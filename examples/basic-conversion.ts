import { UnWebClient } from 'unweb';

const client = new UnWebClient({ apiKey: 'unweb_your_key_here' });

const result = await client.convert.paste(`
  <h1>Getting Started</h1>
  <p>This is a <strong>quick start</strong> guide for the UnWeb API.</p>
`);
console.log('=== Paste Conversion ===');
console.log(result.markdown);
console.log(`Quality Score: ${result.qualityScore}/100`);

const page = await client.convert.url('https://example.com');
console.log('\n=== URL Conversion ===');
console.log(page.markdown.slice(0, 200));
