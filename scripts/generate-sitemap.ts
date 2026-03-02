import fs from 'fs-extra';
import path from 'path';
import { SITE_URL } from '../config/site';
import { getAllPosts, getAllTags } from '../lib/posts';
import { getAllSteps, getAllSkills } from '../lib/categories';
import { encodePostSlugForPath } from '../lib/url';

async function generateSitemap() {
  console.log('🗺️  サイトマップを生成しています...');

  const [posts, steps, skills, allTags] = await Promise.all([
    getAllPosts(),
    getAllSteps(),
    getAllSkills(),
    getAllTags(),
  ]);

  const staticPages = [
    '',
    '/posts',
    '/about',
    '/about-author',
    '/editorial-policy',
    '/cookie-policy',
    '/contact',
    '/privacy',
    '/disclaimer',
    '/affiliate-disclosure',
    '/tags',
    '/search',
    '/steps',
  ];

  const stepPages = steps.map((step) => `/steps/${step.id}`);
  const skillPages = skills.map((skill) => `/skills/${skill.id}`);
  const tagPages = allTags.map(({ tag }) => `/tags/${encodeURIComponent(tag)}`);

  const postUrls = posts
    .map(
      (post) => `  <url>
    <loc>${SITE_URL}/posts/${encodePostSlugForPath(post.slug)}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

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
${tagPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  )
  .join('\n')}
${postUrls}
</urlset>`;

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  await fs.writeFile(outputPath, sitemap, 'utf-8');
  console.log('✅ サイトマップを生成しました: public/sitemap.xml');
}

generateSitemap().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
