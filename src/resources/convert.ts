import type { UnWebClient } from '../client.js';
import type { ConversionResult } from '../types.js';
import { readFileSync } from 'node:fs';

export class ConvertResource {
  constructor(private client: UnWebClient) {}

  async paste(html: string): Promise<ConversionResult> {
    const data = await this.client._request('POST', '/api/convert/paste', { json: { html } });
    return toResult(data);
  }

  async url(url: string): Promise<ConversionResult> {
    const data = await this.client._request('POST', '/api/convert/url', { json: { url } });
    return toResult(data);
  }

  async upload(content: Buffer | string, fileName?: string): Promise<ConversionResult> {
    let buffer: Buffer;
    let name: string;
    if (typeof content === 'string') {
      buffer = readFileSync(content);
      name = content.split(/[\\/]/).pop() ?? 'upload.html';
    } else {
      buffer = content;
      name = fileName ?? 'upload.html';
    }
    const formData = new FormData();
    formData.append('file', new Blob([buffer]), name);
    const data = await this.client._request('POST', '/api/convert/upload', { body: formData, authMode: 'api_key' });
    return toResult(data);
  }
}

function toResult(data: Record<string, unknown>): ConversionResult {
  return {
    markdown: (data.markdown as string) ?? '',
    warnings: (data.warnings as string[]) ?? [],
    qualityScore: (data.qualityScore as number) ?? 100,
  };
}
