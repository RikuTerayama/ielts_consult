#!/usr/bin/env npx tsx
/**
 * hero 画像の public 配下での存在有無を監査
 * 実行: pnpm run audit:hero
 * exit: 実体なしが 0 件なら 0、1 件以上なら 1（CI 用）
 */

import { getAllPosts } from "../lib/posts";
import fs from "fs";
import path from "path";

async function main() {
  const posts = await getAllPosts();
  const publicDir = path.join(process.cwd(), "public");

  let heroExists = 0;
  let heroMissing = 0;
  let heroEmpty = 0;
  const missingSlugs: string[] = [];

  for (const post of posts) {
    const hero = post.hero;
    if (!hero) {
      heroEmpty++;
      continue;
    }
    const publicPath = hero.startsWith("/")
      ? path.join(publicDir, hero.slice(1))
      : path.join(publicDir, hero);
    const exists = fs.existsSync(publicPath);
    if (exists) {
      heroExists++;
    } else {
      heroMissing++;
      missingSlugs.push(post.slug);
    }
  }

  console.log("=== hero 画像監査結果 ===");
  console.log(`合計記事数: ${posts.length}`);
  console.log(`hero あり かつ 実体あり: ${heroExists}`);
  console.log(`hero あり だが 実体なし: ${heroMissing}`);
  console.log(`hero が空: ${heroEmpty}`);
  if (missingSlugs.length > 0) {
    console.log("\n実体なしの slug 一覧:");
    missingSlugs.forEach((s) => console.log(`  - ${s}`));
  }

  process.exit(heroMissing > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
