import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { load } from "cheerio/slim";
import sharp from "sharp";

const repoRoot = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "content", "note-media-manifest.json"), "utf8")
);

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

let imageReferences = 0;
let audioReferences = 0;
let amazonLinks = 0;
const expectedImages = new Set();
const expectedAudio = new Set();

assert(manifest.articles.length === 28, `記事数: ${manifest.articles.length}`);

const allPostFiles = fs
  .readdirSync(path.join(repoRoot, "content", "posts"))
  .filter((name) => name.endsWith(".html"));
const targetPostFiles = manifest.articles.map((article) => `${article.slug}.html`);
const targetPostFileSet = new Set(targetPostFiles);
const existingPostFiles = allPostFiles.filter((name) => !targetPostFileSet.has(name));
const expectedPostFiles = new Set([...existingPostFiles, ...targetPostFiles]);
assert(allPostFiles.length === 52, `公開記事ファイル数: ${allPostFiles.length}`);
assert(existingPostFiles.length === 24, `既存記事数: ${existingPostFiles.length}`);
assert(expectedPostFiles.size === 52, `既存記事と対象記事の重複: ${expectedPostFiles.size}`);
assert(
  allPostFiles.every((name) => expectedPostFiles.has(name)),
  "既存24件＋許可済み28件以外の記事があります"
);

const allGuids = [];
for (const filename of allPostFiles) {
  const raw = fs.readFileSync(path.join(repoRoot, "content", "posts", filename), "utf8");
  const guid = raw.match(/note\.com\/ielts_consult\/n\/([A-Za-z0-9]+)/)?.[1];
  assert(Boolean(guid), `${filename}: note GUIDなし`);
  if (guid) allGuids.push(guid);
}
assert(new Set(allGuids).size === 52, "公開記事にGUID重複があります");
assert(new Set(allPostFiles.map((name) => name.slice(0, -5).toLowerCase())).size === 52, "slug重複があります");

