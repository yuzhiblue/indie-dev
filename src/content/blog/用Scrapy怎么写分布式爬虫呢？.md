---
title: "用Scrapy怎么写分布式爬虫呢？"
description: "使用 Scrapy 实现分布式爬虫时，通常需要结合 Scrapy 的爬虫框架和分布式任务队列（如 Redis ）来实现主节点和工作节点的通信。以下是具体实现步骤和代码示例。 1\\. 系统架构 主节点 ：负责生成初始任务（URL）并放入任务队"
pubDate: 2025-01-20
tags: ['爬虫', 'Python', '数据库']
draft: true
slug: scrapy-distributed-crawler-guide
---
使用 **Scrapy** 实现分布式爬虫时，通常需要结合 **Scrapy** 的爬虫框架和分布式任务队列（如 **Redis** ）来实现主节点和工作节点的通信。以下是具体实现步骤和代码示例。

* * *

### 1\. **系统架构**

  * **主节点** ：负责生成初始任务（URL）并放入任务队列（如Redis）。
  * **工作节点** ：运行Scrapy爬虫，从任务队列中获取URL并执行爬取任务。
  * **任务队列** ：使用Redis作为任务队列，存储待爬取的URL。
  * **去重机制** ：使用Redis的集合（Set）或布隆过滤器（Bloom Filter）实现URL去重。

* * *

### 2\. **实现步骤**

  1. **安装依赖** ：
  2. 安装Scrapy和Scrapy-Redis： `bash pip install scrapy scrapy-redis`
  3. 安装Redis并启动Redis服务： `bash sudo apt install redis-server redis-server`

  4. **配置Scrapy项目** ：

  5. 创建一个Scrapy项目： `bash scrapy startproject pdf_crawler cd pdf_crawler`
  6. 配置Scrapy-Redis： 修改 `settings.py`，添加以下配置： `python # 使用Scrapy-Redis调度器 SCHEDULER = "scrapy_redis.scheduler.Scheduler" # 使用Redis作为去重过滤器 DUPEFILTER_CLASS = "scrapy_redis.dupefilter.RFPDupeFilter" # 允许暂停和恢复爬取 SCHEDULER_PERSIST = True # Redis连接设置 REDIS_URL = "redis://localhost:6379" # 设置Item Pipeline ITEM_PIPELINES = { 'scrapy_redis.pipelines.RedisPipeline': 300, }`

  7. **编写爬虫** ：

  8. 在 `spiders` 目录下创建一个爬虫文件，例如 `pdf_spider.py`： ```python import scrapy from scrapy_redis.spiders import RedisSpider

class PdfSpider(RedisSpider): name = "pdf_spider" redis_key = "pdf_tasks" # Redis中的任务队列名称



```
 def parse(self, response):
     # 提取PDF链接
     pdf_links = response.css('a[href$=".pdf"]::attr(href)').getall()
     for pdf_link in pdf_links:
         yield {
             'url': response.urljoin(pdf_link),
             'file_name': pdf_link.split('/')[-1]
         }
```


```

  9. **主节点生成任务** ：

  10. 主节点将初始URL放入Redis队列： ```python import redis

# 连接到Redis r = redis.Redis(host='localhost', port=6379, db=0)

# 添加初始URL到任务队列 urls = [ "http://example.com/page1", "http://example.com/page2", "http://example.com/page3" ] for url in urls: r.lpush('pdf_tasks', url) print("Initial URLs added to Redis queue.") ```

  11. **运行工作节点** ：

  12. 在工作节点上运行Scrapy爬虫： `bash scrapy crawl pdf_spider`

  13. **下载PDF文件** ：

  14. 在 `pipelines.py` 中编写一个Pipeline来处理下载逻辑： ```python import requests import os

class PdfDownloadPipeline: def process_item(self, item, spider): url = item['url'] file_name = item['file_name'] save_path = os.path.join('downloads', file_name)



```
     # 下载PDF文件
     response = requests.get(url)
     with open(save_path, 'wb') as f:
         f.write(response.content)
     print(f"Downloaded {file_name} from {url}")
     return item
```


`- 在 `settings.py` 中启用Pipeline：`python ITEM_PIPELINES = { 'pdf_crawler.pipelines.PdfDownloadPipeline': 300, } ```

* * *

### 3\. **运行流程**

  1. **主节点** ：
  2. 将初始URL推送到Redis队列。
  3. **工作节点** ：
  4. 运行Scrapy爬虫，从Redis队列中获取URL并执行爬取任务。
  5. 提取PDF链接并下载文件。
  6. **Redis** ：
  7. 作为任务队列和去重过滤器，确保任务分发的可靠性和高效性。

* * *

### 4\. **总结**

  * **Scrapy-Redis** ：用于实现分布式爬虫的任务分发和去重。
  * **主节点** ：生成任务并推送到Redis队列。
  * **工作节点** ：运行Scrapy爬虫，从Redis队列中获取任务并执行。
  * **Pipeline** ：处理下载逻辑，将PDF文件保存到本地。

通过这种方式，你可以轻松实现一个分布式的PDF文件爬取系统。
