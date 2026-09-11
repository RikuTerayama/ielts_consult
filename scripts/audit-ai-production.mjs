import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const site = 'https://ieltsconsult.netlify.app';
const baseline = JSON.parse(fs.readFileSync('docs/ai-search-baseline.json','utf8'));
const failures = [], checks = [], botChecks = [];
const check = (ok,message) => { if(!ok) failures.push(message); };
const htmlData = (html) => {
  const $ = load(html);
  return {
    canonical: $('link[rel=canonical]').attr('href'), canonicalCount:$('link[rel=canonical]').length,
    title:$('title').text(), description:$('meta[name=description]').attr('content'),
    noindex:/noindex/.test($('meta[name=robots]').attr('content') || ''),
    byline:$('article header a[rel=author]').text(),
    schema:$('script[type="application/ld+json"]').toArray().map(e=>JSON.parse($(e).text())),
    articleBody:$('article .prose').text(),
    affiliateUrls:$('a[href]').toArray().map(e=>$(e).attr('href')).filter(v=>/amzn\.to|amazon\.|a8\.net/.test(v)),
    media:$('article img, article audio, article source').toArray().map(e=>$(e).attr('src')),
    slots:$('[data-a8-slot]').toArray().map(e=>$(e).attr('data-a8-slot')),
    adsenseDirectives:$('script').toArray().filter(e=>/__next_s.*adsbygoogle\.js/.test($(e).text())).length,
    adsenseClients:[...new Set(html.match(/ca-pub-\d+/g)||[])],
  };
};
const get = async (url, ua) => fetch(url,{redirect:'manual',signal:AbortSignal.timeout(30000),headers:ua?{'User-Agent':ua}:{}});
const articlePages = baseline.pages.filter(p=>p.article);
const pages = [...articlePages, ...baseline.pages.filter(p=>['/','/about-author/','/editorial-policy/'].includes(p.route))];
for(let i=0;i<pages.length;i+=6) {
  await Promise.all(pages.slice(i,i+6).map(async p=>{
    try {
      const r=await get(site+p.route), local=htmlData(fs.readFileSync(path.join('out',decodeURIComponent(p.route),'index.html'),'utf8'));
      check(r.status===200,`${p.route}: HTTP ${r.status}`);
      check(!/noindex|none/i.test(r.headers.get('x-robots-tag')||''),`${p.route}: X-Robots-Tag`);
      const prod=htmlData(await r.text());
      for(const k of Object.keys(local))check(JSON.stringify(prod[k])===JSON.stringify(local[k]),`${p.route}: production/local ${k} mismatch`);
      check(prod.canonicalCount===1 && prod.canonical===site+p.route,`${p.route}: canonical`);
      check(prod.adsenseDirectives===1 && prod.adsenseClients.length===1,`${p.route}: AdSense loading`);
      checks.push({route:p.route,status:r.status,canonical:prod.canonical,byline:prod.byline});
    }catch(e){failures.push(`${p.route}: ${e.message}`);}
  }));
}
const files=[];
for(const file of ['robots.txt','sitemap.xml','rss.xml','ads.txt']) {
  const r=await get(`${site}/${file}`),text=await r.text();
  check(r.status===200,`${file}: HTTP ${r.status}`);
  check(text.replace(/\r\n/g,'\n').trim()===fs.readFileSync(`out/${file}`,'utf8').replace(/\r\n/g,'\n').trim(),`${file}: production/local mismatch`);
  files.push({file,status:r.status});
}
const selected = baseline.sources.filter(s=>{
  const html=fs.readFileSync(path.join('content/posts',s.file),'utf8');
  return /article:modified_time/.test(html);
}).map(s=>'/posts/'+encodeURIComponent(s.file.slice(0,-5).normalize('NFC').toLowerCase())+'/');
const uas = {
  Googlebot:'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  Bingbot:'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'OAI-SearchBot':'Mozilla/5.0 (compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot)',
  PerplexityBot:'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
};
for(const [bot,ua]of Object.entries(uas)){
  for(const route of ['/',...selected]){
    const r=await get(site+route,ua),$=load(await r.text());
    const ok=r.status===200&&$('link[rel=canonical]').attr('href')===site+route&&!/noindex|none/.test(($('meta[name=robots]').attr('content')||'')+(r.headers.get('x-robots-tag')||''));
    check(ok,`${bot} ${route}: crawl test failed`);botChecks.push({bot,route,status:r.status,ok});
  }
}
const report={pagesChecked:checks.length,articlesChecked:articlePages.length,files,botRequests:botChecks.length,botFailures:botChecks.filter(x=>!x.ok).length,officialIpOriginVerified:false,selectedUrls:selected.map(p=>site+p),failures};
if(process.argv.includes('--write-evidence'))fs.writeFileSync('out/ai-production-audit.json',JSON.stringify({...report,checks,botChecks},null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exitCode=1;
