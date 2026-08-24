---
title: 'Pixel UI'
description: '一套轻量级 CSS 组件库，专为管理后台设计。'
pubDate: 2025-02-20
tags: ['CSS', 'Components', 'Design System']
featured: false
github: 'https://github.com/yourname/pixel-ui'
website: 'https://pixel-ui.yourname.dev'
draft: false
---

## 项目简介

Pixel UI 是一套**零运行时**的 CSS 组件库，所有组件仅由原生 CSS 变量驱动，
不捆绑任何 JavaScript 框架，专为管理后台与内部工具设计。

## 设计原则

1. **可主题化**：所有颜色、圆角、间距均为 CSS 变量，改一处全局生效
2. **无障碍优先**：组件默认符合 WCAG 2.1，含焦点态与 ARIA 标注
3. **体积tiny**：完整引入 gzip 后小于 12KB

## 组件清单

- 按钮 / 表单 / 开关
- 表格 / 分页 / 树形
- 弹窗 / 抽屉 / 提示

## 技术栈

- 纯 CSS（含 `@layer` 分层）
- 设计令牌（Design Tokens）驱动
- 文档站基于 Astro 构建

## 适合谁

如果你在做内部后台、SaaS 控制台，又不想引入几十 KB 的组件框架，Pixel UI 是合适的选择。
