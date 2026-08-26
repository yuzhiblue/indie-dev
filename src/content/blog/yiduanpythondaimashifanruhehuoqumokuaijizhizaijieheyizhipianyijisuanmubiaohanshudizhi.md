---
title: "一段Python代码示范如何获取模块基址，再结合已知偏移计算目标函数地址"
description: "下面是一个示范代码，展示了如何使用Python结合psutil和ctypes来获取目标进程的模块基址，并且计算目标函数的地址。代码主要利用了Windows API。 步骤： 1. 获取目标进程的ID（psutil） 2. 列出目标进程的模块"
pubDate: 2025-07-28
tags: ['技术']
draft: false
---
下面是一个示范代码，展示了如何使用Python结合psutil和ctypes来获取目标进程的模块基址，并且计算目标函数的地址。代码主要利用了Windows API。

### 步骤：

  1. 获取目标进程的ID（psutil）
  2. 列出目标进程的模块，找到需要的模块基址
  3. 计算目标函数的绝对地址（基址 + 偏移）

### 代码示例：



```python
import psutil
import ctypes
import win32api
import win32con
import win32process
import sys

# 获取目标进程的PID
def get_process_id(process_name):
    for proc in psutil.process_iter(['pid', 'name']):
        if process_name.lower() in proc.info['name'].lower():
            return proc.info['pid']
    return None

# 获取目标进程的模块基址
def get_module_base_address(pid, module_name):
    # 打开进程
    process_handle = win32api.OpenProcess(win32con.PROCESS_VM_READ | win32con.PROCESS_QUERY_INFORMATION, False, pid)

    # 获取模块列表
    hmodule = win32api.EnumProcessModules(process_handle)
    for mod in hmodule:
        mod_name = win32api.GetModuleFileNameEx(process_handle, mod)
        if module_name.lower() in mod_name.lower():
            # 返回模块基址
            return mod
    return None

# 计算目标函数的绝对地址
def get_function_address(module_base, offset):
    return module_base + offset

if __name__ == "__main__":
    target_pid = get_process_id("target_program.exe")  # 替换为目标进程名
    if target_pid is None:
        print("目标进程未找到")
        sys.exit(1)

    # 获取目标模块基址，假设我们知道模块名称
    module_name = "target_program.dll"  # 替换为实际模块名
    module_base = get_module_base_address(target_pid, module_name)
    if module_base is None:
        print(f"未找到模块: {module_name}")
        sys.exit(1)

    print(f"模块基址: {hex(module_base)}")

    # 假设目标函数的偏移是0x1234（请替换为实际偏移）
    function_offset = 0x1234
    function_address = get_function_address(module_base, function_offset)
    print(f"目标函数地址: {hex(function_address)}")
```


### 代码解释：

  1. 获取目标进程的PID： 
  2. 使用psutil库的process_iter方法遍历系统中的所有进程，通过进程名找到对应的PID。
  3. 获取目标进程的模块基址： 
  4. 使用win32api和EnumProcessModules来列出目标进程的所有模块。然后通过模块名来匹配找到目标模块，并返回该模块的基址。
  5. 计算函数地址： 
  6. 假设你已经知道目标函数的偏移（例如，0x1234），通过基址加上偏移，计算出目标函数的绝对地址。

### 注意：

  * **模块名：** 确保module_name与目标程序的DLL文件名一致。
  * **函数偏移：** 需要通过反汇编工具、调试器或者PE文件分析来获取目标函数的偏移。
  * **权限：** 操作系统可能会限制访问其他进程的内存，需要适当的权限（管理员权限）。

### 进一步优化：

你可以动态获取目标函数的偏移，也可以结合其他工具（如IDA Pro、x64dbg等）获取精确的偏移值。
