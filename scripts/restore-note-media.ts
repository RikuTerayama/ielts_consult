/**
 * 前回追加した無料28記事だけを対象に、note XMLのDOM順序どおり画像を復元し、
 * XML番号と同番号のassetsフォルダから音声を復元する。
 *
 * - XML1 -> assets1 / XML2 -> assets2 / XML3 -> assets3 を固定
 * - basename完全一致のみ許可
 * - 本文テキストが前回のtext-only変換結果と一致しない場合は中止
 * - 画像はWebPへ変換し、音声はpreload制御を行う既存プレイヤー用にGUID名で保存
 */

import fs from "fs-extra";
import path from "path";
import os from "os";
import sharp from "sharp";
import { load } from "cheerio/slim";
import {
  parseItemXml,
  sanitizeContent,
} from "./convert-single-item-to-html";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const PUBLIC_ASSETS_DIR = path.join(process.cwd(), "public", "assets");
const PUBLIC_AUDIO_DIR = path.join(process.cwd(), "public", "audio", "posts");
const MANIFEST_PATH = path.join(
  process.cwd(),
  "content",
  "note-media-manifest.json"
);

const TARGET_GUIDS = new Set(
  "nc225998bf8aa na4908fe7896d nacdad5439802 n0499b6eb6a86 n2cc66f281895 n13c34eab9dc2 n10aac88b2c89 n072e4a71d99e n304c475212df nb53a3e2953f9 n303ea64508a9 n808bf1d8a4fe n19af47791846 n4a317b4b4856 nc6d05d209dc4 nbd106ce20b62 n638411efd264 n381d033cf051 nfe4ef24511a3 ndd996f990008 n2dc836537c0f n4fa0c9400a0c ne313df4e5377 ncc57e2ac3602 n7142c12eb3d1 ne188a27bc1ee n496297eb2ea0 n9f4201a867c7"
    .split(" ")
);

type SourceConfig = {
  xmlNumber: 1 | 2 | 3;
  xmlPath: string;
  assetsDir: string;
};

type ManifestAsset = {
  source: string;
  publicPath: string;
  sourceBytes: number;
  outputBytes: number;
  width?: number;
  height?: number;
  alt?: string;
};

type ManifestArticle = {
  guid: string;
  xmlNumber: number;
  slug: string;
  title: string;
  images: ManifestAsset[];
  audio?: ManifestAsset;
};

function getSources(): SourceConfig[] {
  const downloads = path.join(os.homedir(), "Downloads");
  return ([1, 2, 3] as const).map((xmlNumber) => ({
    xmlNumber,
    xmlPath: path.join(downloads, `note-ielts_consult-${xmlNumber}.xml`),
    assetsDir: path.join(downloads, `assets${xmlNumber}`),
  }));
}

function extractItemStrings(xml: string): string[] {
  return xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
}

async function listFilesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function buildBasenameIndex(dir: string): Promise<Map<string, string[]>> {
  const index = new Map<string, string[]>();
  for (const filePath of await listFilesRecursively(dir)) {
    const basename = path.basename(filePath);
    const matches = index.get(basename) ?? [];
    matches.push(filePath);
    index.set(basename, matches);
  }
  return index;
}

