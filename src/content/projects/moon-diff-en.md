---
title: 'MoonDiff — Text Diff & Patch Library for MoonBit'
description: 'A pure MoonBit text diff/patch library: five algorithms (LCS, Myers, Patience, Histogram, Hirschberg), unified patch application, 3-way merge, semantic JSON diff (RFC 6902) and multi-file tree diff — zero dependencies.'
pubDate: 2026-10-27
updatedDate: 2026-10-27
tags: ['MoonBit', 'Open Source', 'Diff', 'Algorithms', 'Library']
featured: false
github: 'https://github.com/yuzhiblue/moon-diff'
lang: 'en'
i18nKey: 'moon-diff'
draft: false
---

## Overview

MoonDiff is a text diff & patch library written in MoonBit, created for the MoonBit Ecosystem Open Source Competition (MGPIC 2026).

**Zero dependencies**, fully generic — any type satisfying `Eq` can be compared directly. From the classic LCS to Myers' minimal edit script, from unified patch replay to 3-way merge, and on to RFC 6902 JSON Patch and multi-file tree diff, it's all in one package.

## Installation

```bash
moon add yuzhiblue/moon-diff@0.2.2
```

```moonbit
import yuzhiblue/moon-diff/diff
```

## Features

- **5 diff algorithms**: classic LCS, Myers O(ND), Patience diff, Histogram diff, and linear-space Hirschberg (only O(n+m) memory)
- **Unified diff**: `to_unified` produces GNU `diff -u` style output compatible with the standard patch tool; `to_unified_stat` produces `git diff --stat` style summaries
- **Patch application**: exact apply, fuzzy apply (with offset/fuzz tolerance), reverse apply (like `patch -R`), and +/- flipping
- **Git-style**: `git_diff_text`, Git blob SHA-1 hashing, binary diff — with a self-implemented SHA-1
- **3-way merge**: diff3-style conflict markers, with `ours` / `theirs` resolution strategies
- **Semantic JSON diff**: emits RFC 6902 JSON Patch (key-order independent), with patch application
- **Multi-file tree diff**: directory-level diff and patch application with rename detection
- **Inline highlighting**: `word_diff_html` produces `<del>/<ins>` inline comparisons; Unicode-aware tokenization compares CJK text character by character
- **Similarity ratio**: `ratio(a, b)` returns a [0,1] similarity score, similar to Python's `difflib.ratio`

## Quick Start

```moonbit
let a = ["apple", "banana", "cherry"]
let b = ["apple", "blueberry", "cherry"]

let changes = diff(a, b)
// [Equal("apple"), Delete("banana"), Insert("blueberry"), Equal("cherry")]

// unified diff rendering + patch replay
let patch = to_unified(diff_lines(old_text, new_text), "old.txt", "new.txt", 3)
let result = apply_unified(old_text, patch)  // result == new_text
```

A CLI is included so you can try every capability — diff, patch, merge, json, ratio and more:

```bash
moon run cli -- diff "line1\nline2" "line1\nLINE2" --stat
moon run cli -- merge "base" "ours" "theirs" --ours
moon run cli -- ratio "我爱北京" "我爱南京"
```

## Links

- GitHub repository: https://github.com/yuzhiblue/moon-diff
- mooncakes package page: https://mooncakes.io/package/yuzhiblue/moon-diff
- Online API docs: https://mooncakes.io/docs/yuzhiblue/moon-diff@0.2.2

## License

Apache-2.0
