# yuzhiblue 个人网站

基于 [Astro](https://astro.build) 构建的个人作品集与博客站点，属于独立开发者 **yuzhiblue**，用于展示独立开发的产品、工具与开源项目，并记录技术笔记与产品思考。

- 线上地址：<https://dev.7tec.cn>
- 作者：yuzhiblue（GitHub [@yuzhiblue](https://github.com/yuzhiblue)）

## 技术栈

- **Astro** `^7.2.4` —— 静态站点生成框架
- **@astrojs/mdx** `^7.0.7` —— 支持以 MDX 编写内容
- **@astrojs/sitemap** `^3.7.3` —— 自动生成站点地图
- 内容以 Markdown 编写，配合 Astro Content Collections 进行类型校验
- 代码高亮使用 Shiki（`github-dark` 主题）
- 纯 CSS（作用域内联），无额外 UI 框架，深色主题

## 项目结构

```text
/
├── public/                 # 静态资源（图片、favicon 等）
│   ├── images/             # 文章与项目配图
│   ├── projects/           # 项目封面等
│   └── favicon.svg
├── scripts/
│   └── migrate_7tec.py     # 一次性迁移脚本：从 7tec.cn 抓取文章转为本项目的 Markdown
├── src/
│   ├── content/            # 内容集合（Markdown 源文件）
│   │   ├── blog/           # 博客文章（约 650 篇，由迁移脚本生成）
│   │   └── projects/       # 项目介绍（手动维护）
│   ├── layouts/
│   │   └── BaseLayout.astro  # 全局布局（导航、页脚、主题样式）
│   ├── pages/              # 路由页面
│   │   ├── index.astro       # 首页（作品、最新文章、关注入口）
│   │   ├── about.astro       # 关于页
│   │   ├── blog/
│   │   │   ├── index.astro     # 文章列表
│   │   │   └── [...slug].astro # 文章详情
│   │   └── projects/
│   │       ├── index.astro     # 项目列表
│   │       └── [...slug].astro # 项目详情
│   └── content.config.ts   # 内容集合 schema 定义
├── astro.config.mjs        # Astro 配置（集成、站点、构建选项）
└── package.json
```

## 内容组织

内容通过 `src/content.config.ts` 中定义的两个集合进行约束：

- **`blog`**：博客文章，字段含 `title`、`description`、`pubDate`、`updatedDate`、`tags`、`coverImage`、`draft`。
- **`projects`**：项目介绍，字段含 `title`、`description`、`pubDate`、`updatedDate`、`tags`、`featured`、`coverImage`，以及链接字段 `github`、`website`、`demo`、`download`、`purchase`。

`draft: true` 的文章/项目不会被发布到线上。列表页会优先展示 `featured: true` 的项目。

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

- `astro.config.mjs` 中 `site` 设为 `https://dev.7tec.cn`，并使用 `base: './'` 的相对路径，使构建产物在 `file://` 直接打开时也能正确加载资源。
- 构建脚本通过 `inlineStylesheets: 'always'` 将样式内联进 HTML，便于静态托管。
- 部署时直接发布 `npm run build` 生成的 `./dist/` 目录即可。

## 博客迁移脚本

`scripts/migrate_7tec.py` 是一个**一次性**迁移工具，用于把原站点 <https://7tec.cn> 的 `/detail/{id}` 文章抓取并转换为本项目的 Markdown 文章，写入 `src/content/blog/`，图片下载至 `public/images/blog/`。

```sh
source .venv-migrate/bin/activate
python scripts/migrate_7tec.py                 # 抓取 1–650
python scripts/migrate_7tec.py --start 1 --end 20   # 小范围测试
```

依赖：`requests`、`beautifulsoup4`、`html2text`、`pypinyin`（标题转拼音 slug）。

## 了解更多

- Astro 文档：<https://docs.astro.build>
- 在首页「关注我」板块可找到作者的 GitHub、X、公众号等联系方式。
