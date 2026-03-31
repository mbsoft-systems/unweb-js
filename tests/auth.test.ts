import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnWebClient } from '../src/client.js';

describe('AuthResource', () => {
  let client: UnWebClient;
  beforeEach(() => { client = new UnWebClient({ apiKey: 'unweb_test', baseUrl: 'http://test.local' }); });

  it('login stores JWT', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ token: 'jwt_abc123', userId: 'u1', email: 'user@test.com' });
    const result = await client.auth.login('user@test.com', 'password123');
    expect(result.token).toBe('jwt_abc123');
    expect(client._jwtToken).toBe('jwt_abc123');
    expect(client._request).toHaveBeenCalledWith('POST', '/api/auth/login', { json: { email: 'user@test.com', password: 'password123' }, authMode: 'none' });
  });

  it('register stores JWT', async () => {
    vi.spyOn(client, '_request').mockResolvedValue({ token: 'jwt_new', userId: 'u2', email: 'new@test.com' });
    const result = await client.auth.register('new@test.com', 'pass!', 'First', 'Last');
    expect(result.token).toBe('jwt_new');
    expect(client._jwtToken).toBe('jwt_new');
  });

  it('me uses JWT auth', async () => {
    client._jwtToken = 'jwt_test';
    vi.spyOn(client, '_request').mockResolvedValue({ id: 'u1', email: 'user@test.com', firstName: 'Test', lastName: 'User', role: 'User' });
    const profile = await client.auth.me();
    expect(profile.email).toBe('user@test.com');
    expect(client._request).toHaveBeenCalledWith('GET', '/api/auth/me', { authMode: 'jwt' });
  });

  it('changePassword sends correct body', async () => {
    client._jwtToken = 'jwt_test';
    vi.spyOn(client, '_request').mockResolvedValue({});
    await client.auth.changePassword('old_pass', 'new_pass');
    expect(client._request).toHaveBeenCalledWith('POST', '/api/auth/change-password', { json: { currentPassword: 'old_pass', newPassword: 'new_pass' }, authMode: 'jwt' });
  });
});
