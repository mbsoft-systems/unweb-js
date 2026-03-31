import { AuthError, NotFoundError, QuotaExceededError, UnWebError, ValidationError } from './errors.js';
import type { UnWebClientOptions } from './types.js';
import { AuthResource } from './resources/auth.js';
import { ConvertResource } from './resources/convert.js';
import { CrawlResource } from './resources/crawl.js';
import { KeysResource } from './resources/keys.js';
import { SubscriptionResource } from './resources/subscription.js';
import { UsageResource } from './resources/usage.js';

const DEFAULT_BASE_URL = 'https://api.unweb.info';

export class UnWebClient {
  /** @internal */ _apiKey: string | undefined;
  /** @internal */ _baseUrl: string;
  /** @internal */ _timeout: number;
  /** @internal */ _jwtToken: string | undefined;

  readonly convert: ConvertResource;
  readonly crawl: CrawlResource;
  readonly auth: AuthResource;
  readonly keys: KeysResource;
  readonly usage: UsageResource;
  readonly subscription: SubscriptionResource;

  constructor(options: UnWebClientOptions = {}) {
    this._apiKey = options.apiKey;
    this._baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this._timeout = options.timeout ?? 30_000;

    this.convert = new ConvertResource(this);
    this.crawl = new CrawlResource(this);
    this.auth = new AuthResource(this);
    this.keys = new KeysResource(this);
    this.usage = new UsageResource(this);
    this.subscription = new SubscriptionResource(this);
  }

  /** @internal */
  async _request(
    method: string,
    path: string,
    options: {
      json?: Record<string, unknown>;
      body?: BodyInit;
      params?: Record<string, string | number>;
      authMode?: 'api_key' | 'jwt' | 'none';
      headers?: Record<string, string>;
    } = {},
  ): Promise<Record<string, unknown>> {
    const { json, body, params, authMode = 'api_key', headers: extraHeaders } = options;

    let url = `${this._baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
      url += `?${qs.toString()}`;
    }

    const headers: Record<string, string> = { ...extraHeaders };
    if (authMode === 'api_key' && this._apiKey) headers['X-API-Key'] = this._apiKey;
    else if (authMode === 'jwt' && this._jwtToken) headers['Authorization'] = `Bearer ${this._jwtToken}`;

    let fetchBody: BodyInit | undefined = body;
    if (json) {
      headers['Content-Type'] = 'application/json';
      fetchBody = JSON.stringify(json);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this._timeout);

    try {
      const response = await fetch(url, { method, headers, body: fetchBody, signal: controller.signal });
      if (response.status === 204) return {};

      const data = response.headers.get('content-type')?.includes('application/json')
        ? await response.json()
        : {};

      if (response.ok) return data as Record<string, unknown>;

      const msg = (data as any).detail ?? (data as any).error ?? (data as any).title ?? JSON.stringify(data);
      const errors = (data as any).errors;
      const errorMsg = errors ? (Array.isArray(errors) ? errors.join('; ') : String(errors)) : msg;

      if (response.status === 400) throw new ValidationError(errorMsg, 400, data as any);
      if (response.status === 401) throw new AuthError(errorMsg, 401, data as any);
      if (response.status === 403) throw new AuthError(errorMsg, 403, data as any);
      if (response.status === 404) throw new NotFoundError(errorMsg, 404, data as any);
      if (response.status === 429) throw new QuotaExceededError(errorMsg, 429, data as any);
      throw new UnWebError(errorMsg, response.status, data as any);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
