import fs from 'fs-extra';
import path from 'path';
import { getAllPosts, getAllTags } from '../lib/posts';

const SITE_URL = 'https://ielts-consult.netlify.app';

async function generateSitemap() {
  console.log('🗺️  サイトマップを生成しています...');

  const posts = await getAllPosts();
  const tags = await getAllTags();

  const staticPages = [
    '',
    '/posts',
    '/tags',
    '/search',
    '/about',
    '/contact',
    '/privacy',
    '/disclaimer',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page}/</loc>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
${posts
  .map(
    (post) => `  <url>
    <loc>${SITE_URL}/posts/${post.slug}/</loc>
    <lastmod>${new Date(post.date).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
${tags
  .map(
    (tag) => `  <url>
    <loc>${SITE_URL}/tags/${tag}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  await fs.writeFile(outputPath, sitemap, 'utf-8');
  console.log('✅ サイトマップを生成しました: public/sitemap.xml');
}

generateSitemap().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
