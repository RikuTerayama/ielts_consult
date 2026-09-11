import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { load } from "cheerio/slim";

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "out");
const postsDir = path.join(repoRoot, "content", "posts");
const siteUrl = "https://ieltsconsult.netlify.app";
const siteHost = new URL(siteUrl).hostname;
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

function normalizeRouteSegment(segment) {
  return segment.normalize("NFC").toLowerCase();
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function routeForOutput(htmlPath) {
  const relative = path.relative(outDir, htmlPath).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  const directory = path.posix.dirname(relative);
  return `/${directory.split("/").map(encodeURIComponent).join("/")}/`;
}

function outputTargetForPathname(pathname) {
  const decoded = safeDecode(pathname).replace(/^\/+|\/+$/g, "");
  if (!decoded) return path.join(outDir, "index.html");
  const direct = path.join(outDir, ...decoded.split("/"));
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  return path.join(direct, "index.html");
}

function isNotFoundOutput(htmlPath) {
  const relative = path.relative(outDir, htmlPath).replaceAll(path.sep, "/");
  return relative === "404.html" || relative === "404/index.html";
}

function isNoindex($) {
  return /(?:^|[,\s])noindex(?:[,\s]|$)/i.test(
    $("meta[name='robots']").attr("content") || ""
  );
}

function isCanonicalPagePath(pathname) {
  if (pathname !== "/" && !pathname.endsWith("/")) return false;
  return safeDecode(pathname)
    .split("/")
    .filter(Boolean)
    .every((segment) => segment === normalizeRouteSegment(segment));
}

function canonicalPagePath(pathname) {
  const decoded = safeDecode(pathname);
  const segments = decoded.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  return `/${segments.map((segment) => encodeURIComponent(normalizeRouteSegment(segment))).join("/")}/`;
}

function parseJsonLd($) {
  return $("script[type='application/ld+json']")
    .toArray()
    .flatMap((element) => {
      try {
        return [JSON.parse($(element).html() || "")];
      } catch {
        return [];
      }
    });
}

if (!fs.existsSync(outDir)) {
  throw new Error("out がありません。先に production build を実行してください。");
}

const htmlFiles = walk(outDir).filter((file) => file.endsWith(".html"));
const pageByRoute = new Map();
const canonicalToRoute = new Map();
let doubleEncodedCanonicals = 0;

for (const htmlPath of htmlFiles) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const $ = load(html);

  if (isNotFoundOutput(htmlPath)) {
    assert($("link[rel='canonical']").length === 0, `${htmlPath}: 404にcanonicalがあります`);
    assert(isNoindex($), `${htmlPath}: 404がnoindexではありません`);
    continue;
  }

  const route = routeForOutput(htmlPath);
  const canonicalElements = $("link[rel='canonical']");
  const canonical = canonicalElements.attr("href") || "";
  assert(canonicalElements.length === 1, `${route}: canonical数 ${canonicalElements.length}`);
  assert(Boolean($("title").text().trim()), `${route}: titleなし`);
  assert(canonical === `${siteUrl}${route}`, `${route}: 自己参照canonical不一致 ${canonical}`);
  assert(isCanonicalPagePath(route), `${route}: 出力URLが正規化されていません`);

  try {
    const pathname = new URL(canonical).pathname;
    if (decodeURIComponent(pathname) !== decodeURIComponent(decodeURIComponent(pathname))) {
      doubleEncodedCanonicals += 1;
    }
  } catch {
    failures.push(`${route}: canonical解析失敗 ${canonical}`);
  }

  if (canonicalToRoute.has(canonical)) {
    failures.push(`${route}: canonical重複 ${canonicalToRoute.get(canonical)}`);
  }
  canonicalToRoute.set(canonical, route);
  pageByRoute.set(route, { route, htmlPath, html, $, canonical, noindex: isNoindex($) });
}

const internalPageLinks = [];
const brokenInternalLinks = [];
const redirectingInternalLinks = [];
const inboundArticleLinks = new Map();
const relatedInboundArticleLinks = new Map();

