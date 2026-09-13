#!/usr/bin/env python3
"""把 public 下文件名含特殊字符（& @ = # ? % 空格 括号）或过长的图片
改成 URL 友好、长度可控的名字，并同步更新 src/content 里的 Markdown 引用。

用法：
    python scripts/normalize-image-names.py           # 只报告，不改动
    python scripts/normalize-image-names.py --apply   # 执行重命名 + 更新引用
"""
from __future__ import annotations

import argparse
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG_ROOT = ROOT / 'public'
CONTENT_ROOT = ROOT / 'src' / 'content'
EXTS = {'.png', '.jpg', '.jpeg', '.webp'}
SPECIAL = r'[&@=#?%\s()]'
MAX_STEM = 60


def normalize(stem: str) -> str:
    out = re.sub(SPECIAL, '-', stem)
    out = re.sub(r'-{2,}', '-', out)
    out = re.sub(r'-_|_-', '_', out)
    out = re.sub(r'-{2,}', '-', out).strip('-_')
    if len(out) > MAX_STEM:
        digest = hashlib.md5(stem.encode('utf-8')).hexdigest()[:8]
        out = out[:MAX_STEM - 9].strip('-_') + '-' + digest
    return out


def markdown_forms(name: str) -> list[str]:
    """该文件名在 Markdown 中可能出现的写法（括号会被转义）。"""
    forms = {name}
    if '(' in name or ')' in name:
        forms.add(name.replace('(', r'\(').replace(')', r'\)'))
    return sorted(forms, key=len, reverse=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='实际执行重命名并更新引用')
    args = parser.parse_args()

    targets: list[tuple[Path, str]] = []
    for path in sorted(IMG_ROOT.rglob('*')):
        if path.is_file() and path.suffix.lower() in EXTS and re.search(SPECIAL, path.name):
            new_name = normalize(path.stem) + path.suffix.lower()
            if new_name != path.name:
                targets.append((path, new_name))

    if not targets:
        print('没有需要规范化的文件名')
        return 0

    md_files = list(CONTENT_ROOT.rglob('*.md'))

    for path, new_name in targets:
        forms = markdown_forms(path.name)
        refs = []
        for md in md_files:
            text = md.read_text(encoding='utf-8')
            if any(form in text for form in forms):
                refs.append(md.relative_to(ROOT))
        print(f'{path.name}\n  -> {new_name}\n  被引用: {len(refs)} 处 {refs}')

        if not args.apply:
            continue

        for md in md_files:
            text = md.read_text(encoding='utf-8')
            updated = text
            for form in forms:
                updated = updated.replace(form, new_name)
            if updated != text:
                md.write_text(updated, encoding='utf-8')
        path.rename(path.with_name(new_name))

    if not args.apply:
        print('\n报告模式，未改动任何文件。加 --apply 执行。')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
