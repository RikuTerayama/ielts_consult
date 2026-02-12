/**
 * 【読む順】記事が getAllPosts に含まれるか検証
 * 実行: npx tsx scripts/debug-reading-series-posts.ts
 */
import { getAllPosts } from "../lib/posts";

async function main() {
  const posts = await getAllPosts();
  const readingSeries = posts.filter((p) => p.slug.includes("【読む順"));
  console.log(`\n=== getAllPosts 検証 ===`);
  console.log(`総件数: ${posts.length}`);
  console.log(`【読む順】件数: ${readingSeries.length}`);
  console.log(`\n【読む順】slug一覧（日付順）:`);
  readingSeries.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.slug.slice(0, 50)}... | date: ${p.date}`);
  });
  console.log(`\n先頭5件（最新記事・人気記事に表示）:`);
  posts.slice(0, 5).forEach((p, i) => {
    const tag = p.slug.includes("【読む順") ? " [読む順]" : "";
    console.log(`  ${i + 1}. ${p.slug.slice(0, 45)}...${tag}`);
  });
  console.log(`\n先頭6件（サイドバー新着に表示）:`);
  posts.slice(0, 6).forEach((p, i) => {
    const tag = p.slug.includes("【読む順") ? " [読む順]" : "";
    console.log(`  ${i + 1}. ${p.slug.slice(0, 45)}...${tag}`);
  });
}

main().catch(console.error);