const targetGuids = new Set(manifest.articles.map((article) => article.guid));
const locatedTargetGuids = new Set();
let targetDrafts = 0;
let targetNonPosts = 0;
for (const xmlNumber of [1, 2, 3]) {
  const xmlPath = path.join(os.homedir(), "Downloads", `note-ielts_consult-${xmlNumber}.xml`);
  const xml = fs.readFileSync(xmlPath, "utf8");
  for (const item of xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || []) {
    const guid = item.match(/<guid(?:\s[^>]*)?>(?:<!\[CDATA\[)?([^<\]]+)/i)?.[1]?.trim();
    if (!guid || !targetGuids.has(guid)) continue;
    assert(!locatedTargetGuids.has(guid), `${guid}: XML内GUID重複`);
    locatedTargetGuids.add(guid);
    const status = item.match(/<wp:status>(?:<!\[CDATA\[)?([^<\]]+)/i)?.[1]?.trim();
    const postType = item.match(/<wp:post_type>(?:<!\[CDATA\[)?([^<\]]+)/i)?.[1]?.trim();
    if (status !== "publish") targetDrafts += 1;
    if (postType !== "post") targetNonPosts += 1;
  }
}
assert(locatedTargetGuids.size === 28, `XML内対象GUID数: ${locatedTargetGuids.size}`);
assert(targetDrafts === 0, `対象内draft件数: ${targetDrafts}`);
assert(targetNonPosts === 0, `対象内post以外の件数: ${targetNonPosts}`);

for (const article of manifest.articles) {
  const postPath = path.join(repoRoot, "content", "posts", `${article.slug}.html`);
  assert(fs.existsSync(postPath), `${article.guid}: 記事ファイルなし`);
  if (!fs.existsSync(postPath)) continue;

  const raw = fs.readFileSync(postPath, "utf8");
  const $ = load(raw);
  assert($("title").first().text().trim() === article.title, `${article.guid}: title不一致`);
  assert(
    raw.includes(`https://note.com/ielts_consult/n/${article.guid}`),
    `${article.guid}: note GUID不一致`
  );
  assert($("time[datetime]").length === 1, `${article.guid}: 公開日なし`);

  const images = $("article .content img").toArray();
  assert(images.length === article.images.length, `${article.guid}: 画像数不一致`);
  imageReferences += images.length;

  for (let index = 0; index < images.length; index += 1) {
    const $image = $(images[index]);
    const expected = article.images[index];
    const src = $image.attr("src") || "";
    expectedImages.add(src);
    assert(src === expected.publicPath, `${article.guid}: 画像順序不一致 ${index + 1}`);
    assert(src.endsWith(".webp"), `${article.guid}: WebPではありません ${src}`);
    assert(Boolean($image.attr("alt")?.trim()), `${article.guid}: altなし ${src}`);
    assert(Boolean($image.attr("width")), `${article.guid}: widthなし ${src}`);
    assert(Boolean($image.attr("height")), `${article.guid}: heightなし ${src}`);
    if (index === 0) {
      assert($image.attr("loading") === "eager", `${article.guid}: hero loading不正`);
      assert($image.attr("fetchpriority") === "high", `${article.guid}: hero priority不正`);
    } else {
      assert($image.attr("loading") === "lazy", `${article.guid}: lazyなし ${index + 1}`);
    }

    const outputPath = path.join(repoRoot, "public", src.replace(/^\//, ""));
    assert(fs.existsSync(outputPath), `${article.guid}: 画像ファイルなし ${src}`);
    if (fs.existsSync(outputPath)) {
      const metadata = await sharp(outputPath).metadata();
      assert(metadata.format === "webp", `${article.guid}: WebP実体不正 ${src}`);
      assert(metadata.width === expected.width, `${article.guid}: width実体不一致 ${src}`);
      assert(metadata.height === expected.height, `${article.guid}: height実体不一致 ${src}`);
      assert(fs.statSync(outputPath).size === expected.outputBytes, `${article.guid}: 画像サイズ不一致 ${src}`);
    }
  }

  if (article.audio) {
    audioReferences += 1;
    expectedAudio.add(article.audio.publicPath);
    const audioPath = path.join(repoRoot, "public", article.audio.publicPath.replace(/^\//, ""));
    assert(fs.existsSync(audioPath), `${article.guid}: 音声ファイルなし`);
    if (fs.existsSync(audioPath)) {
      assert(fs.statSync(audioPath).size === article.audio.outputBytes, `${article.guid}: 音声サイズ不一致`);
    }
  }

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href") || "";
    try {
      const host = new URL(href).hostname.replace(/^www\./, "").toLowerCase();
      if (["amzn.to", "amazon.co.jp", "amazon.com"].includes(host)) amazonLinks += 1;
    } catch {
      // 相対URLは対象外
    }
  });
}

const generatedImages = fs
  .readdirSync(path.join(repoRoot, "public", "assets"))
  .filter((name) => /^n[a-f0-9]+_.+\.webp$/i.test(name))
  .map((name) => `/assets/${name}`);
const generatedAudio = fs
  .readdirSync(path.join(repoRoot, "public", "audio", "posts"))
  .filter((name) => /^n[a-f0-9]+\.m4a$/i.test(name))
  .map((name) => `/audio/posts/${name}`);

assert(expectedImages.size === 250, `ユニーク画像数: ${expectedImages.size}`);
assert(generatedImages.length === expectedImages.size, `生成画像数: ${generatedImages.length}`);
assert(generatedImages.every((item) => expectedImages.has(item)), "未参照の生成画像があります");
assert(expectedAudio.size === 27, `ユニーク音声数: ${expectedAudio.size}`);
assert(generatedAudio.length === expectedAudio.size, `生成音声数: ${generatedAudio.length}`);
assert(generatedAudio.every((item) => expectedAudio.has(item)), "未参照の生成音声があります");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      articles: manifest.articles.length,
      publicArticles: allPostFiles.length,
      existingArticles: existingPostFiles.length,
      allowlistedFreeArticles: targetPostFiles.length,
      duplicateGuids: allGuids.length - new Set(allGuids).size,
      duplicateSlugs:
        allPostFiles.length -
        new Set(allPostFiles.map((name) => name.slice(0, -5).toLowerCase())).size,
      paidArticlesPublished: 0,
      draftArticlesPublished: targetDrafts,
      imageReferences,
      uniqueImageFiles: expectedImages.size,
      audioReferences,
      uniqueAudioFiles: expectedAudio.size,
      amazonLinks,
      imageSourceBytes: manifest.totals.imageSourceBytes,
      imageOutputBytes: manifest.totals.imageOutputBytes,
      audioSourceBytes: manifest.totals.audioSourceBytes,
      audioOutputBytes: manifest.totals.audioOutputBytes,
      failures: 0,
    },
    null,
    2
  )
);
