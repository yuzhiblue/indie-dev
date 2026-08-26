---
title: "QWindowsContext: OleInitialize() failed如何解决？"
description: "在使用pyside6进行桌面开发的时候，可能会碰到以下提示信息： 这个提示信息并不会影响程序的运行，但是总给人一种代码有BUG的感觉。尝试网上提供的各种方法，仍然无法解决这个问题。 这算是一个BUG，当你同时调用pyside6或者其它qt库"
pubDate: 2025-01-17
tags: ['技术']
draft: false
---
在使用pyside6进行桌面开发的时候，可能会碰到以下提示信息：



```bash
QWindowsContext: OleInitialize() failed:  "COM error 0x80010106: 无法在设置线程模式后对其加以更改。"
qt.qpa.window: SetProcessDpiAwarenessContext() failed: 操作成功完成。
Qt's default DPI awareness context is DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2. If you know what you are doing, you can overwrite this default using qt.conf (https://doc.qt.io/qt-6/highdpi.html#configuring-windows).
```


这个提示信息并不会影响程序的运行，但是总给人一种代码有BUG的感觉。尝试网上提供的各种方法，仍然无法解决这个问题。

这算是一个BUG，当你同时调用pyside6或者其它qt库和pywinauto或者uiautomation的时候就会出现COM库初始化冲突的问题。

pywinauto的作者也在issue上面回复了，最好的方式是在内部需要的地方再调用pywinauto，并且在import pywinauto前面加上：sys.coinit_flags = 2，因为pywinauto最好在MTA多线程模式下运行，不然可能会出错。但是这样仍然会有userwarning，如果不想看到用户警告就使用：



```python
import warnings
warnings.simplefilter("ignore", UserWarning)
```


~~其实很简单，你只需要将执行代码放到子线程中就可以了。库也在子线程中导入，就可以完全避免这个问题。主线程中只放GUI部分的代码，然后子线程和主线程之间用信号和槽函数通信。~~

**综合以上，最新解决方法：**



```python
import warnings
warnings.simplefilter("ignore", UserWarning)
sys.coinit_flags = 2
```


希望对你有所帮助！