for (const page of pageByRoute.values()) {
  page.$("a[href]").each((_, element) => {
    const href = page.$(element).attr("href") || "";
    if (!href || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) return;

    let url;
    try {
      url = new URL(href, siteUrl);
    } catch {
      failures.push(`${page.route}: URL解析失敗 ${href}`);
      return;
    }
    if (url.hostname !== siteHost) return;

    const canonicalTargetRoute = canonicalPagePath(url.pathname);
    const linkedPage = pageByRoute.get(canonicalTargetRoute);
    const target = linkedPage
      ? linkedPage.htmlPath
      : outputTargetForPathname(url.pathname);
    if (!fs.existsSync(target)) {
      brokenInternalLinks.push({ from: page.route, href: url.pathname });
      return;
    }

    if (linkedPage) {
      internalPageLinks.push({ from: page.route, href: url.pathname });
      if (url.pathname !== canonicalTargetRoute) {
        redirectingInternalLinks.push({ from: page.route, href: url.pathname });
      }
    }

    const targetRoute = linkedPage ? canonicalTargetRoute : url.pathname;
    if (/^\/posts\/[^/]+\/$/.test(targetRoute)) {
      inboundArticleLinks.set(
        targetRoute,
        (inboundArticleLinks.get(targetRoute) ?? 0) + 1
      );
      if (/^\/posts\/[^/]+\/$/.test(page.route)) {
        relatedInboundArticleLinks.set(
          targetRoute,
          (relatedInboundArticleLinks.get(targetRoute) ?? 0) + 1
        );
      }
    }
  });
}

for (const item of brokenInternalLinks) {
  failures.push(`${item.from}: broken internal link ${item.href}`);
}
for (const item of redirectingInternalLinks) {
  failures.push(`${item.from}: redirect/noncanonical internal link ${item.href}`);
}

const postPages = [...pageByRoute.values()].filter((page) =>
  /^\/posts\/[^/]+\/$/.test(page.route)
);
const postsIndex = pageByRoute.get("/posts/");
const postIndexLinks = new Set(
  postsIndex
    ? postsIndex.$("a[href^='/posts/']")
        .toArray()
        .map((element) => new URL(postsIndex.$(element).attr("href"), siteUrl).pathname)
    : []
);
const articleTitles = new Set();
const articleDescriptions = new Set();
const articleBodyHashes = new Set();
let articlesWithRelatedInbound = 0;

for (const page of postPages) {
  const title = page.$("title").text().trim();
  const description = page.$("meta[name='description']").attr("content")?.trim() || "";
  const h1 = page.$("article h1").first().text().trim();
  const bodyText = page.$("article .prose").text().replace(/\s+/g, " ").trim();
  const bodyHash = crypto.createHash("sha256").update(bodyText).digest("hex");
  const jsonLd = parseJsonLd(page.$);
  const articleSchema = jsonLd.find((item) => item?.["@type"] === "BlogPosting");
  const breadcrumbSchema = jsonLd.find((item) => item?.["@type"] === "BreadcrumbList");

  assert(!page.noindex, `${page.route}: 記事がnoindexです`);
  assert(Boolean(description), `${page.route}: descriptionなし`);
  assert(Boolean(h1), `${page.route}: H1なし`);
  assert(title.startsWith(h1), `${page.route}: titleとH1が不一致`);
  assert(bodyText.length >= 700, `${page.route}: 本文が薄すぎます (${bodyText.length}文字)`);
  assert(!articleTitles.has(title), `${page.route}: title重複`);
  assert(!articleDescriptions.has(description), `${page.route}: description重複`);
  assert(!articleBodyHashes.has(bodyHash), `${page.route}: 記事本文の完全重複`);
  assert(Boolean(articleSchema), `${page.route}: BlogPostingなし`);
  assert(articleSchema?.url === page.canonical, `${page.route}: BlogPosting URL不一致`);
  assert(Boolean(articleSchema?.datePublished), `${page.route}: datePublishedなし`);
  assert(Boolean(articleSchema?.dateModified), `${page.route}: dateModifiedなし`);
  assert(Boolean(breadcrumbSchema), `${page.route}: BreadcrumbListなし`);
  assert(postIndexLinks.has(page.route), `${page.route}: 記事一覧からのリンクなし`);
  assert((inboundArticleLinks.get(page.route) ?? 0) > 0, `${page.route}: 孤立記事です`);
  if ((relatedInboundArticleLinks.get(page.route) ?? 0) > 0) {
    articlesWithRelatedInbound += 1;
  }

  articleTitles.add(title);
  articleDescriptions.add(description);
  articleBodyHashes.add(bodyHash);
}

