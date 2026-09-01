import fs from "node:fs";
import path from "node:path";
import { load } from "cheerio/slim";

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "out");
const siteUrl = (process.env.SITE_URL || "https://ieltsconsult.netlify.app").replace(/\/$/, "");
const siteHost = new URL(siteUrl).hostname;
const manifest = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "content", "note-media-manifest.json"), "utf8")
);
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function routeForOutput(htmlPath) {
  const relative = path.relative(outDir, htmlPath);
  const directory = path.dirname(relative);
  if (directory === ".") return "/";
  return `/${directory.split(path.sep).map(encodeURIComponent).join("/")}/`;
}

async function request(url, method = "GET") {
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    failures.push(`${method} ${url}: ${error.message}`);
    return null;
  }
}

async function inBatches(items, batchSize, callback) {
  for (let index = 0; index < items.length; index += batchSize) {
    await Promise.all(items.slice(index, index + batchSize).map(callback));
  }
}

const htmlFiles = walk(outDir).filter((file) => file.endsWith("index.html"));
const pageRoutes = htmlFiles.map(routeForOutput);
const internalUrls = new Set();
let doubleEncodedCanonicals = 0;
let trainingLinkOccurrences = 0;

await inBatches(pageRoutes, 8, async (route) => {
  const url = `${siteUrl}${route}`;
  const response = await request(url);
  if (!response) return;
  assert(response.status === 200, `${url}: HTML status ${response.status}`);
  const html = await response.text();
  const $ = load(html);
  const canonicalElements = $("link[rel='canonical']");
  assert(canonicalElements.length === 1, `${url}: canonical数 ${canonicalElements.length}`);
  const canonical = canonicalElements.attr("href") || "";
  assert(canonical === url, `${url}: canonical不一致 ${canonical}`);

  try {
    const pathname = new URL(canonical).pathname;
    const onceDecoded = decodeURIComponent(pathname);
    const twiceDecoded = decodeURIComponent(onceDecoded);
    if (onceDecoded !== twiceDecoded) {
      doubleEncodedCanonicals += 1;
    }
  } catch {
    failures.push(`${url}: canonical URL解析失敗`);
  }

  trainingLinkOccurrences += (html.match(/ielts-training\.onrender\.com/gi) || []).length;

  for (const [selector, attribute] of [
    ["a[href]", "href"],
    ["link[href]", "href"],
    ["script[src]", "src"],
    ["img[src]", "src"],
    ["audio[src]", "src"],
    ["source[src]", "src"],
  ]) {
    $(selector).each((_, element) => {
      const value = $(element).attr(attribute) || "";
      if (!value || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(value)) return;
      try {
        const target = new URL(value, siteUrl);
        if (target.hostname !== siteHost) return;
        target.hash = "";
        internalUrls.add(target.href);
      } catch {
        failures.push(`${url}: 内部URL解析失敗 ${value}`);
      }
    });
  }
});

let brokenInternalLinks = 0;
await inBatches([...internalUrls], 12, async (url) => {
  const response = await request(url, "HEAD");
  if (!response || response.status >= 400) {
    brokenInternalLinks += 1;
    failures.push(`${url}: internal status ${response?.status ?? "request failed"}`);
  }
});

const sitemapResponse = await request(`${siteUrl}/sitemap.xml`);
const rssResponse = await request(`${siteUrl}/rss.xml`);
const robotsResponse = await request(`${siteUrl}/robots.txt`);
const sitemap = sitemapResponse ? await sitemapResponse.text() : "";
const rss = rssResponse ? await rssResponse.text() : "";
const robots = robotsResponse ? await robotsResponse.text() : "";
assert(sitemapResponse?.status === 200, `sitemap status ${sitemapResponse?.status}`);
assert(rssResponse?.status === 200, `RSS status ${rssResponse?.status}`);
assert(robotsResponse?.status === 200, `robots status ${robotsResponse?.status}`);
assert((sitemap.match(/<loc>[^<]*\/posts\/[^<]+<\/loc>/g) || []).length === 52, "sitemap記事数不一致");
assert((rss.match(/<item>/g) || []).length === 52, "RSS記事数不一致");
assert(/sitemap\.xml/i.test(robots), "robotsにsitemap指定なし");
assert(doubleEncodedCanonicals === 0, `canonical二重エンコード: ${doubleEncodedCanonicals}`);
assert(trainingLinkOccurrences === 0, `停止済みアプリリンク: ${trainingLinkOccurrences}`);
assert(brokenInternalLinks === 0, `broken internal links: ${brokenInternalLinks}`);

const representative = manifest.articles.find((article) => article.guid === "n0499b6eb6a86");
const smokeUrls = {
  root: `${siteUrl}/`,
  representativePost: `${siteUrl}/posts/${encodeURIComponent(representative.slug)}/`,
  tag: `${siteUrl}/tags/${encodeURIComponent("英語学習")}/`,
  image: `${siteUrl}${representative.images[0].publicPath}`,
  audio: `${siteUrl}${representative.audio.publicPath}`,
  sitemap: `${siteUrl}/sitemap.xml`,
  rss: `${siteUrl}/rss.xml`,
  robots: `${siteUrl}/robots.txt`,
};
const smokeStatus = {};
for (const [name, url] of Object.entries(smokeUrls)) {
  const response = await request(url, name === "image" || name === "audio" ? "HEAD" : "GET");
  smokeStatus[name] = response?.status ?? null;
  assert(response?.status === 200, `${name}: status ${response?.status}`);
  if (response && name !== "image" && name !== "audio") await response.body?.cancel();
}

const report = {
  siteUrl,
  htmlPages: pageRoutes.length,
  checkedInternalUrls: internalUrls.size,
  brokenInternalLinks,
  doubleEncodedCanonicals,
  trainingLinkOccurrences,
  sitemapArticles: (sitemap.match(/<loc>[^<]*\/posts\/[^<]+<\/loc>/g) || []).length,
  rssArticles: (rss.match(/<item>/g) || []).length,
  smokeStatus,
  failures: failures.length,
};

if (failures.length) {
  console.error(JSON.stringify(report, null, 2));
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
