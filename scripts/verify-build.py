#!/usr/bin/env python3
"""构建产物 SEO 自检。

用法：
    npm run build
    python scripts/verify-build.py

检查项：robots / 404 / sitemap 过滤 / canonical / OG / JSON-LD / RSS / 图片引用是否 404。
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import unquote

DIST = Path(__file__).resolve().parent.parent / 'dist'
LD_RE = re.compile(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', re.S)

failures: list[str] = []


def check(label: str, condition: bool, detail: str = '') -> None:
    if condition:
        print(f'[PASS] {label}')
    else:
        failures.append(label)
        print(f'[FAIL] {label}' + (f' -- {detail}' if detail else ''))


def read(path: str) -> str:
    return (DIST / path).read_text(encoding='utf-8')


def ld_types(html: str) -> list[str]:
    types = []
    for blob in LD_RE.findall(html):
        try:
            types.append(json.loads(blob).get('@type'))
        except json.JSONDecodeError:
            types.append('INVALID_JSON')
    return types


if not DIST.exists():
    raise SystemExit('dist 不存在，请先执行 npm run build')

# --- 静态文件 ---
for name in ['robots.txt', '404.html', 'sitemap-index.xml', 'rss.xml', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png']:
    check(f'{name} 已生成', (DIST / name).exists())

# --- 首页 ---
home = read('index.html')
canonical = re.findall(r'<link rel="canonical" href="([^"]+)"', home)
check('首页 canonical 是绝对地址', bool(canonical) and canonical[0].startswith('https://'), str(canonical))
check('首页 title 使用新文案', '7TEC - 独立开发者' in home)
check('首页含 OG 站名与 url', 'og:site_name' in home and 'og:url' in home)
check('首页含 Twitter Card', 'twitter:card' in home)
check('首页 RSS 声明存在', 'application/rss+xml' in home)
check('首页 JSON-LD = WebSite + Person', set(ld_types(home)) == {'WebSite', 'Person'}, str(ld_types(home)))
check('canonical 已切换到主域 7tec.cn', bool(canonical) and canonical[0].startswith('https://7tec.cn/'), str(canonical))
check('首页 og:image 指向默认分享图', 'content="https://7tec.cn/og-default.png"' in home)
check('首页含 RSS 订阅入口', 'href="/rss.xml"' in home)
check('首页含 theme-color', 'name="theme-color"' in home)
home_desc = re.search(r'<meta name="description" content="([^"]*)"', home)
check('首页 description 长度充足（≥120 字符）',
      bool(home_desc) and len(home_desc.group(1)) >= 120,
      f'{len(home_desc.group(1))} 字符' if home_desc else '未找到')

# --- 文章页 ---
all_blog_html = sorted((DIST / 'blog').glob('*/index.html'))
# Astro 会为旧 slug 生成静态重定向页，和文章页放在同目录，需要排除
redirects = [p for p in all_blog_html if 'http-equiv="refresh"' in p.read_text(encoding='utf-8')]
post_files = [p for p in all_blog_html if p not in redirects]
check('存在文章页', bool(post_files), f'{len(post_files)} 篇（另有 {len(redirects)} 个旧 slug 重定向页）')
if redirects:
    check('重定向页均为 meta refresh 形式',
          all('http-equiv="refresh"' in p.read_text(encoding='utf-8') for p in redirects))
if post_files:
    post = post_files[0]
    post_html = post.read_text(encoding='utf-8')
    check(f'文章页 JSON-LD 含 BlogPosting（{post.parent.name}）',
          'BlogPosting' in ld_types(post_html), str(ld_types(post_html)))
    check('文章页 canonical 存在', 'rel="canonical"' in post_html)
    check('文章页有 og:type=article', '<meta property="og:type" content="article"' in post_html)

# --- 项目页 ---
project = read('projects/doutimer/index.html')
check('项目页 JSON-LD 含 SoftwareApplication',
      'SoftwareApplication' in ld_types(project), str(ld_types(project)))
check('项目页封面带 fetchpriority=high', 'fetchpriority="high"' in project)
check('项目页含相关项目互链', 'class="related-item"' in project)
check('项目页 canonical 使用主域', 'https://7tec.cn/projects/doutimer/' in project)

# --- sitemap 过滤 ---
sitemap = ''.join(p.read_text(encoding='utf-8') for p in DIST.glob('sitemap*.xml'))
check('sitemap 已排除 /blog/page/', '/blog/page/' not in sitemap)
check('sitemap 已排除 /blog/tag/', '/blog/tag/' not in sitemap)
check('sitemap 含文章地址', '/blog/' in sitemap)
check('sitemap 使用主域', 'https://7tec.cn/' in sitemap and 'dev.7tec.cn' not in sitemap)

# --- 404 ---
check('404 页输出 noindex', 'noindex' in read('404.html'))

# --- 隐私政策（AdSense 硬性要求） ---
privacy_file = DIST / 'privacy' / 'index.html'
check('隐私政策页已生成', privacy_file.exists())
if privacy_file.exists():
    privacy = privacy_file.read_text(encoding='utf-8')
    check('隐私政策披露 Cookie 使用', 'Cookie' in privacy)
    check('隐私政策披露 Google AdSense 与 DART Cookie',
          'AdSense' in privacy and 'DoubleClick' in privacy)
    check('隐私政策提供个性化广告退出链接',
          'google.com/settings/ads' in privacy and 'aboutads.info' in privacy)
    check('隐私政策披露 Google Analytics', 'Google Analytics' in privacy)
    check('隐私政策提供邮箱联系方式', 'mailto:' in privacy)
    check('隐私政策页未被 noindex', 'noindex' not in privacy)
    check('隐私政策已进 sitemap', '/privacy' in sitemap)

# 站内每个页面（旧 slug 重定向页除外）都应能从页脚到达隐私政策
_crawlable = [p for p in DIST.rglob('*.html')
              if 'http-equiv="refresh"' not in p.read_text(encoding='utf-8')]
_no_privacy_link = [p.relative_to(DIST).as_posix() for p in _crawlable
                    if 'href="/privacy/"' not in p.read_text(encoding='utf-8')]
check('全站页脚均含隐私政策入口', not _no_privacy_link, str(_no_privacy_link[:5]))

# --- URL 规范化一致性（astro.config trailingSlash: 'always'）---
# canonical / og:url / sitemap 均为带尾斜杠形式，内部链接与 JSON-LD 必须一致，
# 否则两种形式会被搜索引擎当成重复页面（曾导致 obstimer 规范网址被 Google 改选）
_slash_bad: list[str] = []
for html_file in _crawlable:
    text = html_file.read_text(encoding='utf-8')
    rel = html_file.relative_to(DIST).as_posix()
    for m in re.findall(r'<link rel="canonical" href="([^"]+)"', text):
        if not m.endswith('/'):
            _slash_bad.append(f'{rel} canonical={m}')
    for m in re.findall(r'href="(/[^"]*)"', text):
        if re.match(r'^/(blog|projects|about|privacy)(/[^/]*)?$', m) and not m.endswith('/'):
            _slash_bad.append(f'{rel} link={m}')
    for m in re.findall(r'"url":\s*"(https://7tec\.cn[^"]*)"', text):
        if not m.endswith('/'):
            _slash_bad.append(f'{rel} jsonld={m}')
check('全站 canonical / 内部链接 / JSON-LD 均为带斜杠形式', not _slash_bad, str(_slash_bad[:5]))

# --- RSS ---
rss = read('rss.xml')
item_count = rss.count('<item>')
check('RSS 含 item', item_count >= 10, f'{item_count} 条')
check('RSS pubDate 为 RFC822 格式', bool(re.search(r'<pubDate>\w{3}, \d{2} \w{3} \d{4}', rss)))
check('RSS 使用主域', 'https://7tec.cn/' in rss)

# --- 图片引用完整性（含相对路径） ---
missing: list[str] = []
for html_file in DIST.rglob('*.html'):
    content = html_file.read_text(encoding='utf-8')
    for src in re.findall(r'<img[^>]+src="([^"]+)"', content):
        if src.startswith(('http://', 'https://', 'data:', '//')):
            continue
        clean = unquote(src.split('?')[0].split('#')[0])
        target = (DIST / clean.lstrip('/')) if clean.startswith('/') else (html_file.parent / clean)
        if not target.resolve().exists():
            missing.append(f'{html_file.relative_to(DIST).as_posix()} -> {src}')
check('所有 <img> 指向的文件均存在', not missing, str(missing[:5]))

# --- 旧域名残留 ---
stale = [p.relative_to(DIST).as_posix() for p in DIST.rglob('*.html')
         if 'dev.7tec.cn' in p.read_text(encoding='utf-8')]
check('构建产物中已无 dev.7tec.cn 残留', not stale, str(stale[:3]))

print()
print(f'结果：{"全部通过" if not failures else str(len(failures)) + " 项失败"}')
raise SystemExit(0 if not failures else 1)