const sitemap = fs.readFileSync(path.join(outDir, "sitemap.xml"), "utf8");
const sitemapBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
  loc: match[1].match(/<loc>([^<]+)<\/loc>/)?.[1] || "",
  lastmod: match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
}));
const sitemapUrls = sitemapBlocks.map((entry) => entry.loc);
const sitemapSet = new Set(sitemapUrls);
assert(sitemapSet.size === sitemapUrls.length, "sitemap URL重複があります");

for (const entry of sitemapBlocks) {
  let url;
  try {
    url = new URL(entry.loc);
  } catch {
    failures.push(`sitemap URL解析失敗 ${entry.loc}`);
    continue;
  }
  assert(url.origin === siteUrl, `sitemap origin不一致 ${entry.loc}`);
  assert(isCanonicalPagePath(url.pathname), `sitemap非正規URL ${entry.loc}`);
  const page = pageByRoute.get(url.pathname);
  assert(Boolean(page), `sitemap URLの出力HTMLなし ${entry.loc}`);
  assert(page?.canonical === entry.loc, `sitemap/canonical不一致 ${entry.loc}`);
  assert(!page?.noindex, `sitemapにnoindex URL ${entry.loc}`);
}

for (const page of postPages) {
  assert(sitemapSet.has(page.canonical), `${page.route}: sitemap掲載なし`);
}

const noindexInSitemap = [...pageByRoute.values()].filter(
  (page) => page.noindex && sitemapSet.has(page.canonical)
);
const tagPages = [...pageByRoute.values()].filter((page) =>
  /^\/tags\/[^/]+\/$/.test(page.route)
);
assert(postPages.length === fs.readdirSync(postsDir).filter(file => file.endsWith('.html')).length, `記事出力数 ${postPages.length}`);
assert(sitemapBlocks.length === 10 + postPages.length + tagPages.length, `sitemap URL数 ${sitemapBlocks.length}`);
assert(noindexInSitemap.length === 0, `sitemap内noindex ${noindexInSitemap.length}`);
assert(doubleEncodedCanonicals === 0, `canonical二重エンコード ${doubleEncodedCanonicals}`);

const sourcePosts = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith(".html"))
  .map((file) => {
    const sourceHtml = fs.readFileSync(path.join(postsDir, file), "utf8");
    const $ = load(sourceHtml);
    const slug = file.slice(0, -5);
    const date =
      $("time[datetime]").first().attr("datetime") ||
      $("meta[property='article:published_time']").attr("content") ||
      "";
    return {
      slug,
      route: `/posts/${encodeURIComponent(normalizeRouteSegment(slug))}/`,
      lastmod: ($('meta[property="article:modified_time"]').attr('content') || date)
        ? new Date($('meta[property="article:modified_time"]').attr('content') || date).toISOString() : undefined,
    };
  });

const normalizedSourceSlugs = sourcePosts.map((post) => normalizeRouteSegment(post.slug));
assert(new Set(normalizedSourceSlugs).size === sourcePosts.length, "正規化後の記事slug重複があります");
assert(sourcePosts.every((post) => !/^n[0-9a-z]+$/i.test(post.slug)), "note ID形式の記事slugが残っています");
for (const post of sourcePosts) {
  const entry = sitemapBlocks.find((item) => new URL(item.loc).pathname === post.route);
  assert(entry?.lastmod === post.lastmod, `${post.route}: sitemap lastmod不一致`);
}

