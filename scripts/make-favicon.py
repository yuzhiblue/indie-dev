#!/usr/bin/env python3
"""生成站点图标资源：
- public/favicon.ico          16 / 32 / 48 / 64 多尺寸
- public/favicon.svg          矢量版
- public/apple-touch-icon.png 180x180，iOS「添加到主屏幕」

设计与 public/avatar.svg 保持一致：靛蓝渐变 + 白色字母 Y（替换掉原来的 Astro 默认 logo）。

注意：iOS 主屏图标不支持透明背景，且系统会自动裁切圆角，因此 apple-touch-icon
采用"满铺渐变"而非圆形，避免出现「深色方框里套一个圆」的效果。

用法：python scripts/make-favicon.py
"""
from __future__ import annotations

import io
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
ICO_PATH = PUBLIC / 'favicon.ico'
SVG_PATH = PUBLIC / 'favicon.svg'
TOUCH_PATH = PUBLIC / 'apple-touch-icon.png'
PREVIEW_PATH = ROOT / '.codebuddy' / 'favicon-preview.png'
TOUCH_PREVIEW_PATH = ROOT / '.codebuddy' / 'apple-touch-preview.png'

ICO_SIZES = [16, 32, 48, 64]
TOUCH_SIZE = 180
GRAD_FROM = (99, 102, 241)   # #6366f1
GRAD_TO = (79, 70, 229)      # #4f46e5
LETTER_COLOR = (250, 250, 250)  # #fafafa

BOLD_FONTS = [
    r'C:\Windows\Fonts\arialbd.ttf',
    r'C:\Windows\Fonts\segoeuib.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]

SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="yuzhiblue">
  <defs>
    <linearGradient id="favicon-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="64" fill="url(#favicon-bg)"/>
  <text x="64" y="66" text-anchor="middle" dominant-baseline="central"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        font-size="96" font-weight="800" fill="#fafafa">Y</text>
</svg>
"""


def load_font(size: int):
    for path in BOLD_FONTS:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


def vertical_gradient(size: int) -> Image.Image:
    gradient = Image.new('RGBA', (size, size))
    drawer = ImageDraw.Draw(gradient)
    for y in range(size):
        ratio = y / max(1, size - 1)
        color = tuple(round(a + (b - a) * ratio) for a, b in zip(GRAD_FROM, GRAD_TO))
        drawer.line([(0, y), (size, y)], fill=color + (255,))
    return gradient


def draw_letter(icon: Image.Image, size: int, ratio: float) -> None:
    font = load_font(max(6, round(size * ratio)))
    drawer = ImageDraw.Draw(icon)
    left, top, right, bottom = drawer.textbbox((0, 0), 'Y', font=font)
    drawer.text(
        ((size - (right - left)) / 2 - left, (size - (bottom - top)) / 2 - top),
        'Y', font=font, fill=LETTER_COLOR + (255,),
    )


def make_icon(size: int, letter_ratio: float) -> Image.Image:
    """浏览器标签页图标：圆形渐变底 + 居中白色 Y。"""
    icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    icon.paste(vertical_gradient(size), (0, 0), mask)
    draw_letter(icon, size, letter_ratio)
    return icon


def make_touch_icon(size: int) -> Image.Image:
    """iOS 主屏图标：满铺渐变（不透明），圆角由系统裁切。"""
    icon = vertical_gradient(size)
    draw_letter(icon, size, 0.72)
    return icon


def write_ico(path: Path, images: list[tuple[int, Image.Image]]) -> None:
    """把多张独立绘制的尺寸写成单个 ICO（内嵌 PNG，保留各尺寸的最佳画质）。"""
    blobs: list[tuple[int, bytes]] = []
    for size, image in images:
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        blobs.append((size, buffer.getvalue()))

    header = struct.pack('<HHH', 0, 1, len(blobs))
    offset = 6 + 16 * len(blobs)
    entries = b''
    payload = b''
    for size, blob in blobs:
        dim = 0 if size >= 256 else size
        entries += struct.pack('<BBBBHHII', dim, dim, 0, 0, 1, 32, len(blob), offset)
        payload += blob
        offset += len(blob)

    path.write_bytes(header + entries + payload)


def main() -> int:
    # 小尺寸稍微放大字母比例，保证 16px 下依然可辨
    images = [(size, make_icon(size, 0.88 if size <= 16 else 0.78)) for size in ICO_SIZES]
    write_ico(ICO_PATH, images)
    print(f'written: {ICO_PATH} sizes={ICO_SIZES}')

    SVG_PATH.write_text(SVG, encoding='utf-8')
    print(f'written: {SVG_PATH}')

    touch = make_touch_icon(TOUCH_SIZE)
    touch.save(TOUCH_PATH, optimize=True)
    print(f'written: {TOUCH_PATH} size={TOUCH_SIZE}')

    PREVIEW_PATH.parent.mkdir(exist_ok=True)
    width = sum(size for size, _ in images) + 24 * (len(images) + 1)
    sheet = Image.new('RGBA', (width, 96), (10, 10, 10, 255))
    x = 24
    for size, image in images:
        sheet.paste(image, (x, (96 - size) // 2), image)
        x += size + 24
    sheet.save(PREVIEW_PATH)
    print(f'preview: {PREVIEW_PATH}')

    touch.save(TOUCH_PREVIEW_PATH)
    print(f'preview: {TOUCH_PREVIEW_PATH}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
