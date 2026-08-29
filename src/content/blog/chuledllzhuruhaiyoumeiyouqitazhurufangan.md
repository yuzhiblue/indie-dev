---
title: "除了DLL注入，还有没有其它注入方案？"
description: "如果你不想编写DLL文件，仍然有其他方法可以进行注入，尤其是在Python中。你可以尝试直接通过代码注入（不需要编写DLL）来操控目标进程。这种方法通常通过直接操作进程内存，或者利用现有的工具和库来达到注入的效果。 以下是几种常见的替代方案"
pubDate: 2025-07-28
tags: ['Python', '并发编程', '开发工具']
draft: false
slug: dll-injection-alternatives
---
如果你不想编写DLL文件，仍然有其他方法可以进行注入，尤其是在Python中。你可以尝试直接通过代码注入（不需要编写DLL）来操控目标进程。这种方法通常通过直接操作进程内存，或者利用现有的工具和库来达到注入的效果。

以下是几种常见的替代方案：

## 1\. 通过ctypes直接操作进程内存

你可以使用Python的ctypes库直接修改目标进程的内存，注入代码并执行。这种方法不依赖于DLL，而是通过直接的内存写入来注入代码。

示例代码：直接写入进程内存并执行代码 这个示例使用ctypes和pywin32库在目标进程中直接写入数据，并执行：



```python
import ctypes
import win32api
import win32process
import win32con
import win32gui
import sys

# 获取目标进程ID
def get_process_id(process_name):
    import psutil
    for proc in psutil.process_iter():
        if process_name.lower() in proc.name().lower():
            return proc.pid
    return None

def inject_code(pid, code):
    # 获取进程句柄
    process_handle = win32api.OpenProcess(win32con.PROCESS_ALL_ACCESS, False, pid)

    # 分配内存空间
    alloc_mem = win32api.VirtualAllocEx(process_handle, 0, len(code), win32con.MEM_COMMIT, win32con.PAGE_READWRITE)

    # 写入代码
    win32api.WriteProcessMemory(process_handle, alloc_mem, code)

    # 执行代码
    thread_id = win32api.CreateRemoteThread(process_handle, None, 0, alloc_mem, 0, 0, None)

    # 等待线程完成
    win32api.WaitForSingleObject(thread_id, -1)

    # 释放内存
    win32api.VirtualFreeEx(process_handle, alloc_mem, len(code), win32con.MEM_RELEASE)

    # 关闭进程句柄
    win32api.CloseHandle(process_handle)

if __name__ == "__main__":
    target_pid = get_process_id("notepad.exe")  # 目标进程为记事本
    if target_pid is None:
        print("目标进程未找到")
        sys.exit(1)

    # 注入的代码，可以是任何目标进程能够执行的机器码或汇编代码
    # 这里假设你注入的代码是一个简单的NOP（空操作）指令
    code = b"\x90" * 100  # NOP指令表示空操作，字节流形式

    inject_code(target_pid, code)
    print("代码注入完成")
```


## 2\. 使用现有的注入工具

你可以使用现有的开源工具来进行注入，这些工具通常会封装好注入的复杂性。以下是几个常见的工具：

PyInjector：这是一个简单的Python脚本，可以通过直接控制Windows进程来进行注入。你可以使用它来将代码注入到目标进程中。

Frida：Frida是一个强大的动态二进制分析工具，允许你注入JavaScript代码到目标进程中。它提供了跨平台支持，并且非常强大，能够在运行时动态修改程序的行为。Frida通过Python API提供了灵活的控制。

使用Frida注入代码的简单示例：



```python
import frida
import sys

# 编写JavaScript代码以注入到目标进程
script_code = """
console.log('Hello from Frida!');
"""

def on_message(message, data):
    print(f"Message: {message}")
    print(f"Data: {data}")

# 获取目标进程的PID
session = frida.attach("notepad.exe")

# 注入代码
script = session.create_script(script_code)
script.on('message', on_message)
script.load()

sys.stdin.read()
```


  * frida.attach("notepad.exe")：连接到目标进程（记事本）。
  * script_code：注入的JavaScript代码，可以是自定义的任何代码。
  * 使用Frida不仅可以注入代码，还能拦截API调用、修改内存、甚至进行反向工程。

## 3\. 使用pyautogui模拟键盘和鼠标输入

如果你不想进行复杂的内存注入，你还可以通过模拟键盘和鼠标输入来影响目标应用程序的行为。pyautogui是一个流行的Python库，用于模拟鼠标和键盘事件。

### 安装pyautogui：



```bash
pip install pyautogui
```


### 模拟键盘和鼠标输入的示例：



```python
import pyautogui
import time

# 打开记事本（假设记事本已经打开）
pyautogui.hotkey('win', 'r')  # 打开运行对话框
time.sleep(1)
pyautogui.write('notepad')
pyautogui.press('enter')

time.sleep(1)

# 在记事本中输入文本
pyautogui.write('Hello, this is an injection example!')
```


## 总结：

如果你不想编写DLL文件，仍然可以使用以下替代方案：

  1. 直接通过内存注入代码，使用Python的ctypes等库。
  2. 使用现有的工具，如Frida，它允许动态注入JavaScript代码到目标进程。
  3. 通过模拟用户输入，使用库如pyautogui来影响目标应用。

需要注意的是，无论使用哪种方法，都应遵循法律法规，确保在合法的范围内进行实验或开发。
