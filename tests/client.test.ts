import { describe, it, expect } from 'vitest';
import { UnWebClient } from '../src/client.js';

describe('UnWebClient', () => {
  it('stores api key', () => {
    const client = new UnWebClient({ apiKey: 'unweb_test123' });
    expect(client._apiKey).toBe('unweb_test123');
  });

  it('uses default base URL', () => {
    const client = new UnWebClient({ apiKey: 'unweb_test' });
    expect(client._baseUrl).toBe('https://api.unweb.info');
  });

  it('accepts custom base URL', () => {
    const client = new UnWebClient({ apiKey: 'unweb_test', baseUrl: 'http://localhost:5000' });
    expect(client._baseUrl).toBe('http://localhost:5000');
  });

  it('strips trailing slash from base URL', () => {
    const client = new UnWebClient({ baseUrl: 'http://localhost:5000/' });
    expect(client._baseUrl).toBe('http://localhost:5000');
  });

  it('has all resource accessors', () => {
    const client = new UnWebClient({ apiKey: 'unweb_test' });
    expect(client.convert).toBeDefined();
    expect(client.crawl).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.keys).toBeDefined();
    expect(client.usage).toBeDefined();
    expect(client.subscription).toBeDefined();
  });

  it('defaults timeout to 30s', () => {
    const client = new UnWebClient();
    expect(client._timeout).toBe(30_000);
  });
});
