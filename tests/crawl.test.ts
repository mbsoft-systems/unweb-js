import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnWebClient } from '../src/client.js';

describe('CrawlResource', () => {
  let client: UnWebClient;
  beforeEach(() => { client = new UnWebClient({ apiKey: 'unweb_test', baseUrl: 'http://test.local' }); });

  it('start sends crawl request', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ jobId: 'abc-123', status: 'Queued', pagesCrawled: 0, pagesQueued: 1, startUrl: 'https://docs.example.com', allowedPath: '/docs/', maxPages: 50, exportFormat: 'raw-md' });
    const job = await client.crawl.start('https://docs.example.com', { allowedPath: '/docs/', maxPages: 50 });
    expect(job.jobId).toBe('abc-123');
    expect(job.status).toBe('Queued');
  });

  it('start includes webhookUrl', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ jobId: 'abc', status: 'Queued' });
    await client.crawl.start('https://example.com', { webhookUrl: 'https://myapp.com/hook' });
    expect(client._request).toHaveBeenCalledWith('POST', '/api/crawl', { json: expect.objectContaining({ webhookUrl: 'https://myapp.com/hook' }) });
  });

  it('status returns job', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ jobId: 'abc-123', status: 'Running', pagesCrawled: 5, pagesQueued: 10 });
    const job = await client.crawl.status('abc-123');
    expect(job.status).toBe('Running');
    expect(job.pagesCrawled).toBe(5);
  });

  it('list returns paginated jobs', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ jobs: [{ jobId: 'j1', status: 'Completed' }, { jobId: 'j2', status: 'Running' }], totalCount: 2 });
    const result = await client.crawl.list();
    expect(result.totalCount).toBe(2);
    expect(result.jobs).toHaveLength(2);
  });

  it('download returns info', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ downloadUrl: 'https://blob.azure.net/abc.zip', sizeBytes: 1024, contentType: 'application/zip', fileName: 'crawl.zip' });
    const dl = await client.crawl.download('abc-123');
    expect(dl.downloadUrl).toBe('https://blob.azure.net/abc.zip');
    expect(dl.sizeBytes).toBe(1024);
  });

  it('cancel calls DELETE', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({});
    await client.crawl.cancel('abc-123');
    expect(client._request).toHaveBeenCalledWith('DELETE', '/api/crawl/abc-123');
  });
});