const rss = fs.readFileSync(path.join(outDir, "rss.xml"), "utf8");
const rssLinks = [...rss.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((match) => match[1]);
assert(rssLinks.length === sourcePosts.length, `RSS記事数 ${rssLinks.length}`);
assert(new Set(rssLinks).size === rssLinks.length, "RSS GUID重複があります");
assert(rssLinks.every((url) => sitemapSet.has(url)), "RSSに非canonical/非sitemap URLがあります");

const robots = fs.readFileSync(path.join(outDir, "robots.txt"), "utf8");
assert(/Allow:\s*\//i.test(robots), "robots.txtにAllow: / がありません");
assert(!/Disallow:\s*\//i.test(robots), "robots.txtがサイト全体をblockしています");
assert(
  robots.includes(`${siteUrl}/sitemap.xml`),
  "robots.txtのsitemap参照が不正です"
);

const redirects = fs.readFileSync(path.join(outDir, "_redirects"), "utf8");
assert(!/^\/posts\/\*\s+\/$/m.test(redirects), "存在しない記事をホームへ一律redirectしています");
assert(!/\/tags\/ielts\/?\s+\/tags\/IELTS\//.test(redirects), "タグを大文字URLへ戻す競合redirectがあります");

const recentManifest = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "content", "note-media-manifest.json"), "utf8")
);
const recentChecks = recentManifest.articles.map((article) => {
  const route = `/posts/${encodeURIComponent(normalizeRouteSegment(article.slug))}/`;
  return {
    guid: article.guid,
    route,
    inSitemap: sitemapSet.has(`${siteUrl}${route}`),
    linkedFromPostsIndex: postIndexLinks.has(route),
    relatedInboundLinks: relatedInboundArticleLinks.get(route) ?? 0,
  };
});
for (const article of recentChecks) {
  assert(article.inSitemap, `${article.guid}: 直近追加記事がsitemapにありません`);
  assert(article.linkedFromPostsIndex, `${article.guid}: 直近追加記事が記事一覧からリンクされていません`);
}

const report = {
  htmlOutputs: htmlFiles.length,
  canonicalPages: pageByRoute.size,
  articlePages: postPages.length,
  tagPages: tagPages.length,
  sitemapUrls: sitemapBlocks.length,
  sitemapArticleUrls: sitemapUrls.filter((url) =>
    /^\/posts\/[^/]+\/$/.test(new URL(url).pathname)
  ).length,
  sitemapNoindexUrls: noindexInSitemap.length,
  sitemapDuplicateUrls: sitemapUrls.length - sitemapSet.size,
  brokenInternalLinks: brokenInternalLinks.length,
  redirectingInternalLinks: redirectingInternalLinks.length,
  canonicalDuplicates: pageByRoute.size - canonicalToRoute.size,
  doubleEncodedCanonicals,
  normalizedSlugDuplicates: sourcePosts.length - new Set(normalizedSourceSlugs).size,
  noteIdArticleOutputs: postPages.filter((page) => /^\/posts\/n[0-9a-z]+\/$/i.test(page.route)).length,
  orphanArticles: postPages.filter((page) => (inboundArticleLinks.get(page.route) ?? 0) === 0).length,
  articlesLinkedFromPostsIndex: postPages.filter((page) => postIndexLinks.has(page.route)).length,
  articlesWithRelatedInbound,
  recentArticles: recentChecks.length,
  recentInSitemap: recentChecks.filter((article) => article.inSitemap).length,
  recentLinkedFromPostsIndex: recentChecks.filter((article) => article.linkedFromPostsIndex).length,
  recentWithRelatedInbound: recentChecks.filter((article) => article.relatedInboundLinks > 0).length,
  rssArticles: rssLinks.length,
  failures: failures.length,
};

if (failures.length) {
  console.error(JSON.stringify(report, null, 2));
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
