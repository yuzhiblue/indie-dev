---
title: 'DevTool CLI'
description: '命令行工具，帮助独立开发者快速搭建项目脚手架。'
pubDate: 2024-11-12
tags: ['Node.js', 'CLI', 'Tooling']
featured: true
coverImage: '/projects/devtool-cli/screenshot.png'
github: 'https://github.com/yuzhiblue/devtool-cli'
draft: false
---

## 项目简介

DevTool CLI 是一个零配置的命令行脚手架工具，一条命令即可生成带有最佳实践预设的项目骨架，
支持前端、后端、全栈等多种模板。

## 核心特性

- **模板市场**：内置 10+ 社区维护模板，也可自定义私有模板
- **交互式创建**：`devtool new` 引导式问答，自动写入合理的默认值
- **可组合**：每个功能以插件形式存在，按需安装，避免臃肿
- **跨平台**：Windows / macOS / Linux 一致体验

## 界面预览

![DevTool CLI 界面截图](/projects/devtool-cli/screenshot.png)

## 快速开始

```sh
npm install -g @yuzhiblue/devtool
devtool new my-app
cd my-app && npm run dev
```

## 技术栈

- Node.js + TypeScript
- commander（参数解析）
- prompts（交互式输入）
- ejs（模板渲染）

## 路线图

- [ ] 模板版本管理与回滚
- [ ] 团队共享模板仓库
