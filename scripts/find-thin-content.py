#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""内容体检：区分「真实踩坑记录」与「通用 / AI 搬运式薄内容」。

判断依据（启发式，最终仍需人工确认）：
  - 字数：去代码块后的中文字符数
  - 经验痕迹：是否出现第一人称的排查、试错、环境描述
  - AI 话术：是否出现「是一种」「通常」「综上所述」「希望对你有所帮助」等通用措辞
  - 问答式标题：标题是否为「XX 是什么意思 / 怎么办 / 如何」

用法：
    python scripts/find-thin-content.py            # 完整清单
    python scripts/find-thin-content.py --limit 40 # 只打印主表前 40 行
"""
from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / 'src' / 'content' / 'blog'
FRONTMATTER_RE = re.compile(r'^---\r?\n(.*?)\r?\n---\r?\n(.*)$', re.S)
CODE_RE = re.compile(r'```.*?```', re.S)
CJK_RE = re.compile(r'[\u4e00-\u9fff]')

# 第一人称踩坑痕迹（AI 无法凭空产生的内容）
EXPERIENCE_RE = re.compile(
    r'(我(当时|遇到|发现|试|用|做|踩|折腾|找了|改成|最后|这里|项目)|'
    r'折腾|踩坑|掉坑|试了|试过|没成功|没有成功|不生效|不起作用|'
    r'亲测|实测|终于|一直没)'
)
# 通用 / AI 话术
AI_TELL_RE = re.compile(
    r'(是一种|通常|一般|可以分为|总而言之|综上所述|希望对你有所帮助|'
    r'本文将|本文介绍|需要注意的是|首先.*其次)'
)
QA_TITLE_RE = re.compile(r'(是什么|什么意思|怎么办|如何|怎么|为什么|有哪些|哪种|哪个)')


def parse(path: Path) -> dict | None:
    text = path.read_text(encoding='utf-8')
    m = FRONTMATTER_RE.match(text)
    if not m:
        return None
    fm, body = m.group(1), m.group(2)

    def field(name: str) -> str:
        mm = re.search(rf'^{name}:\s*"?(.*?)"?\s*$', fm, re.M)
        return mm.group(1).strip() if mm else ''

    prose = CODE_RE.sub('', body)
    return {
        'file': path.name,
        'title': field('title'),
        'date': field('pubDate')[:10],
        'tags': field('tags'),
        'draft': bool(re.search(r'^draft:\s*true', fm, re.M)),
        'chars': len(CJK_RE.findall(prose)),
        'has_img': '![' in body,
        'experience': len(EXPERIENCE_RE.findall(prose)),
        'ai_tell': len(AI_TELL_RE.findall(prose)),
        'qa_title': bool(QA_TITLE_RE.search(field('title'))),
    }


def grade(x: dict) -> str:
    # 有真实排查痕迹、或图文并茂的长文 → 保留
    if x['experience'] >= 2 or (x['has_img'] and x['chars'] >= 600):
        return 'KEEP'
    # 过短，或通篇 AI 话术且零经验痕迹 → 建议下线/扩容
    if x['chars'] < 500 or (x['ai_tell'] >= 1 and x['experience'] == 0):
        return 'THIN'
    return 'REVIEW'


def main() -> None:
    limit = None
    if '--limit' in sys.argv:
        limit = int(sys.argv[sys.argv.index('--limit') + 1])
    only = None
    if '--grade' in sys.argv:
        only = sys.argv[sys.argv.index('--grade') + 1].upper()

    items = [x for x in (parse(p) for p in sorted(BASE.glob('*.md'))) if x]
    published = [x for x in items if not x['draft']]
    for x in published:
        x['grade'] = grade(x)

    counts = Counter(x['grade'] for x in published)
    chars = sorted(x['chars'] for x in published)
    print(f'内容总数 {len(items)}（已发布 {len(published)}，draft {len(items) - len(published)}）')
    if chars:
        print(f'已发布中文字数：最小 {chars[0]} / 中位 {chars[len(chars) // 2]} / 最大 {chars[-1]}')
    print(f"分级：KEEP {counts['KEEP']} · REVIEW {counts['REVIEW']} · THIN {counts['THIN']}")
    print()

    order = {'THIN': 0, 'REVIEW': 1, 'KEEP': 2}
    rows = sorted(published, key=lambda r: (order[r['grade']], r['chars']))
    if only:
        rows = [r for r in rows if r['grade'] == only]

    print(f'{"级别":6s} {"字数":>5s} {"图":1s} {"经验":>3s}  日期        标题')
    print('-' * 100)
    for x in rows[:limit]:
        print(f"{x['grade']:6s} {x['chars']:5d} {'图' if x['has_img'] else '·':1s} "
              f"{x['experience']:3d}  {x['date']}  {x['title'][:38]}  <- {x['file']}")

    for g in ([only] if only else ['THIN', 'KEEP']):
        subset = sorted((r for r in published if r['grade'] == g), key=lambda r: r['chars'])
        print()
        print(f'【{g} 清单】{len(subset)} 篇' +
              ('，建议扩容或改为 draft：' if g == 'THIN' else '，建议保留并优先扩容：'))
        for x in subset:
            print(f"  {x['chars']:5d}字 {x['date']} {'问答式' if x['qa_title'] else '      '} "
                  f"{x['title'][:38]}  <- {x['file']}")


if __name__ == '__main__':
    main()
