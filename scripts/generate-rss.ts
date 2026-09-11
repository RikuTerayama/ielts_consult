import fs from "fs-extra";
import path from "path";
import { SITE_URL } from "../config/site";
import { getAllPosts } from "../lib/posts";
import { encodePostSlugForPath } from "../lib/url";

const SITE_TITLE = "外資系コンサルの英語力底上げブログ";
const SITE_DESCRIPTION =
  "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc2822(dateStr: string): string {
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? "" : date.toUTCString();
}

async function generateRSS() {
  console.log("📡 RSSフィードを生成しています...");

  const posts = await getAllPosts();
  // Reflect a real content change, not the build clock. Item pubDate stays original.
  const latestContentDate = posts.map(post => post.modifiedDate || post.date)
    .filter(value => value && !Number.isNaN(Date.parse(value)))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  const lastBuildDate = latestContentDate ? toRfc2822(latestContentDate) : "";

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/posts/${encodePostSlugForPath(post.slug)}/`;
      const title = escapeXml(post.title);
      const desc = escapeXml(post.description || "");
      const pubDate = toRfc2822(post.date || "");
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      <description>${desc}</description>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}/</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${lastBuildDate ? `<lastBuildDate>${lastBuildDate}</lastBuildDate>` : ''}
${items}
  </channel>
</rss>`;

  const outputPath = path.join(process.cwd(), "public", "rss.xml");
  await fs.writeFile(outputPath, rss, "utf-8");
  console.log("✅ RSSフィードを生成しました: public/rss.xml");
}

generateRSS().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
