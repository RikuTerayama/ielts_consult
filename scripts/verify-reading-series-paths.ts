/**
 * 【読む順】シリーズ パス整合性検証スクリプト
 *
 * リクエストパス候補 3 種と out/posts の実フォルダの整合を機械的に判定する。
 *
 * 候補:
 * - hrefCandidate: encodePostSlugForPath(slug) = リンクで生成されるパス（%23→%2523）
 * - decode1Candidate: decodeURIComponent(hrefCandidate) = 静的ホストが1回デコードした後のパス
 * - nextJsStyleCandidate: slug.replace(/#/g,'%23') = Next.js が out に出力するフォルダ名
 *
 * 実行: npx tsx scripts/verify-reading-series-paths.ts
 * （npx tsx が使えない場合: node ./node_modules/tsx/dist/cli.mjs scripts/verify-reading-series-paths.ts）
 */

import fs from "fs";
import path from "path";
import { getAllPosts } from "../lib/posts";
import { encodePostSlugForPath } from "../lib/url";

const POSTS_OUT = path.join(process.cwd(), "out", "posts");

/** リンクで生成されるパス（実装後: encodePostSlugForPath = encodeURIComponent + %23→%2523） */
function getHrefCandidate(slug: string): string {
  return encodePostSlugForPath(slug);
}

/** 静的ホストが 1 回デコードした後のパス（out フォルダ名と一致するはず） */
function getDecode1Candidate(hrefCandidate: string): string {
  return decodeURIComponent(hrefCandidate);
}

