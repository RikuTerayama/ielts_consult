/**
 * docs/missing-affiliate-meta.json の未登録URLを content/affiliate-meta.json にスケルトン追加する。
 * 既存キーは保持し、キー順で安定ソートして書き出す。
 * 運用: まず affiliate:missing-meta で未登録を洗い出し → affiliate:sync-meta で器を追加 → 手動で title/subtitle/image を埋める
 */

import fs from "fs";
import path from "path";

const AFFILIATE_META_PATH = path.join(process.cwd(), "content/affiliate-meta.json");
const MISSING_META_PATH = path.join(process.cwd(), "docs/missing-affiliate-meta.json");

type AffiliateMetaItem = {
  title?: string;
  subtitle?: string;
  image?: string;
  label?: string;
};

type AffiliateMetaMap = Record<string, AffiliateMetaItem>;

const SKELETON: AffiliateMetaItem = {
  title: "",
  subtitle: "",
  image: "/affiliate-images/placeholder.svg",
  label: "PR",
};

function main() {
  if (!fs.existsSync(MISSING_META_PATH)) {
    console.error(`\n❌ ${MISSING_META_PATH} が見つかりません。`);
    console.log("  先に npm run affiliate:missing-meta を実行してください。\n");
    process.exit(1);
  }

  const existing: AffiliateMetaMap = JSON.parse(
    fs.readFileSync(AFFILIATE_META_PATH, "utf-8")
  );
  const missing: AffiliateMetaMap = JSON.parse(
    fs.readFileSync(MISSING_META_PATH, "utf-8")
  );

  let added = 0;
  const merged: AffiliateMetaMap = { ...existing };

  for (const [url, item] of Object.entries(missing)) {
    if (!(url in merged)) {
      merged[url] = {
        title: item.title ?? SKELETON.title,
        subtitle: item.subtitle ?? SKELETON.subtitle,
        image: item.image || SKELETON.image,
        label: (item.label && item.label.trim()) ? item.label : SKELETON.label,
      };
      added++;
    }
  }

  const sorted = Object.keys(merged)
    .sort((a, b) => a.localeCompare(b))
    .reduce<AffiliateMetaMap>((acc, key) => {
      acc[key] = merged[key];
      return acc;
    }, {});

  fs.writeFileSync(
    AFFILIATE_META_PATH,
    JSON.stringify(sorted, null, 2),
    "utf-8"
  );

  console.log(`\n✅ content/affiliate-meta.json を更新しました。`);
  console.log(`   追加: ${added}件 / 既存保持: ${Object.keys(existing).length}件 / 合計: ${Object.keys(sorted).length}件\n`);
}

main();
