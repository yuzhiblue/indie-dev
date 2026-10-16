---
title: "如果1个网站每秒请求数限制为100，那么我爬虫的并发量多少合适？"
description: "如果目标网站的请求速率限制为 每秒 100 次请求（100 RPS） ，那么你需要根据这个限制来合理设置爬虫的并发量。以下是具体的分析和建议： 1\\. 理解请求速率限制 100 RPS ：表示目标网站允许每秒最多处理 100 个请求。 限制"
pubDate: 2025-01-20
tags: ['并发编程', 'Python']
draft: true
slug: crawler-concurrency-for-100-rps-limit
---
如果目标网站的请求速率限制为 **每秒 100 次请求（100 RPS）** ，那么你需要根据这个限制来合理设置爬虫的并发量。以下是具体的分析和建议：

* * *

### 1\. **理解请求速率限制**

  * **100 RPS** ：表示目标网站允许每秒最多处理 100 个请求。
  * **限制范围** ：通常是对单个 IP 地址的限制。如果你使用多个 IP（如代理池），可以绕过这个限制。

* * *

### 2\. **设置并发量的原则**

  * **不超过限制** ：并发量应尽量接近但不超过 100 RPS，避免触发速率限制。
  * **留有余地** ：为了应对网络波动和目标服务器的响应时间变化，建议将并发量设置为限制值的 80%-90%。
  * **动态调整** ：根据目标服务器的响应状态（如 429 状态码）动态调整并发量。

* * *

### 3\. **并发量的计算**

  * **理论并发量** ：100 RPS。
  * **建议并发量** ：80-90 RPS（即 80-90 个并发任务）。

* * *

### 4\. **实现方法**

#### （1）**使用`asyncio.Semaphore` 控制并发量**

通过信号量限制同时运行的异步任务数量。

##### 示例代码：



```python
import asyncio
import aiohttp

# 设置并发量为 90
CONCURRENCY = 90
semaphore = asyncio.Semaphore(CONCURRENCY)

async def fetch(session, url):
    async with semaphore:  # 控制并发量
        try:
            async with session.get(url) as response:
                if response.status == 200:
                    print(f"请求成功: {url}")
                    return await response.text()
                else:
                    print(f"请求失败: {url} (状态码: {response.status})")
        except Exception as e:
            print(f"请求出错: {url} ({str(e)})")

async def main(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        await asyncio.gather(*tasks)

urls = [f"https://example.com/page{i}" for i in range(1000)]
asyncio.run(main(urls))
```


#### （2）**动态调整并发量**

根据目标服务器的响应状态动态调整并发量。

##### 示例代码：



```python
import asyncio
import aiohttp

# 初始并发量为 90
CONCURRENCY = 90
semaphore = asyncio.Semaphore(CONCURRENCY)

async def fetch(session, url):
    async with semaphore:
        try:
            async with session.get(url) as response:
                if response.status == 200:
                    print(f"请求成功: {url}")
                    return await response.text()
                elif response.status == 429:  # 触发速率限制
                    print(f"触发速率限制: {url}")
                    await adjust_concurrency(-10)  # 减少并发量
                else:
                    print(f"请求失败: {url} (状态码: {response.status})")
        except Exception as e:
            print(f"请求出错: {url} ({str(e)})")

async def adjust_concurrency(delta):
    global CONCURRENCY, semaphore
    CONCURRENCY += delta
    if CONCURRENCY < 1:
        CONCURRENCY = 1
    print(f"调整并发量: {CONCURRENCY}")
    # 动态调整信号量
    while semaphore._value < CONCURRENCY:
        semaphore.release()
    while semaphore._value > CONCURRENCY:
        await semaphore.acquire()

async def main(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        await asyncio.gather(*tasks)

urls = [f"https://example.com/page{i}" for i in range(1000)]
asyncio.run(main(urls))
```


* * *

### 5\. **优化建议**

  * **使用代理 IP 池** ：通过多个代理 IP 分散请求，避免单个 IP 触发速率限制。
  * **自动限速** ：根据目标服务器的响应状态动态调整请求频率。
  * **错误重试** ：当触发速率限制时，等待一段时间后重试。

* * *

### 6\. **总结**

  * **建议并发量** ：80-90 RPS。
  * **实现方法** ：使用 `asyncio.Semaphore` 控制并发量，并结合动态调整策略。
  * **优化措施** ：使用代理 IP 池、自动限速和错误重试。

通过合理设置并发量，可以最大化爬虫的效率，同时避免触发目标服务器的速率限制。
