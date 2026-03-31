import { UnWebClient } from 'unweb';

const client = new UnWebClient({ apiKey: 'unweb_your_key_here' });

let job = await client.crawl.start('https://docs.example.com', {
  allowedPath: '/docs/',
  maxPages: 50,
});
console.log(`Crawl started: job ${job.jobId}`);

while (job.status !== 'Completed' && job.status !== 'Failed' && job.status !== 'Cancelled') {
  await new Promise((r) => setTimeout(r, 5000));
  job = await client.crawl.status(job.jobId);
  console.log(`  Status: ${job.status} — ${job.pagesCrawled} pages crawled`);
}

if (job.status === 'Completed') {
  const download = await client.crawl.download(job.jobId);
  console.log(`\nDownload: ${download.downloadUrl}`);
} else {
  console.log(`\nCrawl failed: ${job.errorMessage}`);
}
