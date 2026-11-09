import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { promises as fs } from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import { DocumentRecord, DocumentRecordDocument } from './schemas/document.schema';
import { ChunkingService } from './chunking.service';
import { AiProviderService } from '../ai/providers/ai-provider.service';
import { VectorStoreService } from '../ai/vector-store.service';
import { randomUUID } from 'crypto';
@Injectable()
export class DocumentsService {
  private logger = new Logger(DocumentsService.name);
  constructor(
    @InjectModel(DocumentRecord.name) private docs: Model<DocumentRecordDocument>,
    private config: ConfigService, private chunker: ChunkingService,
    private ai: AiProviderService, private vectors: VectorStoreService,
  ) {}
  private async extract(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') return (await pdf(file.buffer)).text;
    if (ext === '.docx') return (await mammoth.extractRawText({ buffer: file.buffer })).value;
    if (['.txt','.md','.csv'].includes(ext)) return file.buffer.toString('utf8');
    throw new BadRequestException('Supported formats: PDF, DOCX, TXT, MD, CSV');
  }
  async upload(file: Express.Multer.File, userId: string) {
    if (!file) throw new BadRequestException('A file is required');
    const allowed = ['.pdf','.docx','.txt','.md','.csv'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) throw new BadRequestException('Unsupported file type');
    const max = Number(this.config.get('MAX_FILE_SIZE_MB') || 20) * 1024 * 1024;
    if (file.size > max) throw new BadRequestException(`File exceeds ${max / 1024 / 1024} MB limit`);
    const dir = path.resolve(this.config.get('UPLOAD_DIR') || './uploads', userId);
    await fs.mkdir(dir, { recursive: true });
    const safeName = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
    const storagePath = path.join(dir, safeName);
    await fs.writeFile(storagePath, file.buffer);
    const doc = await this.docs.create({ userId: new Types.ObjectId(userId), originalName: file.originalname, mimeType: file.mimetype, size: file.size, storagePath, status: 'processing' });
    try {
      const extracted = await this.extract(file);
      if (!extracted.trim()) throw new Error('No extractable text found in this document');
      const chunks = this.chunker.chunk(extracted);
      const vectors = await this.ai.embed(chunks.map(c => c.text));
      await this.vectors.upsert(chunks.map((c, i) => ({
        id: randomUUID(), vector: vectors[i],
        payload: { userId, documentId: doc.id, documentName: doc.originalName, chunkIndex: c.index, text: c.text, startChar: c.startChar, endChar: c.endChar, tokenEstimate: c.tokenEstimate }
      })));
      doc.status = 'indexed'; doc.chunkCount = chunks.length; doc.extractedText = extracted;
      await doc.save();
      return this.serialize(doc);
    } catch (error) {
      doc.status = 'failed'; doc.errorMessage = error.message; await doc.save();
      this.logger.error(`Ingestion failed for ${doc.id}: ${error.message}`);
      return this.serialize(doc);
    }
  }
  async list(userId: string) {
    const docs = await this.docs.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
    return docs.map(d => ({ id: d._id.toString(), originalName: d.originalName, mimeType: d.mimeType, size: d.size, category: d.category, status: d.status, chunkCount: d.chunkCount, errorMessage: d.errorMessage, createdAt: d.createdAt }));
  }
  async get(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid document id');
    const doc = await this.docs.findOne({ _id: id, userId: new Types.ObjectId(userId) });
    if (!doc) throw new NotFoundException('Document not found');
    return this.serialize(doc);
  }
  async updateCategory(id: string, userId: string, category: string) {
    const doc = await this.docs.findOneAndUpdate({ _id: id, userId: new Types.ObjectId(userId) }, { category }, { new: true });
    if (!doc) throw new NotFoundException('Document not found');
    return this.serialize(doc);
  }
  async remove(id: string, userId: string) {
    const doc = await this.docs.findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) });
    if (!doc) throw new NotFoundException('Document not found');
    try { await fs.unlink(doc.storagePath); } catch {}
    try { await this.vectors.deleteDocument(doc.id); } catch (e) { this.logger.warn(`Vector cleanup skipped: ${e.message}`); }
    return { deleted: true, id };
  }
  private serialize(doc: any) {
    return { id: doc.id, originalName: doc.originalName, mimeType: doc.mimeType, size: doc.size, category: doc.category, status: doc.status, chunkCount: doc.chunkCount, errorMessage: doc.errorMessage, extractedText: doc.extractedText, createdAt: doc.createdAt };
  }
}
