export interface ConversionResult {
  markdown: string;
  warnings: string[];
  qualityScore: number;
}

export interface CrawlJob {
  jobId: string;
  status: string;
  pagesCrawled: number;
  pagesQueued: number;
  startUrl: string;
  allowedPath: string;
  maxPages: number;
  exportFormat: string;
  errorMessage?: string;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  outputSizeBytes?: number;
}

export interface CrawlJobList {
  jobs: CrawlJob[];
  totalCount: number;
}

export interface CrawlDownload {
  downloadUrl: string;
  expiresAt?: string;
  sizeBytes?: number;
  contentType: string;
  fileName: string;
}

export interface CrawlStartOptions {
  allowedPath?: string;
  maxPages?: number;
  exportFormat?: string;
  ignoreRobotsTxt?: boolean;
  webhookUrl?: string;
}

export interface CrawlListOptions {
  status?: string;
  skip?: number;
  take?: number;
}

export interface AuthToken {
  token: string;
  userId: string;
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ProfileUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt?: string;
  lastUsedAt?: string;
  isRevoked: boolean;
}

export interface ApiKeyCreated {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
}

export interface UsageCurrent {
  creditsUsed: number;
  creditsLimit: number;
  overageCreditsUsed: number;
  billingCycleStart?: string;
  billingCycleEnd?: string;
}

export interface Subscription {
  tier: string;
  status: string;
  monthlyCredits: number;
  creditsUsed: number;
  allowsOverage: boolean;
}

export interface UnWebClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}
