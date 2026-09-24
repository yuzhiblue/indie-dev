---
title: "单线程异步如何控制并发量呢？"
description: "在单线程异步编程中（如使用 Python 的 asyncio），控制并发量是通过信号量（Semaphore） 或任务队列 来实现的。信号量是一种同步原语，用于限制同时运行的异步任务数量。 以下是具体实现方法和示例代码： 1\\. 使用信号量（"
pubDate: 2025-01-20
tags: ['并发编程', 'Python', 'Cloudflare']
draft: true
slug: async-concurrency-control
---
在单线程异步编程中（如使用 Python 的 `asyncio`），控制并发量是通过**信号量（Semaphore）** 或**任务队列** 来实现的。信号量是一种同步原语，用于限制同时运行的异步任务数量。

以下是具体实现方法和示例代码：

* * *

### 1\. **使用信号量（Semaphore）控制并发量**

信号量可以限制同时运行的异步任务数量。`asyncio.Semaphore` 是 `asyncio` 提供的一个工具，用于控制并发。

#### （1）**示例代码**



```python
import asyncio

# 控制并发量为 5
semaphore = asyncio.Semaphore(5)

async def download_file(url):
    async with semaphore:  # 获取信号量
        print(f"开始下载: {url}")
        await asyncio.sleep(2)  # 模拟下载耗时
        print(f"下载完成: {url}")

async def main(urls):
    tasks = [download_file(url) for url in urls]
    await asyncio.gather(*tasks)

urls = [f"http://example.com/file{i}" for i in range(20)]
asyncio.run(main(urls))
```


#### （2）**代码说明**

  * `semaphore = asyncio.Semaphore(5)`：创建一个信号量，限制并发量为 5。
  * `async with semaphore`：在进入 `download_file` 函数时获取信号量，退出时释放信号量。
  * 如果当前有 5 个任务正在运行，第 6 个任务会等待，直到有信号量被释放。

* * *

### 2\. **使用任务队列控制并发量**

通过手动管理任务队列，可以更灵活地控制并发量。

#### （1）**示例代码**



```python
import asyncio

async def download_file(url):
    print(f"开始下载: {url}")
    await asyncio.sleep(2)  # 模拟下载耗时
    print(f"下载完成: {url}")

async def worker(queue):
    while True:
        url = await queue.get()  # 从队列中获取任务
        await download_file(url)
        queue.task_done()  # 标记任务完成

async def main(urls, concurrency):
    queue = asyncio.Queue()

    # 将任务添加到队列
    for url in urls:
        queue.put_nowait(url)

    # 启动 worker
    workers = [asyncio.create_task(worker(queue)) for _ in range(concurrency)]
    await queue.join()  # 等待所有任务完成

    # 取消 worker
    for w in workers:
        w.cancel()

urls = [f"http://example.com/file{i}" for i in range(20)]
asyncio.run(main(urls, concurrency=5))  # 控制并发量为 5
```


#### （2）**代码说明**

  * `queue = asyncio.Queue()`：创建一个任务队列。
  * `worker` 函数：从队列中获取任务并执行。
  * `concurrency` 参数：控制并发量，即同时运行的 `worker` 数量。
  * `queue.task_done()`：标记任务完成，通知 `queue.join()`。
  * `queue.join()`：等待所有任务完成。

* * *

### 3\. **两种方法的对比**

**方法** | **信号量** | **任务队列**  
---|---|---  
**实现复杂度** | 简单 | 较复杂  
**灵活性** | 适合简单场景 | 适合复杂场景，支持动态调整并发量  
**适用场景** | 控制固定数量的并发任务 | 需要更精细的任务调度和管理  
  
* * *

### 4\. **总结**

  * **信号量** ：适合简单的并发控制，代码简洁易用。
  * **任务队列** ：适合复杂的并发控制，支持动态调整和更精细的任务管理。

根据你的需求选择合适的方法。如果只是简单地控制并发量，信号量是更推荐的方式；如果需要更复杂的任务调度，可以使用任务队列。
