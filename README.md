# 鱼仔桌面宠物 YuZai Desktop Pet

鱼仔是一个本地运行的 Electron 桌面宠物项目。当前第一版目标是：桌面上能看到一只由 `assets/origin` 源视频重建而来的猫，透明置顶显示，能播放序列帧动画，能弹气泡提醒，并能对鼠标靠近做出可见反应。

后续新增动作、删除旧素材、覆盖运行帧之前，必须先列出清单给用户确认。

## 当前可运行状态

开发运行：

```bash
npm run dev
```

常用运行验证：

```bash
npm run typecheck
npm run build
YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window.png npm run dev
```

说明：仓库已清理历史执行文档和中间记录，`validate:all` / `validate:release` 中部分文档型校验不再作为当前运行验收入口。确认程序能否正常运行时，以类型检查、构建、桌宠启动截图和 runtime 资源检查为准。

可继续使用的运行相关单项验证：

```bash
npm run validate:runtime-animations
npm run validate:animation-smoothness
npm run validate:animation-director
npm run validate:daily-animation-rotator
npm run validate:runtime-behavior-schedule
npm run validate:runtime-interaction-schedule
npm run validate:drag-visual-feedback
npm run validate:canvas-transition-smoothing
npm run validate:manifest-contract
npm run validate:manifest-contract:current
npm run validate:capture-plan
npm run validate:capture-sequence-inspector
npm run typecheck
npm run build
```

本机应用包验证：

```bash
npm run package:dir
npm run validate:package
```

正式安装包入口：

```bash
npm run package:mac
npm run package:win
```

打包产物输出到 `release/`，该目录不会提交到 Git。当前打包内容只包含运行所需的 `dist/electron`、`dist/renderer` 和 `dist/assets/runtime`，不会把 `assets/origin` 源视频打进应用包。
`validate:package` 会重新生成本机应用包，并检查 `app.asar` 包含运行入口和 runtime 动画资源、没有打入源视频或可灵生成素材，同时确认应用图标资源存在。

桌面截图验收示例：

```bash
YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window.png npm run dev
```

鼠标靠近自动验收示例：

```bash
YUZAI_TEST_MOUSE_PROXIMITY_MS=500 \
YUZAI_CAPTURE_DELAY_MS=2000 \
YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-proximity-paw-raise.png \
npm run dev
```

多帧动画验收示例：

```bash
YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png \
YUZAI_CAPTURE_SEQUENCE_COUNT=6 \
YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 \
YUZAI_CAPTURE_DELAY_MS=900 \
npm run dev
```

该命令会输出 `/private/tmp/yuzai-window-animation-001.png` 到 `-006.png`，用于连续检查桌宠动作是否有空白帧、闪烁、明显卡顿或切换姿势是否突兀。

捕获后可以运行自动检查：

```bash
npm run capture:inspect -- \
  --sequence-path /private/tmp/yuzai-window-animation.png \
  --count 6 \
  --min-changed-frames 2 \
  --min-width 200 \
  --min-height 200
```

检查器会确认连续帧是否存在、非空、是有效 PNG、尺寸不低于阈值，并用文件哈希确认至少有指定数量的不同帧。它不能替代肉眼检查动作美感，但能快速发现漏帧、空帧、坏图、异常尺寸和完全不动的问题。

## 已实现的 MVP 能力

- Electron 透明、无边框、置顶桌面宠物窗口。
- 运行时播放 `assets/runtime/animations` 中的透明 PNG 序列帧。
- 当前运行帧来自已接入的透明 PNG 序列帧；中间生成视频和历史执行文档已清理。
- 当前 manifest 已启用 22 个动作，其中 16 个来自可灵生成动作；13 个桌宠语义状态均已有独立动作映射。
- `AnimationDirector` 按 `daily / interactive / transition` 分类调度动作，交互动作结束后回到日常动作。
- manifest 合约验证会检查 13 个状态映射、动作分类、切换安全帧和交互回流配置，避免新增动作时破坏调度。
- idle 状态会自动插入眨眼、环顾、舔脸、趴卧呼吸、桌面嗅闻、摇尾和备用待机等日常变化，避免长期只播放默认待机。
- Canvas 渲染器已接入跨动作淡入淡出，降低日常动作与交互动作切换时的生硬闪切。
- 定时气泡提醒喝水、休息。
- 右键菜单支持隐藏、显示、重置位置、角色大小、动作频率和退出。
- 托盘菜单支持隐藏后恢复显示，并提供退出入口，避免隐藏后找不回桌宠。
- 角色大小、窗口位置、动作频率会保存到本地设置文件，重启后自动恢复。
- 主进程全局鼠标靠近检测通过 `mouse:proximity` 触发渲染进程动作，优先播放 `cursor_watch`，必要时回退到 `paw_raise`。
- 拖拽时播放 `dragging` 交互动作，并叠加更明显的拖拽手感反馈。
- 测试模式支持指定任意已启用 action 预览，便于逐个检查生成动作在桌宠窗口里的真实效果。
- 测试模式支持多帧桌面截图捕获，便于检查序列帧播放过程中的流畅度和姿势切换。
- 渲染页已配置 Content Security Policy，Electron 启动时不再出现开发安全警告。
- 已接入 electron-builder 打包配置和临时鱼仔应用图标，可生成本机应用包，并保留 macOS dmg / Windows nsis 安装包脚本入口。
- `.env.local` 可存放本地可灵密钥，已被 `.gitignore` 忽略，不能提交。

