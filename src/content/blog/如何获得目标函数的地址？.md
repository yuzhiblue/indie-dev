---
title: "如何获得目标函数的地址？"
description: "要详细讲如何获得目标函数的地址，实际上是逆向工程和调试中的一个核心环节。不同情况下方法有所差异，下面我系统性介绍几种常用方法，帮你理解和操作。 如何获得目标函数的地址 1\\. 静态分析：使用反汇编工具 工具示例 \\ IDA Pro \\ Gh"
pubDate: 2025-07-28
tags: ['Python', 'Windows', 'Nuitka']
draft: true
slug: get-target-function-address
---
要详细讲如何获得目标函数的地址，实际上是逆向工程和调试中的一个核心环节。不同情况下方法有所差异，下面我系统性介绍几种常用方法，帮你理解和操作。

## 如何获得目标函数的地址

### 1\. 静态分析：使用反汇编工具

**工具示例** \- IDA Pro \- Ghidra（免费开源） \- Radare2 \- Binary Ninja **步骤** 1\. 加载目标程序  
先将可执行文件（exe、dll等）加载到反汇编工具中。

  1. 查看导出函数  
目标程序如果有导出表（Exports），可以直接找到导出函数名及其相对地址（相对于模块基址）。 
  2. 这一步在工具里通常叫做“Exports”或“Export Table”。

  3. 查找函数符号  
如果是带符号的调试版本（PDB等符号文件存在），反汇编工具能直接显示函数名。否则需要根据代码特征、字符串引用等进行分析定位。

  4. 查看函数入口地址  
找到目标函数的入口地址，这个地址是相对模块基址的偏移。

  5. 计算绝对地址  
运行时目标模块会加载到内存中的基址加上偏移就是函数的绝对地址。

### 2\. 动态调试：使用调试器（如x64dbg、OllyDbg）

**原理**  
调试器加载目标程序，可以动态观察进程内存和代码执行情况，直接查找函数入口地址。

**步骤**  
1\. 加载目标程序到调试器  
打开x64dbg或OllyDbg，附加到目标进程或者直接打开exe。

  1. 搜索函数符号  
如果有符号文件（PDB），调试器能显示函数名。

  2. 查找函数调用  
通过观察调用栈、断点等手段找到你关心的函数入口。

  3. 获取函数地址  
在调试器界面中右键复制函数入口地址。

  4. 验证调用  
可以设置断点，执行到函数入口确认地址正确。

### 3\. 使用PE文件分析库：如 Python 的 pefile

**适用场景**  
\- 主要用来分析PE文件的导出函数地址  
\- 不适合静态链接或没有导出的内部函数 

**示例**



```python
import pefile

pe = pefile.PE("target_program.exe")
for exp in pe.DIRECTORY_ENTRY_EXPORT.symbols:
    print(f"Function: {exp.name}, Address: {hex(pe.OPTIONAL_HEADER.ImageBase + exp.address)}")
```


这列出所有导出函数的内存地址（基址+偏移）。

### 4\. 使用Windows API动态获取函数地址

典型用法：GetProcAddress

如果函数在DLL中导出，可以：

  * 使用 LoadLibrary 或 GetModuleHandle 获取模块句柄。
  * 使用 GetProcAddress 获取函数地址。

**示例：**



```python
import ctypes

dll_handle = ctypes.windll.kernel32.LoadLibraryA(b"user32.dll")
func_addr = ctypes.windll.kernel32.GetProcAddress(dll_handle, b"MessageBoxA")
print(hex(func_addr))
```


### 5\. 使用符号服务器和调试符号文件（PDB）

对于微软官方模块或自己编译带符号的程序，可以：

  * 下载对应PDB符号文件 
  * 用调试器加载符号信息 
  * 直接使用符号名查找函数地址 

## 其他重要知识点

**基址（Base Address）**  
模块加载到内存后，有一个基址。静态偏移加基址得到函数绝对地址。

**ASLR（地址空间布局随机化）**  
现代系统会随机化模块基址，每次加载时不同。需要先获取当前模块基址，才能计算正确的函数地址。

**获取模块基址（动态）**  
可以用Windows API EnumProcessModules，或者用psutil结合ctypes调用底层接口。

## 总结示例流程（结合注入场景）

  1. 使用调试器确认目标函数偏移。
  2. 用程序获取目标进程模块基址。
  3. 计算目标函数的绝对地址：绝对地址 = 模块基址 + 函数偏移。
  4. 用远程线程调用该绝对地址。
