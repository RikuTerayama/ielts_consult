import fs from "node:fs";
import path from "node:path";
import { load } from "cheerio/slim";

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "out");
const siteUrl = "https://ieltsconsult.netlify.app";
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

function safeDecode(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function outputTargetForPathname(pathname) {
  const decoded = safeDecode(pathname).replace(/^\/+/, "");
  if (!decoded) return path.join(outDir, "index.html");
  const direct = path.join(outDir, ...decoded.split("/"));
  if (path.extname(direct)) return direct;
  return path.join(direct, "index.html");
}

function internalTarget(value) {
  if (!value || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(value)) return null;
  let url;
  try {
    url = new URL(value, siteUrl);
  } catch {
    return null;
  }
  if (url.hostname !== siteHost) return null;
  return outputTargetForPathname(url.pathname);
}

const htmlFiles = walk(outDir).filter((file) => file.endsWith(".html"));
let checkedInternalReferences = 0;
let doubleEncodedCanonicals = 0;
for (const htmlPath of htmlFiles) {
  const $ = load(fs.readFileSync(htmlPath, "utf8"));
  assert($("link[rel='canonical']").length === 1, `${htmlPath}: canonicalが1件ではありません`);
  const canonical = $("link[rel='canonical']").attr("href") || "";
  try {
    const pathname = new URL(canonical).pathname;
    const onceDecoded = decodeURIComponent(pathname);
    const twiceDecoded = decodeURIComponent(onceDecoded);
    if (onceDecoded.replace(/%23/gi, "#") !== twiceDecoded) {
      doubleEncodedCanonicals += 1;
    }
  } catch {
    failures.push(`${htmlPath}: canonical URL解析失敗`);
  }

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
      const target = internalTarget(value);
      if (!target) return;
      checkedInternalReferences += 1;
      assert(fs.existsSync(target), `${htmlPath}: 参照先なし ${value}`);
    });
  }
}

const encodePostSlugForPath = (slug) =>
  encodeURIComponent(slug).replace(/%23/g, "%2523");
