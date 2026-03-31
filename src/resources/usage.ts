import type { UnWebClient } from '../client.js';
import type { UsageCurrent } from '../types.js';

export class UsageResource {
  constructor(private client: UnWebClient) {}

  async current(): Promise<UsageCurrent> {
    const data = await this.client._request('GET', '/api/usage/current', { authMode: 'jwt' });
    return { creditsUsed: (data.creditsUsed as number) ?? 0, creditsLimit: (data.creditsLimit as number) ?? 0, overageCreditsUsed: (data.overageCreditsUsed as number) ?? 0, billingCycleStart: data.billingCycleStart as string | undefined, billingCycleEnd: data.billingCycleEnd as string | undefined };
  }

  async stats(): Promise<Record<string, unknown>> {
    return this.client._request('GET', '/api/usage/stats', { authMode: 'jwt' });
  }

  async history(): Promise<Record<string, unknown>> {
    return this.client._request('GET', '/api/usage/history', { authMode: 'jwt' });
  }
}
