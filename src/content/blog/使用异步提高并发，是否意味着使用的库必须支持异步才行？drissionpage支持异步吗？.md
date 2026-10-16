---
title: "使用异步提高并发，是否意味着使用的库必须支持异步才行？drissionpage支持异步吗？"
description: "是的，使用异步提高并发的前提是所使用的库必须支持异步 。如果库本身是同步的（如 requests），即使你在异步函数中调用它，也无法实现真正的并发，因为同步操作会阻塞事件循环。 1\\. 异步库的要求 异步 I/O ：库必须基于异步 I/O"
pubDate: 2025-01-20
tags: ['并发编程', '数据库', 'Python']
draft: true
slug: async-library-support-drissionpage
---
是的，**使用异步提高并发的前提是所使用的库必须支持异步** 。如果库本身是同步的（如 `requests`），即使你在异步函数中调用它，也无法实现真正的并发，因为同步操作会阻塞事件循环。

* * *

### 1\. **异步库的要求**

  * **异步 I/O** ：库必须基于异步 I/O 实现（如 `asyncio`、`aiohttp`）。
  * **非阻塞** ：库的操作必须是非阻塞的，能够将控制权交还给事件循环。

#### 常见的异步库：

  * **网络请求** ：`aiohttp`、`httpx`（异步模式）。
  * **数据库** ：`asyncpg`（PostgreSQL）、`aiomysql`（MySQL）。
  * **文件操作** ：`aiofiles`。

* * *

### 2\. **DrissionPage 是否支持异步？**

**DrissionPage** 是一个基于浏览器自动化的 Python 库，主要用于网页操作和数据提取。截至 2023 年 10 月，**DrissionPage 本身是同步的** ，并不原生支持异步操作。

如果你在异步函数中直接调用 DrissionPage 的同步方法，会导致事件循环被阻塞，从而无法实现并发。

* * *

### 3\. **如何在异步环境中使用 DrissionPage？**

虽然 DrissionPage 本身是同步的，但你可以通过以下方法在异步环境中使用它：

#### （1）**使用`run_in_executor` 将同步代码放到线程池中运行**

`asyncio` 提供了 `run_in_executor` 方法，可以将同步代码放到线程池中运行，从而避免阻塞事件循环。

##### 示例代码：



```python
import asyncio
from DrissionPage import ChromiumPage

async def async_fetch(url):
    loop = asyncio.get_event_loop()
    # 将同步代码放到线程池中运行
    result = await loop.run_in_executor(None, sync_fetch, url)
    return result

def sync_fetch(url):
    # 同步代码
    page = ChromiumPage()
    page.get(url)
    content = page.ele('tag:html').html
    page.close()
    return content

async def main(urls):
    tasks = [async_fetch(url) for url in urls]
    results = await asyncio.gather(*tasks)
    return results

urls = ["http://example.com", "http://example.org"]
results = asyncio.run(main(urls))
print(results)
```


##### 代码说明：

  * `loop.run_in_executor`：将同步代码 `sync_fetch` 放到线程池中运行。
  * `sync_fetch`：使用 DrissionPage 进行同步操作。
  * `async_fetch`：将同步操作包装为异步函数。

#### （2）**使用多进程**

如果任务非常繁重，可以使用多进程来并行运行多个 DrissionPage 实例。

##### 示例代码：



```python
from multiprocessing import Pool
from DrissionPage import ChromiumPage

def sync_fetch(url):
    page = ChromiumPage()
    page.get(url)
    content = page.ele('tag:html').html
    page.close()
    return content

def main(urls):
    with Pool(processes=4) as pool:  # 使用 4 个进程
        results = pool.map(sync_fetch, urls)
    return results

urls = ["http://example.com", "http://example.org"]
results = main(urls)
print(results)
```


* * *

### 4\. **总结**

  * **异步编程要求库必须支持异步** ，否则无法实现真正的并发。
  * **DrissionPage 是同步库** ，无法直接在异步环境中使用。
  * **解决方法** ：
  * 使用 `run_in_executor` 将同步代码放到线程池中运行。
  * 使用多进程并行运行多个 DrissionPage 实例。

如果你需要高性能的异步网页操作，可以考虑使用原生支持异步的库（如 `playwright` 或 `pyppeteer`）。
