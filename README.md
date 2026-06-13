# 鱼仔桌面宠物 YuZai Desktop Pet

鱼仔是一个本地运行的 Electron 桌面宠物项目。当前版本已经从早期 Canvas 占位绘制升级为真实猫咪 PNG 序列帧渲染，支持透明置顶窗口、状态机、自主行为、鼠标交互和右键菜单。

## 当前状态

项目目前可以正常开发运行：

```bash
npm run dev
```

常用检查命令：

```bash
npm run typecheck
npm run validate:sprites
npm run audit:sprites
npm run sprites:derive-states
npm run video:reference -- "<video-path>" 16
npm run sprites:idle-from-video -- "<video-path>"
npm run build
```

## 已实现功能

- Electron 透明、无边框、置顶桌面宠物窗口。
- 280x280 运行窗口，Canvas 2D 渲染 512x512 透明 PNG 精灵帧。
- 鼠标默认穿透，只在命中宠物区域时启用交互。
- 左键点击、连续点击、长按拖拽、鼠标经过逗猫棒互动。
- 右键菜单：隐藏宠物、显示宠物、重置位置、动作频率、退出程序。
- 自动行为：待机、走动、挥手、逗猫棒、惊讶、害羞、犯困、入睡、熟睡，互动后回到 idle。
- 桌面边缘回弹，走到边缘后自动反向。
- 启动前预加载并解码所有精灵帧，运行时保持 `requestAnimationFrame` 渲染，避免动画频闪。
- 状态切换时从动作第一帧播放，未解码帧会保留上一张真实帧，不会闪回占位图。
- 运行时对相邻序列帧做轻量叠化，降低 16 帧素材在小窗口中的硬切跳动。

## 猫咪身份锁定

当前素材基于用户提供的真实猫咪照片与确认过的动作参考图制作。身份特征记录在：

```text
assets/references/cat-identity-lock.json
```

核心约束：

- 灰白双色猫，灰色头部、耳朵、背部、侧身和尾巴。
- 白色鼻梁、口鼻、胸腹和四肢。
- 金黄色/琥珀色眼睛。
- 深灰色粗尾巴，尾尖圆润，常呈弯曲形态。
- 英短感圆脸、短鼻、圆润厚实身形、短腿、圆爪。
- 后续新增外观修正必须写入身份锁定文件，并作为硬性约束。

## 状态机与动作资源

当前状态类型定义在：

```text
src/core/fsm/state-types.ts
```

已覆盖 13 个状态/动作：

- `idle`
- `walk`
- `walk_left`
- `walking`
- `sleep`
- `sleepy`
- `sleeping`
- `waking`
- `surprised`
- `shy`
- `dragging`
- `waving`
- `teaser`

运行素材目录在：

```text
assets/sprites/
```

每个动作目录包含 16 张透明 PNG，命名格式为：

```text
<action>/<action>_0001.png
<action>/<action>_0002.png
...
<action>/<action>_0016.png
```

当前动作目录：

- `idle`
- `walk`
- `walk_left`
- `walking`
- `sleep`
- `sleepy`
- `sleeping`
- `waking`
- `surprised`
- `shy`
- `dragging`
- `waving`
- `teaser`

注意：

- `walk` 是向右走。
- `walk_left` 必须由 `walk` 水平镜像生成，不能倒序播放。
- `walking` 是运行时别名目录，当前内容来自 `walk`。
- `sleeping` 使用睡眠序列，当前内容来自 `sleep`。
- `teaser` 是鼠标经过时的逗猫棒互动，猫咪身体大小应保持稳定。

## 代码结构

```text
electron/
  main.ts              Electron 主进程、窗口、右键菜单、IPC
  preload.ts           Renderer 可用的安全 IPC API

src/core/
  animation/           状态过渡时长
  behavior/            自主行为、交互、边缘回弹
  config/              默认时序和移动配置
  fsm/                 状态类型、优先级、状态机
  render/              Canvas 渲染、精灵加载、占位绘制 fallback

src/renderer/
  index.html           渲染入口页面
  main.ts              主循环、窗口移动、渲染调度
  styles.css           透明窗口页面样式

assets/
  sprites/             正式运行 PNG 序列帧
  references/          身份锁定、参考预览、制作中间产物

scripts/
  slice-reference-sheets.mjs
  prepare-runtime-sprite-aliases.mjs
  validate-cat-sprites.mjs
```

## 素材维护流程

从参考动作图重新切帧：

```bash
npm run sprites:from-sheets
```

生成运行时别名目录：

```bash
npm run sprites:aliases
```

校验素材：

