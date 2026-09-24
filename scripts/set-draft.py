#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量设置文章 frontmatter 的 draft 字段。

用法：
    python scripts/set-draft.py draft   a.md b.md ...        # 下线指定文章
    python scripts/set-draft.py publish a.md b.md ...        # 恢复发布
    python scripts/set-draft.py draft --except keep.txt      # 下线「保留清单」之外的全部已发布文章

选项：
    --dry-run   只预览，不写入

文件名可以省略路径，默认在 src/content/blog/ 下查找。
只改 draft 一行，保留原文件的换行符与其余内容。
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

BLOG = Path(__file__).resolve().parent.parent / 'src' / 'content' / 'blog'
FM_RE = re.compile(r'^---\r?\n(.*?)\r?\n---\r?\n(.*)$', re.S)


def resolve(name: str) -> Path:
    p = Path(name)
    if p.exists():
        return p
    cand = BLOG / Path(name).name
    if cand.exists():
        return cand
    raise SystemExit(f'找不到文件：{name}')


def is_draft(path: Path) -> bool:
    m = FM_RE.match(path.read_text(encoding='utf-8'))
    return bool(m and re.search(r'^draft:\s*true', m.group(1), re.M))


def set_draft(path: Path, value: bool, dry: bool) -> str:
    text = path.read_text(encoding='utf-8')
    m = FM_RE.match(text)
    if not m:
        return f'SKIP  {path.name}（无 frontmatter）'
    fm, body = m.group(1), m.group(2)
    old = bool(re.search(r'^draft:\s*true', fm, re.M))
    if old == value:
        return f'SAME  {path.name}（已是 draft={str(value).lower()}）'
    if re.search(r'^draft:\s*(true|false)', fm, re.M):
        new_fm = re.sub(r'^draft:\s*(true|false)', f'draft: {str(value).lower()}',
                        fm, count=1, flags=re.M)
    else:
        new_fm = fm + f'\ndraft: {str(value).lower()}'
    if not dry:
        with path.open('w', encoding='utf-8', newline='') as f:
            f.write(f'---\n{new_fm}\n---\n{body}')
    return f'{"PLAN" if dry else "DONE"}  {path.name}  {str(old).lower()} -> {str(value).lower()}'


def main() -> None:
    args = sys.argv[1:]
    dry = '--dry-run' in args
    args = [a for a in args if a != '--dry-run']
    if not args:
        raise SystemExit(__doc__)

    action = args.pop(0)
    if action not in ('draft', 'publish'):
        raise SystemExit('第一个参数必须是 draft 或 publish')
    value = action == 'draft'

    if '--except' in args:
        idx = args.index('--except')
        keep_lines = Path(args[idx + 1]).read_text(encoding='utf-8').splitlines()
        keep = {line.strip() for line in keep_lines if line.strip() and not line.startswith('#')}
        targets = [p for p in sorted(BLOG.glob('*.md'))
                   if p.name not in keep and is_draft(p) != value]
    else:
        targets = [resolve(n) for n in args]

    for p in targets:
        print(set_draft(p, value, dry))
    print(f'\n共 {len(targets)} 个文件' + ('（预览模式，未写入）' if dry else ' 已处理'))


if __name__ == '__main__':
    main()
