import fs from 'fs-extra';
import path from 'path';
import { SITE_URL } from '../config/site';
import { getAllPosts } from '../lib/posts';
import { getAllSteps, getAllSkills } from '../lib/categories';
import { encodePostSlugForPath } from '../lib/url';

/** 審査前は準備中のため sitemap から除外するパス（将来復活時に削除） */
const SITEMAP_EXCLUDE_PREFIXES = ['/tags', '/search', '/steps', '/skills'];

function shouldIncludeInSitemap(path: string): boolean {
  return !SITEMAP_EXCLUDE_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + '/'));
}

async function generateSitemap() {
  console.log('🗺️  サイトマップを生成しています...');

  const [posts, steps, skills] = await Promise.all([
    getAllPosts(),
    getAllSteps(),
    getAllSkills(),
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
  ].filter(shouldIncludeInSitemap);

  const stepPages = steps.map((step) => `/steps/${step.id}`).filter(shouldIncludeInSitemap);
  const skillPages = skills.map((skill) => `/skills/${skill.id}`).filter(shouldIncludeInSitemap);

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
