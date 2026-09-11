import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { load } from 'cheerio';

export const SITE = 'https://ieltsconsult.netlify.app';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const keyPattern = /^[a-zA-Z0-9-]{8,128}$/;

export function validateHtml(html, url) {
  const $ = load(html);
  if ($('link[rel=canonical]').length !== 1 || $('link[rel=canonical]').attr('href') !== url) throw new Error(`Noncanonical page: ${url}`);
  if ($('meta[name=robots], meta[name=googlebot], meta[name=bingbot]').toArray().some(e => /(?:^|[,\s])(?:noindex|none)(?:[,\s]|$)/i.test($(e).attr('content') || ''))) throw new Error(`Noindex page: ${url}`);
}

export function validateUrls(urls, outDir = 'out') {
  if (!urls.length || urls.length > 10000) throw new Error('Provide an explicit changed-URL list (1–10000 URLs)');
  if (new Set(urls).size !== urls.length) throw new Error('Duplicate URLs');
  const $map = load(fs.readFileSync(path.join(outDir, 'sitemap.xml'), 'utf8'), { xmlMode: true });
  const listed = new Set($map('loc').toArray().map(e => $map(e).text()));
  for (const value of urls) {
    const u = new URL(value);
    if (u.origin !== SITE || u.username || u.password || u.search || u.hash || !u.pathname.endsWith('/') || !listed.has(value)) throw new Error(`Not an indexable canonical sitemap URL: ${value}`);
    const target = path.resolve(outDir, '.' + decodeURIComponent(u.pathname), 'index.html');
    if (!target.startsWith(path.resolve(outDir) + path.sep)) throw new Error('Invalid path');
    validateHtml(fs.readFileSync(target, 'utf8'), value);
  }
  return urls;
}

export function findKey(publicDir = 'public', supplied = process.env.INDEXNOW_KEY) {
  if (supplied) {
    if (!keyPattern.test(supplied)) throw new Error('Invalid INDEXNOW_KEY format');
    if (fs.readFileSync(path.join(publicDir, `${supplied}.txt`), 'utf8').trim() !== supplied) throw new Error('Key verification file does not match');
    return supplied;
  }
  const found = fs.readdirSync(publicDir).filter(f => f.endsWith('.txt') && keyPattern.test(f.slice(0,-4))).filter(f => fs.readFileSync(path.join(publicDir,f),'utf8').trim() === f.slice(0,-4));
  if (found.length > 1) throw new Error('Multiple keys: select the existing key using INDEXNOW_KEY');
  return found[0]?.slice(0,-4);
}

// Network is injected in tests; no normal test/build sends an IndexNow request.
export async function submitUrls(urls, key, request = fetch) {
  if (!urls.length || urls.some(value => { const u = new URL(value); return u.origin !== SITE || u.username || u.password || u.search || u.hash; })) throw new Error('Explicit same-site canonical URLs required');
  if (!keyPattern.test(key || '')) throw new Error('Provision a verification key before --submit');
  const get = async (url) => {
    const res = await request(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
    if (res.status !== 200) throw new Error(`Production verification HTTP ${res.status}: ${url}`);
    return res;
  };
  const keyLocation = `${SITE}/${key}.txt`;
  if ((await (await get(keyLocation)).text()).trim() !== key) throw new Error('Production ownership verification failed');
  for (const url of urls) {
    const res = await get(url);
    if (/noindex|none/i.test(res.headers.get('x-robots-tag') || '')) throw new Error(`Production X-Robots-Tag blocks ${url}`);
    validateHtml(await res.text(), url);
  }
  const response = await request(ENDPOINT, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000),
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE).hostname, key, keyLocation, urlList: urls }),
  });
  if (![200,202].includes(response.status)) throw new Error(`IndexNow HTTP ${response.status}; not automatically retried`);
  return { status: response.status, meaning: response.status === 202 ? 'received; key validation pending' : 'received; indexing not guaranteed', urls };
}

async function main() {
  const args = process.argv.slice(2);
  const submit = args.includes('--submit');
  if (args.some(a => a.startsWith('--') && !['--submit','--dry-run'].includes(a))) throw new Error('Unknown flag');
  if (submit && args.includes('--dry-run')) throw new Error('Choose --dry-run or --submit, not both');
  const urls = validateUrls(args.filter(a => !a.startsWith('--')));
  const key = findKey();
  if (!submit) {
    console.log(JSON.stringify({ mode: 'dry-run', keyReady: Boolean(key), requestsSent: 0, urls }, null, 2));
    return;
  }
  console.log(JSON.stringify(await submitUrls(urls, key), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
