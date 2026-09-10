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

async function request(url, method = "GET", redirect = "follow") {
  try {
    return await fetch(url, {
      method,
      redirect,
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
const pageRoutes = htmlFiles
  .map(routeForOutput)
  .filter((route) => route !== "/404/");
const internalUrls = new Set();
let doubleEncodedCanonicals = 0;
let trainingLinkOccurrences = 0;

await inBatches(pageRoutes, 8, async (route) => {
  const url = `${siteUrl}${route}`;
  const response = await request(url, "GET", "manual");
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
let redirectingInternalLinks = 0;
await inBatches([...internalUrls], 12, async (url) => {
  const response = await request(url, "HEAD", "manual");
  if (response && response.status >= 300 && response.status < 400) {
    redirectingInternalLinks += 1;
    failures.push(`${url}: internal redirect ${response.status} ${response.headers.get("location") || ""}`);
    return;
  }
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
assert((sitemap.match(/<url>/g) || []).length === 75, "sitemap URL総数不一致");
assert((rss.match(/<item>/g) || []).length === 52, "RSS記事数不一致");
assert(/sitemap\.xml/i.test(robots), "robotsにsitemap指定なし");
assert(doubleEncodedCanonicals === 0, `canonical二重エンコード: ${doubleEncodedCanonicals}`);
assert(trainingLinkOccurrences === 0, `停止済みアプリリンク: ${trainingLinkOccurrences}`);
assert(brokenInternalLinks === 0, `broken internal links: ${brokenInternalLinks}`);
assert(redirectingInternalLinks === 0, `redirecting internal links: ${redirectingInternalLinks}`);

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert(new Set(sitemapUrls).size === sitemapUrls.length, "sitemap URL重複");
let sitemapRedirects = 0;
let sitemapErrors = 0;
let sitemapNoindex = 0;
await inBatches(sitemapUrls, 8, async (url) => {
  const response = await request(url, "GET", "manual");
  if (!response) {
    sitemapErrors += 1;
    return;
  }
  if (response.status >= 300 && response.status < 400) {
    sitemapRedirects += 1;
    failures.push(`${url}: sitemap redirect ${response.status} ${response.headers.get("location") || ""}`);
    return;
  }
  if (response.status !== 200) {
    sitemapErrors += 1;
    failures.push(`${url}: sitemap status ${response.status}`);
    return;
  }
  const html = await response.text();
  const $ = load(html);
  const canonical = $("link[rel='canonical']").attr("href") || "";
  const robotsMeta = $("meta[name='robots']").attr("content") || "";
  assert(canonical === url, `${url}: sitemap URLのcanonical不一致 ${canonical}`);
  if (/noindex/i.test(robotsMeta)) {
    sitemapNoindex += 1;
    failures.push(`${url}: sitemapにnoindex`);
  }
});

const normalizeRouteSegment = (value) => value.normalize("NFC").toLowerCase();
const encodeRouteSegment = (value) => encodeURIComponent(normalizeRouteSegment(value));
const representative = manifest.articles.find((article) => article.guid === "n0499b6eb6a86");
const smokeUrls = {
  root: `${siteUrl}/`,
  representativePost: `${siteUrl}/posts/${encodeRouteSegment(representative.slug)}/`,
  tag: `${siteUrl}/tags/${encodeRouteSegment("英語学習")}/`,
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

const legacy404Paths = [
  "/posts/n15d8a98fb855",
  "/posts/n15d8a98fb855/",
  "/posts/n2d360aa73005/",
  "/posts/n17e52d8f3cbe",
  "/posts/n17e52d8f3cbe/",
];
const legacy404 = [];
for (const pathname of legacy404Paths) {
  const response = await request(`${siteUrl}${pathname}`, "GET", "manual");
  const html = response ? await response.text() : "";
  const $ = load(html);
  const result = {
    pathname,
    status: response?.status ?? null,
    location: response?.headers.get("location") || null,
    canonical: $("link[rel='canonical']").attr("href") || null,
    robots: $("meta[name='robots']").attr("content") || null,
    title: $("title").text().trim() || null,
  };
  legacy404.push(result);
  assert(result.status === 404, `${pathname}: legacy URL status ${result.status}`);
  assert(result.canonical === null, `${pathname}: 404にcanonical ${result.canonical}`);
  assert(/noindex/i.test(result.robots || ""), `${pathname}: 404がnoindexではありません`);
}

async function inspectRedirect(pathname) {
  const response = await request(`${siteUrl}${pathname}`, "GET", "manual");
  return {
    pathname,
    status: response?.status ?? null,
    location: response?.headers.get("location") || null,
  };
}

const normalizationChecks = [
  await inspectRedirect("/tags/Speaking"),
  await inspectRedirect("/tags/Speaking/"),
  await inspectRedirect("/tags/speaking"),
  await inspectRedirect("/tags/speaking/"),
  await inspectRedirect(`/tags/${encodeURIComponent("表現")}/`),
];
for (const result of normalizationChecks) {
  if (result.pathname === "/tags/speaking/" || result.pathname.includes(encodeURIComponent("表現"))) {
    assert(result.status === 200, `${result.pathname}: 正規タグURL status ${result.status}`);
  } else {
    assert(result.status === 301, `${result.pathname}: 非正規タグURL status ${result.status}`);
    assert(result.location === "/tags/speaking/", `${result.pathname}: redirect先 ${result.location}`);
  }
}

const report = {
  siteUrl,
  htmlPages: pageRoutes.length,
  checkedInternalUrls: internalUrls.size,
  brokenInternalLinks,
  redirectingInternalLinks,
  doubleEncodedCanonicals,
  trainingLinkOccurrences,
  sitemapUrls: sitemapUrls.length,
  sitemapArticles: (sitemap.match(/<loc>[^<]*\/posts\/[^<]+<\/loc>/g) || []).length,
  sitemapRedirects,
  sitemapErrors,
  sitemapNoindex,
  rssArticles: (rss.match(/<item>/g) || []).length,
  smokeStatus,
  legacy404,
  normalizationChecks,
  failures: failures.length,
};

if (failures.length) {
  console.error(JSON.stringify(report, null, 2));
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
