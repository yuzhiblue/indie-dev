---
title: "python脚本打包成exe可执行文件过程中的一些要点"
description: "python打包成exe可执行文件，首先要考虑两个问题。 一个是杀毒软件报毒的问题，一个是打包文件大小的问题。 杀毒软件报毒大概率是因为调用了cmd命令行去处理任务。这个时候可以修改一下执行逻辑。尽量不用cmd命令执行命令。 关于打包文件大"
pubDate: 2024-07-18
tags: ['开发工具', 'Nuitka', 'Python']
draft: false
slug: python-to-exe-packaging-tips
---
python打包成exe可执行文件，首先要考虑两个问题。

一个是杀毒软件报毒的问题，一个是打包文件大小的问题。

杀毒软件报毒大概率是因为调用了cmd命令行去处理任务。这个时候可以修改一下执行逻辑。尽量不用cmd命令执行命令。

关于打包文件大小的问题，可以创建虚拟环境，再去虚拟环境中打包。这样可以将文件打包到很小。

常用的pyinstaller命令：



```bash
pyinstaller -F -w --add-data=D:\douyin\gui\icon.png:. --add-data=D:\douyin\gui\favicon.ico:. -i D:\douyin\gui\favicon.ico D:\douyin\gui\dou.py

# -F 打包成单文件
# -w exe程序运行时是否显示命令符窗口
# --add-data 添加一些静态资源，如图片等等。结尾以:.结束，意思是放到根目录下。
# -i 添加图标 后面跟上图标的路径
# 最后是脚本的绝对路径。
```


需要注意的是需要注意的是：为避免出错，尽量使用绝对路径。

最后，打包好之后要检查一下有没有报毒。使用这个网址：https://www.virustotal.com/gui/ 和https://www.virscan.org/ 这个网址
