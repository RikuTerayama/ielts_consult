/**
 * note WXR export から、事前監査済みGUIDだけをテキスト専用記事として追加する。
 *
 * 例:
 * pnpm tsx scripts/import-note-text-posts.ts \
 *   --export path/to/export-1.xml \
 *   --export path/to/export-2.xml \
 *   --include-guids n123,n456 \
 *   --write
 *
 * デフォルトは dry-run。無料判定はこのスクリプトでは推測せず、note の価格
 * metadata 等で事前監査したGUIDを --include-guids で明示する。
 */

import fs from "fs";
import path from "path";
import { load } from "cheerio/slim";
import {
  convertItemToHtml,
  parseItemXml,
} from "./convert-single-item-to-html";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

interface ExportItem {
  rawXml: string;
  guid: string;
  link: string;
  title: string;
  status: string;
  postType: string;
}

function extractItemStrings(xml: string): string[] {
  return xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
}

function normalizeTitle(title: string): string {
  return title
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getExistingKeys(): {
  guids: Set<string>;
  links: Set<string>;
  titles: Set<string>;
} {
  const guids = new Set<string>();
  const links = new Set<string>();
  const titles = new Set<string>();

  if (!fs.existsSync(POSTS_DIR)) return { guids, links, titles };

  for (const filename of fs.readdirSync(POSTS_DIR)) {
    if (!filename.endsWith(".html")) continue;
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
    const $ = load(raw);
    const canonical = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
    const title = $("title").first().text().trim();
    if (canonical) {
      links.add(canonical.replace(/\/$/, ""));
      const match = canonical.match(/note\.com\/ielts_consult\/n\/([^/?#]+)/i);
      if (match) guids.add(match[1]);
    }
    if (title) titles.add(normalizeTitle(title));
  }

  return { guids, links, titles };
}

function parseArgs(): {
  exportPaths: string[];
  includeGuids: Set<string>;
  write: boolean;
  overwrite: boolean;
} {
  const args = process.argv.slice(2);
  const exportPaths: string[] = [];
  const includeGuids = new Set<string>();
  let write = false;
  let overwrite = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--export" && args[i + 1]) {
      exportPaths.push(path.resolve(args[++i]));
    } else if (args[i] === "--include-guids" && args[i + 1]) {
      for (const guid of args[++i].split(",")) {
        if (guid.trim()) includeGuids.add(guid.trim());
      }
    } else if (args[i] === "--write") {
      write = true;
    } else if (args[i] === "--overwrite") {
      overwrite = true;
    }
  }

  if (exportPaths.length === 0 || includeGuids.size === 0) {
    throw new Error(
      "--export <path>（複数可）と --include-guids <guid,...> が必要です"
    );
  }
  for (const exportPath of exportPaths) {
    if (!fs.existsSync(exportPath)) {
      throw new Error(`export が見つかりません: ${exportPath}`);
    }
  }

  return { exportPaths, includeGuids, write, overwrite };
}

function loadUniqueItems(exportPaths: string[]): ExportItem[] {
  const items: ExportItem[] = [];
  const seenGuids = new Set<string>();
  const seenLinks = new Set<string>();
  const seenTitles = new Set<string>();

  for (const exportPath of exportPaths) {
    const raw = fs.readFileSync(exportPath, "utf-8");
    for (const rawXml of extractItemStrings(raw)) {
      const parsed = parseItemXml(rawXml);
      if (!parsed?.guid || !parsed.title) continue;
      const link = parsed.link.replace(/\/$/, "");
      const title = normalizeTitle(parsed.title);
      if (
        seenGuids.has(parsed.guid) ||
        (link && seenLinks.has(link)) ||
        seenTitles.has(title)
      ) {
        continue;
      }
      seenGuids.add(parsed.guid);
      if (link) seenLinks.add(link);
      seenTitles.add(title);
      items.push({
        rawXml,
        guid: parsed.guid,
        link,
        title: parsed.title,
        // 欠損値は公開扱いにせず、main の厳密チェックで除外する。
        status: parsed.status || "",
        postType: parsed.postType || "",
      });
    }
  }

  return items;
}

function assertTextOnly(filePath: string): void {
  const raw = fs.readFileSync(filePath, "utf-8");
  const forbidden = [
    /<img\b/i,
    /<(?:audio|video|source|picture)\b/i,
    /(?:href|src)=["']\/assets\//i,
    /\/assets\/[^"'\s>]+\.(?:m4a|mp3|pdf)(?:[?#][^"'\s>]*)?/i,
  ];
  const failed = forbidden.find((pattern) => pattern.test(raw));
  if (failed) throw new Error(`asset参照が残っています (${failed}): ${filePath}`);
}

function main(): void {
  const { exportPaths, includeGuids, write, overwrite } = parseArgs();
  const existing = getExistingKeys();
  const allItems = loadUniqueItems(exportPaths);
  const byGuid = new Map(allItems.map((item) => [item.guid, item]));
  const created: Array<{ guid: string; title: string; filePath: string }> = [];

  for (const guid of includeGuids) {
    const item = byGuid.get(guid);
    if (!item) throw new Error(`指定GUIDがexportにありません: ${guid}`);
    if (item.status !== "publish" || item.postType !== "post") {
      throw new Error(
        `公開postではありません: ${guid} (${item.status}/${item.postType})`
      );
    }
    const preview = convertItemToHtml(item.rawXml, POSTS_DIR, true, {
      textOnly: true,
    });
    if (!preview) throw new Error(`変換に失敗しました: ${guid}`);
    if (fs.existsSync(preview.filePath)) {
      if (!overwrite) {
        throw new Error(`出力先が既に存在します: ${preview.filePath}`);
      }
      const current = fs.readFileSync(preview.filePath, "utf-8");
      const $current = load(current);
      const currentCanonical =
        $current('link[rel="canonical"]').attr("href")?.replace(/\/$/, "") ?? "";
      const currentTitle = normalizeTitle($current("title").first().text());
      if (
        currentCanonical !== item.link ||
        currentTitle !== normalizeTitle(item.title)
      ) {
        throw new Error(`別記事の出力先は上書きできません: ${preview.filePath}`);
      }
    } else if (
      existing.guids.has(item.guid) ||
      existing.links.has(item.link) ||
      existing.titles.has(normalizeTitle(item.title))
    ) {
      throw new Error(`既存記事と重複しています: ${guid} ${item.title}`);
    }

    const result = convertItemToHtml(item.rawXml, POSTS_DIR, !write, {
      textOnly: true,
    });
    if (!result) throw new Error(`変換に失敗しました: ${guid}`);
    created.push({ guid, title: item.title, filePath: result.filePath });
  }

  if (write) {
    for (const item of created) assertTextOnly(item.filePath);
  }

  console.log(`${write ? "Created" : "Would create"}: ${created.length}`);
  for (const item of created) {
    console.log(`${item.guid}\t${path.basename(item.filePath)}\t${item.title}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
