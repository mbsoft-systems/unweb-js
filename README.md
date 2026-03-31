# UnWeb TypeScript SDK

[![CI](https://github.com/mbsoft-systems/unweb-js/actions/workflows/ci.yml/badge.svg)](https://github.com/mbsoft-systems/unweb-js/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@mbsoftsystems/unweb.svg)](https://www.npmjs.com/package/@mbsoftsystems/unweb)
[![Node 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for the [UnWeb API](https://unweb.info) — convert HTML to clean, LLM-ready Markdown for RAG pipelines, AI agents, and documentation ingestion.

## Installation

```bash
npm install unweb
```

## Quick Start

```typescript
import { UnWebClient } from 'unweb';

const client = new UnWebClient({ apiKey: 'unweb_your_key_here' });

// Convert HTML to Markdown
const result = await client.convert.paste('<h1>Hello World</h1><p>Clean markdown output.</p>');
console.log(result.markdown);       // "# Hello World\n\nClean markdown output."
console.log(result.qualityScore);   // 100

// Convert a webpage
const page = await client.convert.url('https://example.com/article');
console.log(page.markdown);

// Upload an HTML file
const file = await client.convert.upload('./page.html');
console.log(file.markdown);
```

Get your free API key at [app.unweb.info](https://app.unweb.info) (500 credits/month, no credit card required).

## Features

- **Conversions** — Paste HTML, fetch URLs, or upload files. Returns clean CommonMark with quality scores.
- **Web Crawler** — Crawl entire documentation sites with BFS traversal. Export as raw Markdown, LangChain JSONL, or LlamaIndex JSON.
- **Webhook Notifications** — Get notified when crawl jobs complete via HTTPS webhooks.
- **Dashboard Access** — Manage API keys, view usage, and handle subscriptions programmatically.
- **Quality Scores** — Every conversion returns a 0–100 quality score detecting JS-rendered pages and content extraction issues.
- **Fully Typed** — Complete TypeScript types for all requests and responses.

## API Reference

### Conversions

All conversion methods return a `ConversionResult` with `markdown`, `warnings`, and `qualityScore`.

```typescript
import { UnWebClient } from 'unweb';

const client = new UnWebClient({ apiKey: 'unweb_...' });

// Paste raw HTML
const result = await client.convert.paste('<h1>Title</h1><p>Content</p>');
result.markdown;       // "# Title\n\nContent"
result.qualityScore;   // 0–100
result.warnings;       // ["Content auto-detected using: <main> element"]

// Convert from URL (fetches and converts server-side)
const page = await client.convert.url('https://docs.python.org/3/tutorial/index.html');

// Upload an HTML file (pass file path or Buffer)
const uploaded = await client.convert.upload('./downloaded-page.html');

// Upload from a Buffer
const buf = Buffer.from('<h1>Hello</h1>');
const fromBuf = await client.convert.upload(buf, 'hello.html');
```

### Web Crawler

Crawl documentation sites and download results as a ZIP archive.

```typescript
// Start a crawl job
let job = await client.crawl.start('https://docs.example.com', {
  allowedPath: '/docs/',       // Only crawl URLs under this path
  maxPages: 100,               // Page limit
  exportFormat: 'raw-md',      // "raw-md" | "langchain" | "llamaindex"
  webhookUrl: 'https://your-app.com/hooks/crawl',  // Optional completion webhook
});
console.log(`Job started: ${job.jobId}`);

// Poll until complete
while (job.status !== 'Completed' && job.status !== 'Failed' && job.status !== 'Cancelled') {
  await new Promise((r) => setTimeout(r, 5000));
  job = await client.crawl.status(job.jobId);
  console.log(`  ${job.status}: ${job.pagesCrawled} pages crawled`);
}

// Download results
if (job.status === 'Completed') {
  const download = await client.crawl.download(job.jobId);
  console.log(`Download ZIP: ${download.downloadUrl}`);
  console.log(`Size: ${download.sizeBytes} bytes`);
}

// List all your crawl jobs
const jobs = await client.crawl.list({ status: 'Completed' });
for (const j of jobs.jobs) {
  console.log(`  ${j.jobId}: ${j.pagesCrawled} pages`);
}

// Cancel a running job
await client.crawl.cancel(job.jobId);
```

**Export formats:**

| Format | Output | Use case |
|--------|--------|----------|
| `raw-md` | ZIP with `.md` files + manifest | General purpose |
| `langchain` | JSONL compatible with LangChain document loaders | RAG with LangChain |
| `llamaindex` | JSON compatible with LlamaIndex readers | RAG with LlamaIndex |

### Authentication

The SDK uses **API keys** for conversion and crawler endpoints (set once in the constructor). For dashboard endpoints (usage, keys, subscription), authenticate with email/password to get a JWT:

```typescript
// API key auth (conversions + crawler) — set in constructor
const client = new UnWebClient({ apiKey: 'unweb_...' });

// JWT auth (dashboard endpoints) — login first
await client.auth.login('you@example.com', 'your-password');

// Now dashboard endpoints work
const usage = await client.usage.current();
const keys = await client.keys.list();
```

```typescript
// Register a new account
const token = await client.auth.register('new@example.com', 'password', 'First', 'Last');

// Get current user profile
const profile = await client.auth.me();
console.log(`${profile.firstName} (${profile.email})`);

// Update profile
await client.auth.updateProfile({ firstName: 'NewName' });

// Change password
await client.auth.changePassword('old-password', 'new-password');
```

### API Key Management

Requires JWT auth (`client.auth.login(...)` first).

```typescript
// List API keys
const keys = await client.keys.list();
for (const key of keys) {
  console.log(`  ${key.name}: ${key.keyPrefix}...`);
}

// Create a new API key (full key only shown once)
const newKey = await client.keys.create('Production Key');
console.log(`Key: ${newKey.key}`);  // Save this — not retrievable later

// Revoke an API key
await client.keys.revoke('key-id-here');
```

### Usage Tracking

Requires JWT auth.

```typescript
const usage = await client.usage.current();
console.log(`Credits used: ${usage.creditsUsed}/${usage.creditsLimit}`);
console.log(`Overage: ${usage.overageCreditsUsed}`);
console.log(`Billing cycle: ${usage.billingCycleStart} – ${usage.billingCycleEnd}`);

// Detailed stats and history (returns raw objects)
const stats = await client.usage.stats();
const history = await client.usage.history();
```

### Subscription

Requires JWT auth.

```typescript
const sub = await client.subscription.get();
console.log(`Tier: ${sub.tier}`);                  // Free | Starter | Pro | Scale
console.log(`Credits: ${sub.creditsUsed}/${sub.monthlyCredits}`);
console.log(`Overage: ${sub.allowsOverage}`);

// Get a checkout URL to upgrade
const url = await client.subscription.checkout('Pro');
console.log(`Upgrade: ${url}`);

// Cancel subscription
await client.subscription.cancel();
```

## Error Handling

The SDK throws typed exceptions for all API errors:

```typescript
import {
  UnWebClient,
  UnWebError,
  AuthError,
  QuotaExceededError,
  ValidationError,
  NotFoundError,
} from 'unweb';

const client = new UnWebClient({ apiKey: 'unweb_...' });

try {
  const result = await client.convert.paste('');
} catch (e) {
  if (e instanceof ValidationError) {
    console.error(`Bad request: ${e.message}`);       // 400
  } else if (e instanceof AuthError) {
    console.error(`Auth failed: ${e.message}`);       // 401 / 403
  } else if (e instanceof QuotaExceededError) {
    console.error(`Quota exceeded: ${e.message}`);    // 429
  } else if (e instanceof NotFoundError) {
    console.error(`Not found: ${e.message}`);         // 404
  } else if (e instanceof UnWebError) {
    console.error(`API error (${e.statusCode}): ${e.message}`);
  }
}

// All exceptions expose:
// e.statusCode  — HTTP status code
// e.response    — Raw response body object
```

## Configuration

```typescript
const client = new UnWebClient({
  apiKey: 'unweb_...',                      // API key for conversions/crawler
  baseUrl: 'https://api.unweb.info',        // Default API URL
  timeout: 30_000,                          // Request timeout in milliseconds (default: 30s)
});
```

You can also read the API key from an environment variable:

```typescript
const client = new UnWebClient({
  apiKey: process.env.UNWEB_API_KEY,
});
```

## Pricing

| Tier | Credits/month | Price |
|------|--------------|-------|
| Free | 500 | $0 |
| Starter | 2,000 | $12/mo |
| Pro | 15,000 | $39/mo |
| Scale | 60,000 | $99/mo |

Different operations cost different credits. Paid plans include overage billing so your pipelines never stop. See [unweb.info](https://unweb.info) for details.

## Links

- [UnWeb Homepage](https://unweb.info)
- [API Documentation](https://docs.unweb.info)
- [Dashboard](https://app.unweb.info) (get your API key)
- [Python SDK](https://github.com/mbsoft-systems/unweb-python)
- [Report Issues](https://github.com/mbsoft-systems/unweb-js/issues)

## License

MIT — see [LICENSE](LICENSE) for details.
