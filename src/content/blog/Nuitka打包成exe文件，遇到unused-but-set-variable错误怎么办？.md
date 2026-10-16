---
title: "Nuitka打包成exe文件，遇到unused-but-set-variable错误怎么办？"
description: "网上的文章都把Nuitka吹成神了，说打包后可以防止被反编译，体积能缩小多少，速度能快多少。 结果自己一试，净报错，快两天的时间了，还没有打包出一个能用的程序，之前用pyinstaller第1次打包就成功了，这属实有点折磨人呀。 而且网上净"
pubDate: 2024-07-30
tags: ['Nuitka', '开发工具']
draft: true
slug: nuitka-unused-but-set-variable
---
网上的文章都把Nuitka吹成神了，说打包后可以防止被反编译，体积能缩小多少，速度能快多少。

结果自己一试，净报错，快两天的时间了，还没有打包出一个能用的程序，之前用pyinstaller第1次打包就成功了，这属实有点折磨人呀。

而且网上净是吹捧的文章，却很少有能解决异常处理异常的文章。只能自己一点一点去摸索。

最头疼的是遇到这个大bug：unused-but-set-variable。官方文章快翻烂了，各位大神的文章，也一遍一遍的拜读，甚至连各家ai助手都问遍了，就差没把C++学一遍了，都没有找到解决方案。

最后还是在github上面的issue里面找到了一个回答。只需要加一个参数就可以解决这个问题：--experimental=allow-c-warnings

如果你也遇到了这个问题，那你不用找了，就这个答案，全网独一份，赶紧试试吧。
