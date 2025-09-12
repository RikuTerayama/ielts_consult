import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://example.netlify.app', // TODO: 一時URLでOK
  integrations: [sitemap()],
  output: 'static'
});
