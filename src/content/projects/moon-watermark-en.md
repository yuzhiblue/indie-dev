---
title: 'MoonWatermark — Image Watermarking Library for MoonBit'
description: 'A pure MoonBit image watermarking library: visible watermarks (text / dots / logo / tiled) plus invisible forensic watermarks (LSB / DCT domain), with embed / extract / verify / trace APIs and a CLI. Chinese bitmap glyphs built in.'
pubDate: 2026-10-27
updatedDate: 2026-10-27
tags: ['MoonBit', 'Open Source', 'Watermarking', 'Image Processing', 'Security']
featured: false
github: 'https://github.com/yuzhiblue/moon-watermark'
lang: 'en'
applicationCategory: 'DeveloperApplication'
operatingSystem: 'Cross-platform'
i18nKey: 'moon-watermark'
draft: false
---

## Overview

MoonWatermark is an image watermarking algorithm library written in MoonBit, covering both **visible watermarks** and **invisible forensic watermarks**:

- **Visible**: text / random dot pattern / logo / full-frame tiled
- **Invisible (forensic)**: LSB (least significant bit) and DCT (discrete cosine transform domain), the latter surviving JPEG compression

It provides embed / extract / verify / trace APIs end to end, JSON-serializable configuration, and built-in 16×16 Chinese bitmap glyphs (Cjk16, 3755 GB2312 level-1 characters), extensible via the `GlyphProvider` interface.

## Typical Use Cases

- Anti-scraping for e-commerce, preview protection for stock assets, image copyright proof
- Internal document leak tracing: distribute a per-recipient seed, then use `trace_dots` to locate the source of a leak
- API image tracking, dedup-resistant marking for live streams

## Choosing a Channel

| Need | Recommended |
| --- | --- |
| Visible deterrent | Visible watermark (text / tiled) |
| Invisible evidence | LSB |
| Image goes through JPEG / compression | DCT |
| Need to identify the leaker | Dot pattern + per-recipient seed, traced via `trace_dots` |

## Installation

```bash
moon add yuzhiblue/moon-watermark@0.1.18
```

## Quick Start

```moonbit
let img = @lib.RgbaImage::new(320, 240, 0xFFFF_FFFF)

// combined embedding: text (45° diagonal) + dots (seed = recipient ID) + LSB (user ID)
let tcfg = @lib.TextConfig::with_font("LIVE", 8, 200, 2, 0.6, 0xFF00_00FF, "ascii5x7", angle=45.0)
let opts : @lib.EmbedOptions = {
  text_cfg: Some(tcfg),
  dot_cfg: Some(@lib.DotConfig::default()),
  lsb_payload: Some(@utf8.encode("UID-001")),
  lsb_key: Some(42L),
  dct_payload: None,
  dct_delta: 24,
}
let marked = img.embed_all(opts)
```

```bash
# CLI: embed text + dots + LSB
moon run cmd/main -- embed in.png out.png --text "LIVE 2026-10-03" --font cjk16 --lsb "UID-001" --key 42

# DCT-domain watermark only (JPEG-resistant)
moon run cmd/main -- embed in.jpg out.jpg --dct "UID-001" --delta 48

# verification
moon run cmd/main -- verify-dots out.png
moon run cmd/main -- verify-dct out.png --delta 48
```

## Core Capabilities

- **Deterministic dot watermarks**: fully determined by DotConfig (including seed) — same seed, bit-identical reproduction → extractable and traceable
- **Forensic tracing**: `dot_contrast` multi-control-group signal (k=8 median) automatically corrects dark-region bias, with false-positive rate calibratable down to ~0.1%; `trace_dots` evaluates candidate seeds one by one and returns -2 on ambiguity instead of locking the wrong one
- **Blind detection**: `detect_lsb` / `detect_dct` answer "is this image marked?" without any key
- **Imperceptibility**: LSB measures 76.98dB PSNR and DCT 50.9dB — both well above the 40dB visibility threshold
- **Robustness**: DCT watermarks survive JPEG q60 recompression; dot watermarks remain extractable after rescaling

## Design Boundaries (Honest Disclosure)

- No strong encryption / anti-forgery — anyone who knows the algorithm can extract or overwrite a watermark; access-controlled scenarios should manage embedding parameters at the application layer
- Invisible watermarks are not robust to geometric attacks (crop / rotate / rescale) — use the DCT/LSB channels for those scenarios
- Carrier formats supported: PNG / JPEG

## Related Product

The author also built an online product in the same space: [Live Stream Sticker Watermark](/projects/watermark-kaizdo-en/) — a plug-and-play OBS browser-source watermarking SaaS with dynamic forensic variables and 21 behavior effects. No coding required.

## Links

- GitHub repository: https://github.com/yuzhiblue/moon-watermark
- mooncakes package page: https://mooncakes.io/package/yuzhiblue/moon-watermark
- Online API docs: https://mooncakes.io/docs/yuzhiblue/moon-watermark@0.1.18

## License

Apache-2.0 for the main codebase; Cjk16 glyph data derived from Noto Sans CJK (SIL OFL 1.1).
