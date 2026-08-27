#!/usr/bin/env python3
"""
一次性修复脚本：把博客 Markdown 中仍指向旧站的图片链接
    https://7tec.cn/images/blog/{art_id}/{file}
改写为本地相对路径
    /images/blog/{art_id}/{file}

原因：迁移脚本 migrate_7tec.py 在下载图片后已把 <img src> 改成本地相对路径，
但 html2text 设置了 h.baseurl = BASE（https://7tec.cn），又把相对路径重新
绝对化为 https://7tec.cn/images/blog/... 。本脚本把链接改回本地路径。

规则：
- 仅处理 /images/blog/ 路径下的图片，不影响 7tec.cn/go?... 推广跳转、
  7tec.cn/usr/uploads/*.tar.gz 下载等其它外部链接。
- 仅当 public/images/blog/{art_id}/{file} 本地文件确实存在时才改写（幂等安全）。
- 支持文件名中的 Markdown 转义字符（如反斜杠 + 括号、空格）。
- 同时清理被迁移脚本误写入 frontmatter description 的裸图片链接
  `!https://7tec.cn/images/blog/...`（去除方括号后残留的文本）。
- 幂等：改写后链接不再包含 7tec.cn，重复运行无副作用。

用法：
    python scripts/fix_image_links.py            # 执行改写
    python scripts/fix_image_links.py --dry-run  # 只报告，不写文件
"""
import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "src" / "content" / "blog"
IMG_ROOT = ROOT / "public" / "images" / "blog"

HOST = "https://7tec.cn"

# 匹配 Markdown 链接/图片中的 7tec.cn/images/blog/ URL，
# 允许 URL 内部出现转义字符 \(  \)，并在第一个未转义的 ) 处结束。
MD_LINK_RE = re.compile(r"\]\((https?://7tec\.cn/images/blog/((?:[^)\\]|\\.)*))\)")
# 兼顾 <https://7tec.cn/images/blog/...> 形式的自动链接
ANGLE_RE = re.compile(r"<(https?://7tec\.cn/images/blog/[^>\s]+)>")
# frontmatter description 中被迁移脚本误写入的裸图片链接（无方括号）：
#   !https://7tec.cn/images/blog/639/x.png
# 这些只会以迁移残留的垃圾文本形式出现在 frontmatter，渲染时本就不会成为图片，
# 且文件名可能因 description 截断而残缺，因此直接删除（不依赖本地文件是否存在）。
BARE_IMG_RE = re.compile(r"!https?://7tec\.cn/images/blog/?[^\s)\"]*")


def unescape_markdown(path: str) -> str:
    """反转 Markdown 对链接目标中特殊字符的转义：反斜杠+右括号 -> 右括号 等。"""
    return re.sub(r"\\([\\()\[\]])", r"\1", path)


def rewrite_text(text: str, dry_run: bool):
    """返回 (新文本, 改写次数, 跳过数, 跳过清单)。"""
    changed = 0
    skipped = 0
    skipped_list = []

    def process(match: re.Match) -> str:
        nonlocal changed, skipped
        full = match.group(0)          # 整个匹配，如 ](https://7tec.cn/images/blog/639/x.png)
        url = match.group(1)           # https://7tec.cn/images/blog/639/x.png
        rel = match.group(2)           # /images/blog/639/x.png （可能含转义）
        local_rel = unescape_markdown(rel)
        local_path = IMG_ROOT / local_rel.lstrip("/")
        if local_path.exists():
            new_url = url.replace(HOST, "", 1)  # 去掉协议+主机，保留 /images/blog/...
            changed += 1
            return full.replace(url, new_url, 1)
        else:
            skipped += 1
            skipped_list.append(local_rel)
            return full

    def process_angle(match: re.Match) -> str:
        nonlocal changed, skipped
        full = match.group(0)
        url = match.group(1)
        rel = url[len(HOST):]
        local_path = IMG_ROOT / rel.lstrip("/")
        if local_path.exists():
            changed += 1
            return full.replace(url, url.replace(HOST, "", 1), 1)
        skipped += 1
        skipped_list.append(rel)
        return full

    def process_bare(match: re.Match) -> str:
        nonlocal changed, skipped
        # frontmatter 中的裸图片文本：一律删除（若本地存在则本就是迁移残留，
        # 若本地不存在则多半是 description 截断导致的残缺 URL，均无需保留）。
        changed += 1
        return ""

    new_text, n_md = MD_LINK_RE.subn(process, text)
    new_text, n_angle = ANGLE_RE.subn(process_angle, new_text)
    new_text, n_bare = BARE_IMG_RE.subn(process_bare, new_text)
    # 清理删除裸链接后可能产生的连续空格
    new_text = re.sub(r"[ \t]{2,}", " ", new_text)

    return new_text, changed, skipped, skipped_list


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="只报告，不写文件")
    args = ap.parse_args()

    if not BLOG_DIR.exists():
        print(f"[ERR] 未找到博客目录：{BLOG_DIR}")
        return

    total_changed = 0
    total_skipped = 0
    all_skipped = []
    files_changed = 0

    md_files = sorted(BLOG_DIR.glob("*.md"))
    print(f"扫描 {len(md_files)} 个博客文件...")

    for f in md_files:
        text = f.read_text(encoding="utf-8")
        new_text, changed, skipped, skipped_list = rewrite_text(text, args.dry_run)
        if changed:
            files_changed += 1
            total_changed += changed
            if not args.dry_run:
                f.write_text(new_text, encoding="utf-8")
        total_skipped += skipped
        all_skipped.extend(skipped_list)

    print(f"改写图片链接：{total_changed} 处，涉及 {files_changed} 个文件。")
    if total_skipped:
        print(f"跳过（本地文件不存在，未改写）：{total_skipped} 处：")
        for s in sorted(set(all_skipped)):
            print(f"   - {s}")
    else:
        print("无跳过项，所有 7tec.cn 图片均有本地副本。")
    if args.dry_run:
        print("[dry-run] 未写入任何文件。")


if __name__ == "__main__":
    main()
