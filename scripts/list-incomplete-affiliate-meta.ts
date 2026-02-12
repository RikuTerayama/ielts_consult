/**
 * content/posts/*.html を走査し、p.link 内のアフィリエイトURLを収集。
 * content/affiliate-meta.json に登録済みだが title が空のURLを docs/incomplete-affiliate-meta.json に出力する。
 */

import fs from "fs";
import path from "path";
import { load } from "cheerio/slim";
import type { CheerioAPI, Cheerio } from "cheerio/slim";
import type { AnyNode } from "domhandler";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const AFFILIATE_META_PATH = path.join(process.cwd(), "content/affiliate-meta.json");
const OUTPUT_PATH = path.join(process.cwd(), "docs/incomplete-affiliate-meta.json");

/** http/https を吸収して https に統一、末尾スラッシュ除去（lib/posts.ts と同一） */
function normalizeUrl(href: string): string {
  try {
    const u = new URL(href);
    u.protocol = "https:";
    const pathname = u.pathname.replace(/\/+$/, "") || "/";
    return `https://${u.host}${pathname}${u.search}`;
  } catch {
    return href;
  }
}

/** href がカード化対象のアフィリエイトドメインか（lib/posts.ts と同一） */
function isAffiliateTargetUrl(href: string): boolean {
  if (!href || typeof href !== "string") return false;
  try {
    const u = new URL(href);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    return (
      host === "amzn.to" ||
      host === "amazon.co.jp" ||
      host === "amazon.com" ||
      u.hostname.toLowerCase() === "www.amazon.co.jp" ||
      u.hostname.toLowerCase() === "www.amazon.com"
    );
  } catch {
    return false;
  }
}

/** p 要素が「URL単体行」（a が1つだけ、a.text が href と同一）か */
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

type AffiliateMetaItem = { title?: string; subtitle?: string; image?: string; label?: string };
type AffiliateMetaMap = Record<string, AffiliateMetaItem>;

function main() {
  const affiliateMeta: AffiliateMetaMap = JSON.parse(
    fs.readFileSync(AFFILIATE_META_PATH, "utf-8")
  );

  const urls = new Set<string>();
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".html"));

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const html = fs.readFileSync(filePath, "utf-8");
    const $ = load(html);

    $("article .content p.link, .content p.link, p.link").each((_, el) => {
      const $p = $(el);
      if (!isUrlSingleLine($, $p)) return;
      const $a = $p.find("a").first();
      const href = $a.attr("href")?.trim() ?? "";
      if (!isAffiliateTargetUrl(href)) return;
      urls.add(normalizeUrl(href));
    });
  }

  const incomplete = [...urls].filter((url) => {
    const meta = affiliateMeta[url];
    return meta && !(meta.title && meta.title.trim());
  });

  const template: AffiliateMetaMap = {};
  for (const url of incomplete) {
    const meta = affiliateMeta[url];
    template[url] = {
      title: meta?.title ?? "",
      subtitle: meta?.subtitle ?? "",
      image: meta?.image ?? "",
      label: meta?.label ?? "",
    };
  }

  const docsDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(template, null, 2), "utf-8");

  console.log(`\n📋 登録済みだが title が空のアフィリエイトURL: ${incomplete.length}件`);
  if (incomplete.length > 0) {
    incomplete.forEach((u) => console.log(`  - ${u}`));
  }
  console.log(`\n📁 出力先: ${OUTPUT_PATH}\n`);
}

main();
