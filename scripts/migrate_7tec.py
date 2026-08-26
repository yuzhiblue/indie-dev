#!/usr/bin/env python3
"""
一次性迁移脚本：把 https://7tec.cn 的 /detail/{id} 博客文章
抓取并转换为本 Astro 项目的 Markdown 文章。

用法：
    source .venv-migrate/bin/activate
    python scripts/migrate_7tec.py            # 抓 1-650
    python scripts/migrate_7tec.py --start 1 --end 20   # 测试小范围

产出：
    src/content/blog/{slug}.md
    public/images/blog/{id}/{图片}
"""
import argparse
import os
import re
import sys
import time
import urllib.parse
from pathlib import Path

import requests
from bs4 import BeautifulSoup
import html2text
from pypinyin import lazy_pinyin

BASE = "https://7tec.cn"
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "src" / "content" / "blog"
IMG_ROOT = ROOT / "public" / "images" / "blog"
IMG_ROOT.mkdir(parents=True, exist_ok=True)
BLOG_DIR.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (compatible; 7tec-migrator/1.0)"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": UA})

# 已用过 slug 计数（处理重名）
slug_counts: dict[str, int] = {}


def slugify(title: str) -> str:
    """标题转拼音 slug，中文逐字转拼音，英文/数字保留。"""
    parts = []
    for ch in title:
        if re.match(r"[\u4e00-\u9fff]", ch):
            parts.append("".join(lazy_pinyin(ch)))
        elif re.match(r"[a-zA-Z0-9]", ch):
            parts.append(ch.lower())
        # 其它字符（标点、空格）作为分隔点
    raw = "-".join(p for p in re.split(r"[^a-z0-9]+", "".join(parts)) if p)
    return raw or "post"


def unique_slug(title: str) -> str:
    base = slugify(title)
    if base not in slug_counts:
        slug_counts[base] = 0
        return base
    slug_counts[base] += 1
    return f"{base}-{slug_counts[base]}"


def parse_date(text: str) -> str | None:
    """'2026年5月28日 08:50' -> '2026-05-28'"""
    m = re.search(r"(\d{4})年(\d{1,2})月(\d{1,2})日", text)
    if not m:
        return None
    y, mo, d = m.groups()
    return f"{int(y):04d}-{int(mo):02d}-{int(d):02d}"


def fetch(url: str) -> str | None:
    try:
        r = SESSION.get(url, timeout=20)
    except Exception as e:
        print(f"  [ERR] 请求失败 {url}: {e}")
        return None
    if r.status_code == 404 or r.url.rstrip("/") == BASE:
        return None  # 404 或跳回首页视为无效
    return r.text


def download_image(src: str, art_id: int) -> str | None:
    if src.startswith("data:"):
        return None
    if src.startswith("//"):
        src = "https:" + src
    elif src.startswith("/"):
        src = BASE + src
    elif not src.startswith("http"):
        src = urllib.parse.urljoin(BASE, src)
    dest_dir = IMG_ROOT / str(art_id)
    dest_dir.mkdir(parents=True, exist_ok=True)
    fname = urllib.parse.unquote(src.split("?")[0].rstrip("/").split("/")[-1])
    if not fname or "." not in fname:
        fname = f"img_{int(time.time()*1000)}.jpg"
    dest = dest_dir / fname
    rel = f"/images/blog/{art_id}/{fname}"
    if dest.exists():
        return rel
    try:
        ir = SESSION.get(src, timeout=30)
        ir.raise_for_status()
        dest.write_bytes(ir.content)
        return rel
    except Exception as e:
        print(f"    [IMG ERR] {src}: {e}")
        return None


