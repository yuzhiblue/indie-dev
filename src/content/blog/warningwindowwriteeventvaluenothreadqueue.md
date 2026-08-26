---
title: "warning window.write_event_value - no thread queue"
description: "当我们使用pysimplegui构建程序GUI的时候始终出现warning window.write_event_value no thread queue found，这是怎么回事呢？ 如果你也像我一样，尝试了很多种方式，依然找不到答案。"
pubDate: 2024-07-16
tags: ['技术']
draft: false
---
当我们使用pysimplegui构建程序GUI的时候始终出现warning window.write_event_value - no thread queue found，这是怎么回事呢？

如果你也像我一样，尝试了很多种方式，依然找不到答案。只需一招就可以轻松解决。那就是只需要在下面这段代码里面加上finalize=True就可以了。



```python
window=sg.Window(name, layout)
#将上面的代码改为：
window=sg.Window(name, layout,finalize=True)
```


可以试一下。
