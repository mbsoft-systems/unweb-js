import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnWebClient } from '../src/client.js';

describe('ConvertResource', () => {
  let client: UnWebClient;

  beforeEach(() => {
    client = new UnWebClient({ apiKey: 'unweb_test', baseUrl: 'http://test.local' });
  });

  it('paste sends HTML and returns ConversionResult', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ markdown: '# Hello', warnings: [], qualityScore: 100 });
    const result = await client.convert.paste('<h1>Hello</h1>');
    expect(result.markdown).toBe('# Hello');
    expect(result.qualityScore).toBe(100);
    expect(client._request).toHaveBeenCalledWith('POST', '/api/convert/paste', { json: { html: '<h1>Hello</h1>' } });
  });

  it('url sends URL and returns ConversionResult', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ markdown: '# Page', warnings: [], qualityScore: 80 });
    const result = await client.convert.url('https://example.com');
    expect(result.markdown).toBe('# Page');
    expect(result.qualityScore).toBe(80);
    expect(client._request).toHaveBeenCalledWith('POST', '/api/convert/url', { json: { url: 'https://example.com' } });
  });

  it('upload sends file as FormData', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ markdown: '# File', warnings: [], qualityScore: 100 });
    const result = await client.convert.upload(Buffer.from('<h1>File</h1>'), 'test.html');
    expect(result.markdown).toBe('# File');
    expect(client._request).toHaveBeenCalledWith('POST', '/api/convert/upload', expect.objectContaining({ authMode: 'api_key' }));
  });
});
