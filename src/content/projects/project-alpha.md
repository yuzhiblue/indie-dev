---
title: 'Project Alpha'
description: '一个极简的本地笔记应用，支持 Markdown 和实时预览。'
pubDate: 2024-09-01
tags: ['React', 'Electron', 'Markdown']
featured: true
github: 'https://github.com/yuzhiblue/project-alpha'
website: 'https://project-alpha.yuzhiblue.dev'
draft: false
---

## 项目简介

Project Alpha 是一个极简的本地笔记应用，专注于「写作即预览」的流畅体验。
没有复杂的菜单，打开就能写，所见即所得。

## 核心特性

- **实时预览**：左侧编辑、右侧渲染，零延迟同步
- **本地优先**：所有笔记以纯 Markdown 文件存储在本地，数据完全自主
- **双向链接**：支持 `[[笔记名]]` 语法建立知识网络
- **主题切换**：内置暗色 / 亮色两套主题

## 技术栈

| 层级 | 选型 |
| --- | --- |
| 界面 | React + TypeScript |
| 桌面壳 | Electron |
| 编辑器 | CodeMirror 6 |
| 存储 | 文件系统 + 增量索引 |

## 截图

> 此处可放置应用截图，将图片放入 `public/` 后使用 `![截图](/your-image.png)` 引用。

## 未来规划

- [ ] 端到端加密同步
- [ ] 插件系统
- [ ] 移动端适配
