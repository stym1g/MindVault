import { Injectable } from '@nestjs/common';
import { AiProviderService } from './providers/ai-provider.service';
import { VectorStoreService } from './vector-store.service';
@Injectable()
export class AiService {
  constructor(private ai: AiProviderService, private vectors: VectorStoreService) {}
  async search(query: string, userId: string, topK = 6) {
    const [embedding] = await this.ai.embed([query]);
    const hits = await this.vectors.search(embedding, userId, topK);
    return hits.map(hit => ({ score: hit.score, text: hit.payload?.text, documentId: hit.payload?.documentId, documentName: hit.payload?.documentName, chunkIndex: hit.payload?.chunkIndex }));
  }
  async chat(question: string, userId: string, topK = 6) {
    const sources = await this.search(question, userId, topK);
    const context = sources.map((s, i) => `[Source ${i + 1}: ${s.documentName}, chunk ${s.chunkIndex}]\n${s.text}`).join('\n\n---\n\n');
    if (!context) return { answer: 'I could not find relevant information in your knowledge vault.', sources: [] };
    const answer = await this.ai.answer(question, context);
    return { answer, sources: sources.map(({ score, text, ...source }) => ({ ...source, score })) };
  }
}