const postSlugByOutputDirectory = new Map(
  fs
    .readdirSync(path.join(repoRoot, "content", "posts"))
    .filter((name) => name.endsWith(".html"))
    .map((name) => name.slice(0, -5))
    .map((slug) => [slug.replace(/#/g, "%23"), slug])
);
const postOutputFiles = htmlFiles.filter((file) => {
  const relative = path.relative(path.join(outDir, "posts"), file);
  return !relative.startsWith("..") && relative !== "index.html" && /^[^\\/]+[\\/]index\.html$/.test(relative);
});
const articleCanonicals = [];
for (const htmlPath of postOutputFiles) {
  const outputDirectory = path.basename(path.dirname(htmlPath));
  const slug = postSlugByOutputDirectory.get(outputDirectory);
  assert(Boolean(slug), `${outputDirectory}: 対応する記事slugなし`);
  const $ = load(fs.readFileSync(htmlPath, "utf8"));
  const canonical = $("link[rel='canonical']").attr("href") || "";
  const expected = `${siteUrl}/posts/${encodePostSlugForPath(slug || outputDirectory)}/`;
  assert(canonical === expected, `${slug}: 全記事canonical不一致`);
  articleCanonicals.push(canonical);
}
assert(postOutputFiles.length === 52, `出力記事数: ${postOutputFiles.length}`);
assert(new Set(articleCanonicals).size === 52, "記事canonical重複があります");
assert(doubleEncodedCanonicals === 0, `canonical二重エンコード: ${doubleEncodedCanonicals}`);

const tagOutputFiles = htmlFiles.filter((file) => {
  const relative = path.relative(path.join(outDir, "tags"), file);
  return !relative.startsWith("..") && relative !== "index.html" && /^[^\\/]+[\\/]index\.html$/.test(relative);
});
for (const htmlPath of tagOutputFiles) {
  const tag = path.basename(path.dirname(htmlPath));
  const $ = load(fs.readFileSync(htmlPath, "utf8"));
  const canonical = $("link[rel='canonical']").attr("href") || "";
  assert(
    canonical === `${siteUrl}/tags/${encodeURIComponent(tag)}/`,
    `${tag}: タグcanonical不一致`
  );
}
assert(tagOutputFiles.length === 13, `タグ出力数: ${tagOutputFiles.length}`);

let targetImages = 0;
let targetAudio = 0;
let targetAffiliateCards = 0;
for (const article of manifest.articles) {
  const articlePath = path.join(outDir, "posts", article.slug, "index.html");
  assert(fs.existsSync(articlePath), `${article.guid}: 出力HTMLなし`);
  if (!fs.existsSync(articlePath)) continue;

  const $ = load(fs.readFileSync(articlePath, "utf8"));
  const expectedCanonical = `${siteUrl}/posts/${encodeURIComponent(article.slug)}/`;
  assert(
    $("link[rel='canonical']").attr("href") === expectedCanonical,
    `${article.guid}: canonical不一致`
  );
  assert(Boolean($("meta[name='description']").attr("content")?.trim()), `${article.guid}: descriptionなし`);
  assert(Boolean($("meta[property='og:title']").attr("content")?.trim()), `${article.guid}: og:titleなし`);
  assert(Boolean($("meta[property='og:image']").attr("content")?.trim()), `${article.guid}: og:imageなし`);

  const jsonLd = $("script[type='application/ld+json']")
    .toArray()
    .flatMap((element) => {
      try {
        return [JSON.parse($(element).html() || "")];
      } catch {
        failures.push(`${article.guid}: JSON-LD解析失敗`);
        return [];
      }
    });
  const articleSchema = jsonLd.find((item) => item["@type"] === "BlogPosting");
  const breadcrumbSchema = jsonLd.find((item) => item["@type"] === "BreadcrumbList");
  assert(Boolean(articleSchema), `${article.guid}: BlogPostingなし`);
  assert(articleSchema?.url === expectedCanonical, `${article.guid}: BlogPosting URL不一致`);
  assert(Boolean(articleSchema?.datePublished), `${article.guid}: datePublishedなし`);
  assert(Boolean(breadcrumbSchema), `${article.guid}: BreadcrumbListなし`);
  assert(breadcrumbSchema?.itemListElement?.[0]?.item === `${siteUrl}/`, `${article.guid}: パンくずHomeなし`);

  const images = $("article .prose img");
  targetImages += images.length;
  assert(images.length === article.images.length, `${article.guid}: 出力画像数不一致`);

  const audio = $("article .prose audio");
  if (article.audio) {
    targetAudio += audio.length;
    assert(audio.length === 1, `${article.guid}: 音声プレイヤー数不一致`);
    assert(audio.attr("preload") === "none", `${article.guid}: preload不正`);
    assert(audio.attr("src") === article.audio.publicPath, `${article.guid}: 音声URL不一致`);
  } else {
    assert(audio.length === 0, `${article.guid}: 不要な音声プレイヤー`);
  }

  const sourcePath = path.join(repoRoot, "content", "posts", `${article.slug}.html`);
  const $source = load(fs.readFileSync(sourcePath, "utf8"));
  let bareAmazonLinks = 0;
  $source("p.link").each((_, element) => {
    const children = $source(element).children();
    if (children.length !== 1 || !children.first().is("a[href]")) return;
    const href = children.first().attr("href") || "";
    if (children.first().text().trim() !== href.trim()) return;
    try {
      const host = new URL(href).hostname.replace(/^www\./, "").toLowerCase();
      if (["amzn.to", "amazon.co.jp", "amazon.com"].includes(host)) bareAmazonLinks += 1;
    } catch {
      // 相対URLはAmazonリンクではない
    }
  });

  const cards = $("a.affiliate-card[data-affiliate='amazon']");
  targetAffiliateCards += cards.length;
  assert(cards.length === bareAmazonLinks, `${article.guid}: Amazonカード数不一致`);
  cards.each((_, element) => {
    const $card = $(element);
    const rel = new Set(($card.attr("rel") || "").split(/\s+/));
    assert(rel.has("nofollow") && rel.has("sponsored"), `${article.guid}: Amazon rel不正`);
    assert($card.find(".affiliate-card__label").text().includes("PR"), `${article.guid}: PR表示なし`);
    assert(
      $card.find(".affiliate-card__cta").text().includes("Amazon.co.jpで商品を見る"),
      `${article.guid}: Amazon CTA不正`
    );
  });
}

const allOutputText = htmlFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
assert(!/ielts-training\.onrender\.com|TRAINING_APP_URL|トレーニングアプリ/i.test(allOutputText), "停止済みアプリ導線が残っています");

const sitemap = fs.readFileSync(path.join(outDir, "sitemap.xml"), "utf8");
const rss = fs.readFileSync(path.join(outDir, "rss.xml"), "utf8");
assert((sitemap.match(/<loc>[^<]*\/posts\/[^<]+<\/loc>/g) || []).length === 52, "sitemap記事数不一致");
assert((rss.match(/<item>/g) || []).length === 52, "RSS記事数不一致");
assert(articleCanonicals.every((url) => sitemap.includes(`<loc>${url}</loc>`)), "sitemapに記事canonical欠落");
const rssGuids = [...rss.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((match) => match[1]);
assert(new Set(rssGuids).size === 52, "RSS GUID重複");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      htmlFiles: htmlFiles.length,
      checkedInternalReferences,
      targetArticles: manifest.articles.length,
      targetImages,
      targetAudio,
      targetAffiliateCards,
      articleCanonicals: articleCanonicals.length,
      duplicateArticleCanonicals:
        articleCanonicals.length - new Set(articleCanonicals).size,
      doubleEncodedCanonicals,
      tagPages: tagOutputFiles.length,
      sitemapArticles: 52,
      rssArticles: 52,
      failures: 0,
    },
    null,
    2
  )
);
