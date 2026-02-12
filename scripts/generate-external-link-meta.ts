/**
 * content/posts/*.html を走査し、p.link 内の note.com URL を収集。
 * 未登録 URL のみ OGP を取得して content/external-link-meta.json を更新する。
 * Amazon は affiliate-meta.json の運用を継続するため除外。
 */

import fs from "fs";
import path from "path";
import { load } from "cheerio/slim";
import type { CheerioAPI, Cheerio } from "cheerio/slim";
import type { AnyNode } from "domhandler";
import { fetchOgpMeta } from "../lib/ogp-fetch";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const META_PATH = path.join(process.cwd(), "content/external-link-meta.json");

type ExternalLinkMetaMap = Record<
  string,
  { title?: string; description?: string; image?: string }
>;

/** URL 正規化（lib/posts.ts と整合） */
function normalizeUrl(href: string): string {
  try {
    const u = new URL(href.trim());
    u.protocol = "https:";
    const pathname = u.pathname.replace(/\/+$/, "") || "/";
    return `https://${u.host}${pathname}${u.search}`;
  } catch {
    return href.trim();
  }
}

/** note.com のみ対象（Amazon は除外） */
function isNoteTargetUrl(href: string): boolean {
  if (!href || typeof href !== "string") return false;
  try {
    const u = new URL(href);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    return host === "note.com" || u.hostname.toLowerCase() === "www.note.com";
  } catch {
    return false;
  }
}

/** p 要素が「URL単体行」か */
function isUrlSingleLine($: CheerioAPI, $p: Cheerio<AnyNode>): boolean {
  const children = $p.children();
  if (children.length !== 1) return false;
  const child = children.eq(0);
  const tagName = (child[0] as { tagName?: string } | undefined)?.tagName?.toLowerCase();
  if (tagName !== "a") return false;
  const href = child.attr("href")?.trim() ?? "";
  const text = child.text().trim();
  return href.length > 0 && text === href;
}

async function main() {
  console.log("🔗 外部リンクメタを生成しています...");

  const urls = new Set<string>();
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".html"));

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const html = fs.readFileSync(filePath, "utf-8");
    const $ = load(html);

    $("p.link").each((_, el) => {
      const $p = $(el);
      if (!isUrlSingleLine($, $p)) return;
      const $a = $p.find("a").first();
      const href = $a.attr("href")?.trim() ?? "";
      if (!isNoteTargetUrl(href)) return;
      urls.add(normalizeUrl(href));
    });
  }

  const noteUrls = [...urls].sort();

  if (noteUrls.length === 0) {
    console.log("  note.com の p.link URL がありません。");
    return;
  }

  let existing: ExternalLinkMetaMap = {};
  if (fs.existsSync(META_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(META_PATH, "utf-8"));
    } catch (err) {
      console.warn("  ⚠ external-link-meta.json の読み込みに失敗しました。既存データを無視します。", err);
    }
  }

  const unregistered = noteUrls.filter((url) => !(url in existing));
  const newMeta: ExternalLinkMetaMap = { ...existing };

  for (const url of unregistered) {
    try {
      const meta = await fetchOgpMeta(url);
      if (meta && (meta.title || meta.description || meta.image)) {
        newMeta[url] = {
          title: meta.title?.trim() || undefined,
          description: meta.description?.trim() || undefined,
          image: meta.image?.trim() || undefined,
        };
        console.log(`  ✅ ${url}`);
      } else {
        console.warn(`  ⚠ OGP取得失敗: ${url}`);
        // 取得失敗時は登録しない（ミニマル表示にフォールバック）
      }
    } catch (err) {
      console.warn(`  ⚠ OGP取得エラー: ${url}`, err);
      // 失敗時は登録しない
    }
  }

  const sorted: ExternalLinkMetaMap = {};
  for (const key of Object.keys(newMeta).sort()) {
    sorted[key] = newMeta[key];
  }

  fs.writeFileSync(META_PATH, JSON.stringify(sorted, null, 2), "utf-8");
  console.log(`\n✅ content/external-link-meta.json を更新しました。`);
}

main().catch((err) => {
  console.warn("⚠ generate-external-link-meta でエラーが発生しました（ビルドは継続します）:", err);
  // exit code 1 にしない
});
