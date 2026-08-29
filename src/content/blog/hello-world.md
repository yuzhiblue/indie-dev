---
title: '如何用 Astro 搭建个人项目展示页'
description: '从零开始搭建一个美观、SEO 友好的独立开发者展示站，包含项目展示和博客功能。'
pubDate: 2025-01-15
updatedDate: 2025-01-20
tags: ['前端']
draft: false
slug: astro-portfolio-site-setup
---

## 为什么选择 Astro

独立开发者做项目展示，最核心的需求就三个：**能被搜到**、**看起来专业**、**维护成本低**。

Astro 在这三点上都做得很好：

1. **默认输出纯 HTML** — Google 爬虫最爱吃的格式
2. **框架无关** — 可以用 React、Vue、Svelte 任意混用
3. **内容集合** — 天生支持博客和文档，不需要额外 CMS

## 项目结构

```
src/
  content/
    blog/          # Markdown 文章
    config.ts      # 内容集合配置
  layouts/
    BaseLayout.astro
  pages/
    index.astro    # 首页
    blog/
      index.astro  # 博客列表
      [slug].astro # 文章详情
  components/
  styles/
```

## 关键配置

`astro.config.mjs` 是核心，别忘了加上 sitemap：

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourdomain.com',
  integrations: [sitemap()],
});
```

## SEO 要点

- 每个页面设置唯一的 `<title>` 和 `<meta description>`
- 自动生成 `sitemap.xml`
- 图片加 `alt` 属性
- 使用语义化 HTML 标签

## 总结

Astro 非常适合独立开发者做个人站点。它把 SEO 这件事做对了，同时给你足够的自由去设计有个人风格的页面。

---

*这篇文章是用 Astro Content Collections 写的，改天我会写一期关于如何部署到 Vercel 的教程。*
