#!/usr/bin/env python3
"""扫描并（可选）压缩 public/ 下的图片。

用法：
    python scripts/optimize-images.py            # 仅报告，不改动任何文件
    python scripts/optimize-images.py --apply    # 实际压缩（原地覆盖，结果变大则自动回滚）

策略：
    - 宽度超过 MAX_WIDTH 的等比缩小（页面显示宽度远小于此，不影响观感）
    - JPEG 以 quality=82 + progressive 重编码
    - PNG 使用 optimize 重压缩
    - 只有压缩后确实更小才写入，否则保留原文件
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / 'public'
EXTS = {'.png', '.jpg', '.jpeg', '.webp'}
MAX_WIDTH = 1920
JPEG_QUALITY = 82


def human(num: int) -> str:
    if num < 1024:
        return f'{num} B'
    if num < 1024 * 1024:
        return f'{num / 1024:.1f} KB'
    return f'{num / 1024 / 1024:.2f} MB'


def collect() -> list[Path]:
    return [p for p in sorted(TARGET.rglob('*')) if p.is_file() and p.suffix.lower() in EXTS]


def compress(path: Path) -> tuple[int, int]:
    """原地压缩，返回 (压缩前字节数, 压缩后字节数)。"""
    original = path.read_bytes()
    before = len(original)

    with Image.open(path) as image:
        image.load()
        fmt = (image.format or '').upper()
        width, height = image.size

        if width > MAX_WIDTH:
            ratio = MAX_WIDTH / width
            image = image.resize((MAX_WIDTH, max(1, round(height * ratio))), Image.LANCZOS)

        if fmt in {'JPEG', 'JPG'}:
            if image.mode not in {'RGB', 'L'}:
                image = image.convert('RGB')
            image.save(path, format='JPEG', quality=JPEG_QUALITY,
                       optimize=True, progressive=True)
        elif fmt == 'PNG':
            image.save(path, format='PNG', optimize=True)
        elif fmt == 'WEBP':
            image.save(path, format='WEBP', quality=JPEG_QUALITY, method=6)
        else:
            return before, before

    after = path.stat().st_size
    if after >= before:
        path.write_bytes(original)
        return before, before
    return before, after


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='实际写入压缩结果')
    args = parser.parse_args()

    files = collect()
    if not files:
        print('未找到图片')
        return 0

    total_before = 0
    total_after = 0
    rows: list[tuple[str, int, int, int]] = []

    for path in files:
        before = path.stat().st_size
        total_before += before
        with Image.open(path) as image:
            width, height = image.size
        if args.apply:
            before, after = compress(path)
        else:
            after = before
        total_after += after
        rows.append((str(path.relative_to(ROOT)), before, after, width))

    rows.sort(key=lambda r: r[1], reverse=True)

    print(f'{"文件":<58}{"尺寸":>10}{"原始":>12}{"压缩后":>12}')
    print('-' * 94)
    for name, before, after, width in rows:
        shown = f'{width}px'
        print(f'{name:<58}{shown:>10}{human(before):>12}{human(after):>12}')

    print('-' * 94)
    print(f'共 {len(rows)} 张；合计 {human(total_before)} -> {human(total_after)}')
    if not args.apply:
        print('当前为报告模式，未修改任何文件。加 --apply 执行压缩。')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
