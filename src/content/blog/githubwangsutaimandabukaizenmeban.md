---
title: "Github网速太慢打不开怎么办？"
description: "使用GitHub有一段时间了，我发现这几天老是打不开。我以为是被和谐了。然后网上搜索了一下解决方案。 其中csdn上面有一个方案是把一段代码复制到hosts里面去。这个我试了，效果有但是不太好。 于是我在segmentfault找到了另外一"
pubDate: 2020-02-09
tags: ['开发工具']
draft: false
slug: github-slow-connection-fix
---
使用GitHub有一段时间了，我发现这几天老是打不开。我以为是被和谐了。然后网上搜索了一下解决方案。

其中csdn上面有一个方案是把一段代码复制到hosts里面去。这个我试了，效果有但是不太好。



```
#就是这个代码
http://github.com 204.232.175.94 http://gist.github.com 107.21.116.220
http://help.github.com 207.97.227.252 http://nodeload.github.com 199.27.76.130
http://raw.github.com 107.22.3.110 http://status.github.com 204.232.175.78
http://training.github.com 207.97.227.243 http://www.github.com
```


于是我在segmentfault找到了另外一种方法。这个方法目前效果还不错。特地记录一下。

**首先打开网址：** http://tool.chinaz.com/speedworld/ 并在文本框中输入gethub.com 点击查看分析。

**其次往下翻网页** ，找到总耗时最小的一条，把ip地址复制下来。

**最后将下面的代码追加到hosts文件里面就可以了。**



```
13.250.177.223 https://github.com
```


刷新一下网页，速度立马上来了。不知道有没有用，大家可以试一下。

至于怎么找到hosts文件请自行百度。这里就不再赘述了。
