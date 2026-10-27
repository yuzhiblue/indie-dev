---
title: 'MoonDiff — MoonBit 文本 diff & patch 库'
description: '纯 MoonBit 实现的文本 diff/patch 库：LCS、Myers、Patience、Histogram、Hirschberg 五种算法，unified patch 应用、3-way merge、语义化 JSON diff、多文件树 diff，零依赖。'
pubDate: 2026-10-27
updatedDate: 2026-10-27
tags: ['MoonBit', '开源', 'Diff', '算法', '库']
featured: false
github: 'https://github.com/yuzhiblue/moon-diff'
lang: 'zh'
applicationCategory: 'DeveloperApplication'
operatingSystem: 'Cross-platform'
i18nKey: 'moon-diff'
draft: false
---

## 简介

MoonDiff 是一个用 MoonBit 编写的文本 diff & patch 库，为 MoonBit 国产基础软件生态开源大赛（MGPIC 2026）而写。

**零依赖**、泛型设计，任何满足 `Eq` 的类型都可以直接比较。从经典的 LCS 到 Myers 最小编辑脚本，从 unified patch 回放到 3-way merge，再到 RFC 6902 JSON Patch 和多文件树 diff，一站配齐。

## 安装

```bash
moon add yuzhiblue/moon-diff@0.2.2
```

```moonbit
import yuzhiblue/moon-diff/diff
```

## 功能特性

- **5 种 diff 算法**：经典 LCS、Myers O(ND)、Patience diff、Histogram diff、线性空间 Hirschberg（仅 O(n+m) 内存）
- **Unified diff**：`to_unified` 输出 GNU `diff -u` 风格，兼容标准 patch 工具；`to_unified_stat` 输出 `git diff --stat` 风格摘要
- **Patch 应用**：精确应用、fuzz 容错应用、反向应用（`patch -R`）、翻转 +/-
- **Git 风格**：`git_diff_text`、Git blob SHA-1、二进制 diff，附自实现 SHA-1
- **3-way merge**：diff3 风格冲突标记，支持 `ours` / `theirs` 解析策略
- **语义化 JSON diff**：输出 RFC 6902 JSON Patch（对象顺序无关），支持 patch 应用
- **多文件树 diff**：支持重命名检测的目录级 diff 与 patch 应用
- **行内高亮**：`word_diff_html` 生成 `<del>/<ins>` 行内对比；Unicode 感知分词，中日韩文本逐字符比较
- **相似度比率**：`ratio(a, b)` 返回 [0,1] 相似度，类似 Python `difflib.ratio`

## 快速上手

```moonbit
let a = ["apple", "banana", "cherry"]
let b = ["apple", "blueberry", "cherry"]

let changes = diff(a, b)
// [Equal("apple"), Delete("banana"), Insert("blueberry"), Equal("cherry")]

// unified diff 渲染 + patch 回放
let patch = to_unified(diff_lines(old_text, new_text), "old.txt", "new.txt", 3)
let result = apply_unified(old_text, patch)  // result == new_text
```

自带 CLI，可直接体验 diff / patch / merge / json / ratio 等全部能力：

```bash
moon run cli -- diff "line1\nline2" "line1\nLINE2" --stat
moon run cli -- merge "base" "ours" "theirs" --ours
moon run cli -- ratio "我爱北京" "我爱南京"
```

## 链接

- GitHub 仓库：https://github.com/yuzhiblue/moon-diff
- mooncakes 包页：https://mooncakes.io/package/yuzhiblue/moon-diff
- 在线 API 文档：https://mooncakes.io/docs/yuzhiblue/moon-diff@0.2.2

## 开源协议

Apache-2.0
