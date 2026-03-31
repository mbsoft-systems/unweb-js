import type { UnWebClient } from '../client.js';
import type { ApiKey, ApiKeyCreated } from '../types.js';

export class KeysResource {
  constructor(private client: UnWebClient) {}

  async list(): Promise<ApiKey[]> {
    const data = await this.client._request('GET', '/api/keys', { authMode: 'jwt' });
    return (data as unknown as Record<string, unknown>[]).map((k) => ({
      id: (k.id as string) ?? '', name: (k.name as string) ?? '', keyPrefix: (k.keyPrefix as string) ?? '',
      createdAt: k.createdAt as string | undefined, lastUsedAt: k.lastUsedAt as string | undefined, isRevoked: (k.isRevoked as boolean) ?? false,
    }));
  }

  async create(name: string): Promise<ApiKeyCreated> {
    const data = await this.client._request('POST', '/api/keys', { json: { name }, authMode: 'jwt' });
    return { id: (data.id as string) ?? '', name: (data.name as string) ?? '', key: (data.key as string) ?? '', keyPrefix: (data.keyPrefix as string) ?? '' };
  }

  async revoke(keyId: string): Promise<void> {
    await this.client._request('DELETE', `/api/keys/${keyId}`, { authMode: 'jwt' });
  }
}
