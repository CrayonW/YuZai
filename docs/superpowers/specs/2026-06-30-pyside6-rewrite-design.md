# 鱼仔桌宠 PySide6 重写设计

## 背景

当前项目经历过 Electron、PixiJS、视频切帧、AI 视频生成等多条路线，但实际效果没有满足桌宠核心目标：鱼仔在桌面上自然可见、动作和交互稳定、模型相似度可控、跨 macOS 和 Windows 运行。

后续方案全部切换为 Python + PySide6 + PyInstaller。参考 `zyt314415128/dyberpet-dahui` 的桌宠运行时思路，但不复制其源码，不继承其养成、商店、任务、便便、金币等复杂系统。

## 目标

第一阶段目标是建立一个干净、可维护、跨平台的鱼仔桌宠基础版本：

- macOS 和 Windows 使用同一套 Python 主程序。
- 桌面上显示透明背景、始终置顶的鱼仔窗口。
- 鱼仔可拖拽移动，位置可保存。
- 支持右键菜单，至少包含退出、重置位置、置顶开关。
- 支持鼠标靠近反应和基础气泡。
- 动画先采用透明 PNG 帧动画。
- 素材优先保证鱼仔像 `assets/origin/鱼仔参考图.png`。

## 非目标

第一阶段不做以下内容：

- 不继续使用 Electron、PixiJS 或旧 Canvas 渲染路线。
- 不继续使用 Kling/AI 视频批量生成作为运行时主线。
- 不恢复旧 `assets/runtime/animations` 序列帧生产流水线。
- 不实现养成数值、金币、商店、任务、便便系统。
- 不直接复制 `dyberpet-dahui` 源码。
- 不做 macOS 签名和公证；本机运行即可。

## 参考项目取舍

参考 `dyberpet-dahui` 的内容：

- PySide6 透明无边框桌宠窗口。
- 始终置顶、拖拽、右键菜单、系统托盘等桌宠基础能力。
- PNG 帧动画和动作配置表。
- 多屏幕和屏幕边界处理思路。
- PyInstaller 打包方式。

不继承的内容：

- GPL 项目源码。
- 复杂养成系统和仪表盘。
- 商店、物品、金币、任务、便便等玩法。
- 参考项目自带角色素材。

## 新项目结构

重写后的项目结构以 Python 为主：

```text
YuZai/
├── README.md
├── requirements.txt
├── pyproject.toml
├── yuzai_pet/
│   ├── __init__.py
│   ├── __main__.py
│   ├── app.py
│   ├── pet_window.py
│   ├── animation.py
│   ├── behavior.py
│   ├── config.py
│   └── platform_window.py
├── assets/
│   ├── origin/
│   │   ├── 鱼仔参考图.png
│   │   └── 原始动作视频素材
│   └── yuzai/
│       ├── actions/
│       │   ├── idle/
│       │   ├── hover/
│       │   └── drag/
│       └── pet.json
├── tools/
│   └── 素材处理工具
├── docs/
│   └── 中文设计、计划、验收记录
└── packaging/
    ├── macos/
    └── windows/
```

## 清理边界

重写实施时删除旧主线文件：

- `electron/`
- `src/`
- `esbuild.config.mjs`
- `tsconfig.json`
- `package.json`
- `package-lock.json`
- `node_modules/`
- 旧 Node 脚本中服务于 Electron、PixiJS、Kling、runtime-intake、视频切帧主线的内容
- `assets/runtime/`
- `assets/sprites/`
- 旧 PixiJS 和视频序列帧相关计划文档

保留内容：

- `assets/origin/鱼仔参考图.png`
- `assets/origin/` 下用户提供的原始视频素材
- 必要的中文项目文档
- `.gitignore`
- 图标等后续仍可复用的构建资源，是否保留以实施时清单为准

任何删除都必须先列清单，再执行。

## 运行时设计

### 应用入口

`python -m yuzai_pet` 启动应用。入口创建 `QApplication`，加载配置，创建桌宠窗口，并设置退出逻辑。

### 桌宠窗口

`PetWindow` 负责：

- 透明背景。
- 无边框。
- 始终置顶。
- 按 PNG alpha 区域绘制鱼仔。
- 鼠标拖拽移动。
- 右键菜单。
- 记住窗口位置和缩放。

### 动画播放器

`AnimationPlayer` 负责：

- 从 `assets/yuzai/actions/<action>/` 加载 PNG 帧。
- 按 `pet.json` 配置播放帧率、循环方式和动作名。
- 提供 `play(action)`、`set_idle(action)`、`tick()` 等接口。
- 第一阶段支持 `idle`、`hover`、`drag` 三类动作。

### 行为控制

`BehaviorController` 负责：

- 空闲时播放 `idle`。
- 鼠标靠近时切到 `hover` 或短暂反应帧。
- 拖拽时切到 `drag`。
- 松手后回到 `idle`。
- 触发气泡时不打断核心动作。

### 配置

`assets/yuzai/pet.json` 描述：

- 窗口默认大小。
- 可用动作列表。
- 每个动作的帧目录、帧率、是否循环。
- 交互阈值，例如鼠标靠近距离。

用户位置、缩放、置顶开关等运行时配置写入用户本地配置目录，不写回仓库。

## 打包设计

第一阶段先支持源码运行：

```bash
python -m yuzai_pet
```

随后使用 PyInstaller：

- macOS：输出 `.app` 或目录包，本机运行，不做签名公证。
- Windows：输出 `.exe`，后续在 Windows 实机验收。

打包配置放在 `packaging/`，避免和运行时代码混在一起。

## 验收标准

第一阶段通过条件：

- `python -m yuzai_pet` 可以启动。
- macOS 桌面能看到透明背景、始终置顶的鱼仔。
- 可用鼠标拖拽鱼仔。
- 右键菜单可退出。
- 鼠标靠近有明显反应。
- 运行时不依赖 Electron、PixiJS、Node 构建或旧视频生成脚本。
- 项目目录清理后仍保留原始参考素材。

## 风险

- PySide6 在 macOS 和 Windows 的透明窗口、置顶和鼠标穿透表现可能有差异，需要分别验证。
- 如果素材仍来自视频切帧，动作质量仍会受素材影响；因此第一阶段只做少量动作，不追求完整状态库。
- 删除旧文件前必须使用清单确认，避免误删原始素材。
