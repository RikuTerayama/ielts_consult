import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { load } from "cheerio/slim";

const repoRoot = process.cwd();
const exportRoot = process.env.NOTE_EXPORT_ROOT || path.join(os.homedir(), "Downloads");
const postsDir = path.join(repoRoot, "content", "posts");
const publicAudioDir = path.join(repoRoot, "public", "audio", "posts");
const outPostsDir = path.join(repoRoot, "out", "posts");
const audioExtensions = new Set([".m4a", ".mp3", ".wav"]);

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function unwrapXmlText(value = "") {
  return value
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getXmlElement(itemXml, tagName) {
  const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return unwrapXmlText(
    itemXml.match(
      new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, "i")
    )?.[1] ?? ""
  );
}

function extractGuid(value) {
  return value.match(/note\.com\/ielts_consult\/n\/(n[0-9a-z]+)/i)?.[1];
}

function extractAudioRefs(contentEncoded) {
  const decoded = unwrapXmlText(contentEncoded);
  const matches = decoded.match(
    /(?:https?:\/\/|\/assets\/)[^\s"'<>]+?\.(?:m4a|mp3|wav)(?:\?[^\s"'<>]*)?/gi
  );
  return [...new Set(matches ?? [])];
}

function getUrlBasename(url) {
  try {
    return decodeURIComponent(
      path.posix.basename(new URL(url, "https://local.invalid").pathname)
    );
  } catch {
    return "";
  }
}

function normalizeTitle(value) {
  return value.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();
}

const xmlItemsByGuid = new Map();
const assetFilesByExport = new Map();

for (let exportNumber = 1; exportNumber <= 3; exportNumber += 1) {
  const xmlPath = path.join(exportRoot, `note-ielts_consult-${exportNumber}.xml`);
  const assetsDir = path.join(exportRoot, `assets${exportNumber}`);
  if (!fs.existsSync(xmlPath)) {
    throw new Error(`XML not found: ${xmlPath}`);
  }
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`Assets directory not found: ${assetsDir}`);
  }

  const assetFiles = walkFiles(assetsDir).filter((filePath) =>
    audioExtensions.has(path.extname(filePath).toLowerCase())
  );
  assetFilesByExport.set(
    exportNumber,
    new Map(assetFiles.map((filePath) => [path.basename(filePath).toLowerCase(), filePath]))
  );

  const xml = fs.readFileSync(xmlPath, "utf8");
  const itemMatches = xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi);
  for (const match of itemMatches) {
    const itemXml = match[1];
    const guid =
      extractGuid(getXmlElement(itemXml, "guid")) || extractGuid(itemXml);
    if (!guid) continue;

    const contentEncoded = getXmlElement(itemXml, "content:encoded");
    const entry = {
      exportNumber,
      title: getXmlElement(itemXml, "title").replace(/<[^>]+>/g, "").trim(),
      audioRefs: extractAudioRefs(contentEncoded),
    };
    const existing = xmlItemsByGuid.get(guid) ?? [];
    existing.push(entry);
    xmlItemsByGuid.set(guid, existing);
  }
}

const publicAudioFiles = walkFiles(publicAudioDir).filter((filePath) =>
  audioExtensions.has(path.extname(filePath).toLowerCase())
);

const postFiles = fs
  .readdirSync(postsDir)
  .filter((fileName) => fileName.endsWith(".html"))
  .sort((a, b) => a.localeCompare(b, "ja"));

