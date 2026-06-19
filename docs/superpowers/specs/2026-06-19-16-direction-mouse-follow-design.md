# 16 方向鼠标跟随与相似帧衔接设计

日期：2026-06-19

## 背景

当前桌宠已经使用视频转序列帧播放真实猫咪动作，但用户反馈动作衔接太生硬，并明确选择“通过 16 方向视频素材实现猫咪头和眼睛 360 度跟随鼠标位置”。本设计只定义方案、素材契约、运行时接入方式和验证门禁；在用户确认处理清单前，不生成视频、不抽帧、不覆盖 runtime、不修改正式 manifest 动作。

## 目标

1. 鼠标靠近桌宠时，猫咪可以根据鼠标相对桌宠中心的角度切换到 16 个方向的真实视频动作。
2. 每个方向动作使用独立可灵视频素材，表现为猫咪头部和眼睛自然看向目标方向，身体保持稳定。
3. 新方向素材按长视频标准生成，避免当前 3-5 秒动作过短导致重复感强。
4. 切换方向和退出跟随模式时，使用帧相似度自动锚点降低硬切。
5. 所有新增素材仍走项目 runtime-intake 门禁：生成前清单、人工审查、去水印、抽帧、manifest 更新、桌面多帧验收。

## 非目标

- 不用 Canvas 旋转整只猫来假装 360 度跟随。
- 不把 16 个方向动作直接写入 `assets/runtime/animations/manifest.json`。
- 不在没有视频、审查图和批准文件时创建正式 runtime-intake 波次。
- 不把帧相似度报告当成最终视觉验收，仍需要桌面截图或录屏确认。

## 16 方向动作清单

方向以桌宠中心到鼠标位置的屏幕角度划分，每个扇区 22.5 度。动作命名使用 `look_` 前缀，全部属于 `interactive`，预期可循环播放。

| action | 方向角度中心 | 鼠标方向语义 | 预期输出 |
| --- | ---: | --- | --- |
| `look_e` | 0° | 正右 | `assets/origin/generated/kling/look_e.mp4` |
| `look_ene` | 22.5° | 右上偏右 | `assets/origin/generated/kling/look_ene.mp4` |
| `look_ne` | 45° | 右上 | `assets/origin/generated/kling/look_ne.mp4` |
| `look_nne` | 67.5° | 上方偏右 | `assets/origin/generated/kling/look_nne.mp4` |
| `look_n` | 90° | 正上 | `assets/origin/generated/kling/look_n.mp4` |
| `look_nnw` | 112.5° | 上方偏左 | `assets/origin/generated/kling/look_nnw.mp4` |
| `look_nw` | 135° | 左上 | `assets/origin/generated/kling/look_nw.mp4` |
| `look_wnw` | 157.5° | 左上偏左 | `assets/origin/generated/kling/look_wnw.mp4` |
| `look_w` | 180° | 正左 | `assets/origin/generated/kling/look_w.mp4` |
| `look_wsw` | 202.5° | 左下偏左 | `assets/origin/generated/kling/look_wsw.mp4` |
| `look_sw` | 225° | 左下 | `assets/origin/generated/kling/look_sw.mp4` |
| `look_ssw` | 247.5° | 下方偏左 | `assets/origin/generated/kling/look_ssw.mp4` |
| `look_s` | 270° | 正下 | `assets/origin/generated/kling/look_s.mp4` |
| `look_sse` | 292.5° | 下方偏右 | `assets/origin/generated/kling/look_sse.mp4` |
| `look_se` | 315° | 右下 | `assets/origin/generated/kling/look_se.mp4` |
| `look_ese` | 337.5° | 右下偏右 | `assets/origin/generated/kling/look_ese.mp4` |

## 长视频素材契约

16 方向跟随动作需要比当前交互动作更长，避免鼠标停留时频繁重复。

- 方向跟随动作目标时长：8 秒。
- 目标 FPS：24。
- runtime 帧数目标：192 帧。
- `loop: true`，开始和结束姿势必须尽量一致。
- 猫咪身体位置稳定，主要移动部位是头部、眼睛、耳朵和少量呼吸。
- 猫咪全身入镜，耳朵、尾巴、脚掌不得被裁切。
- 背景必须为纯绿色绿幕。
- 不得出现文字、水印、logo、人、手、玩具、家具或额外物体。
- 每个方向必须保持同一只猫的脸型、毛色、眼睛颜色、斑纹位置和身体比例。

## 视频提示词模板

每个方向共用同一模板，只替换 `{directionName}` 和 `{directionDescription}`。

```text
使用参考图中的同一只猫作为唯一角色。生成一个桌面宠物鼠标跟随方向动作视频，竖版 4:5，固定机位，纯绿色绿幕背景。猫咪全身入镜，居中，脚底、耳朵和尾巴不要被裁切。猫咪保持稳定坐姿，身体只有轻微自然呼吸，头部和眼睛持续自然看向 {directionName}，也就是 {directionDescription}。眼神要像正在追踪用户鼠标位置，耳朵轻微朝向目标方向，动作温和、连续、可爱，适合转成透明序列帧循环播放。开始和结束姿势尽量一致，方便无缝循环。保持猫咪脸型、毛色、眼睛颜色、花纹位置、身体比例和毛发质感与参考图一致。画面中只能有这一只猫，没有人、没有道具、没有文字、没有水印、没有 logo。
```

