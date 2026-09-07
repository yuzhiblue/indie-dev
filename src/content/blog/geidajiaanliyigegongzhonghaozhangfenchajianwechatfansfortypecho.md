---
title: "给大家安利一个公众号涨粉插件:WeChatfans for Typecho"
description: "请注意：本插件已经不兼容最新版的typecho，需要自己自行修改。 今天给大家安利一个微信公众号涨粉插件:WeChat Fans for Typecho。 在这里首先感谢博主同乐儿。博主为人比较谦虚，而且乐于助人。一开始我是看到他博客上有一"
pubDate: 2019-01-26
tags: ['前端']
draft: false
slug: typecho-wechatfans-plugin
---
请注意：本插件已经不兼容最新版的typecho，需要自己自行修改。

今天给大家安利一个微信公众号涨粉插件:WeChat Fans for Typecho。

在这里首先感谢博主同乐儿。博主为人比较谦虚，而且乐于助人。一开始我是看到他博客上有一个微信关注发送验证码才能显示内容的功能，于是就关注了他的公众号，问他怎么做到的，然后马上就回复我说这个是WORDPRESS插件，才发现他用的不是Typecho。本来想有空了自己研究一下的，结果他第二天就发过来了。真的是太感谢了。

**安装方法：**

第一步：下载本插件，放在 `usr/plugins/` 目录中（插件文件夹名必须为WechatFans）； 第二步：激活插件； 第三步：填写微博小号等等配置； 第四步：完成。

**使用方法：**

1、配置各项参数； 2、编写文章时点击编辑器VX按钮，插入以下代码： <!–wechatfans start–> <!–wechatfans end–> 代码，中间的文字即为隐藏内容； 3、替换主题目录下post.php中输出内容的代码，如：

content; ?>

替换成 4、替换主题目录下archive.php或index.php中输出摘要或内容的代码，没有则不替换，如：

excerpt(140, “…”); ?>

替换成

同乐儿博客官方下载地址:http://www.tongleer.com/2055.html