```bash
npm run validate:sprites
```

审计动作重复与预览所有运行帧：

```bash
npm run audit:sprites
```

审计报告和总预览图会输出到：

```text
assets/references/cat-sprite-preview/runtime-action-audit.json
assets/references/cat-sprite-preview/runtime-all-actions.png
```

从参考视频抽帧：

```bash
npm run video:reference -- "<video-path>" 16
```

抽帧结果会输出到：

```text
assets/references/video-reference/reference-video-metadata.json
assets/references/video-reference/reference-video-contact-sheet.png
assets/references/video-reference/frame_0001.png
```

每个状态的目标动作 brief 在：

```text
assets/config/action-briefs.json
```

从黑底视频生成 idle 候选帧：

```bash
npm run sprites:idle-from-video -- "<video-path>"
```

默认输出到 `assets/references/video-reference/idle-candidate/`。黑底视频压缩噪声和水印可能导致抠图不干净，只有人工确认候选帧合格后，才使用 `-- --apply` 覆盖运行素材。

从现有确认素材派生非重复状态帧：

```bash
npm run sprites:derive-states
```

该命令会备份旧状态到 `assets/references/cat-sprite-backups/before-derived-states/`，然后生成 `sleepy`、`sleeping`、`waking`、`surprised`、`shy`、`dragging`、`waving` 等状态的临时派生帧。它用于消除像素级重复，不代表最终美术质量。

校验内容包括：

- 每个必需动作目录存在。
- 每个目录正好 16 张 PNG。
- 每张图为 512x512。
- 每张图包含 alpha 透明通道。
- 主体不贴边、不出画、不裁切。
- `walk_left` 与 `walk` 为精确水平镜像。
- `sleep` 有轻微呼吸变化。

`teaser` 因为逗猫棒会移动，整体透明边界会变化；校验脚本会提示人工确认猫咪身体比例是否稳定。

## 已知取舍

- `sleepy`、`sleeping`、`waking`、`surprised`、`shy`、`dragging`、`waving` 当前已经不再与基础状态像素级重复，但仍是由现有素材做缩放、位移、旋转、选帧组合得到的派生草稿。
- `walk` 和 `walking` 当前仍像素级重复，这是运行兼容用的别名；实际左右移动使用 `walk` 和 `walk_left`。
- `placeholder-yuzai.ts` 仍保留为 fallback：当资源加载异常时用于兜底，不作为正常运行视觉。
- `assets/references/cat-sprite-work/` 是制作中间产物，可用于追溯切帧和抠图过程。

## 后续待办

- 为全部 13 个动作目录生成独立、真实、流畅的动作序列，避免状态间像素级重复。
- 优先重做 `waking`、`shy`、`dragging`、`surprised`、`waving`、`sleepy`、`sleeping`，这些是当前观感最单一的状态。
- 已找到的参考视频更适合作为真实静坐/idle 风格参考；若要完整重做 13 状态，还需要更多动作参考或明确允许按 `assets/config/action-briefs.json` 设计补全。
- 基于参考视频拆解猫咪动作节奏：起势、主动作、回弹、呼吸/尾巴/耳朵细节、循环首尾衔接。
- 每个动作保持 16 帧、512x512、透明背景、主体比例稳定；必要时可先生成动作草稿预览，确认后再替换运行素材。
- 增加可视化调试页：预览所有状态、FPS、当前帧号、命中区域和状态切换日志。
- 增加状态机单元测试，覆盖优先级、锁定时间、睡眠唤醒和 hover teaser 回退逻辑。
- 增加渲染层测试或截图检查，验证透明背景、无占位闪帧、状态切换首帧播放。
- 将动作时长、FPS、移动速度、窗口大小整理到配置文件中，减少硬编码。
- 优化拖拽状态：拖拽时使用更贴合的提起/晃动动作，而不是 idle 别名。
- 优化睡眠链路：`sleepy -> sleeping -> waking` 增加更自然的过渡帧。
- 增加托盘图标与菜单入口，支持隐藏后从托盘恢复。
- 增加打包配置，输出 macOS dmg 和 Windows exe。
- 未来可扩展天气、日程、低电量、保存成功等系统/应用联动动作。

## 不建议随意改动

- 不要直接手改 `walk_left` 帧；应从 `walk` 镜像生成。
- 不要在最终运行素材中使用 alpha 混合补帧，容易造成透明边缘重影。
- 不要让素材贴边或裁切；透明 PNG 必须保持宠物居中且比例一致。
- 不要在未更新 `cat-identity-lock.json` 的情况下改变猫咪花色、眼睛颜色、尾巴颜色或体型。
