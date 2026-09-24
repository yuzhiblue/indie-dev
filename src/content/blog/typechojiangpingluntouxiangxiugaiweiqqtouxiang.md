---
title: "Typecho将评论头像修改为QQ头像"
description: "最近一直在研究Typecho，默认的Gravatar是在是太难看了，而且还会经常宕机，所以网上最常用的方法是用QQ头像替换默认的gravatar头像。于是我在网上苦苦搜索了好几天，终于找到了适合的方法，现在记录一下代码。 用以上代码替换co"
pubDate: 2018-11-13
tags: ['前端']
draft: true
slug: typecho-qq-comment-avatar
---
最近一直在研究Typecho，默认的Gravatar是在是太难看了，而且还会经常宕机，所以网上最常用的方法是用QQ头像替换默认的gravatar头像。于是我在网上苦苦搜索了好几天，终于找到了适合的方法，现在记录一下代码。



```php
    <span itemprop="image"><?php $number=$comments->mail; echo '<img src="https://q2.qlogo.cn/headimg_dl? bs='.$number.'&dst_uin='.$number.'&dst_uin='.$number.'&;dst_uin='.$number.'&spec=100&url_enc=0&referer=bu_interface&term_type=PC" width="46px" height="46px" style="border-radius: 50%;">'; ?></span>
```


用以上代码替换comment.php里面默认的gravatar代码即可。
