import { UnWebClient } from 'unweb';

const client = new UnWebClient({ apiKey: 'unweb_your_key_here' });

let job = await client.crawl.start('https://docs.example.com', {
  allowedPath: '/docs/',
  maxPages: 100,
  exportFormat: 'langchain',
});
console.log(`Crawl started: ${job.jobId}`);

while (job.status !== 'Completed' && job.status !== 'Failed' && job.status !== 'Cancelled') {
  await new Promise((r) => setTimeout(r, 5000));
  job = await client.crawl.status(job.jobId);
}

if (job.status !== 'Completed') {
  console.error(`Crawl failed: ${job.errorMessage}`);
  process.exit(1);
}

const download = await client.crawl.download(job.jobId);
console.log(`Download JSONL: ${download.downloadUrl}`);
console.log('\nTo use with LangChain.js:');
console.log('1. Download the JSONL file');
console.log('2. Use JSONLoader from langchain/document_loaders');
console.log('3. Create a vector store');
console.log('4. Query with a retriever');
