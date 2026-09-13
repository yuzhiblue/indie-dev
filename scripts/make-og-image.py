#!/usr/bin/env python3
"""生成默认社交分享图 public/og-default.png（1200x630）。

用法：python scripts/make-og-image.py

配色与站点 tokens.css 对齐：背景 #0a0a0a、强调色 #6366f1。
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'og-default.png'

W, H = 1200, 630
ACCENT = (99, 102, 241)
TEXT = (250, 250, 250)
MUTED = (136, 136, 136)

BOLD_FONTS = [
    r'C:\Windows\Fonts\msyhbd.ttc',
    r'C:\Windows\Fonts\msyh.ttc',
    r'C:\Windows\Fonts\arialbd.ttf',
    '/System/Library/Fonts/PingFang.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]
REGULAR_FONTS = [
    r'C:\Windows\Fonts\msyh.ttc',
    r'C:\Windows\Fonts\arial.ttf',
    '/System/Library/Fonts/PingFang.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
]


def load_font(candidates: list[str], size: int):
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


def main() -> int:
    image = Image.new('RGB', (W, H), (10, 10, 10))
    draw = ImageDraw.Draw(image)

    # 纵向渐变背景，上方略带蓝紫
    for y in range(H):
        t = y / (H - 1)
        draw.line(
            [(0, y), (W, y)],
            fill=(
                round(24 - 14 * t),
                round(24 - 15 * t),
                round(40 - 30 * t),
            ),
        )

    # 顶部强调线
    draw.rectangle([0, 0, W, 6], fill=ACCENT)

    pad = 90
    title_font = load_font(BOLD_FONTS, 104)
    sub_font = load_font(REGULAR_FONTS, 36)
    url_font = load_font(REGULAR_FONTS, 26)

    # 强调短线
    draw.rectangle([pad, 176, pad + 96, 184], fill=ACCENT)

    draw.text((pad, 214), 'yuzhiblue', font=title_font, fill=TEXT)
    draw.text((pad, 372), '独立开发者 · Windows 自动化工具与开发笔记', font=sub_font, fill=MUTED)
    draw.text((pad, H - 112), '7tec.cn', font=url_font, fill=ACCENT)

    image.save(OUT, optimize=True)
    print(f'written: {OUT} ({image.size[0]}x{image.size[1]})')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
