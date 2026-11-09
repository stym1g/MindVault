import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
@Injectable()
export class AiProviderService {
  private client: OpenAI;
  constructor(private config: ConfigService) {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (key) this.client = new OpenAI({ apiKey: key });
  }
  private requireClient() { if (!this.client) throw new ServiceUnavailableException('Set OPENAI_API_KEY to enable embeddings and chat'); return this.client; }
  async embed(texts: string[]): Promise<number[][]> {
    const client = this.requireClient();
    const model = this.config.get('OPENAI_EMBEDDING_MODEL') || 'text-embedding-3-small';
    const result = await client.embeddings.create({ model, input: texts });
    return result.data.map(x => x.embedding);
  }
  async answer(question: string, context: string): Promise<string> {
    const client = this.requireClient();
    const result = await client.chat.completions.create({
      model: this.config.get('OPENAI_CHAT_MODEL') || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Answer only using the supplied context. If the context does not contain the answer, say you could not find it in the knowledge vault. Do not invent sources. Be concise.' },
        { role: 'user', content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}` }
      ]
    });
    return result.choices[0]?.message?.content || 'I could not generate an answer.';
  }
}
