// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { blogRedirects } from './src/data/redirects.mjs';

// 旧拼音 slug → 新语义化 slug，保证已被收录的旧链接不 404（由 scripts/apply-slugs.mjs 生成）
const blogRedirectMap = Object.fromEntries(blogRedirects.map((r) => [r.from, r.to]));

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
  redirects: blogRedirectMap,
});