负向提示词沿用项目当前 `defaultNegativePrompt`，并额外强调：

```text
不要让身体大幅旋转，不要跳跃，不要换镜头，不要移动机位，不要出现鼠标实体图案，不要把猫变成卡通贴纸，不要让头部转动幅度超过真实猫咪可自然完成的范围。
```

## 运行时播放逻辑

主进程继续使用 Electron `screen.getCursorScreenPoint()` 获取鼠标屏幕坐标，并在现有靠近检测基础上增加方向事件：

1. 读取桌宠窗口 `bounds`。
2. 计算桌宠中心点。
3. 用鼠标坐标减中心点得到向量。
4. 将向量角度归一化到 0-360 度。
5. 按 22.5 度扇区映射到 16 个 `look_*` action。
6. 仅在鼠标位于跟随范围内时发送方向事件。
7. 鼠标离开跟随范围时发送离开事件，渲染进程回到日常动作。

渲染进程接收方向事件后，不直接每帧强制切 action，而是经过跟随调度器：

- 当前方向未变化：继续播放当前方向循环。
- 方向变化小于一个扇区：保持当前动作，减少抖动。
- 方向变化达到一个扇区且超过最小停留时间：请求切换到新方向动作。
- 鼠标快速绕圈：节流到 8-12 FPS 的方向决策频率，避免每个浏览器帧都切序列帧。

## 帧相似度自动锚点

当前项目已有 `scripts/action-transition-risk-report.mjs` 可以计算帧差异，但它主要用于报告。后续需要新增 runtime 可用的锚点生成流程：

1. 对每个 `look_*` 动作读取首尾安全窗口，例如前 24 帧、后 24 帧。
2. 对方向动作之间的相邻扇区切换计算 RMSE 或等价帧差异。
3. 为每对常见切换生成最优 `fromFrame -> toFrame`。
4. 写入独立锚点文件，例如 `assets/runtime/animations/transition-anchors.json`。
5. `AnimationDirector` 切换 action 时优先使用锚点中的目标 entry frame。
6. 如果没有锚点，回退到 manifest 的 `entryFrames` 和 Canvas crossfade。

第一版锚点只覆盖：

- `idle_primary -> look_*`
- `look_* -> idle_primary`
- 相邻方向 `look_* -> look_*`

非相邻方向允许先走最接近的相邻方向，或直接选择最相似锚点，具体由验证结果决定。

## 接入门禁

正式接入 16 方向前必须满足：

1. 用户确认 16 方向处理前清单。
2. 可灵生成 16 个方向视频。
3. 每个视频都有审查图或抽样图。
4. 人工确认无水印、无文字、无 logo、无额外物体、猫咪身份一致。
5. 源视频通过时长、尺寸、绿幕和帧数预检。
6. 去水印/抠绿后生成 runtime 序列帧。
7. 生成相似帧锚点报告和锚点 JSON。
8. 更新 runtime manifest 和鼠标方向调度代码。
9. 通过桌面多帧截图或录屏验收，确认鼠标在 16 个方向附近移动时猫咪能明显跟随。
10. 运行 `npm run validate:all`、`npm run validate:release`。

## 分阶段实施

### 阶段 1：文档与清单

- 写入本设计。
- 更新可灵批次计划，增加 `mouse-follow-16-direction` 候选批次。
- 生成 16 方向处理前清单，供用户确认。

### 阶段 2：视频生成与审查

- 用户确认后执行可灵生成。
- 生成审查图。
- 逐个检查水印、文字、logo、额外物体、身份一致性和动作方向。

### 阶段 3：runtime 接入

- 抽帧、去水印、抠绿。
- 新增 16 个 `look_*` runtime action。
- 新增鼠标方向 IPC 事件和跟随调度器。
- 新增相似帧锚点生成脚本和验证脚本。

### 阶段 4：验收与优化

- 捕获 16 方向桌面截图序列。
- 检查方向切换是否明显、是否闪切、是否动作重复过快。
- 根据结果决定是否补 `idle_to_look_*` 和 `look_*_to_idle` 专用过渡。

## 风险

- 16 个方向视频生成成本高，且同一只猫身份一致性更难保持。
- 下方方向可能被模型理解成低头或趴下，必须在提示词中强调“坐姿稳定，只是头眼向下看”。
- 上方方向可能导致耳朵或头顶被裁切，审查时必须重点检查。
- 相邻方向视频不是同一次生成，首尾姿态可能仍有差异，因此相似帧锚点只能缓解，不能替代必要的过渡视频。

## 验证方式

设计阶段：

```bash
npm run validate:all
npm run validate:release
```

接入阶段还需要新增并运行：

```bash
npm run validate:mouse-follow-16-plan
npm run validate:transition-anchors
YUZAI_TEST_MOUSE_FOLLOW_16=1 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-mouse-follow-16.png YUZAI_CAPTURE_SEQUENCE_COUNT=16 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 npm run dev
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-mouse-follow-16.png --count 16 --min-changed-frames 10 --min-width 200 --min-height 200
```
