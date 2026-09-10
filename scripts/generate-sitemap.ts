import fs from 'fs-extra';
import path from 'path';
import { SITE_URL } from '../config/site';
import { getAllPosts, getAllTags } from '../lib/posts';
import {
  encodePostSlugForPath,
  encodeRouteSegmentForPath,
  normalizeRouteSegment,
} from '../lib/url';

type SitemapEntry = {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  lastmod?: string;
};

function toLastmod(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function renderUrl(entry: SitemapEntry): string {
  return `  <url>
    <loc>${SITE_URL}${entry.path}</loc>${
      entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
    }
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}

async function generateSitemap() {
  console.log('🗺️  サイトマップを生成しています...');

  const [posts, allTags] = await Promise.all([
    getAllPosts(),
    getAllTags(),
  ]);

  const latestPostDate = posts
    .map((post) => toLastmod(post.date))
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);

  // サイトマップにはcanonicalかつindex対象のURLだけを掲載する。
  const staticPages: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: '1.0', lastmod: latestPostDate },
    { path: '/posts/', changefreq: 'daily', priority: '0.9', lastmod: latestPostDate },
    { path: '/about/', changefreq: 'monthly', priority: '0.6' },
    { path: '/about-author/', changefreq: 'monthly', priority: '0.7' },
    { path: '/editorial-policy/', changefreq: 'monthly', priority: '0.5' },
    { path: '/cookie-policy/', changefreq: 'monthly', priority: '0.3' },
    { path: '/contact/', changefreq: 'monthly', priority: '0.4' },
    { path: '/disclaimer/', changefreq: 'monthly', priority: '0.3' },
    { path: '/affiliate-disclosure/', changefreq: 'monthly', priority: '0.3' },
    { path: '/tags/', changefreq: 'weekly', priority: '0.7', lastmod: latestPostDate },
  ];

  const tagPages: SitemapEntry[] = allTags.map(({ tag }) => {
    const tagKey = normalizeRouteSegment(tag);
    const lastmod = posts
      .filter((post) =>
        post.tags.some((postTag) => normalizeRouteSegment(postTag) === tagKey)
      )
      .map((post) => toLastmod(post.date))
      .filter((date): date is string => Boolean(date))
      .sort()
      .at(-1);

    return {
      path: `/tags/${encodeRouteSegmentForPath(tag)}/`,
      changefreq: 'weekly',
      priority: '0.6',
      lastmod,
    };
  });

  const postPages: SitemapEntry[] = posts.map((post) => ({
    path: `/posts/${encodePostSlugForPath(post.slug)}/`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: toLastmod(post.date),
  }));

  const entries = [...staticPages, ...tagPages, ...postPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(renderUrl).join('\n')}
</urlset>`;

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  await fs.writeFile(outputPath, sitemap, 'utf-8');
  console.log('✅ サイトマップを生成しました: public/sitemap.xml');
}

generateSitemap().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