def convert_body(art_id: int, body_html: str) -> str:
    soup = BeautifulSoup(body_html, "html.parser")

    # 下载图片，改写 src/数据
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if not src:
            continue
        rel = download_image(src, art_id)
        if rel:
            img["src"] = rel
            if not img.get("alt"):
                img["alt"] = ""

    # 代码块：<pre class="codehilite"><code class="language-xxx">
    # 先提取并暂存，用占位符替换，避免 html2text 折叠内部换行
    code_blocks = []
    for pre in soup.find_all("pre"):
        lang = ""
        code = pre.find("code")
        if code and code.get("class"):
            for c in code.get("class"):
                if c.startswith("language-"):
                    lang = c.split("language-", 1)[1]
        text = (code or pre).get_text("\n")
        idx = len(code_blocks)
        code_blocks.append((lang, text.rstrip("\n")))
        ph = soup.new_tag("p")
        ph.string = f"@@CODE_{idx}@@"
        pre.replace_with(ph)

    h = html2text.HTML2Text()
    h.body_width = 0
    h.baseurl = BASE
    h.ignore_images = False
    h.ignore_links = False
    md = h.handle(str(soup))
    # 清理多余空行
    md = re.sub(r"\n{3,}", "\n\n", md).strip()

    # 还原代码块为 Markdown 围栏代码块
    for idx, (lang, text) in enumerate(code_blocks):
        placeholder = f"@@CODE_{idx}@@"
        md = md.replace(placeholder, f"\n\n```{lang}\n{text}\n```\n")
    return md


def yaml_escape(s: str) -> str:
    """转义双引号字符串里的 YAML 特殊字符（反斜杠、双引号）。"""
    return s.replace("\\", "\\\\").replace('"', '\\"')


def make_description(md: str, limit: int = 120) -> str:
    # 去掉代码块
    txt = re.sub(r"```.*?```", "", md, flags=re.S)
    txt = re.sub(r"[#*>\`\-\[\]()]", "", txt)
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt[:limit].rstrip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", type=int, default=1)
    ap.add_argument("--end", type=int, default=650)
    ap.add_argument("--delay", type=float, default=0.3)
    args = ap.parse_args()

    ok, skip, fail = 0, 0, 0
    failures = []

    for art_id in range(args.start, args.end + 1):
        url = f"{BASE}/detail/{art_id}"
        html = fetch(url)
        if not html:
            skip += 1
            print(f"[{art_id}] 跳过 (404/无效)")
            continue
        soup = BeautifulSoup(html, "html.parser")

        h1 = soup.select_one("h1.mt-4")
        if not h1:
            skip += 1
            print(f"[{art_id}] 跳过 (无标题，可能不是文章)")
            continue
        title = h1.get_text(strip=True)

        cat = ""
        cat_a = soup.select_one("a.btn-outline-success.btn-sm")
        if cat_a and cat_a.get("href"):
            m = re.search(r"/category/([^/]+)/?", cat_a["href"])
            if m:
                cat = urllib.parse.unquote(m.group(1))

        date_text = ""
        p = soup.select_one(".user_details .media-body p.small")
        if p:
            date_text = p.get_text(strip=True)
        pub_date = parse_date(date_text) or ""

        tags = []
        if cat:
            tags.append(cat)
        for a in soup.select(".news_d_footer a[href^='/tag/']"):
            t = a.get_text(strip=True)
            if t and t not in tags:
                tags.append(t)

        body = soup.select_one("div.blog_details")
        if not body:
            skip += 1
            print(f"[{art_id}] 跳过 (无正文)")
            continue
        # 剔除版权声明段
        for bad in body.select("p.bg-secondary"):
            bad.decompose()
        body_html = str(body)

        md = convert_body(art_id, body_html)
        if not md.strip():
            skip += 1
            print(f"[{art_id}] 跳过 (正文为空)")
            continue

        slug = unique_slug(title)
        description = make_description(md)
        frontmatter = [
            "---",
            f'title: "{yaml_escape(title)}"',
            f'description: "{yaml_escape(description)}"',
            f"pubDate: {pub_date}",
            f"tags: {tags}",
            "draft: false",
            "---",
            "",
        ]
        out = BLOG_DIR / f"{slug}.md"
        out.write_text("\n".join(frontmatter) + md + "\n", encoding="utf-8")
        ok += 1
        print(f"[{art_id}] OK -> {slug}.md  ({pub_date}, {len(md)}字, {len(tags)}标签)")

        time.sleep(args.delay)

    print(f"\n完成: 成功 {ok}, 跳过 {skip}, 失败 {fail}")
    if failures:
        print("失败列表:", failures)


if __name__ == "__main__":
    main()