## 当前动作素材

运行时 manifest：

```text
assets/runtime/animations/manifest.json
```

运行帧目录：

```text
assets/runtime/animations/<action>/frames/frame_000001.png
```

当前运行帧统一为 24 fps、512x512 透明 PNG。原始素材动作通常为 72 帧，可灵生成动作通常为 120 帧；运行时以 manifest 中记录的帧数为准。

| 运行时 action | 分类 | 来源 | 状态 |
| --- | --- | --- | --- |
| `idle_primary` | `daily` | `assets/origin/鱼仔待机动作1.mp4` | 已接入 |
| `idle_secondary` | `daily` | `assets/origin/鱼仔待机动作2.mp4` | 已接入 |
| `tail_wag` | `daily` | `assets/origin/鱼仔晃动尾巴视频.mp4` | 已接入 |
| `walk` | `daily` | `assets/origin/鱼仔走路视频.mp4` | 已接入 |
| `walk_left` | `daily` | 从 `walk` 镜像生成 | 已接入 |
| `paw_raise` | `interactive` | `assets/origin/鱼仔前肢抬起视频.mp4` | 已接入 |
| `slow_blink` | `daily` | 已接入 runtime 序列帧 | 已接入 |
| `look_around` | `daily` | 已接入 runtime 序列帧 | 已接入 |
| `cursor_watch` | `interactive` | 已接入 runtime 序列帧 | 已接入 |
| `click_surprised` | `interactive` | 已接入 runtime 序列帧 | 已接入 |
| `poke_annoyed` | `interactive` | 已接入 runtime 序列帧 | 已接入 |
| `call_response` | `interactive` | 已接入 runtime 序列帧 | 已接入 |
| `stretch_yawn` | `daily` | 已接入 runtime 序列帧 | 已接入 |
| `groom_face_wash` | `daily` | 已接入 runtime 序列帧 | 已接入 |
| `loaf_breathing` | `daily` | 已接入 runtime 序列帧 | 已接入 |
| `desk_sniff` | `daily` | 已接入 runtime 序列帧 | 已接入 |
| `shy` | `interactive` | 已接入 runtime 序列帧 | 已接入 |
| `sleepy` | `transition` | 已接入 runtime 序列帧 | 已接入 |
| `sleep` | `transition` | 已接入 runtime 序列帧 | 已接入 |
| `sleeping` | `daily` | 已接入 runtime 序列帧 | 已接入 |
| `waking` | `transition` | 已接入 runtime 序列帧 | 已接入 |
| `dragging` | `interactive` | 已接入 runtime 序列帧 | 已接入 |

当前 13 个桌宠状态覆盖结果为：独立动作 13 个、复用混合 0 个、fallback 0 个、missing 0 个。后续新增动作优先用于提升自然度、衔接和角色一致性，而不是补基础状态缺口。

## 素材边界

当前运行流程：

```text
assets/runtime/animations/<action>/frames/*.png
  -> assets/runtime/animations/manifest.json
  -> Electron 桌宠窗口播放
```

`assets/origin` 保留用户提供的原始素材视频和参考图，不作为运行时直接播放来源。中间生成视频、历史执行文档和批次记录已清理；后续如果重新生成或接入动作，应先列清单确认：

- 本次处理的源视频文件。
- 目标 action 名称和分类。
- 会生成、删除或覆盖的路径。
- 是否会修改 manifest。
- 验证命令和桌面验收方式。

## 代码结构

```text
electron/
  main.ts              Electron 主进程、窗口、右键菜单、全局鼠标靠近检测
  preload.ts           Renderer 可用的安全 IPC API

src/core/
  behavior/            自主行为、交互、边缘回弹、气泡提醒
  fsm/                 状态类型、优先级、状态机
  render/              manifest 加载、序列帧资源、动画调度、Canvas 渲染

src/renderer/
  index.html           渲染入口页面
  main.ts              主循环、窗口移动、渲染调度
  styles.css           透明窗口页面样式

assets/
  origin/              用户提供或 AI 生成后待验收的源视频和参考图
  reviews/runtime/     桌宠窗口截图、动作预览和衔接验证证据
  runtime/animations/  当前 Electron 运行时使用的透明序列帧

scripts/
  build-runtime-animations-from-origin.mjs
  validate-runtime-animations.mjs
  validate-animation-smoothness.mjs
  validate-animation-director.mjs
  kling/
```

## 后续重点

- 保持 13 状态独立动作覆盖稳定，后续重点转向身份一致性、构图、帧率、透明边缘和动作起止帧自然度。
- 继续增加多帧截图或录屏验收，重点检查日常动作和交互动作的起止衔接是否足够平滑。
- 对仍然生硬的动作单独补 `transitionIn` / `transitionOut` 或生成专用过渡动作，而不是直接硬切。
- 当前 PNG 序列帧体积较大，后续可评估 WebP 或图集方案。
- 继续用可灵 CLI 生成新动作视频，但生成结果必须先人工验收再接入运行时。
- 优化正式图标、签名和公证配置，再输出面向分发的 macOS dmg / Windows exe。

## 不建议随意改动

- 不要把 `assets/origin` 源视频当成运行时素材直接播放。
- 不要把旧 `assets/sprites` / 16 帧派生流程作为当前验收标准。
- 不要把带水印、文字、logo 的源视频像素直接进入运行输出。
- 不要在没有用户确认清单的情况下删除、覆盖或重新生成动作素材。
- 不要提交 `.env.local` 或任何可灵密钥。
