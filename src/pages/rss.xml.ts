import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const SITE_URL = 'https://7tec.cn';
const FEED_SIZE = 30;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const cdata = (value: string) => `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE_URL);

  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, FEED_SIZE);

  const items = posts
    .map((post) => {
      const url = new URL(`/blog/${post.id}`, base).toString();
      return `    <item>
      <title>${cdata(post.data.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <description>${cdata(post.data.description)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${cdata('yuzhiblue 开发博客')}</title>
    <link>${escapeXml(new URL('/blog', base).toString())}</link>
    <description>${cdata('开发笔记与技术思考：Windows 自动化、Python / PySide6、Astro 建站与独立产品开发经验。')}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(new URL('/rss.xml', base).toString())}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
