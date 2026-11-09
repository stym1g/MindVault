import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentRecord, DocumentRecordSchema } from './schemas/document.schema';
import { ChunkingService } from './chunking.service';
import { AiModule } from '../ai/ai.module';
@Module({ imports: [MongooseModule.forFeature([{ name: DocumentRecord.name, schema: DocumentRecordSchema }]), AiModule], controllers: [DocumentsController], providers: [DocumentsService, ChunkingService] })
export class DocumentsModule {}