const results = postFiles.map((fileName) => {
  const sourcePath = path.join(postsDir, fileName);
  const sourceHtml = fs.readFileSync(sourcePath, "utf8");
  const $ = load(sourceHtml);
  const guid = extractGuid(sourceHtml);
  const title = $("title").first().text().trim();
  const slug = fileName.slice(0, -".html".length);
  const xmlMatches = guid ? xmlItemsByGuid.get(guid) ?? [] : [];
  const xmlItem = xmlMatches.length === 1 ? xmlMatches[0] : undefined;
  const xmlHasAudio = Boolean(xmlItem?.audioRefs.length);

  const publicAudioPath = publicAudioFiles.find((filePath) => {
    const extension = path.extname(filePath);
    const baseName = path.basename(filePath, extension);
    return baseName === guid || normalizeTitle(baseName) === normalizeTitle(title);
  });
  const productionHasAudio = Boolean(publicAudioPath);

  const assetMap = xmlItem
    ? assetFilesByExport.get(xmlItem.exportNumber) ?? new Map()
    : new Map();
  const sourceAssetMatches = (xmlItem?.audioRefs ?? [])
    .map(getUrlBasename)
    .filter(Boolean)
    .map((baseName) => assetMap.get(baseName.toLowerCase()))
    .filter(Boolean);

  const builtPath = path.join(outPostsDir, slug, "index.html");
  let builtPlayerCount;
  let builtAudioSrc;
  let builtAudioExists;
  if (fs.existsSync(builtPath)) {
    const builtHtml = fs.readFileSync(builtPath, "utf8");
    const $built = load(builtHtml);
    builtPlayerCount = $built(".post-audio audio").length;
    builtAudioSrc = $built(".post-audio audio").first().attr("src");
    builtAudioExists = builtAudioSrc
      ? fs.existsSync(
          path.join(repoRoot, "public", decodeURIComponent(builtAudioSrc).replace(/^\//, ""))
        )
      : undefined;
  }

  const classification = xmlHasAudio
    ? productionHasAudio
      ? "A"
      : "B"
    : "C";

  return {
    slug,
    title,
    guid,
    xmlMatchCount: xmlMatches.length,
    exportNumber: xmlItem?.exportNumber,
    xmlAudioRefCount: xmlItem?.audioRefs.length ?? 0,
    xmlHasAudio,
    sourceAssetMatchCount: sourceAssetMatches.length,
    publicAudio: publicAudioPath ? path.basename(publicAudioPath) : undefined,
    productionHasAudio,
    builtPlayerCount,
    builtAudioSrc,
    builtAudioExists,
    classification,
  };
});

const classA = results.filter((result) => result.classification === "A");
const classB = results.filter((result) => result.classification === "B");
const classC = results.filter((result) => result.classification === "C");
const missingXml = results.filter((result) => result.xmlMatchCount === 0);
const duplicateXml = results.filter((result) => result.xmlMatchCount > 1);
const missingSourceAsset = results.filter(
  (result) => result.xmlAudioRefCount > 0 && result.sourceAssetMatchCount === 0
);
const builtPages = results.filter((result) => result.builtPlayerCount !== undefined);
const brokenBuiltAudio = results.filter(
  (result) => result.builtAudioSrc && result.builtAudioExists === false
);
const builtPlayerMismatch = results.filter(
  (result) =>
    result.builtPlayerCount !== undefined &&
    (result.builtPlayerCount > 0) !== result.xmlHasAudio
);
const mappedPublicAudio = new Set(
  results.map((result) => result.publicAudio).filter(Boolean)
);
const unmappedPublicAudio = publicAudioFiles.filter(
  (filePath) => !mappedPublicAudio.has(path.basename(filePath))
);

const summary = {
  publishedArticles: results.length,
  uniqueArticleGuids: new Set(results.map((result) => result.guid).filter(Boolean)).size,
  xmlAudioArticles: classA.length + classB.length,
  productionAudioArticles: results.filter((result) => result.productionHasAudio).length,
  publicAudioFiles: publicAudioFiles.length,
  unmappedPublicAudioFiles: unmappedPublicAudio.length,
  classification: { A: classA.length, B: classB.length, C: classC.length },
  missingXmlMappings: missingXml.length,
  duplicateXmlMappings: duplicateXml.length,
  xmlAudioWithoutExactMappedAsset: missingSourceAsset.length,
  builtPagesAudited: builtPages.length,
  builtAudioPlayerArticles: builtPages.filter((result) => result.builtPlayerCount > 0).length,
  builtAudioPlayers: builtPages.reduce(
    (total, result) => total + (result.builtPlayerCount ?? 0),
    0
  ),
  brokenBuiltAudio: brokenBuiltAudio.length,
  builtPlayerMismatch: builtPlayerMismatch.length,
};

console.log(JSON.stringify(summary, null, 2));

for (const [label, entries] of [
  ["B_XML_AUDIO_PRODUCTION_MISSING", classB],
  ["MISSING_XML_MAPPING", missingXml],
  ["DUPLICATE_XML_MAPPING", duplicateXml],
  ["MISSING_EXACT_MAPPED_ASSET", missingSourceAsset],
  ["BROKEN_BUILT_AUDIO", brokenBuiltAudio],
  ["BUILT_PLAYER_XML_MISMATCH", builtPlayerMismatch],
]) {
  if (entries.length > 0) {
    console.log(`\n${label}`);
    for (const entry of entries) {
      console.log(
        JSON.stringify({
          guid: entry.guid,
          title: entry.title,
          exportNumber: entry.exportNumber,
          xmlMatchCount: entry.xmlMatchCount,
          xmlAudioRefCount: entry.xmlAudioRefCount,
          sourceAssetMatchCount: entry.sourceAssetMatchCount,
          publicAudio: entry.publicAudio,
          builtAudioSrc: entry.builtAudioSrc,
        })
      );
    }
  }
}

const hasFailures =
  results.length !== 52 ||
  missingXml.length > 0 ||
  duplicateXml.length > 0 ||
  classB.length > 0 ||
  missingSourceAsset.length > 0 ||
  brokenBuiltAudio.length > 0 ||
  builtPlayerMismatch.length > 0 ||
  unmappedPublicAudio.length > 0;

if (hasFailures) process.exitCode = 1;
