import fs from 'fs-extra';
import path from 'path';
import { getAllPosts, getAllTags } from '../lib/posts';
import { getAllSteps, getAllSkills } from '../lib/categories';

const SITE_URL = 'https://ieltsconsult.netlify.app';

async function generateSitemap() {
  console.log('🗺️  サイトマップを生成しています...');

  const posts = await getAllPosts();
  const tags = await getAllTags();
  const steps = await getAllSteps();
  const skills = await getAllSkills();

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

  // 学習ステップ別ページ
  const stepPages = steps.map(step => `/steps/${step.id}`);
  
  // 技能別ページ
  const skillPages = skills.map(skill => `/skills/${skill.id}`);

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
${stepPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
${skillPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
