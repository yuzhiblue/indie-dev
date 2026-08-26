---
title: "如何使用asyncio和aiohttp实现大批量pdf文件的爬取任务？并控制并发量为200"
description: "使用 asyncio 和 aiohttp 实现大批量 PDF 文件的爬取任务，并控制并发量为 200，可以通过以下步骤实现： 1\\. 实现思路 异步爬取 ：使用 aiohttp 发起异步 HTTP 请求，下载 PDF 文件。 并发控制 ：使"
pubDate: 2025-01-20
tags: ['技术']
draft: false
---
使用 **`asyncio`** 和 **`aiohttp`** 实现大批量 PDF 文件的爬取任务，并控制并发量为 200，可以通过以下步骤实现：

* * *

### 1\. **实现思路**

  * **异步爬取** ：使用 `aiohttp` 发起异步 HTTP 请求，下载 PDF 文件。
  * **并发控制** ：使用 `asyncio.Semaphore` 控制并发量，确保同时运行的下载任务不超过 200 个。
  * **任务管理** ：将下载任务添加到任务列表中，并使用 `asyncio.gather` 等待所有任务完成。

* * *

### 2\. **实现代码**

以下是一个完整的示例代码：



```python
import asyncio
import aiohttp
import os

# 设置并发量为 200
CONCURRENCY = 200
semaphore = asyncio.Semaphore(CONCURRENCY)

# 下载目录
DOWNLOAD_DIR = "pdf_downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

async def download_pdf(session, url):
    async with semaphore:  # 控制并发量
        try:
            print(f"开始下载: {url}")
            async with session.get(url) as response:
                if response.status == 200:
                    # 提取文件名
                    file_name = os.path.basename(url)
                    file_path = os.path.join(DOWNLOAD_DIR, file_name)

                    # 保存文件
                    with open(file_path, "wb") as f:
                        while True:
                            chunk = await response.content.read(1024)  # 分块读取
                            if not chunk:
                                break
                            f.write(chunk)
                    print(f"下载完成: {url} -> {file_path}")
                else:
                    print(f"下载失败: {url} (状态码: {response.status})")
        except Exception as e:
            print(f"下载出错: {url} ({str(e)})")

async def main(urls):
    # 创建 aiohttp 会话
    async with aiohttp.ClientSession() as session:
        # 创建下载任务
        tasks = [download_pdf(session, url) for url in urls]
        # 等待所有任务完成
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    # 示例 PDF 文件 URL 列表
    urls = [
        f"https://example.com/pdf/file{i}.pdf" for i in range(1000)
    ]

    # 运行主函数
    asyncio.run(main(urls))
```


* * *

### 3\. **代码说明**

#### （1）**并发控制**

  * `semaphore = asyncio.Semaphore(CONCURRENCY)`：创建一个信号量，限制并发量为 200。
  * `async with semaphore`：在 `download_pdf` 函数中使用信号量，确保同时运行的下载任务不超过 200 个。

#### （2）**异步下载**

  * `aiohttp.ClientSession`：创建一个异步 HTTP 会话，用于发起请求。
  * `response.content.read(1024)`：分块读取文件内容，避免一次性加载大文件到内存。

#### （3）**文件保存**

  * `os.path.basename(url)`：从 URL 中提取文件名。
  * `os.path.join(DOWNLOAD_DIR, file_name)`：将文件保存到指定目录。

#### （4）**任务管理**

  * `tasks = [download_pdf(session, url) for url in urls]`：创建下载任务列表。
  * `await asyncio.gather(*tasks)`：并发运行所有任务，并等待它们完成。

* * *

### 4\. **优化建议**

#### （1）**动态调整并发量**

可以根据网络带宽和目标服务器的响应时间动态调整并发量。例如：



```python
async def adjust_concurrency(new_concurrency):
    global semaphore
    while semaphore._value < new_concurrency:
        semaphore.release()  # 增加并发量
    while semaphore._value > new_concurrency:
        await semaphore.acquire()  # 减少并发量
```


#### （2）**错误重试**

为下载任务添加重试机制，避免因网络波动导致任务失败：



```python
import random

async def download_pdf(session, url, retries=3):
    async with semaphore:
        for attempt in range(retries):
            try:
                print(f"开始下载: {url} (尝试 {attempt + 1}/{retries})")
                async with session.get(url) as response:
                    if response.status == 200:
                        file_name = os.path.basename(url)
                        file_path = os.path.join(DOWNLOAD_DIR, file_name)
                        with open(file_path, "wb") as f:
                            while True:
                                chunk = await response.content.read(1024)
                                if not chunk:
                                    break
                                f.write(chunk)
                        print(f"下载完成: {url} -> {file_path}")
                        return
                    else:
                        print(f"下载失败: {url} (状态码: {response.status})")
            except Exception as e:
                print(f"下载出错: {url} ({str(e)})")
            await asyncio.sleep(random.uniform(1, 3))  # 随机等待一段时间后重试
        print(f"下载失败: {url} (重试次数用尽)")
```


#### （3）**日志记录**

将下载日志保存到文件中，便于后续分析：



```python
import logging

logging.basicConfig(
    filename="download.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

async def download_pdf(session, url):
    async with semaphore:
        try:
            logging.info(f"开始下载: {url}")
            async with session.get(url) as response:
                if response.status == 200:
                    file_name = os.path.basename(url)
                    file_path = os.path.join(DOWNLOAD_DIR, file_name)
                    with open(file_path, "wb") as f:
                        while True:
                            chunk = await response.content.read(1024)
                            if not chunk:
                                break
                            f.write(chunk)
                    logging.info(f"下载完成: {url} -> {file_path}")
                else:
                    logging.error(f"下载失败: {url} (状态码: {response.status})")
        except Exception as e:
            logging.error(f"下载出错: {url} ({str(e)})")
```


* * *

### 5\. **总结**

  * 使用 `asyncio` 和 `aiohttp` 可以实现高效的异步爬取任务。
  * 通过 `asyncio.Semaphore` 控制并发量，确保同时运行的下载任务不超过 200 个。
  * 通过分块读取文件、动态调整并发量、错误重试和日志记录，可以进一步优化下载任务的性能和可靠性。
