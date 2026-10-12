---
title: "一次“编译成功却运行即崩”的排查记：Nuitka 4.3 + PySide6 的 segfault 之坑"
description: "Nuitka 4.3 打包的 PySide6 程序运行必崩（access violation），回退 Nuitka 4.2.2 一切正常。整个过程踩了 7 个坑，记录如下，希望能帮你少走弯路。"
pubDate: 2026-10-13
tags: ['Nuitka', 'PySide6', 'segfault', 'faulthandler', '二分排查', '依赖锁定']
draft: false
slug: nuitka-pyside6-segfault-debugging
---

> 结论先行：**Nuitka 4.3 打包的 PySide6 程序运行必崩（access violation），回退 Nuitka 4.2.2 一切正常**。整个过程踩了 7 个坑，记录如下，希望能帮你少走弯路。

## 背景

我在给客户做一个快手直播伴侣的定时开播工具（PySide6 GUI + 图像识别自动化，Nuitka standalone 打包）。昨天的任务很简单：客户定制补丁——循环开播间隔下限从 60 秒改成 10 秒、单场时间从"分钟"改成"分:秒"格式。改完提交、编译、交付，流程和过去几个月一样。

结果客户那边还没反馈，我自己本机先炸了：编译一次成功，运行即崩。

```
D:\Nuitka\main.dist>kwaitimer.exe
qt.qpa.window: SetProcessDpiAwarenessContext() failed: 拒绝访问。
2026-10-12 21:23:45,006 - kwaitimer - INFO - 配置文件不存在，已创建默认配置
Nuitka: A segmentation fault has occurred. This is highly unusual and can
have multiple reasons. Please check https://nuitka.net/info/segfault.html
QThreadStorage: entry 2 destroyed before end of thread 0x278d2341ef0
```

---

## 坑 1：日志停在"配置文件创建"，让人怀疑刚写的代码

崩溃点看起来非常"可疑"——正好卡在启动流程的第 7 步 `initConfig()` 之后、第 8 步 `initUi()` 之前。而我昨天刚改过 `view.py`。

**第一反应是检查昨天的 diff**：正则改了两条、新增一个解析函数、改了几处默认值和文案。但冷静看崩溃时序：

- 昨天改的校验逻辑在 `initValidator()`，位于崩溃点**之前**，已经跑过去了；
- 新增的解析函数只有用户点"开启"按钮才会执行，启动阶段**根本走不到**；
- `mainui_ui.py` 的改动全是 `translate()` 字符串，不涉及控件结构。

教训：**崩溃点相邻 ≠ 因果关系**。先看崩溃时序覆盖了哪些代码路径，再对照 diff 排除"根本走不到"的改动。

## 坑 2：两个红鲱鱼（Red Herring）

- **`SetProcessDpiAwarenessContext() failed: 拒绝访问`**：源码直跑时同样出现，纯警告，与崩溃无关。
- **`QThreadStorage: entry destroyed before end of thread`**：这是崩溃后的清理噪音，不是原因。

如果一开始就对着这两条去查 DPI 清单和线程清理，会浪费几个小时。判断标准很简单：**源码运行时它们也在，但源码不崩**。

## 坑 3：源码正常、编译必崩，方向转打包

最快的分叉判定：直接跑源码。结果源码完美启动（授权、环境检测全部正常）。于是问题范围锁定在"Nuitka 打包产物"上。

这时我犯了个想当然：既然是打包问题，那就先怀疑环境版本。`pip list` 一看——venv 里 PySide6 是 6.12.0，主环境是 6.11.2，**版本不一致**！顺手把 venv 降到 6.11.2，重新编译——还是崩。

后来才想明白：requirements.txt 里 `PySide6` 没锁版本，`pip install -r requirements.txt` 会装最新版，venv 和主环境的差异只是冰山一角。**版本不一致是噪音，"装了什么"远不如"改了什么"重要**——这也引出了后面最关键的一步。

## 坑 4：GitHub Actions 也崩，"本机环境问题"假设破产

为了排除本机环境，改了 `build.yml` 让分支推送触发 CI，用 GitHub Actions 的干净环境（`pip install --upgrade nuitka` 最新版）编译——**产物照样闪退**。

这排除了"本机 venv 被污染"的单一解释，说明问题出在**某个版本组合**上，而且 CI 的"最新版"并没有幸免。

## 坑 5：没有调试器，就用 faulthandler 抓 Python 堆栈

Windows 上没有现成的 cdb（WinDbg），拿不到原生调用栈。但 Nuitka 编译的程序**可以**用 Python 标准库的 `faulthandler` 抓到 Python 级堆栈：

```python
# main.py 入口第一行
import faulthandler
faulthandler.enable()
```

重新编译运行，stderr 出来了：

```
Windows fatal exception: access violation

Current thread 0x000020b4 (most recent call first):
  File "view.py", line 440 in initUi
  File "view.py", line 77 in __init__
```

崩溃在 `initUi()`！这一步价值巨大：把"启动后某个时刻崩"收窄到了"初始化 UI 的几十行里"。

（小坑：Nuitka 对行号的归属只报到函数级，`line 440` 指的是 `def initUi` 那一行，不是精确语句。）

## 坑 6：埋点二分，精确定位到一条 `toggled.connect`

在 `initUi()` 的信号连接之间插入 `self.logger.info('initUi: step N')`，每轮编译约 7 分钟，三轮二分：

```
step 2        → 崩溃在 step 2 ~ 2a 之间（9 条连接）
step 2-1      → 崩溃在 step 2 ~ 2-1 之间（4 条连接）
s2-c1         → 崩溃在 s2-c1 ~ s2-c2 之间（就 1 条！）
```

