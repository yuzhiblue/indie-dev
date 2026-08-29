---
title: "35dir如何自定义数据统计栏？"
description: "我们在网上下载的系统默认的数据统计栏比较简单，只有主题分类、优秀站点和站长资讯三个，看着不够详细。下面我们通过修改一些代码让其更符合我们的要求。 一、添加待审站点 分别打开themes/default/index.html和themes/d"
pubDate: 2015-02-08
tags: ['技术']
draft: false
slug: 35dir-custom-stats-bar
---
我们在网上下载的系统默认的数据统计栏比较简单，只有主题分类、优秀站点和站长资讯三个，看着不够详细。下面我们通过修改一些代码让其更符合我们的要求。

一、添加待审站点

分别打开`themes/default/index.html`和`themes/default/header.html`文件。搜索“数据统计”，在“...个优秀站点，”后面加上`<b>{#$stat.apply#}</b>个待审站点，`这句，点击保存即可。

二、添加未通过站点

首先，打开`source/module/stats.php`文件； 其次，查找`$stat = array();`这一句，在这句下面添加`$stat['block'] = $DB->get_count($DB->table('websites'), array('web_status' => 1));`这句，保存； 再次，分别打开`themes/default/index.html`和`themes/default/header.html`文件。搜索“数据统计”，在“...个优秀站点，”后面加上`<b>{#$stat.block#}</b>个未通过站点，`这句，点击保存即可。

同样的，我们发现优秀站点的数据不是很准确，因为它统计的是所有的网站总数，因此我们可以适当做一下修改。

三、修改优秀站点

首先，打开`source/module/stats.php`文件； 其次，查找`$stat['website'] = $DB->get_count($DB->table('websites'));`将其改为`$stat['website'] = $DB->get_count($DB->table('websites'), array('web_status' => 3));`保存即可；

下面还有一些其他需要修改的地方，大家自己看一下吧：

怎么样？自己试一下吧，有不懂的地方请留言。
