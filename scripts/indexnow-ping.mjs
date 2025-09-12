import https from 'node:https';

const key = process.env.INDEXNOW_KEY;
const endpoint = process.env.INDEXNOW_ENDPOINT || 'https://www.bing.com/indexnow';
const site = process.env.PUBLIC_SITE_URL;
if (!key || !site) {
  console.log('INDEXNOW_KEY or PUBLIC_SITE_URL not set, skip ping.');
  process.exit(0);
}
const sitemap = `${site.replace(/\/$/, '')}/sitemap-index.xml`;
const url = `${endpoint}?url=${encodeURIComponent(site)}&key=${key}&keyLocation=${encodeURIComponent(`${site}/${key}.txt`)}`;

console.log('IndexNow ping:', url, 'sitemap:', sitemap);

https.get(url, (res) => {
  console.log('IndexNow status:', res.statusCode);
}).on('error', (e) => {
  console.error('IndexNow error:', e.message);
});