function getNextJsStyleCandidate(slug: string): string {
  return slug.replace(/#/g, "%23");
}

/** out/posts/<dir>/index.html が存在するか（Windows パス対応） */
function existsInOut(dirName: string): boolean {
  const fullPath = path.join(POSTS_OUT, dirName, "index.html");
  return fs.existsSync(fullPath);
}

/** 全 slug の URL 危険文字スキャン */
function scanSlugChars(slug: string): { char: string; count: number }[] {
  const unsafe = [
    ["#", /#/g],
    ["?", /\?/g],
    ["？", /？/g],
    ["%", /%/g],
    ["/", /\//g],
    ["\\", /\\/g],
    [":", /:/g],
    ["&", /&/g],
    ["=", /=/g],
    ["+", /\+/g],
    [" ", / /g],
    [".", /\./g],
    ["|", /\|/g],
  ] as const;
  const result: { char: string; count: number }[] = [];
  for (const [name, re] of unsafe) {
    const m = slug.match(re);
    if (m) result.push({ char: name, count: m.length });
  }
  return result;
}

async function main() {
  if (!fs.existsSync(POSTS_OUT)) {
    console.error("❌ out/posts が存在しません。npm run build を先に実行してください。");
    process.exit(1);
  }

  const posts = await getAllPosts();
  const dirNames = fs.readdirSync(POSTS_OUT).filter((n) => {
    const p = path.join(POSTS_OUT, n);
    return fs.statSync(p).isDirectory() && n !== "index.html";
  });

  const results: Array<{
    slug: string;
    hrefCandidate: string;
    decode1Candidate: string;
    nextJsStyleCandidate: string;
    outDirName: string | null;
    existsByHref: boolean;
    existsByDecode1: boolean;
    existsByNextJsStyle: boolean;
    charScan: { char: string; count: number }[];
  }> = [];

  for (const post of posts) {
    const hrefCandidate = getHrefCandidate(post.slug);
    const decode1Candidate = getDecode1Candidate(hrefCandidate);
    const nextJsStyleCandidate = getNextJsStyleCandidate(post.slug);

    const outDirName =
      dirNames.find(
        (d) => d === hrefCandidate || d === decode1Candidate || d === nextJsStyleCandidate
      ) ?? null;

    results.push({
      slug: post.slug,
      hrefCandidate,
      decode1Candidate,
      nextJsStyleCandidate,
      outDirName,
      existsByHref: existsInOut(hrefCandidate),
      existsByDecode1: existsInOut(decode1Candidate),
      existsByNextJsStyle: existsInOut(nextJsStyleCandidate),
      charScan: scanSlugChars(post.slug),
    });
  }

  const failed = results.filter((r) => !r.existsByHref && !r.existsByDecode1 && !r.existsByNextJsStyle);
  const ngByDecode1 = results.filter((r) => !r.existsByDecode1);
  const passed = results.filter((r) => r.existsByDecode1);

  // --- 出力 ---
  console.log("\n=== 【読む順】パス整合性検証結果 ===\n");

  console.log("凡例:");
  console.log("  - hrefCandidate: encodePostSlugForPath(slug) = リンク生成パス（%23→%2523）");
  console.log("  - decode1Candidate: decodeURIComponent(hrefCandidate) = 静的ホストが1回デコードした後のパス（out フォルダ名と一致）");
  console.log("  - nextJsStyleCandidate: slug.replace(/#/g,'%23') = Next.js 出力フォルダ名");
  console.log("");

  console.log("サマリー:");
  console.log(`  総数: ${results.length} 件`);
  console.log(`  NG件数（decode1 で存在しない）: ${ngByDecode1.length} 件`);
  console.log(`  existsByHref: ${results.filter((r) => r.existsByHref).length} 件`);
  console.log(`  existsByDecode1: ${results.filter((r) => r.existsByDecode1).length} 件`);
  console.log(`  existsByNextJsStyle: ${results.filter((r) => r.existsByNextJsStyle).length} 件`);
  console.log("");

  console.log("NG slug一覧（decode1 で 404）:");
  ngByDecode1.forEach((r) => console.log(`  - ${r.slug}`));
  console.log("");

  const ngExample = ngByDecode1[0];
  const okExample = passed.find((r) => !r.slug.includes("#"));
  console.log("代表例（【読む順】NG vs 非【読む順】OK）:");
  if (ngExample && okExample) {
    console.log("  [NG] 【読む順】");
    console.log(`    slug: ${ngExample.slug}`);
    console.log(`    hrefCandidate: ${ngExample.hrefCandidate.slice(0, 60)}...`);
    console.log(`    decode1Candidate: ${ngExample.decode1Candidate.slice(0, 50)}...`);
    console.log(`    nextJsStyleCandidate: ${ngExample.nextJsStyleCandidate.slice(0, 50)}...`);
    console.log(`    out実フォルダ: ${ngExample.outDirName?.slice(0, 50)}...`);
    console.log(`    existsByHref: ${ngExample.existsByHref}, existsByDecode1: ${ngExample.existsByDecode1}, existsByNextJsStyle: ${ngExample.existsByNextJsStyle}`);
    console.log("");
    console.log("  [OK] 非【読む順】");
    console.log(`    slug: ${okExample.slug}`);
    console.log(`    decode1Candidate: ${okExample.decode1Candidate.slice(0, 50)}...`);
    console.log(`    out実フォルダ: ${okExample.outDirName?.slice(0, 50)}...`);
    console.log(`    existsByDecode1: ${okExample.existsByDecode1}`);
  }
  console.log("");

  // 全記事 slug 文字種スキャン
  console.log("=== 全記事 slug 文字種スキャン ===");
  const hasHash = results.filter((r) => r.charScan.some((c) => c.char === "#"));
  const hasQ = results.filter((r) => r.charScan.some((c) => c.char === "?"));
  const hasPercent = results.filter((r) => r.charScan.some((c) => c.char === "%"));
  const hasSlash = results.filter((r) => r.charScan.some((c) => c.char === "/"));
  const hasColon = results.filter((r) => r.charScan.some((c) => c.char === ":"));

  console.log(`  # を含む: ${hasHash.length} 件`);
  hasHash.forEach((r) => console.log(`    - ${r.slug.slice(0, 60)}...`));
  const hasFullwidthQ = results.filter((r) => r.charScan.some((c) => c.char === "？"));
  console.log(`  ? を含む（半角）: ${hasQ.length} 件`);
  console.log(`  ？ を含む（全角）: ${hasFullwidthQ.length} 件`);
  if (hasQ.length > 0) hasQ.slice(0, 3).forEach((r) => console.log(`    - ${r.slug.slice(0, 60)}...`));
  if (hasFullwidthQ.length > 0) hasFullwidthQ.slice(0, 3).forEach((r) => console.log(`    - ${r.slug.slice(0, 60)}...`));
  console.log(`  % を含む: ${hasPercent.length} 件`);
  console.log(`  / を含む: ${hasSlash.length} 件`);
  console.log(`  : を含む: ${hasColon.length} 件`);
  console.log("");

  console.log("out/posts の実ディレクトリ名（【読む順】のみ）:");
  dirNames
    .filter((d) => d.includes("読む順"))
    .forEach((d) => console.log(`  - ${d}`));
  console.log("");

  if (ngByDecode1.length > 0) {
    console.log(`❌ decode1 で存在しない記事: ${ngByDecode1.length} 件`);
    process.exit(1);
  }
  console.log("✅ 全記事の index.html が decode1 パスで out/posts 配下に存在します。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
