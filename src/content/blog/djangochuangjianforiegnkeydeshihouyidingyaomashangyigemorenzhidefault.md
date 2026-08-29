---
title: "django创建ForiegnKey的时候一定要马上一个默认值default"
description: "django创建ForiegnKey的时候一定要马上一个默认值default 就像这样一样，别问我怎么知道的。 不信你试试看，看他迁移的时候会不会报错。 所以网上为什么那么多No changes detected的问题。很大一部分原因都在于"
pubDate: 2024-07-30
tags: ['Python', '数据库']
draft: false
slug: django-foreignkey-default
---
django创建ForiegnKey的时候一定要马上一个默认值**default**



```python
software = models.ForeignKey('Software',verbose_name='适用软件',on_delete=models.CASCADE,related_name='cardkey',default=1)
```


就像这样一样，别问我怎么知道的。

不信你试试看，看他迁移的时候会不会报错。

所以网上为什么那么多No changes detected的问题。很大一部分原因都在于没有加上一个默认值。

单单就这个问题就够你折腾半天的了。

加油吧，everyone。
