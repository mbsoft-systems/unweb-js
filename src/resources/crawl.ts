import type { UnWebClient } from '../client.js';
import type { CrawlJob, CrawlJobList, CrawlDownload, CrawlStartOptions, CrawlListOptions } from '../types.js';

export class CrawlResource {
  constructor(private client: UnWebClient) {}

  async start(startUrl: string, options: CrawlStartOptions = {}): Promise<CrawlJob> {
    const json: Record<string, unknown> = {
      startUrl,
      allowedPath: options.allowedPath ?? '/',
      maxPages: options.maxPages ?? 100,
      exportFormat: options.exportFormat ?? 'raw-md',
      ignoreRobotsTxt: options.ignoreRobotsTxt ?? false,
    };
    if (options.webhookUrl) json.webhookUrl = options.webhookUrl;
    const data = await this.client._request('POST', '/api/crawl', { json });
    return toJob(data);
  }

  async status(jobId: string): Promise<CrawlJob> {
    const data = await this.client._request('GET', `/api/crawl/${jobId}/status`);
    return toJob(data);
  }

  async list(options: CrawlListOptions = {}): Promise<CrawlJobList> {
    const params: Record<string, string | number> = { skip: options.skip ?? 0, take: options.take ?? 20 };
    if (options.status) params.status = options.status;
    const data = await this.client._request('GET', '/api/crawl', { params });
    return { jobs: ((data.jobs as Record<string, unknown>[]) ?? []).map(toJob), totalCount: (data.totalCount as number) ?? 0 };
  }

  async download(jobId: string): Promise<CrawlDownload> {
    const data = await this.client._request('GET', `/api/crawl/${jobId}/download`);
    return { downloadUrl: (data.downloadUrl as string) ?? '', expiresAt: data.expiresAt as string | undefined, sizeBytes: data.sizeBytes as number | undefined, contentType: (data.contentType as string) ?? 'application/zip', fileName: (data.fileName as string) ?? '' };
  }

  async cancel(jobId: string): Promise<void> {
    await this.client._request('DELETE', `/api/crawl/${jobId}`);
  }
}

function toJob(data: Record<string, unknown>): CrawlJob {
  return {
    jobId: (data.jobId as string) ?? '', status: (data.status as string) ?? '',
    pagesCrawled: (data.pagesCrawled as number) ?? 0, pagesQueued: (data.pagesQueued as number) ?? 0,
    startUrl: (data.startUrl as string) ?? '', allowedPath: (data.allowedPath as string) ?? '',
    maxPages: (data.maxPages as number) ?? 0, exportFormat: (data.exportFormat as string) ?? '',
    errorMessage: data.errorMessage as string | undefined, createdAt: data.createdAt as string | undefined,
    startedAt: data.startedAt as string | undefined, completedAt: data.completedAt as string | undefined,
    durationSeconds: data.durationSeconds as number | undefined, outputSizeBytes: data.outputSizeBytes as number | undefined,
  };
}
