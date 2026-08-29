---
title: "scrapy 都有哪些命令？"
description: "Scrapy 提供了丰富的命令行工具，用于创建、运行和管理爬虫项目。以下是一些常用的 Scrapy 命令及其用途： 1\\. 全局命令 这些命令可以在任何目录下运行。 命令 | 用途 | scrapy startproject <projec"
pubDate: 2025-01-20
tags: ['开发工具', '爬虫', 'Python']
draft: false
slug: scrapy-commands-cheatsheet
---
Scrapy 提供了丰富的命令行工具，用于创建、运行和管理爬虫项目。以下是一些常用的 Scrapy 命令及其用途：

* * *

### 1\. **全局命令**

这些命令可以在任何目录下运行。

命令 | 用途  
---|---  
`scrapy startproject <project_name>` | 创建一个新的 Scrapy 项目。  
`scrapy genspider <spider_name> <domain>` | 在项目中生成一个新的爬虫。  
`scrapy settings --get <setting>` | 获取指定配置的值。  
`scrapy runspider <spider_file.py>` | 直接运行一个单独的爬虫文件，而不需要创建项目。  
`scrapy fetch <url>` | 使用 Scrapy 下载器下载指定 URL 的内容，并输出到控制台。  
`scrapy view <url>` | 在浏览器中打开指定 URL，并使用 Scrapy 下载器渲染页面。  
`scrapy shell <url>` | 启动 Scrapy 交互式 shell，用于调试和测试提取逻辑。  
`scrapy version` | 显示 Scrapy 的版本信息。  
`scrapy bench` | 运行 Scrapy 的性能测试。  
  
* * *

### 2\. **项目命令**

这些命令需要在 Scrapy 项目目录下运行。

命令 | 用途  
---|---  
`scrapy crawl <spider_name>` | 运行指定的爬虫。  
`scrapy check` | 检查爬虫代码是否存在错误。  
`scrapy list` | 列出项目中所有可用的爬虫。  
`scrapy edit <spider_name>` | 在默认编辑器中打开指定的爬虫文件（需要设置 `EDITOR` 环境变量）。  
`scrapy parse <url> [options]` | 使用指定的爬虫解析 URL，并输出结果。  
`scrapy deploy` | 将项目部署到 Scrapyd 服务器（需要配置 `scrapyd`）。  
  
* * *

### 3\. **常用命令详解**

#### （1）**创建项目**



```bash
scrapy startproject myproject
```


  * 创建一个名为 `myproject` 的 Scrapy 项目。

#### （2）**生成爬虫**



```bash
cd myproject
scrapy genspider myspider example.com
```


  * 在 `myproject` 项目中生成一个名为 `myspider` 的爬虫，爬取域名为 `example.com`。

#### （3）**运行爬虫**



```bash
scrapy crawl myspider
```


  * 运行名为 `myspider` 的爬虫。

#### （4）**启动交互式 Shell**



```bash
scrapy shell https://example.com
```


  * 启动 Scrapy Shell，用于调试和测试提取逻辑。

#### （5）**下载页面**



```bash
scrapy fetch https://example.com
```


  * 下载指定 URL 的内容并输出到控制台。

#### （6）**列出爬虫**



```bash
scrapy list
```


  * 列出项目中所有可用的爬虫。

#### （7）**检查爬虫**



```bash
scrapy check
```


  * 检查爬虫代码是否存在错误。

* * *

### 4\. **高级命令**

#### （1）**部署到 Scrapyd**



```bash
scrapy deploy
```


  * 将项目部署到 Scrapyd 服务器（需要配置 `scrapyd`）。

#### （2）**性能测试**



```bash
scrapy bench
```


  * 运行 Scrapy 的性能测试，检查爬取速度。

* * *

### 5\. **自定义命令**

Scrapy 允许你自定义命令。只需在项目的 `commands` 目录下创建一个 Python 文件，并定义一个 `Command` 类即可。

* * *

### 6\. **总结**

  * Scrapy 提供了丰富的命令行工具，用于创建、运行和管理爬虫项目。
  * 常用的命令包括 `startproject`、`genspider`、`crawl`、`shell` 等。
  * 通过命令行工具，可以快速创建项目、生成爬虫、运行爬虫以及调试代码。

掌握这些命令可以大大提高 Scrapy 的使用效率！
