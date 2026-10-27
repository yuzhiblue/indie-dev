---
title: 'MoonWatermark — MoonBit 图像水印库'
description: '纯 MoonBit 实现的图像水印库：可见水印（文本/点阵/Logo/平铺）与不可见溯源水印（LSB/DCT 域），提供 embed/extract/verify/trace 全链路 API 与 CLI，内置中文点阵字形。'
pubDate: 2026-10-27
updatedDate: 2026-10-27
tags: ['MoonBit', '开源', '水印', '图像处理', '信息安全']
featured: false
github: 'https://github.com/yuzhiblue/moon-watermark'
draft: false
---

## 简介

MoonWatermark 是一个用 MoonBit 编写的图像水印算法库，同时覆盖**可见水印**与**不可见溯源水印**两大类场景：

- **可见水印**：文本 / 随机点阵 / Logo / 全幅平铺
- **不可见溯源水印**：LSB（最低有效位）与 DCT（离散余弦变换域），后者抗 JPEG 压缩

提供 embed / extract / verify / trace 全链路 API，配置支持 JSON 序列化，并内置 16×16 中文点阵字形（Cjk16，GB2312 一级字 3755 个），可通过 `GlyphProvider` 接口扩展自定义字体。

## 典型场景

- 电商防搬运、素材预览防盗、图片版权确权
- 内部资料泄密溯源：按接收者分发 seed，出事后用 `trace_dots` 定位泄露来源
- API 图片追踪、直播画面防去重盗播

## 选型速记

| 需求 | 推荐 |
| --- | --- |
| 看得见的震慑 | 可见水印（文本/平铺） |
| 看不见的取证 | LSB |
| 图片要过 JPEG/压缩链 | DCT |
| 要能定位泄露人 | 点阵 + 按接收者分发 seed，`trace_dots` 溯源 |

## 安装

```bash
moon add yuzhiblue/moon-watermark@0.1.18
```

## 快速上手

```moonbit
let img = @lib.RgbaImage::new(320, 240, 0xFFFF_FFFF)

// 组合嵌入：文本（45° 斜向）+ 点阵（seed=接收者 ID）+ LSB（用户 ID）
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
# CLI 体验：嵌入文本 + 点阵 + LSB
moon run cmd/main -- embed in.png out.png --text "LIVE 2026-10-03" --font cjk16 --lsb "UID-001" --key 42

# 只嵌 DCT 域水印（抗 JPEG）
moon run cmd/main -- embed in.jpg out.jpg --dct "UID-001" --delta 48

# 验证
moon run cmd/main -- verify-dots out.png
moon run cmd/main -- verify-dct out.png --delta 48
```

## 核心能力

- **确定性点阵水印**：由 DotConfig（含 seed）完全决定，同 seed 完全可复现 → 可提取、可溯源
- **溯源判定**：`dot_contrast` 多对照组信号（k=8 median）自动扣除原图暗区偏差，误报率可标定至约 0.1%；`trace_dots` 对候选 seed 逐一判定，歧义时返回 -2 不误锁
- **盲检测**：`detect_lsb` / `detect_dct` 不依赖 key 即可回答"是否被标记"
- **不可见性**：LSB 实测 PSNR 76.98dB、DCT 50.9dB，均 >40dB 肉眼不可察
- **鲁棒性**：DCT 水印经 JPEG q60 重压后仍可提取；点阵水印支持缩放后提取

## 设计边界（诚实声明）

- 不提供强加密/防伪认证——知道算法者可提取或覆盖水印，需鉴权场景由上层管理嵌入参数
- 不可见水印不抗几何攻击（裁剪/旋转/缩放），此类场景建议走 DCT/LSB 通道
- 载体格式支持 PNG / JPEG

## 链接

- GitHub 仓库：https://github.com/yuzhiblue/moon-watermark
- mooncakes 包页：https://mooncakes.io/package/yuzhiblue/moon-watermark
- 在线 API 文档：https://mooncakes.io/docs/yuzhiblue/moon-watermark@0.1.18

## 开源协议

主体代码 Apache-2.0；Cjk16 字形数据派生自 Noto Sans CJK（SIL OFL 1.1）。
