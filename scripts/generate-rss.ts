import fs from 'fs-extra';
import path from 'path';

const SITE_URL = 'https://ieltsconsult.netlify.app';
const SITE_TITLE = '外資系コンサルの英語力底上げブログ';
const SITE_DESCRIPTION = 'IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ';

async function generateRSS() {
  console.log('📡 RSSフィードを生成しています...');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`;

  const outputPath = path.join(process.cwd(), 'public', 'rss.xml');
  await fs.writeFile(outputPath, rss, 'utf-8');
  console.log('✅ RSSフィードを生成しました: public/rss.xml');
}

generateRSS().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
