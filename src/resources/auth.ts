import type { UnWebClient } from '../client.js';
import type { AuthToken, UserProfile, ProfileUpdate } from '../types.js';

export class AuthResource {
  constructor(private client: UnWebClient) {}

  async register(email: string, password: string, firstName = '', lastName = ''): Promise<AuthToken> {
    const data = await this.client._request('POST', '/api/auth/register', { json: { email, password, firstName, lastName }, authMode: 'none' });
    const token = toToken(data);
    this.client._jwtToken = token.token;
    return token;
  }

  async login(email: string, password: string): Promise<AuthToken> {
    const data = await this.client._request('POST', '/api/auth/login', { json: { email, password }, authMode: 'none' });
    const token = toToken(data);
    this.client._jwtToken = token.token;
    return token;
  }

  async me(): Promise<UserProfile> {
    const data = await this.client._request('GET', '/api/auth/me', { authMode: 'jwt' });
    return { id: (data.id as string) ?? '', email: (data.email as string) ?? '', firstName: (data.firstName as string) ?? '', lastName: (data.lastName as string) ?? '', role: (data.role as string) ?? '' };
  }

  async updateProfile(update: ProfileUpdate): Promise<void> {
    const json: Record<string, unknown> = {};
    if (update.email !== undefined) json.email = update.email;
    if (update.firstName !== undefined) json.firstName = update.firstName;
    if (update.lastName !== undefined) json.lastName = update.lastName;
    await this.client._request('PUT', '/api/auth/profile', { json, authMode: 'jwt' });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.client._request('POST', '/api/auth/change-password', { json: { currentPassword, newPassword }, authMode: 'jwt' });
  }
}

function toToken(data: Record<string, unknown>): AuthToken {
  return { token: (data.token as string) ?? '', userId: (data.userId as string) ?? '', email: (data.email as string) ?? '' };
}
