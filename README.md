# yuzhiblue 个人网站

基于 [Astro](https://astro.build) 构建的个人作品集与博客站点，属于独立开发者 **yuzhiblue**，用于展示独立开发的产品、工具与开源项目，并记录技术笔记与产品思考。

- 线上地址：<https://7tec.cn>
- 作者：yuzhiblue（GitHub [@yuzhiblue](https://github.com/yuzhiblue)）

## 技术栈

- **Astro** `^7.2.4` —— 静态站点生成框架
- **@astrojs/mdx** `^7.0.7` —— 支持以 MDX 编写内容
- **@astrojs/sitemap** `^3.7.3` —— 自动生成站点地图
- 内容以 Markdown 编写，配合 Astro Content Collections 进行类型校验
- 代码高亮使用 Shiki（`github-dark` 主题）
- 纯 CSS（组件样式作用域隔离），无额外 UI 框架，深色主题；全局设计令牌见 `src/styles/tokens.css`

## 项目结构

```text
/
├── public/                 # 静态资源
│   ├── favicon.svg
│   ├── images/blog/        # 博客文章配图
│   └── projects/           # 项目封面（doutimer / obstimer / wxtimer 等子目录）
├── scripts/                # 内容治理与迁移脚本（见「内容治理脚本」一节）
│   ├── migrate_7tec.py      # 一次性迁移：从 7tec.cn 抓取文章转 Markdown
│   ├── classify-blog.mjs    # 按主题加权打分，下线非技术文章（写 draft: true）
│   ├── apply-tags.mjs       # 重写文章的 tags 为按主题标签
│   ├── apply-slugs.mjs      # 写入语义化 slug 并生成 redirects.mjs（旧链接 301）
│   └── fix_image_links.py   # 一次性修复：图片链接改回本地相对路径
├── src/
│   ├── components/         # 可复用组件
│   │   ├── ProjectCard.astro
│   │   ├── PostCard.astro
│   │   └── Pagination.astro
│   ├── content/            # 内容集合（Markdown 源文件）
│   │   ├── blog/           # 博客文章（283 篇，由迁移脚本生成）
│   │   └── projects/       # 项目介绍（手动维护，含多语言 -<lang> 文件）
│   ├── data/
│   │   └── redirects.mjs   # 旧博客 slug → 新 slug 的 301 重定向（apply-slugs.mjs 生成）
│   ├── layouts/
│   │   └── BaseLayout.astro  # 全局布局（导航、页脚、主题样式）
│   ├── lib/
│   │   └── projects-i18n.ts  # 项目多语言工具（去重、切换条、字典）
│   ├── pages/              # 路由页面
│   │   ├── index.astro       # 首页（作品、最新文章、关注入口）
│   │   ├── about.astro       # 关于页
│   │   ├── blog/
│   │   │   ├── index.astro     # 文章列表
│   │   │   ├── [slug].astro     # 文章详情
│   │   │   ├── page/[page].astro# 文章分页
│   │   │   └── tag/[tag].astro  # 标签页
│   │   └── projects/
│   │       ├── index.astro     # 项目列表
│   │       ├── [slug].astro     # 项目详情
│   │       └── page/[page].astro# 项目分页
│   ├── styles/
│   │   └── tokens.css       # 全局设计令牌（颜色、间距、圆角）
│   └── content.config.ts   # 内容集合 schema 定义
├── astro.config.mjs        # Astro 配置（集成、站点、构建选项、重定向）
└── package.json
```

## 内容组织

内容通过 `src/content.config.ts` 中定义的两个集合进行约束：

- **`blog`**：博客文章，字段含 `title`、`description`、`pubDate`、`updatedDate`、`tags`、`coverImage`、`slug`（可选，语义化链接）、`draft`。
- **`projects`**：项目介绍，字段含 `title`、`description`、`pubDate`、`updatedDate`、`tags`、`featured`、`coverImage`，链接字段 `github`、`website`、`demo`、`download`、`purchase`，以及多语言字段 `lang`、`i18nKey`（详见「给项目添加多语言版本」一节）。

`draft: true` 的文章/项目不会被发布到线上。列表页会优先展示 `featured: true` 的项目。

## 给项目添加多语言版本

站点采用「**按项目独立多语言文件**」方案：每个语言一个独立 Markdown，生成独立 URL，可被搜索引擎分别收录（类似 GitHub 的多语言 README）。仅个别项目需要多语言时，无需整站 `/en/` 子路径 i18n 重构。

### 原理

- 同一项目的不同语言是 `src/content/projects/` 下**独立的 Markdown 文件**，通过文件名 `-<lang>` 后缀或显式 `i18nKey` 字段关联成一组。
- 详情页 `src/pages/projects/[slug].astro` 按分组自动渲染顶部「语言切换条」，并在 `<head>` 输出 `canonical` + `hreflang` + `x-default`，帮助搜索引擎正确处理重复内容、避免惩罚。
- 首页 / 项目列表 / 分页 / 关于页通过 `dedupeProjects()` 去重，每个项目只展示主语言（`zh`）一张卡片，不会出现「中 / 英各一张」。

### 步骤

1. **新建语言文件**：复制 `obstimer.md` 为 `obstimer-en.md`（约定：主语言不带后缀，其余加 `-<lang>`）。
2. **设置两个关键 frontmatter 字段**：
   - `lang`：语言代码，如 `zh` / `en` / `ja`。决定 `<html lang>`、按钮文案、切换条标签。
   - `i18nKey`：跨语言统一分组键，如 `obstimer`。同一项目所有语言文件填**相同值**，用于关联成一组并生成切换条。*若省略，则自动取文件名去掉尾部 `-xx` 后缀*（如 `obstimer-en` → `obstimer`）。
3. **翻译内容并填写专属链接**：翻译 `title` / `description` / 正文，并在 `download` / `purchase` / `website` / `github` / `demo` 填写**该语言专属**的下载 / 购买地址（不同语言可指向不同链接）。
4. **重新构建**：`npm run build`。

### 按钮文案自动切换

详情页右侧的「在线演示 / 立即购买 / 下载 / 访问官网 / GitHub 源码」按钮文案由 `[slug].astro` 中的 `LANG_ACTIONS` 字典按 `lang` 自动切换，无需在每个文件里写。新增语言时，在 `LANG_ACTIONS` 与 `LANG_CHROME`（返回链接、更新于、日期格式）各补一条即可。

### 支持的语言

内置 `zh` / `en` / `ja` / `ko` / `fr` / `de` / `es` / `ru`（见 `src/lib/projects-i18n.ts` 的 `LANG_META`）。要支持其他语言，在该字典追加一条 `{ code: '<BCP47>', label: '<切换条显示名>' }`。

### 示例：obstimer 英文版 frontmatter

```yaml
---
title: 'OBS Timer (OBStimer)'
description: 'A scheduled scripting plugin for OBS Studio ...'
pubDate: 2025-07-27
updatedDate: 2025-07-27
tags: ['OBS', 'Automation', 'Live streaming', 'Script']
featured: true
coverImage: '/projects/obstimer/cover.png'
download: 'https://wwsm.lanzouo.com/incxS30yw58d'             # 可填英文专属下载地址
purchase: 'https://e.tb.cn/h.hn7C4xIY8KYN4jH?tk=svvs4UuuEB0'  # 可填英文专属购买地址
lang: 'en'
i18nKey: 'obstimer'
draft: false
---
```

> 关键：每个语言是**独立 URL**（如 `/projects/obstimer` 与 `/projects/obstimer-en`），因此才能被搜索引擎分别收录；仅在单页内切换文案不会被收录。

## 常用命令

所有命令在项目根目录的终端中运行：

| 命令                | 说明                                          |
| :------------------ | :-------------------------------------------- |
| `npm install`       | 安装依赖                                      |
| `npm run dev`       | 启动本地开发服务器（`localhost:4321`）        |
| `npm run build`     | 构建生产站点到 `./dist/`                      |
| `npm run preview`   | 本地预览构建产物                              |
| `npm run astro ...` | 运行 Astro CLI，如 `astro add`、`astro check` |

> 环境要求：Node.js `>=22.12.0`。

## 部署说明

- `astro.config.mjs` 中 `site` 设为 `https://7tec.cn`，并使用 `base: './'` 的相对路径，使构建产物在 `file://` 直接打开时也能正确加载资源。
- 构建脚本通过 `inlineStylesheets: 'always'` 将样式内联进 HTML，便于静态托管。
- 部署时直接发布 `npm run build` 生成的 `./dist/` 目录即可。

## 内容治理脚本

站点内容由一批可重复运行的 Node / Python 脚本维护（位于 `scripts/`）。

### 迁移（一次性）

`scripts/migrate_7tec.py` 把原站点 <https://7tec.cn> 的 `/detail/{id}` 文章抓取并转换为本项目的 Markdown 文章，写入 `src/content/blog/`，图片下载至 `public/images/blog/`。

```sh
source .venv-migrate/bin/activate
python scripts/migrate_7tec.py                 # 抓取 1–650
python scripts/migrate_7tec.py --start 1 --end 20   # 小范围测试
```

依赖：`requests`、`beautifulsoup4`、`html2text`、`pypinyin`（标题转拼音 slug）。

### 治理（可重复）

- `scripts/classify-blog.mjs`：按「技术词 vs 无关词」加权打分，下线非技术文章（写入 `draft: true`）。
  ```sh
  node scripts/classify-blog.mjs            # 预演，只出报告
  node scripts/classify-blog.mjs --apply    # 写入 draft: true
  node scripts/classify-blog.mjs --apply --review  # 含「存疑」一并下线
  ```
- `scripts/apply-tags.mjs`：把文章 `tags` 重写为按主题的可导航标签。
  ```sh
  node scripts/apply-tags.mjs            # 预演，打印标签分布
  node scripts/apply-tags.mjs --apply    # 落盘
  ```
- `scripts/apply-slugs.mjs`：为保留文章写入语义化英文 slug，并生成 `src/data/redirects.mjs`（旧 id → 新 slug 的 301 重定向），保证已被收录的旧链接不 404。
  ```sh
  node scripts/apply-slugs.mjs            # 预演，只打印
  node scripts/apply-slugs.mjs --apply    # 落盘（同时更新 redirects.mjs）
  ```
- `scripts/fix_image_links.py`：一次性修复，把博客正文中仍指向 `https://7tec.cn/images/blog/...` 的图片链接改写为本地相对路径（仅当本地文件存在时才改，幂等）。
  ```sh
  python scripts/fix_image_links.py            # 执行改写
  python scripts/fix_image_links.py --dry-run  # 只报告，不写文件
  ```

## 了解更多

- Astro 文档：<https://docs.astro.build>
- 在首页「关注我」板块可找到作者的 GitHub、X、公众号等联系方式。
