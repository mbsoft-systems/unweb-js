import type { UnWebClient } from '../client.js';
import type { Subscription } from '../types.js';

export class SubscriptionResource {
  constructor(private client: UnWebClient) {}

  async get(): Promise<Subscription> {
    const data = await this.client._request('GET', '/api/subscription', { authMode: 'jwt' });
    return { tier: (data.tier as string) ?? 'Free', status: (data.status as string) ?? '', monthlyCredits: (data.monthlyCredits as number) ?? 0, creditsUsed: (data.creditsUsed as number) ?? 0, allowsOverage: (data.allowsOverage as boolean) ?? false };
  }

  async checkout(tier: string): Promise<string> {
    const data = await this.client._request('POST', '/api/subscription/checkout', { json: { tier }, authMode: 'jwt' });
    return (data.checkoutUrl as string) ?? '';
  }

  async cancel(): Promise<void> {
    await this.client._request('POST', '/api/subscription/cancel', { authMode: 'jwt' });
  }
}
