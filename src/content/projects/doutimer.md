---
title: '抖音直播定时助手（Doutimer）'
description: '通过调用 Windows 底层 API 实现自动化点击，支持抖音、快手双平台的直播定时开播与下播工具。'
pubDate: 2025-07-16
updatedDate: 2026-10-25
tags: ['Windows', '自动化', '直播', '抖音']
featured: true
coverImage: '/projects/doutimer/cover.png'
download: 'https://cnb.cool/yuzhiblue/Releases'
purchase: 'https://h5.m.taobao.com/awp/core/detail.htm?ft=t&id=1091435655239'
draft: false
---

## 软件简介

欢迎使用抖音直播定时助手！本软件通过调用 Windows 底层 API 接口，实现自动化点击功能。
本软件执行任务期间不要求直播伴侣一定要在最上层，您可以根据您的需求，将直播伴侣最小化，
或者放在桌面底部，均可以照常运行。

本软件运行环境要求：win10 / win11 64 位，支持本地和云电脑，不支持多开；


## 最新版 0.5.6（2026-10-10 更新）

- 修复托盘区无法双击的问题；

## 界面截图

![软件主界面：常用定时](/projects/doutimer/1.png)

![软件主界面：多组定时](/projects/doutimer/2.png)

![软件主界面：循环定时](/projects/doutimer/3.png)


### 下载地址

https://cnb.cool/yuzhiblue/Releases

- 蓝奏云：
https://wwbqm.lanzouv.com/iy57j4bc3eje 密码:hhct

- 百度网盘：
通过网盘分享的文件：Dou_0.5.6.exe
链接: https://pan.baidu.com/s/1I-nettA5wUf1ARlEIBgCVQ?pwd=7yfp 提取码: 7yfp 复制这段内容后打开百度网盘手机App，操作更方便哦

### 使用教程

- 飞书文档：https://wit8djbtf7y.feishu.cn/wiki/G9aLwktGhiG7QYkWu3wc3zYinZg

### 购买地址

- 淘宝：https://h5.m.taobao.com/awp/core/detail.htm?ft=t&id=1091435655239

### 小贴士

- 因系统环境不同，无法保证一定正常使用，建议购买后先测试。
- 试用卡密：微信关注公众号「7TEC」，回复数字 `8888`。

## 历史版本更新日志

| 版本 | 说明 |
| --- | --- |
| 0.5.6 | 修复托盘区无法双击的问题 |
| 0.5.5 | - 修复诊断模块 qInstallMessageHandler 死代码（v0.5.4 回归问题），Qt 致命信息恢复写入日志。 - crash.log 启动补发判据改为真实崩溃证据：良性 COM 噪音（0x80040155 / 0x8001010D）启动时清空不再误报；真实证据归档为 .prev 并补发一次；新装机场景自动排除。 - 诊断包新增最近 3 张失败截图（screenshots/ 目录），便于识别遮挡点击的弹窗。 |
| 0.5.4 | 修复已知bug，优化开播下播流程 |
| 0.5.3 | 修复已知bug，添加允许发送诊断包的功能 |
| 0.5.2 | 修复已知bug，增加软件的稳定性 |
| 0.5.0 | 添加邮箱通知功能，剥离快手相关逻辑，修复其他问题 |
| 0.3.0524 | 修复多组定时失效、解绑、快手错误提示等 |
| 0.3.0429 | 修复 BUG，数值限制，多线程优化 |
| 0.3.0415 | 代码重构，日志，每天定时，快手团购，解绑，多组定时 |
| 0.2.1105 | 快手电商挂车，UI，优化 | 
| 0.2.1015 / 0.2.1013 / 0.2.1008 / 0.2.1007 | 修复 BUG，稳定性 |
| 0.2.0830 | 循环直播，违规警告，自动关机 |
| 0.2.0725 | 定时开播，界面重写 |
| 0.1.0716 | 定时下播工具（软著登字第 14134871 号） |

## 使用说明

- 已开播请勿重复开启定时开播（易异常下播）。
- 时长 / 时间模式说明：早于当前时间则延迟至次日执行。

## 系统要求

- Windows 10 及以上 64 位系统。
- 仅限抖音电脑版直播伴侣。
