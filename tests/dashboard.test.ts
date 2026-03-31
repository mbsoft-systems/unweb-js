import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnWebClient } from '../src/client.js';

describe('Dashboard Resources', () => {
  let client: UnWebClient;
  beforeEach(() => { client = new UnWebClient({ apiKey: 'unweb_test', baseUrl: 'http://test.local' }); client._jwtToken = 'jwt_test'; });

  it('keys.list returns API keys', async () => {
    vi.spyOn(client, '_request').mockResolvedValue([{ id: 'k1', name: 'My Key', keyPrefix: 'unweb_abc', isRevoked: false }]);
    const keys = await client.keys.list();
    expect(keys).toHaveLength(1);
    expect(keys[0].name).toBe('My Key');
  });

  it('keys.create returns new key', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ id: 'k2', name: 'New Key', key: 'unweb_full_key', keyPrefix: 'unweb_ful' });
    const key = await client.keys.create('New Key');
    expect(key.key).toBe('unweb_full_key');
  });

  it('keys.revoke calls DELETE', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({});
    await client.keys.revoke('k1');
    expect(client._request).toHaveBeenCalledWith('DELETE', '/api/keys/k1', { authMode: 'jwt' });
  });

  it('usage.current returns credits', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ creditsUsed: 150, creditsLimit: 500, overageCreditsUsed: 0 });
    const usage = await client.usage.current();
    expect(usage.creditsUsed).toBe(150);
    expect(usage.creditsLimit).toBe(500);
  });

  it('subscription.get returns tier info', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ tier: 'Pro', status: 'Active', monthlyCredits: 15000, creditsUsed: 500, allowsOverage: true });
    const sub = await client.subscription.get();
    expect(sub.tier).toBe('Pro');
    expect(sub.monthlyCredits).toBe(15000);
    expect(sub.allowsOverage).toBe(true);
  });
});
