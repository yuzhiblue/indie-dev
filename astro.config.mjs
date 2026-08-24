// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dev.7tec.cn',
  // 使用相对路径，使构建产物在 file:// 直接打开时也能正确加载资源
  base: './',
  integrations: [
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
  build: {
    inlineStylesheets: 'always',
  },
});