最终定位到：

```python
self.radioButton_sale.toggled.connect(lambda checked: (...) if checked else None)
```

诡异的规律：前面成功连接的全是 `clicked` / `stateChanged`，**这是全程序第一条 `toggled.connect(lambda)`**。

## 坑 7：最小复现不崩，说明是"慢性伤"，不是"当场伤"

写了个 10 行的最小程序（QRadioButton + `toggled.connect(lambda)`）编译运行——**不崩**。

这说明 `toggled.connect(lambda)` 模式本身没问题，崩溃是**之前某处的堆损坏延迟爆发**——access violation 经常这样，案发现场不等于作案现场。继续在崩溃语句上纠结没有意义，必须换策略：**A/B 对照实验**。

## 转折：git worktree 做 A/B，10 分钟定案

用 `git worktree` 检出昨天改动之前的提交（`a963d09`，8 月 17 日的代码），用同一环境编译：

```powershell
git worktree add d:\kwaitimer_ab a963d09
# 用同一 venv 编译 worktree 里的代码
```

**结果：同样崩在配置文件创建之后。**

昨天的定制改动彻底洗清嫌疑——问题在环境。可是 CI（最新 Nuitka + PySide6 6.12）崩，本机（Nuitka 4.3 + 6.11.2）也崩，两个"不同"组合都崩，还有什么可变？

## 破案：已交付的安装包是"活证据"

想到去对比**最后一次能正常工作的交付版本**。客户机器上装着的旧版就在本机 `D:\Program Files\kwaitimer`：

- 正常版 exe 构建时间：**9 月 2 日**，内嵌 Qt **6.11.2**；
- 文件清单与崩溃版几乎一致（只差卸载器、日志、两个 DLL 命名变体）；
- 说明代码结构没变、Qt 版本相同，**变的是构建工具本身**。

再查 venv 里 9 月 2 日之后被动过的包，真相大白：

```
nuitka                2026/10/12 20:27:18   ← 昨晚编译前 1 小时被升级！
pyside6-6.11.2.dist-info  2026/10/13 0:08   ← 我手动降级的时间
```

**10 月 12 日傍晚，`pip install -r requirements.txt nuitka`（未锁版本）把整个 venv 升级了一遍，其中 Nuitka 从 4.2.x 升到了 4.3。** 9 月 2 日以来第一次重新打包，第一次踩中 4.3 的回归 bug。

## 验证与修复

```
Nuitka 4.3  + PySide6 6.11.2 → 崩
Nuitka 4.3  + PySide6 6.12   → 崩（CI 验证）
Nuitka 4.2.2 + PySide6 6.11.2 → 正常 ✅
```

`pip install nuitka==4.2.2` 后重新编译，程序完整启动：授权检查、环境检测、窗口显示全部正常。回滚一个版本号，问题消失。

最后在 CI 里锁死版本，防止复发：

```yaml
- name: Install Nuitka and pinned PySide6
  run: python -m pip install nuitka==4.2.2 "PySide6==6.11.2"
```

---

## 复盘：这次踩坑教会我的事

1. **"编译成功" ≠ "能运行"。** Nuitka 4.3 编译全程零报错，产物运行必崩。交付前必须实机启动验证，这一步没有捷径。

2. **构建依赖也要锁版本。** `requirements.txt` 里 `PySide6`、`nuitka` 不锁版本，等于把打包质量交给 PyPI 的最新 release 抽签。GUI 框架和打包工具是"基础设施"，锁死它们，升级要走"改版本号 → 编译 → 实测 → 提交"的流程。

3. **已交付的安装包是最好的参照物。** 出问题时，别只盯着代码 diff，去看看"最后一次好的构建"用的是什么组合——文件清单、内嵌 DLL 版本、构建时间戳，全是证据。

4. **faulthandler 是 Nuitka 项目的救命稻草。** 一行 `faulthandler.enable()`，编译版 segfault 也能拿到 Python 级堆栈。建议 GUI 项目默认开启，生产环境也无副作用。

5. **A/B 对照 > 顺藤摸瓜。** 当"崩溃点附近的代码"查不出问题时，用 git worktree 编译历史版本做对照，10 分钟就能把"代码问题"和"环境问题"切开。这次若早做这一步，能省下三轮编译。

6. **堆损坏型崩溃，案发现场不在崩溃点。** access violation 常常延迟爆发，最小复现不崩不代表嫌疑洗清——它只说明"单靠这个模式杀不死进程"。此时该做的是缩小范围（埋点二分）+ 换对照组（历史版本 A/B），而不是在嫌疑语句上死磕。

7. **日志埋点 + 编译二分很慢但很可靠。** 每轮 7 分钟，三轮定位到单条语句。比起反复猜测"可能是 XX 引起的"，机械的二分反而最快。

## 附：排查工具箱速查

```powershell
# 1. 区分代码/环境问题：源码直跑
python main.py

# 2. 编译版抓 Python 堆栈（main.py 入口加 faulthandler.enable()）
#    运行时重定向 stderr 即可看到崩溃堆栈

# 3. 历史版本 A/B
git worktree add ..\ab <commit>
# 用同一环境编译 worktree 内代码并运行对比

# 4. 查"环境什么时候被改过"：按修改时间列 site-packages
Get-ChildItem <venv>\Lib\site-packages -Directory |
  Where-Object { $_.LastWriteTime -gt [datetime]"2026-09-02" }

# 5. 对照最后正常版本：文件清单 diff + DLL 版本
(Get-Item "...\Qt6Core.dll").VersionInfo.ProductVersion
```

希望下一个撞上 Nuitka 4.3 的人，能少熬一个通宵。
