import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';

const site = 'https://ieltsconsult.netlify.app';
const baselinePath = 'docs/ai-search-baseline.json';
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const read = (file) => fs.readFileSync(file, 'utf8');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const route = (file) => '/' + file.slice(4, -10).split(path.sep).filter(Boolean).map(encodeURIComponent).join('/') + (file === path.join('out', 'index.html') ? '' : '/');
const canonical = ($) => $('link[rel=canonical]').attr('href');
const data = ($) => $('script[type="application/ld+json"]').toArray().flatMap(e => { const j = JSON.parse($(e).text()); return j['@graph'] || [j]; });
const sources = fs.readdirSync('content/posts').filter(f => f.endsWith('.html')).sort().map(file => {
  const $ = load(read(path.join('content/posts', file)));
  const text = $('.content').text().replace(/\s+/g, ' ').trim();
  return { file, title: $('title').text(), published: $('time[datetime]').first().attr('datetime') || $('meta[property="article:published_time"]').attr('content') || null,
    modified: $('meta[property="article:modified_time"]').attr('content') || null,
    bodyHash: hash($('.content').html() || ''), chars: text.length,
    firstHandExcerpt: (text.match(/.{0,20}(?:私自身|私の場合|私は|取得しました|達成できました).{0,100}/) || [null])[0],
    affiliateHash: hash(JSON.stringify($('a[href]').toArray().map(e => $(e).attr('href')).filter(h => /amzn\.to|amazon\.|a8\.net/.test(h)))),
    mediaHash: hash(JSON.stringify($('img, audio, source').toArray().map(e => $(e).attr('src')))) };
});
const pages = walk('out').filter(f => f.endsWith('index.html') && !f.includes(`${path.sep}404${path.sep}`)).map(file => {
  const html = read(file), $ = load(html), schemas = data($);
  const article = schemas.find(j => j['@type'] === 'BlogPosting');
  return { route: route(file), canonical: canonical($), indexable: !/noindex/.test($('meta[name=robots]').attr('content') || ''),
    title: $('title').text(), description: $('meta[name=description]').attr('content'), h1: $('h1').first().text(),
    schemaTypes: schemas.map(j => j['@type']), article: Boolean(article),
    published: article?.datePublished, modified: article?.dateModified,
    byline: $('article header a[rel=author]').text(),
    amazonCards: $('[data-affiliate=amazon]').length, a8Cards: $('[data-affiliate=a8]').length,
    audio: $('article audio').length, images: $('article .prose img').length,
    slots: $('[data-a8-slot]').toArray().map(e => $(e).attr('data-a8-slot')),
    affiliateHash: hash(JSON.stringify($('a[href]').toArray().map(e => $(e).attr('href')).filter(h => /amzn\.to|amazon\.|a8\.net/.test(h)))),
    adSenseDirectives: $('script').toArray().filter(e => /__next_s.*adsbygoogle\.js/.test($(e).text())).length,
    metaConflicts: article ? [article.headline !== $('article h1').first().text(), article.description !== $('meta[name=description]').attr('content'), article.url !== canonical($), $('meta[property="og:url"]').attr('content') !== canonical($)].filter(Boolean).length : 0 };
}).sort((a,b) => a.route.localeCompare(b.route));
const sitemap = load(read('out/sitemap.xml'), { xmlMode: true });
const sitemapUrls = sitemap('url loc').toArray().map(e => sitemap(e).text());
const protectedFiles = ['components/a8-rotating-ad.tsx', 'lib/post-ad-slots.ts', 'lib/amazon-product-overrides.ts', 'app/layout.tsx', 'public/ads.txt', 'public/robots.txt', 'netlify.toml'].filter(fs.existsSync);
const snapshot = { sources, pages, protectedFiles: Object.fromEntries(protectedFiles.map(f => [f, hash(read(f))])) };
const totals = {
  sourceArticles: sources.length, indexableArticles: pages.filter(p => p.article && p.indexable).length,
  canonicalPages: pages.length, indexablePages: pages.filter(p => p.indexable).length, noindexPages: pages.filter(p => !p.indexable).length,
  sitemapUrls: sitemapUrls.length, sitemapMissingIndexable: pages.filter(p => p.indexable && !sitemapUrls.includes(p.canonical)).map(p => p.route),
  metadataConflicts: pages.reduce((s,p) => s+p.metaConflicts,0), missingPublished: sources.filter(p=>!p.published).length,
  bylines: pages.filter(p=>p.article&&p.byline).length, audioPlayers: pages.reduce((s,p)=>s+p.audio,0),
  articleImages: pages.reduce((s,p)=>s+p.images,0), firstHandArticles: sources.filter(p=>p.firstHandExcerpt).length,
};
const failures = [];
if (process.argv.includes('--snapshot')) {
  if (fs.existsSync(baselinePath)) throw new Error('Refusing to overwrite the baseline');
  fs.writeFileSync(baselinePath, JSON.stringify({ totals, ...snapshot }, null, 2) + '\n');
} else {
  const before = JSON.parse(read(baselinePath));
  const check = (ok, message) => { if (!ok) failures.push(message); };
  check(JSON.stringify(sources.map(p=>p.file)) === JSON.stringify(before.sources.map(p=>p.file)), 'Article filenames changed');
  for (const p of sources) {
    const b = before.sources.find(v=>v.file===p.file);
    check(p.published === b.published, `${p.file}: publication date changed`);
    check(p.affiliateHash === b.affiliateHash, `${p.file}: affiliate URLs changed`);
    check(p.mediaHash === b.mediaHash, `${p.file}: media changed`);
    check(p.bodyHash === b.bodyHash || p.modified, `${p.file}: meaningful edit without modification date`);
    check(p.bodyHash !== b.bodyHash || p.modified === b.modified, `${p.file}: date-only freshness bump`);
  }
  check(pages.length === before.pages.length, 'Page count changed');
  for (const p of pages) {
    const b = before.pages.find(v=>v.route===p.route);
    check(Boolean(b), `${p.route}: new route`);
    if (!b) continue;
    const allSchema = data(load(read(path.join('out', decodeURIComponent(p.route), 'index.html'))));
    const inspectImages = (value, key) => {
      if (Array.isArray(value)) { value.forEach(v=>inspectImages(v,key)); return; }
      if (value && typeof value === 'object') { Object.entries(value).forEach(([k,v])=>inspectImages(v,k)); return; }
      if (['image','logo','contentUrl'].includes(key) && typeof value === 'string' && value.startsWith(site+'/')) check(fs.existsSync(path.join('out', decodeURIComponent(new URL(value).pathname))), `${p.route}: missing schema image ${value}`);
    };
    allSchema.forEach(j=>inspectImages(j));
    check(p.canonical === b.canonical && p.indexable === b.indexable, `${p.route}: canonical/indexability changed`);
    for (const k of ['amazonCards','a8Cards','audio','images','affiliateHash','adSenseDirectives']) check(p[k] === b[k], `${p.route}: ${k} regression`);
    check(JSON.stringify(p.slots) === JSON.stringify(b.slots), `${p.route}: ad slots changed`);
    if (!p.article) continue;
    const $ = load(read(path.join('out', decodeURIComponent(p.route), 'index.html')));
    const schemas = data($), a = schemas.find(j=>j['@type']==='BlogPosting');
    check(schemas.filter(j=>['BlogPosting','Article'].includes(j['@type'])).length===1, `${p.route}: duplicate article schema`);
    check(p.metaConflicts===0 && p.byline==='IELTS Consult', `${p.route}: metadata/byline mismatch`);
    check(a['@id']===p.canonical+'#article' && a.mainEntityOfPage['@id']===p.canonical, `${p.route}: article identity`);
    check(a.author['@id']===site+'/about-author/#person' && a.author.name===p.byline && a.publisher['@id']===site+'/#organization', `${p.route}: author/publisher identity`);
    check(a.author['@id']!==a.publisher['@id'], `${p.route}: person/publisher conflated`);
    check($('article header time').first().attr('datetime')===p.published, `${p.route}: visible publication date`);
    check($('meta[property="article:modified_time"]').attr('content')===p.modified, `${p.route}: OG modification date`);
    if(p.modified!==p.published) check($('article header time[data-modified]').attr('datetime')===p.modified, `${p.route}: visible modification date`);
  }
  for (const [file, digest] of Object.entries(before.protectedFiles)) {
    // RootLayout intentionally changes author metadata only; tracker blocks are checked independently below.
    if(file !== 'app/layout.tsx') check(hash(read(file))===digest || hash(read(file).replace(/\r\n/g,'\n'))===digest, `${file}: protected implementation changed`);
  }
  check(totals.sitemapMissingIndexable.length===0, 'Indexable page omitted from sitemap');
  const profile = data(load(read('out/about-author/index.html'))).find(j=>j['@type']==='ProfilePage');
  check(profile?.mainEntity?.['@id']===site+'/about-author/#person', 'ProfilePage identity');
  const feed = load(read('out/rss.xml'), { xmlMode: true });
  check(feed('item').length===sources.length, 'RSS article count');
  feed('item').each((_,el)=>{
    const item=feed(el), p=pages.find(p=>p.canonical===item.find('link').text());
    check(Boolean(p), 'RSS noncanonical URL');
    if(!p)return;
    check(item.find('title').text()===p.h1 && item.find('description').text()===p.description, `${p.route}: RSS metadata mismatch`);
    check(Date.parse(item.find('pubDate').text())===Date.parse(p.published), `${p.route}: RSS republished as new`);
  });
}
console.log(JSON.stringify({ ...totals, failures }, null, 2));
if (failures.length) process.exitCode = 1;
