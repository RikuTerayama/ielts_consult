import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://<your-site>.netlify.app', // ← 後で置換
  integrations: [sitemap()],
  output: 'static'
});
