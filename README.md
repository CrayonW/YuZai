# 鱼仔桌面宠物 YuZai Desktop Pet

鱼仔是一个本地运行的 Electron 桌面宠物项目。当前第一版目标是：桌面上能看到一只由 `assets/origin` 源视频重建而来的猫，透明置顶显示，能播放序列帧动画，能弹气泡提醒，并能对鼠标靠近做出可见反应。

项目文档默认使用中文。后续新增动作、删除旧素材、覆盖运行帧之前，必须先列出清单给用户确认。

## 当前可运行状态

开发运行：

```bash
npm run dev
```

常用验证：

```bash
npm run validate:runtime-animations
npm run validate:animation-smoothness
npm run validate:animation-director
npm run typecheck
npm run build
```

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

## 已实现的 MVP 能力

- Electron 透明、无边框、置顶桌面宠物窗口。
- 运行时播放 `assets/runtime/animations` 中的透明 PNG 序列帧。
- 当前运行帧来自 `assets/origin` 中已有鱼仔源视频，源视频水印区域在运行帧中透明化。
- 默认待机、备用待机、摇尾、走路、镜像左走、前肢抬起动作已接入 manifest。
- `AnimationDirector` 按 `daily / interactive / transition` 分类调度动作，交互动作结束后回到日常动作。
- 定时气泡提醒喝水、休息。
- 右键菜单支持隐藏、显示、重置位置、角色大小、动作频率和退出。
- 主进程全局鼠标靠近检测通过 `mouse:proximity` 触发渲染进程动作，当前可见反馈为 `paw_raise` 抬爪。
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

当前每个接入动作使用 24 fps、72 帧、512x512 透明 PNG。

| 运行时 action | 分类 | 来源 | 状态 |
| --- | --- | --- | --- |
| `idle_primary` | `daily` | `assets/origin/鱼仔待机动作1.mp4` | 已接入 |
| `idle_secondary` | `daily` | `assets/origin/鱼仔待机动作2.mp4` | 已接入 |
| `tail_wag` | `daily` | `assets/origin/鱼仔晃动尾巴视频.mp4` | 已接入 |
| `walk` | `daily` | `assets/origin/鱼仔走路视频.mp4` | 已接入 |
| `walk_left` | `daily` | 从 `walk` 镜像生成 | 已接入 |
| `paw_raise` | `interactive` | `assets/origin/鱼仔前肢抬起视频.mp4` | 已接入 |

状态机仍保留更多语义状态，例如 `sleepy`、`sleeping`、`waking`、`surprised`、`shy`、`dragging`、`waving`、`teaser`。但完整 13 状态尚未全部拥有独立真实源视频动作，缺失状态当前会映射到已批准动作或待后续补齐。

## 素材生产流程

当前权威流程：

```text
assets/origin/*.mp4
  -> npm run animations:build-from-origin
  -> assets/runtime/animations/<action>/frames/*.png
  -> assets/runtime/animations/manifest.json
  -> Electron 桌面窗口验收
```

接入新视频前先给用户确认清单，至少包含：

- 本次处理的源视频文件。
- 目标 action 名称和分类。
- 会生成、删除或覆盖的路径。
- 是否会修改 manifest。
- 验证命令和桌面验收方式。

接入后必须更新：

```text
docs/animation-production-log.md
```

## 可灵 AI 视频生成

提示词文档：

```text
docs/cat-video-prompt-guide.md
docs/kling-action-generation-plan.json
```

本地 CLI：

```bash
npm run kling:auth-check
npm run kling:generate -- --dry-run --action idle_primary
npm run kling:generate -- --action idle_primary
```

当前联调记录在：

```text
docs/kling-integration.md
```

截至 2026-06-14，本地请求能到达可灵 API，但当前密钥返回 `401 / Auth failed`。判断是 Secret Key 不匹配、已失效或没有开放平台 API 权限。密钥问题解决前，不要声称项目已经能真实批量生成可灵视频。

## 重要文档入口

- `docs/requirements-mvp.md`：第一版 MVP 需求和验收记录。
- `docs/animation-adapter.md`：动画资源接入规范。
- `docs/animation-production-log.md`：每次素材处理、验证和决定。
- `docs/animation-upgrade-plan.md`：从旧生成素材流程切换到源视频序列帧流程的执行计划。
- `docs/cat-video-prompt-guide.md`：后续生成日常动作、交互动作和过渡动作的视频提示词。
- `docs/kling-integration.md`：可灵 AI 接入说明和鉴权状态。

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
  runtime/animations/  当前 Electron 运行时使用的透明序列帧

scripts/
  build-runtime-animations-from-origin.mjs
  validate-runtime-animations.mjs
  validate-animation-smoothness.mjs
  validate-animation-director.mjs
  kling/
```

## 后续重点

- 补齐 13 状态对应的真实源视频，并统一优化身份、构图、帧率、透明边缘和安全切换帧。
- 增加多帧截图或录屏验收，继续检查日常动作和交互动作的起止衔接是否足够平滑。
- 当前 PNG 序列帧体积较大，后续可评估 WebP 或图集方案。
- 可灵 API 密钥恢复可用后，继续用 CLI 生成新动作视频，但生成结果必须先人工验收再接入运行时。
- 增加托盘入口和打包配置，输出 macOS dmg / Windows exe。

## 不建议随意改动

- 不要把 `assets/origin` 源视频当成运行时素材直接播放。
- 不要把旧 `assets/sprites` / 16 帧派生流程作为当前验收标准。
- 不要把带水印、文字、logo 的源视频像素直接进入运行输出。
- 不要在没有用户确认清单的情况下删除、覆盖或重新生成动作素材。
- 不要提交 `.env.local` 或任何可灵密钥。
