// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dev.7tec.cn',
  integrations: [
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