function normalizeText(html: string): string {
  const $ = load(`<div id="__text-root">${html}</div>`);
  return $("#__text-root")
    .text()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCurrentContent(raw: string): string {
  const match = raw.match(
    /<div class="content">\s*([\s\S]*?)\s*<\/div>\s*<\/article>/
  );
  if (!match) throw new Error("記事本文の.contentを取得できません");
  return match[1];
}

function replaceCurrentContent(raw: string, content: string): string {
  const pattern =
    /(<div class="content">)\s*[\s\S]*?\s*(<\/div>\s*<\/article>)/;
  if (!pattern.test(raw)) throw new Error("記事本文の.contentを置換できません");
  return raw.replace(pattern, (_match, open, close) => {
    return `${open}\n        ${content}\n      ${close}`;
  });
}

function findPostByGuid(guid: string): { filePath: string; slug: string } {
  const matches: Array<{ filePath: string; slug: string }> = [];
  for (const filename of fs.readdirSync(POSTS_DIR)) {
    if (!filename.endsWith(".html")) continue;
    const filePath = path.join(POSTS_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf8");
    if (raw.includes(`https://note.com/ielts_consult/n/${guid}`)) {
      matches.push({ filePath, slug: filename.slice(0, -5) });
    }
  }
  if (matches.length !== 1) {
    throw new Error(`${guid}: 対応記事が${matches.length}件です`);
  }
  return matches[0];
}

function exactAsset(
  index: Map<string, string[]>,
  assetRef: string,
  guid: string,
  xmlNumber: number
): string {
  const decodedRef = decodeURIComponent(assetRef.split(/[?#]/, 1)[0]);
  const basename = path.basename(decodedRef);
  const matches = index.get(basename) ?? [];
  if (matches.length !== 1) {
    throw new Error(
      `${guid}: XML${xmlNumber} / assets${xmlNumber} の ${basename} が${matches.length}件です`
    );
  }
  return matches[0];
}

function sanitizeAlt(value: string, fallback: string): string {
  const normalized = value.replace(/\s+/g, " ").trim() || fallback;
  return normalized.length > 80 ? `${normalized.slice(0, 79)}…` : normalized;
}

function isAudioRef(value: string): boolean {
  return /\.(?:m4a|mp3|wav|aac)(?:[?#].*)?$/i.test(value);
}

async function optimizeImage(
  sourcePath: string,
  guid: string
): Promise<{ publicPath: string; outputPath: string; width: number; height: number }> {
  const basename = path.basename(sourcePath, path.extname(sourcePath));
  if (!basename.startsWith(`${guid}_`)) {
    throw new Error(`${guid}: 記事GUIDと画像名が一致しません: ${path.basename(sourcePath)}`);
  }
  const outputName = `${basename}.webp`;
  const outputPath = path.join(PUBLIC_ASSETS_DIR, outputName);
  await fs.ensureDir(PUBLIC_ASSETS_DIR);
  await sharp(sourcePath, { animated: true })
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 90, effort: 6, smartSubsample: true })
    .toFile(outputPath);
  const metadata = await sharp(outputPath).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`${guid}: 画像サイズを取得できません: ${outputName}`);
  }
  return {
    publicPath: `/assets/${outputName}`,
    outputPath,
    width: metadata.width,
    height: metadata.height,
  };
}

async function restoreArticle(
  config: SourceConfig,
  assetIndex: Map<string, string[]>,
  itemXml: string,
  manifest: ManifestArticle[]
): Promise<void> {
  const parsed = parseItemXml(itemXml);
  if (!parsed || !TARGET_GUIDS.has(parsed.guid)) return;
  if (parsed.status !== "publish" || parsed.postType !== "post") {
    throw new Error(`${parsed.guid}: 公開postではありません`);
  }

  const { filePath, slug } = findPostByGuid(parsed.guid);
  const currentRaw = await fs.readFile(filePath, "utf8");
  const currentContent = extractCurrentContent(currentRaw);
  const expectedTextOnly = sanitizeContent(parsed.contentEncoded, parsed.title, {
    textOnly: true,
  });
  if (normalizeText(currentContent) !== normalizeText(expectedTextOnly)) {
    throw new Error(`${parsed.guid}: 現在の本文テキストが前回変換結果と一致しません`);
  }

  const restored = sanitizeContent(parsed.contentEncoded, parsed.title);
  const $ = load(`<div id="__media-root">${restored}</div>`);
  const $root = $("#__media-root");
  const articleImages: ManifestAsset[] = [];
  let imageIndex = 0;
  let lastHeading = "";

  const ordered = $root.find("h2, h3, h4, img").toArray();
  for (const element of ordered) {
    const $element = $(element);
    const tagName = (element as { tagName?: string }).tagName?.toLowerCase();
    if (tagName !== "img") {
      lastHeading = $element.text().replace(/\s+/g, " ").trim();
      continue;
    }

    const originalRef = $element.attr("src")?.trim() ?? "";
    if (!originalRef.startsWith("/assets/")) {
      throw new Error(`${parsed.guid}: 想定外の画像参照です: ${originalRef}`);
    }
    const sourcePath = exactAsset(
      assetIndex,
      originalRef,
      parsed.guid,
      config.xmlNumber
    );
    const optimized = await optimizeImage(sourcePath, parsed.guid);
    const sourceStat = await fs.stat(sourcePath);
    const outputStat = await fs.stat(optimized.outputPath);

    const figcaption = $element.closest("figure").find("figcaption").text().trim();
    const fallbackAlt = lastHeading
      ? `${lastHeading}の図解`
      : `${parsed.title}の概要画像`;
    const alt = sanitizeAlt($element.attr("alt") || figcaption, fallbackAlt);

    imageIndex += 1;
    $element.attr("src", optimized.publicPath);
    $element.attr("alt", alt);
    $element.attr("width", String(optimized.width));
    $element.attr("height", String(optimized.height));
    $element.attr("decoding", "async");
    if (imageIndex === 1) {
      $element.attr("loading", "eager");
      $element.attr("fetchpriority", "high");
    } else {
      $element.attr("loading", "lazy");
      $element.removeAttr("fetchpriority");
    }

    articleImages.push({
      source: path.basename(sourcePath),
      publicPath: optimized.publicPath,
      sourceBytes: sourceStat.size,
      outputBytes: outputStat.size,
      width: optimized.width,
      height: optimized.height,
      alt,
    });
  }

  let audioAsset: ManifestAsset | undefined;
  const audioLinks = $root
    .find("a[href]")
    .toArray()
    .filter((element) => isAudioRef($(element).attr("href") || ""));
  if (audioLinks.length > 1) {
    throw new Error(`${parsed.guid}: 音声参照が${audioLinks.length}件あります`);
  }
  if (audioLinks.length === 1) {
    const $audioLink = $(audioLinks[0]);
    const originalRef = $audioLink.attr("href") || "";
    const sourcePath = exactAsset(
      assetIndex,
      originalRef,
      parsed.guid,
      config.xmlNumber
    );
    const extension = path.extname(sourcePath).toLowerCase();
    const outputName = `${parsed.guid}${extension}`;
    const outputPath = path.join(PUBLIC_AUDIO_DIR, outputName);
    await fs.ensureDir(PUBLIC_AUDIO_DIR);
    await fs.copyFile(sourcePath, outputPath);
    const sourceStat = await fs.stat(sourcePath);
    const outputStat = await fs.stat(outputPath);
    audioAsset = {
      source: path.basename(sourcePath),
      publicPath: `/audio/posts/${outputName}`,
      sourceBytes: sourceStat.size,
      outputBytes: outputStat.size,
    };

    const $container = $audioLink.closest("div");
    if ($container.length) $container.remove();
    else $audioLink.remove();
  }

  const remainingLocalAssets = $root.find('[src^="/assets/"], [href^="/assets/"]');
  if (remainingLocalAssets.length !== articleImages.length) {
    const refs = remainingLocalAssets
      .toArray()
      .map((element) => $(element).attr("src") || $(element).attr("href"))
      .join(", ");
    throw new Error(`${parsed.guid}: 未処理のローカルasset参照があります: ${refs}`);
  }

  const restoredContent = $root.html() ?? "";
  const restoredWithoutMedia = sanitizeContent(parsed.contentEncoded, parsed.title, {
    textOnly: true,
  });
  if (normalizeText(restoredWithoutMedia) !== normalizeText(currentContent)) {
    throw new Error(`${parsed.guid}: メディア復元後の本文保護検査に失敗しました`);
  }

  await fs.writeFile(
    filePath,
    replaceCurrentContent(currentRaw, restoredContent),
    "utf8"
  );
  manifest.push({
    guid: parsed.guid,
    xmlNumber: config.xmlNumber,
    slug,
    title: parsed.title,
    images: articleImages,
    ...(audioAsset ? { audio: audioAsset } : {}),
  });
}

async function main(): Promise<void> {
  const sources = getSources();
  for (const source of sources) {
    if (!(await fs.pathExists(source.xmlPath))) {
      throw new Error(`XMLがありません: ${source.xmlPath}`);
    }
    if (!(await fs.pathExists(source.assetsDir))) {
      throw new Error(`assetsフォルダがありません: ${source.assetsDir}`);
    }
  }

  const manifest: ManifestArticle[] = [];
  for (const source of sources) {
    const [xml, assetIndex] = await Promise.all([
      fs.readFile(source.xmlPath, "utf8"),
      buildBasenameIndex(source.assetsDir),
    ]);
    for (const itemXml of extractItemStrings(xml)) {
      await restoreArticle(source, assetIndex, itemXml, manifest);
    }
  }

  const restoredGuids = new Set(manifest.map((article) => article.guid));
  if (manifest.length !== restoredGuids.size) {
    throw new Error("同一GUIDが複数のXMLから復元されました");
  }
  const missingGuids = [...TARGET_GUIDS].filter((guid) => !restoredGuids.has(guid));
  if (missingGuids.length) {
    throw new Error(`復元できなかったGUID: ${missingGuids.join(", ")}`);
  }
  if (restoredGuids.size !== TARGET_GUIDS.size) {
    throw new Error(`対象外記事が含まれています: ${restoredGuids.size}件`);
  }

  manifest.sort((a, b) => a.guid.localeCompare(b.guid));
  const totals = manifest.reduce(
    (result, article) => {
      result.imageFiles += article.images.length;
      result.imageSourceBytes += article.images.reduce(
        (sum, image) => sum + image.sourceBytes,
        0
      );
      result.imageOutputBytes += article.images.reduce(
        (sum, image) => sum + image.outputBytes,
        0
      );
      if (article.audio) {
        result.audioFiles += 1;
        result.audioSourceBytes += article.audio.sourceBytes;
        result.audioOutputBytes += article.audio.outputBytes;
      }
      return result;
    },
    {
      articles: manifest.length,
      imageFiles: 0,
      imageSourceBytes: 0,
      imageOutputBytes: 0,
      audioFiles: 0,
      audioSourceBytes: 0,
      audioOutputBytes: 0,
    }
  );

  await fs.writeJson(
    MANIFEST_PATH,
    {
      generatedAt: new Date().toISOString(),
      mappingRule: "XML1→assets1 / XML2→assets2 / XML3→assets3",
      totals,
      articles: manifest,
    },
    { spaces: 2 }
  );
  console.log(JSON.stringify(totals, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
