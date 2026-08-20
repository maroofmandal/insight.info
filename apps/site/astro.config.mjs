import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.INSIGHT_SITE_URL || 'https://insight.info',
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
  vite: {
    server: { allowedHosts: ['insight.local', 'insight.localhost'] },
  },
});
