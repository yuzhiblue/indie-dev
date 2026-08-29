---
title: "windows系统shutdown命令在命令行中可以运行在bat批处理文件中却无法运行"
description: "Windows系统的shutdown命令主要是用来关闭电脑用的，最近因为项目需要需要设置一个定时关闭电脑的脚本。于是就想到了这个shutdown命令。 中间处理bat批处理文件碰到两个坑。一个是乱码，一个是shutdown命令在命令行中可以"
pubDate: 2024-05-16
tags: ['Windows', '开发工具']
draft: false
slug: windows-shutdown-fails-in-bat
---
Windows系统的shutdown命令主要是用来关闭电脑用的，最近因为项目需要需要设置一个定时关闭电脑的脚本。于是就想到了这个shutdown命令。

中间处理bat批处理文件碰到两个坑。**一个是乱码，一个是shutdown命令在命令行中可以运行，但是在bat文件中却无法执行，一直无限循环的打印。**

我问了AI，没有一个回答对的。于是开始百度上搜索。**将@echo off去掉，并添加pause命令，以便于显示错误信息。** 结果仍然没有发现错误信息。

后来又经过多次摸索，我发现原来是文件名字的问题。**文件夹中不能有shutdown名字的bat文件，否则就会一直无限循环。** 于是这次成功了。

关于乱码的问题，网上说是bat命令只能是ansi格式的编码。结果我试了一下不是的，要使用utf-8命令才不会乱码。或者你就在bat命令中加一行**chcp 65001 > nul**就可以了。

以上就是我遇到的问题，写下来记录一下。
