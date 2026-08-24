---
title: 'Weather Widget'
description: '基于地理位置的动态天气组件，支持多种天气数据源。'
pubDate: 2025-05-08
tags: ['Vue', 'API', 'Weather']
featured: false
coverImage: '/projects/weather-widget/screenshot.png'
github: 'https://github.com/yuzhiblue/weather-widget'
draft: false
---

## 项目简介

Weather Widget 是一个可嵌入任意网页的天气组件，自动根据访问者地理位置展示
实时天气与未来 7 天预报，支持多家天气数据源无缝切换。

## 核心特性

- **自动定位**：基于浏览器 Geolocation，也支持手动搜索城市
- **多数据源**：Open-Meteo / OpenWeatherMap 可插拔切换
- **自适应外观**：随背景明暗自动调整配色，融入宿主页面
- **轻量**：约 8KB，无第三方 UI 依赖

## 界面预览

![Weather Widget 截图](/projects/weather-widget/screenshot.png)

## 使用示例

```vue
<WeatherWidget source="open-meteo" :show-forecast="true" />
```

## 技术栈

- Vue 3（Composition API）
- 地理定位 API
- SVG 天气图标（内联，无额外请求）

## 计划

- [ ] 极端天气预警推送
- [ ] 历史天气曲线
