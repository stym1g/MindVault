import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
@Injectable()
export class VectorStoreService implements OnModuleInit {
  private client: QdrantClient;
  private collection: string;
  private logger = new Logger(VectorStoreService.name);
  constructor(private config: ConfigService) {
    this.collection = this.config.get('QDRANT_COLLECTION') || 'mindvault_chunks';
    const url = this.config.get('QDRANT_URL');
    if (url) this.client = new QdrantClient({ url, apiKey: this.config.get('QDRANT_API_KEY') || undefined });
  }
  async onModuleInit() {
    if (!this.client) { this.logger.warn('QDRANT_URL not configured; vector features disabled'); return; }
    try {
      const exists = await this.client.collectionExists(this.collection);
      if (!exists.exists) await this.client.createCollection(this.collection, { vectors: { size: Number(this.config.get('EMBEDDING_DIMENSIONS') || 1536), distance: 'Cosine' } });
    } catch (e) { this.logger.error(`Qdrant initialization failed: ${e.message}`); }
  }
  private ready() { if (!this.client) throw new Error('QDRANT_URL is not configured'); return this.client; }
  async upsert(points: { id: string; vector: number[]; payload: Record<string, any> }[]) {
    await this.ready().upsert(this.collection, { wait: true, points: points.map(p => ({ id: p.id, vector: p.vector, payload: p.payload })) });
  }
  async search(vector: number[], userId: string, limit = 6) {
    return this.ready().search(this.collection, { vector, limit, with_payload: true, filter: { must: [{ key: 'userId', match: { value: userId } }] } });
  }
  async deleteDocument(documentId: string) {
    await this.ready().delete(this.collection, { wait: true, filter: { must: [{ key: 'documentId', match: { value: documentId } }] } });
  }
}
