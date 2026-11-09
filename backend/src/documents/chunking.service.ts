import { Injectable } from '@nestjs/common';
export interface TextChunk { text: string; index: number; startChar: number; endChar: number; tokenEstimate: number; }
@Injectable()
export class ChunkingService {
  // Approximate token count for a first-pass splitter. Replace with the selected model tokenizer for exact limits.
  private tokens(text: string) { return Math.ceil(text.length / 4); }
  chunk(text: string, size = 700, overlap = 100): TextChunk[] {
    const clean = text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    if (!clean) return [];
    const maxChars = size * 4, overlapChars = Math.min(overlap * 4, Math.floor(maxChars / 2));
    const chunks: TextChunk[] = [];
    let start = 0;
    while (start < clean.length) {
      let end = Math.min(start + maxChars, clean.length);
      if (end < clean.length) {
        const minBoundary = start + Math.floor(maxChars * 0.65);
        const window = clean.slice(minBoundary, end);
        const candidates = [window.lastIndexOf('\n\n'), window.lastIndexOf('. '), window.lastIndexOf('\n'), window.lastIndexOf(' ')];
        const boundary = Math.max(...candidates);
        if (boundary > 0) end = minBoundary + boundary + (window[boundary] === '.' ? 1 : 0);
      }
      const part = clean.slice(start, end).trim();
      if (part) chunks.push({ text: part, index: chunks.length, startChar: start, endChar: end, tokenEstimate: this.tokens(part) });
      if (end >= clean.length) break;
      start = Math.max(start + 1, end - overlapChars);
    }
    return chunks;
  }
}
