# 动画制作日志

本文档记录每次动画制作、验证和清理过程。每个加入 `assets/origin` 的源视频，在对应帧被接入运行时前，都必须在这里留下记录。

## 当前源素材清单

| 源文件 | 目标动作 | 状态 | 备注 |
| --- | --- | --- | --- |
| `assets/origin/鱼仔待机动作1.mp4` | `idle_primary` | 已接入第一版 | 默认待机循环。 |
| `assets/origin/鱼仔待机动作2.mp4` | `idle_secondary` | 已接入第一版 | 备用待机循环。 |
| `assets/origin/鱼仔晃动尾巴视频.mp4` | `tail_wag` | 已接入第一版 | 空闲变化动作。 |
| `assets/origin/鱼仔走路视频.mp4` | `walk` | 已接入第一版 | 走路动作，`walk_left` 从它镜像生成。 |
| `assets/origin/鱼仔前肢抬起视频.mp4` | `paw_raise` | 已接入第一版 | 鼠标靠近、招手或前肢反应动作。 |
| `assets/origin/鱼仔参考图.png` | 身份参考 | 待处理 | 重建干净帧时用于保持鱼仔身份一致。 |

## 记录模板

```text
日期：
源文件：
目标动作：
参考片段：
帧数：
FPS：
循环方式：
水印处理：
重建方法：
运行时输出：
验证命令：
桌面验收：
已知问题：
决定：
```

## 接受规则

- 原始源视频必须保留在 `assets/origin`。
- 运行帧必须是干净重建的透明帧，不能直接使用源视频像素。
- 水印像素不能出现在运行输出中。
- 每个被接受的动作都必须写入运行时 manifest。
- 每个被接受的动作都必须在 Electron 桌面窗口中检查。
- 被拒绝的产物不能进入运行时路径。
- 开始任何生成、删除、覆盖动作前，必须先把清单发给用户确认。

## 2026-06-13 第一阶段设置

日期：2026-06-13
源文件：`assets/origin`
目标动作：`idle_primary`、`idle_secondary`、`tail_wag`、`walk`
参考片段：抽帧时再检查完整源视频。
帧数：manifest 初始为禁用状态，`frameCount: 0`；只有干净重建帧存在后才启用对应动作。
FPS：初始目标为 30 fps。
循环方式：`idle_primary`、`idle_secondary`、`walk` 循环；`tail_wag` 作为短空闲变化动作播放。
水印处理：源视频只作为参考。运行帧必须干净重建，不能包含水印像素。
重建方法：基于源视频动作和 `鱼仔参考图.png` 身份参考，重建透明序列帧。
运行时输出：`assets/runtime/animations/<action>/frames/frame_000001.png`。
验证命令：`npm run validate:runtime-animations`、`npm run typecheck`、`npm run build`。
桌面验收：需要在运行帧生成后执行。
已知问题：运行动作仍处于禁用状态，直到重建帧目录存在。
决定：先推进 manifest 驱动的第一阶段实现，再生成最终运行帧。

## 2026-06-13 桌面烟雾测试

日期：2026-06-13
源文件：`assets/runtime/animations/manifest.json`
目标动作：第一阶段 manifest 加载器 fallback
参考片段：尚未生成重建运行帧。
帧数：启用动作仍为 `frameCount: 0`。
FPS：manifest 为后续重建动作保留 30 fps 目标。
循环方式：第一阶段动作禁用时显示占位兜底渲染。
水印处理：本次测试没有渲染任何源视频像素。
重建方法：尚未开始；本次只验证 manifest 驱动运行壳。
运行时输出：Electron 透明桌面窗口截图 `/private/tmp/yuzai-window-phase1.png`。
验证命令：`npm run validate:runtime-animations`、`npm run typecheck`、`npm run build`、`YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-phase1.png npm run dev`。
桌面验收：Electron 成功启动并捕获非空 560x560 RGBA 窗口。可见桌宠是占位兜底渲染，不是原始视频重建动作。
已知问题：Electron 打印开发环境 CSP 警告；该问题与动画 manifest 流程无关，应在单独安全/配置任务中处理。
决定：manifest 驱动加载器和占位兜底渲染阶段的桌面烟雾测试通过。不能将此结果表述为“已用原始素材实现动作”。

## 2026-06-14 旧资产清理

日期：2026-06-14
源文件：`npm run list:animation-cleanup` 输出的旧生成动画目录
目标动作：为第一阶段源视频工作流清理旧产物
参考片段：不适用。
帧数：删除了未跟踪旧帧目录；没有删除运行时 manifest 帧。
FPS：不适用。
循环方式：不适用。
水印处理：删除旧生成/参考输出；保留 `assets/origin` 中的全部原始视频和身份图。
重建方法：不适用，本次仅清理。
运行时输出：保留 `assets/runtime/animations/.gitkeep` 和 `assets/runtime/animations/manifest.json`。
验证命令：`npm run list:animation-cleanup`、`npm run validate:runtime-animations`、`npm run typecheck`、`npm run build`。
桌面验收：清理后未重复执行桌面验收，因为没有删除任何已启用运行帧，manifest 仍处于禁用动作和占位兜底渲染状态。
已知问题：清理候选为未跟踪目录，删除本身没有 git diff；本日志记录已批准的清理结果。
决定：已完成批准的清理。`npm run list:animation-cleanup` 现在返回空 `candidates` 列表。

## 2026-06-14 源视频序列帧 MVP 第一版

日期：2026-06-14
源文件：`assets/origin/鱼仔待机动作1.mp4`、`assets/origin/鱼仔待机动作2.mp4`、`assets/origin/鱼仔晃动尾巴视频.mp4`、`assets/origin/鱼仔走路视频.mp4`、`assets/origin/鱼仔前肢抬起视频.mp4`
目标动作：`idle_primary`、`idle_secondary`、`tail_wag`、`walk`、`walk_left`、`paw_raise`
参考片段：每个源视频取前 2 秒，按 12 fps 生成 24 帧。
帧数：每个 action 24 帧。
FPS：12 fps。
循环方式：`idle_primary`、`idle_secondary`、`walk`、`walk_left` 循环；`tail_wag`、`paw_raise` 作为可打断短动作。
水印处理：源视频右下角水印区域在 512x512 输出中设置为透明 alpha；绿幕背景通过 chromakey 转透明。
重建方法：执行 `npm run animations:build-from-origin`，由 ffmpeg 抽帧、抠绿、缩放和补透明画布，再由 ImageMagick 清除水印区域；`walk_left` 从 `walk` 镜像生成。
运行时输出：`assets/runtime/animations/<action>/frames/frame_000001.png` 到 `frame_000024.png`。
验证命令：`npm run animations:build-from-origin`、`npm run validate:runtime-animations`、`npm run typecheck`、`npm run build`、`YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-source-mvp.png npm run dev`。
桌面验收：Electron 透明桌面窗口成功截图到 `/private/tmp/yuzai-window-source-mvp.png`，截图尺寸为 560x560，内容为源素材序列帧猫，不是占位兜底渲染。
已知问题：当前只是第一版 MVP 运行帧，猫边缘仍有轻微绿幕残边；动作节奏、抠像质量和 13 状态统一设计留到全部素材补齐后处理。
决定：第一版接受为“桌面上能看到一只会动的猫”的 MVP 基线。后续新增动作视频继续按本轮 `assets/origin` 到 `assets/runtime/animations` 的方式处理。

## 2026-06-14 动作流畅度修复

日期：2026-06-14
源文件：`assets/origin/鱼仔待机动作1.mp4`、`assets/origin/鱼仔待机动作2.mp4`、`assets/origin/鱼仔晃动尾巴视频.mp4`、`assets/origin/鱼仔走路视频.mp4`、`assets/origin/鱼仔前肢抬起视频.mp4`
目标动作：`idle_primary`、`idle_secondary`、`tail_wag`、`walk`、`walk_left`、`paw_raise`
问题：第一版运行帧只有 12 fps、24 帧，而源视频为 24 fps、141 帧，导致桌面动作明显不流畅。
参考片段：每个源视频取前 3 秒，按 24 fps 生成 72 帧。
帧数：每个 action 72 帧；运行时总帧数 432 帧。
FPS：24 fps。
循环方式：保持原有 manifest 语义不变。
水印处理：沿用右下角透明化和绿幕 chromakey 流程。
重建方法：将 `scripts/build-runtime-animations-from-origin.mjs` 的输出参数提升到 24 fps、72 帧，并新增 `npm run validate:animation-smoothness` 防止回退。
运行时输出：`assets/runtime/animations/<action>/frames/frame_000001.png` 到 `frame_000072.png`。
验证命令：`npm run validate:animation-smoothness`、`npm run validate:runtime-animations`、`npm run typecheck`、`npm run build`、`YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-smoothness-fix.png npm run dev`。
桌面验收：Electron 透明桌面窗口成功截图到 `/private/tmp/yuzai-window-smoothness-fix.png`，72 帧资源能被运行时加载；另生成本地预览 `/private/tmp/yuzai-idle-24fps-preview.mp4` 用于查看待机序列帧流畅度。
已知问题：PNG 序列帧目录从约 38MB 增长到约 120MB。后续如需降低仓库体积，可以切换到 WebP 或图集。
决定：接受 24 fps、72 帧作为 MVP 流畅度基线；后续新增动作视频按该标准处理。

## 2026-06-14 序列帧动作调度器接入

日期：2026-06-14
源文件：`assets/runtime/animations/manifest.json`
目标动作：`idle_primary`、`idle_secondary`、`tail_wag`、`walk`、`walk_left`、`paw_raise`
问题：原运行时直接由 FSM 状态映射 action，交互触发时容易从第 1 帧硬切，且缺少日常/交互动作分类。
参考片段：沿用当前 24 fps、72 帧运行时序列帧。
帧数：每个 action 72 帧。
FPS：24 fps。
循环方式：`daily` 动作循环；`interactive` 动作一次性播放后按 `returnTo` 回到日常动作。
水印处理：不变。
重建方法：本次未重建帧，新增 `AnimationDirector` 和 manifest 调度字段。
运行时输出：Electron 桌面窗口截图 `/private/tmp/yuzai-window-director.png`。
验证命令：`npm run validate:animation-director`、`npm run validate:runtime-animations`、`npm run validate:animation-smoothness`、`npm run typecheck`、`npm run build`、`YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-director.png npm run dev`。
桌面验收：Electron 透明桌面窗口成功截图，显示源素材猫和提醒气泡。
已知问题：安全帧仍为手工默认标注，后续 13 状态素材齐全后需要逐动作微调 `entryFrames` 和 `exitFrames`。
决定：接受 `AnimationDirector` 作为后续 daily / interactive / transition 分类播放的运行时基础。

## 2026-06-14 交互回切边界修复

日期：2026-06-14
源文件：`src/core/render/animation-director.ts`
目标动作：`idle_primary`、`paw_raise`
问题：交互动作播放期间如果 FSM 提前回到 idle，会留下一个过期的 daily pending 请求，交互结束后可能再次重置日常动作时间轴。
参考片段：不涉及帧重建。
帧数：不变。
FPS：不变。
循环方式：不变。
水印处理：不变。
重建方法：新增验证场景，确认 locked 交互不会被 stale daily request 打断，且回到 daily 后不会重置时间轴。
运行时输出：不涉及新截图。
验证命令：`npm run validate:animation-director`、`npm run typecheck`、`npm run build`。
桌面验收：本次为调度器边界修复，使用自动验证覆盖。
已知问题：仍需要后续用真实鼠标靠近录屏验证视觉衔接。
决定：修复 stale pending request，交互自动回日常时清理过期请求。

## 2026-06-14 全局鼠标靠近触发

日期：2026-06-14
源文件：`electron/main.ts`、`electron/preload.ts`、`src/core/behavior/interaction-controller.ts`
目标动作：`paw_raise`
问题：原鼠标靠近主要依赖透明窗口内的 mousemove，桌面穿透窗口场景下不够可靠。
参考片段：不涉及帧重建。
帧数：不变。
FPS：不变。
循环方式：不变。
水印处理：不变。
重建方法：主进程每 120ms 读取全局鼠标坐标和桌宠窗口 bounds，进入窗口周边距离后通过 `mouse:proximity` 通知 renderer，由 InteractionController 触发 teaser/paw_raise。
运行时输出：Electron 桌面窗口截图 `/private/tmp/yuzai-window-proximity.png`。
验证命令：`npm run typecheck`、`npm run build`、`npm run validate:animation-director`、`YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-proximity.png npm run dev`。
桌面验收：Electron 透明桌面窗口成功截图，显示源素材猫和提醒气泡。
已知问题：截图只能证明窗口正常渲染；真实靠近动作还需要后续用人工移动鼠标或录屏确认视觉触发。
决定：接受全局鼠标靠近检测作为桌面宠物交互触发基础。

## 2026-06-14 鼠标靠近自动验收补充

日期：2026-06-14
源文件：`assets/runtime/animations/paw_raise/frames`
目标动作：`paw_raise`
问题：第一次自动截图只发出一次 `mouse:proximity true`，随后真实鼠标位置轮询立即发出 `false`，导致交互被取消，截图仍停留在待机动作。
参考片段：`paw_raise` 第 36 帧附近为明显抬爪姿态。
帧数：不变，每个 action 72 帧。
FPS：不变，24 fps。
循环方式：`paw_raise` 仍为非循环 interactive 动作，结束后回到 `idle_primary`。
水印处理：像素检查确认运行帧为 `TrueColorAlpha`，右下水印区域和绿幕背景为透明 alpha。
重建方法：本次未重建帧；只在 Electron 测试钩子中加入 `YUZAI_TEST_MOUSE_PROXIMITY_HOLD_MS`，让自动验收时的“鼠标靠近”保持一段时间，避免被真实鼠标坐标冲掉。
运行时输出：Electron 桌面窗口截图 `/private/tmp/yuzai-window-proximity-paw-raise.png`。
验证命令：`npm run typecheck`、`npm run build`、`npm run validate:animation-director`、`YUZAI_TEST_MOUSE_PROXIMITY_MS=500 YUZAI_CAPTURE_DELAY_MS=2000 YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-proximity-paw-raise.png npm run dev`。
桌面验收：截图中可见源素材猫在透明桌面窗口中执行抬爪反馈，并同时显示提醒气泡。
已知问题：当前只验证“靠近触发可见抬爪”；后续需要用录屏或多帧截图继续检查动作起止衔接是否足够平滑。
决定：接受该自动验收命令作为鼠标靠近 MVP 的可复现验证路径。

## 2026-06-15 日常动作轮换接入

日期：2026-06-15
源文件：`assets/runtime/animations/idle_secondary/frames`、`assets/runtime/animations/tail_wag/frames`
目标动作：`idle_secondary`、`tail_wag`
问题：两个 daily 动作已经存在于 manifest，但运行时每帧都从 FSM idle 映射回 `idle_primary`，导致备用待机和摇尾动作不会自然播放。
参考片段：沿用当前 24 fps、72 帧运行时序列帧。
帧数：不变，每个 action 72 帧。
FPS：不变，24 fps。
循环方式：运行时在 idle 状态定时插入一轮 daily variation，优先播放 `tail_wag`，下一轮播放 `idle_secondary`，每轮约 3 秒后回到 `idle_primary`。
水印处理：不变。
重建方法：本次未重建帧，只在 `src/renderer/main.ts` 中接入 idle 日常动作轮换。
运行时输出：Electron 桌面窗口截图 `/private/tmp/yuzai-window-daily-variation.png`。
验证命令：`npm run typecheck`、`npm run build`、`npm run validate:runtime-animations`、`npm run validate:animation-smoothness`、`npm run validate:animation-director`、`npm run validate:daily-animation-rotator`、`YUZAI_CAPTURE_DELAY_MS=2600 YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-daily-variation.png npm run dev`。
桌面验收：截图中可见源素材猫处于摇尾姿态，不再只是默认待机。
已知问题：当前日常轮换仍是固定顺序；后续 13 状态补齐后可以根据动作分类、时间段和用户频率设置做更细的随机权重。
决定：接受 `tail_wag` 和 `idle_secondary` 作为 MVP 日常姿势变化，避免已接入素材闲置。

## 2026-06-15 多帧动画验收钩子

日期：2026-06-15
源文件：`electron/main.ts`、`electron/capture-plan.ts`
目标动作：所有运行时动作
问题：单张截图只能证明某一瞬间能渲染，无法复查序列帧播放过程中是否有空白帧、闪烁、明显卡顿或姿势切换突兀。
参考片段：不涉及帧重建。
帧数：不变，每个 action 72 帧。
FPS：不变，24 fps。
循环方式：不变。
水印处理：不变。
重建方法：本次未重建帧，新增 `YUZAI_CAPTURE_SEQUENCE_PATH`、`YUZAI_CAPTURE_SEQUENCE_COUNT`、`YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS` 测试钩子，一次启动 Electron 后按固定间隔输出连续截图。
运行时输出：Electron 桌面窗口截图 `/private/tmp/yuzai-window-animation-001.png` 到 `/private/tmp/yuzai-window-animation-006.png`。
验证命令：`npm run validate:capture-plan`、`npm run validate:capture-sequence-inspector`、`npm run validate:all`、`YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png YUZAI_CAPTURE_SEQUENCE_COUNT=6 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`、`npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-animation.png --count 6 --min-changed-frames 2 --min-width 200 --min-height 200`。
桌面验收：连续 6 张截图均成功生成且非空，首尾帧可见源素材猫和提醒气泡；自动检查确认 6 张帧文件存在、非空、是有效 PNG、尺寸为 440x440，且至少 2 张不同。
已知问题：当前多帧验收仍是截图序列，不是完整录屏；哈希检查只能发现完全相同或缺失的帧，不能替代肉眼检查动作美感。后续可以增加自动像素差分、透明背景像素占比或短视频导出，进一步量化流畅度。
决定：接受多帧截图作为后续新增动作和交互切换的可复现验收方式。

## 2026-06-15 Manifest 合约验证

日期：2026-06-15
源文件：`assets/runtime/animations/manifest.json`、`src/core/fsm/state-types.ts`
目标动作：所有运行时动作和状态映射
问题：后续会继续补齐 13 状态素材，如果新增动作或状态映射时漏配 `stateMap`、`category`、`entryFrames`、`exitFrames`、`interruptPolicy` 或非循环交互动作的 `returnTo`，运行时可能在切换动作时退回默认动作或出现不可预期的回切。
参考片段：不涉及帧重建。
帧数：不变。
FPS：不变。
循环方式：不变。
水印处理：不变。
重建方法：本次未重建帧，新增 manifest 合约检查器，从 `src/core/fsm/state-types.ts` 提取 `PetStateName` 联合类型，并验证 manifest 中 13 个状态都存在映射。
运行时输出：不涉及新截图。
验证命令：`npm run validate:manifest-contract`、`npm run validate:manifest-contract:current`、`npm run validate:release`。
桌面验收：本次为 manifest 配置质量门禁，使用自动验证覆盖。
已知问题：合约检查只能证明配置完整，不能证明每个语义状态已有独立真实视频；完整 13 状态仍需后续补齐素材。
决定：接受 manifest 合约检查作为新增动作和状态映射的必跑验证门禁。

## 2026-06-15 动作素材接入清单生成器

日期：2026-06-15
源文件：`assets/origin`、`assets/runtime/animations/manifest.json`
目标动作：所有待处理源视频
问题：用户要求后续开始动作前必须先列清单确认；此前清单主要靠人工整理，容易漏掉同一源视频影响多个 action 的情况，例如 `鱼仔走路视频.mp4` 同时影响 `walk` 和镜像派生的 `walk_left`。
参考片段：不涉及帧重建。
帧数：不变。
FPS：不变。
循环方式：不变。
水印处理：不变。
重建方法：本次未重建帧，新增 `npm run animations:intake-checklist`，扫描 `assets/origin` 视频和 manifest，输出中文处理前确认清单。
运行时输出：不涉及新截图。
验证命令：`npm run validate:animation-intake-checklist`、`npm run animations:intake-checklist`、`npm run validate:release`。
桌面验收：本次为素材流程工具，使用自动验证和清单输出覆盖。
已知问题：脚本只能根据现有 manifest 判断已接入动作；全新视频的目标 action、分类和 manifest 修改仍需用户确认后再执行。
决定：接受该清单生成器作为后续新增、删除、覆盖动作素材前的固定第一步。

## 2026-06-15 源视频预检

日期：2026-06-15
源文件：`assets/origin/*.mp4`
目标动作：manifest 中引用的所有源视频
问题：抽帧脚本需要从源视频生成 24 fps、72 帧运行素材；如果源视频缺失、没有视频流、时长不足或尺寸过低，应该在正式删除/覆盖 runtime 帧之前先失败。
参考片段：不涉及帧重建。
帧数：不变。
FPS：不变。
循环方式：不变。
水印处理：不变。
重建方法：本次未重建帧，新增 `npm run animations:audit-origin`，使用 `ffprobe` 读取 manifest 引用的源视频元数据，检查视频流、时长和最低尺寸。
运行时输出：不涉及新截图。
验证命令：`npm run validate:origin-video-audit`、`npm run animations:audit-origin`、`npm run validate:release`。
桌面验收：本次为素材预检工具，使用自动验证覆盖。
已知问题：预检只检查源视频是否足够抽帧，不判断动作美感、猫咪身份一致性、水印位置和绿幕质量；这些仍需后续序列帧验证和桌面多帧验收。
决定：接受源视频预检作为 `animations:build-from-origin` 之前的固定门禁。

## 2026-06-15 13 状态覆盖报告

日期：2026-06-15
源文件：`assets/runtime/animations/manifest.json`、`src/core/fsm/state-types.ts`、`docs/kling-action-generation-plan.json`
目标动作：全部 13 个桌宠状态
问题：项目目标是后续补齐 13 状态真实动作；当前 manifest 已有 13 状态映射，但部分状态仍 fallback 到 `idle_primary`。需要一个固定报告明确当前覆盖度和下一步缺口。
参考片段：不涉及帧重建。
帧数：不变。
FPS：不变。
循环方式：不变。
水印处理：不变。
重建方法：本次未重建帧，新增 `npm run animations:state-coverage`，读取状态类型、manifest 和可灵动作计划，输出每个状态的覆盖状态、运行时 action、源视频和提示词候选；同时支持 `--write docs/state-coverage.md` 保存当前缺口面板。
运行时输出：不涉及新截图。
验证命令：`npm run validate:state-coverage-report`、`npm run animations:state-coverage`、`npm run animations:state-coverage -- --write docs/state-coverage.md`、`npm run validate:release`。
桌面验收：本次为 13 状态覆盖跟踪工具，使用自动验证和报告输出覆盖。
已知问题：报告只说明映射覆盖度，不代表 fallback 状态已经拥有独立真实视频；当前报告显示 13 状态中 6 个为 independent，7 个仍 fallback。
决定：接受状态覆盖报告和 `docs/state-coverage.md` 作为后续补齐 13 状态动作的进度追踪入口。

## 2026-06-15 13 状态补齐待办文档

日期：2026-06-15
源文件：`docs/state-coverage.md`、`docs/kling-action-generation-plan.json`
目标动作：fallback / missing 状态
问题：状态覆盖报告能说明现状，但后续执行还需要明确“下一批该生成什么视频、对应哪个 action、生成后要接入哪里”。需要把 fallback 状态转成可执行待办清单。
参考片段：不涉及帧重建。
帧数：不变。
FPS：不变。
循环方式：不变。
水印处理：不变。
重建方法：本次未重建帧，新增 `npm run animations:state-backlog -- --write docs/state-backlog.md`，根据覆盖报告和可灵动作计划生成补齐待办。
运行时输出：不涉及新截图。
验证命令：`npm run validate:state-backlog`、`npm run animations:state-backlog -- --write docs/state-backlog.md`、`npm run validate:release`。
桌面验收：本次为 13 状态素材规划工具，使用自动验证和文档输出覆盖。
已知问题：`sleep`、`sleepy`、`sleeping` 当前缺少明确提示词计划，待办文档会标记为“待补提示词”；其余 fallback 状态已能关联到可灵计划中的候选动作。
决定：接受 `docs/state-backlog.md` 作为后续补齐 13 状态动作的执行清单。

## 2026-06-15 睡眠三态提示词补齐

日期：2026-06-15
源文件：`docs/kling-action-generation-plan.json`
目标动作：`sleepy`、`sleep`、`sleeping`
问题：`docs/state-backlog.md` 中 `sleep`、`sleepy`、`sleeping` 仍标记为“待补提示词”，无法直接进入可灵生成和素材接入流程。
参考片段：以 `assets/origin/鱼仔参考图.png` 为统一猫咪参考图。
帧数：未生成帧。
FPS：不变，后续仍按 24 fps、72 帧接入。
循环方式：`sleepy` 和 `sleep` 为非循环 daily 动作，`sleeping` 为循环 daily 动作。
水印处理：本次未生成视频；后续生成视频仍必须要求无文字、无水印、无 logo，并在抽帧流程中执行水印区域透明化。
重建方法：本次未重建帧，只补充可灵动作计划和状态提示词映射。
运行时输出：不涉及新截图。
验证命令：`npm run kling:generate -- --dry-run --action sleepy`、`npm run animations:state-coverage -- --write docs/state-coverage.md`、`npm run animations:state-backlog -- --write docs/state-backlog.md`、`npm run validate:release`。
桌面验收：本次为素材生成计划补齐，使用 dry-run 和文档输出覆盖。
已知问题：睡眠三态仍没有真实源视频和运行时独立动作，待可灵密钥可用或用户补充源视频后再接入 manifest。
决定：接受 `sleepy`、`sleep`、`sleeping` 作为后续补齐睡眠状态的候选生成动作。

## 2026-06-15 真实小猫动作计划升级

日期：2026-06-15
源文件：`assets/origin/鱼仔参考图.png`、`docs/kling-action-generation-plan.json`
目标动作：日常动作、交互动作、过渡动作的可灵生成计划
问题：当前动作时间偏短，日常动作重复度高，长期观看容易视觉疲劳；目标是让鱼仔更像真实小猫生活在电脑桌面里，并能对鼠标靠近、点击、拖拽、召唤等行为做出自然反应。
参考片段：以 `assets/origin/鱼仔参考图.png` 为统一猫咪身份参考。
帧数：本次未生成帧；后续按动作视频时长转换为 24 fps 序列帧，再由运行时决定抽样或全量播放。
FPS：计划仍按 24 fps。
循环方式：日常循环动作优先 8 秒，日常插入动作 6-8 秒；交互动作 4 秒；过渡动作 2 秒。
水印处理：提示词明确禁止文字、水印、logo；若平台仍产出水印，进入序列帧前必须先去除或透明化水印区域。
重建方法：本次未重建帧，升级 `docs/kling-action-generation-plan.json`，新增动作级 `durationSeconds`、`antiFatigueRole`、`minCooldownSeconds`，并新增 `npm run validate:kling-plan-quality` 作为质量门禁。
运行时输出：不涉及新截图。
验证命令：`npm run validate:kling-plan-quality`、`npm run kling:generate -- --dry-run --action groom_face_wash`、`npm run kling:generate -- --dry-run --action cursor_watch`、`npm run validate:release`。
桌面验收：本次为动作生成规划升级；真实视频生成后仍需进入素材清单确认、源视频预检、序列帧抽取和桌面多帧截图验收。
已知问题：当前可灵密钥仍未通过开放 API 鉴权，无法生成真实视频；本次只完成可执行计划、提示词和校验工具。
决定：接受“长日常动作池 + 短交互响应 + 过渡衔接”的方案，后续新增参考视频或可灵生成视频时按同一计划接入。

## 2026-06-15 真实小猫行为调度策略

日期：2026-06-15
源文件：`docs/kling-action-generation-plan.json`
目标动作：所有计划中的日常动作、交互动作和过渡动作
问题：长视频提示词只能解决素材生成问题；运行时还需要明确如何避免短时间重复、哪些动作属于日常池、哪些动作由鼠标或点击触发、睡眠动作如何串联，才能让桌宠像真实小猫一样生活在桌面上。
参考片段：以可灵动作计划中的 `durationSeconds`、`antiFatigueRole`、`minCooldownSeconds` 为行为策略来源。
帧数：本次未生成帧。
FPS：不变，后续仍按 24 fps 接入。
循环方式：日常动作池间隔 45-150 秒，交互动作结束回到 `idle_primary`，拖拽动作可在拖拽期间循环。
水印处理：本次不处理视频；策略仍要求只有通过源视频验收和去水印/抠绿流程后才允许进入运行时调度。
重建方法：新增 `npm run animations:behavior-schedule`，从可灵动作计划派生 `docs/cat-behavior-schedule.json` 和 `docs/cat-behavior-schedule.md`；新增 `npm run validate:cat-behavior-schedule` 校验行为策略。
运行时输出：不涉及新截图。
验证命令：`npm run validate:cat-behavior-schedule`、`npm run animations:behavior-schedule -- --write-json docs/cat-behavior-schedule.json --write-md docs/cat-behavior-schedule.md`、`npm run validate:release`。
桌面验收：本次为运行时调度策略准备，不直接切换播放器；等目标 action 已生成帧并写入 manifest 后，再按策略接入并做桌面多帧验收。
已知问题：当前运行时 manifest 仍只有 6 个动作，新增策略中的动作必须等真实视频生成、抽帧、manifest 更新后才能实际播放。
决定：接受 `docs/cat-behavior-schedule.md` 作为后续把真实小猫动作接入播放器的调度依据。

## 2026-06-15 运行时行为策略子集接入

日期：2026-06-15
源文件：`docs/cat-behavior-schedule.json`、`assets/runtime/animations/manifest.json`
目标动作：当前 manifest 已启用且适合 idle 期间播放的日常动作
问题：播放器此前硬编码 `["tail_wag", "idle_secondary"]` 作为日常变化，无法体现策略文档，也容易在后续新增动作时忘记同步；但策略中很多动作尚未生成真实帧，不能直接调度。
参考片段：当前可播放动作仍来自 manifest，未来动作只作为策略候选。
帧数：未生成新帧。
FPS：不变。
循环方式：运行时从策略中筛选已启用、可循环、daily、非行走/睡眠链路动作；当前可用子集为 `tail_wag` 和 `idle_secondary`。
水印处理：不涉及视频处理。
重建方法：新增 `src/core/render/runtime-behavior-schedule.ts`，由策略和 manifest 派生 `DailyAnimationRotator` 配置；播放器不再硬编码日常变化数组。
运行时输出：本次使用自动验证覆盖，未新增桌面截图。
验证命令：`npm run validate:runtime-behavior-schedule`、`npm run validate:release`。
桌面验收：当前行为仍只播放已存在帧，不会调度尚未接入 manifest 的动作；后续真实视频补齐后再做桌面多帧验收。
已知问题：`groom_face_wash`、`loaf_breathing`、`cursor_watch` 等动作仍未生成视频和运行时帧，所以不会实际播放。
决定：接受运行时先接入策略可用子集，作为后续新增真实动作后的自动扩展入口。

## 2026-06-15 运行时交互策略兜底接入

日期：2026-06-15
源文件：`docs/cat-behavior-schedule.json`、`assets/runtime/animations/manifest.json`
目标动作：鼠标靠近、点击、连续点击、拖拽、唤醒
问题：行为策略中规划了 `cursor_watch`、`click_surprised`、`poke_annoyed`、`dragging` 等交互动作，但当前 manifest 只有 `paw_raise` 交互帧；直接请求 `surprised`、`shy` 或 `dragging` 会视觉回落到待机，用户会感觉点击没有反馈。
参考片段：当前可见交互兜底为 `paw_raise`，由 `teaser` 或 `waving` 状态触发。
帧数：未生成新帧。
FPS：不变。
循环方式：非循环交互动作仍由 `AnimationDirector` 播放结束后回到日常动作。
水印处理：不涉及视频处理。
重建方法：新增 `src/core/render/runtime-interaction-schedule.ts`，根据行为策略和 manifest 选择当前可播放的交互状态；`InteractionController` 使用该解析结果处理 hover、click、repeated click、drag 和 wake。
运行时输出：本次使用自动验证覆盖，后续可用桌面截图进一步确认点击反馈。
验证命令：`npm run validate:runtime-interaction-schedule`、`npm run validate:release`。
桌面验收：当前阶段点击和连续点击会回退到可见的 `waving/paw_raise`，等 `click_surprised`、`poke_annoyed`、`dragging` 真实帧补齐后再自动升级到专属动作。
已知问题：交互动作视觉多样性仍受当前素材限制；真实交互视频未生成前，只能使用已有 `paw_raise` 作为可见兜底。
决定：接受交互策略兜底接入，避免用户交互落到不可见的 idle fallback。

## 2026-06-15 自动行为低疲劳间隔接入

日期：2026-06-15
源文件：`docs/cat-behavior-schedule.json`
目标动作：自动走路、自动抬爪/打招呼等 idle 后自动触发动作
问题：自动行为此前基于 `DEFAULT_CONFIG.timing.minIdleMs = 3000`，几秒钟就可能触发一次走路或交互，和真实小猫生活节奏不符，也会加重视觉疲劳。
参考片段：行为策略中的 `rules.minDailyGapSeconds = 45`、`rules.maxDailyGapSeconds = 150`。
帧数：未生成新帧。
FPS：不变。
循环方式：自动行为使用策略间隔调度；日常序列帧播放仍由 `DailyAnimationRotator` 和 `AnimationDirector` 负责。
水印处理：不涉及视频处理。
重建方法：新增 `src/core/render/runtime-autonomous-schedule.ts`，由行为策略派生自动行为间隔；`AutonomousBehavior` 构造时读取该间隔，避免 3 秒级自动触发。
运行时输出：本次使用自动验证覆盖。
验证命令：`npm run validate:autonomous-behavior-schedule`、`npm run validate:release`。
桌面验收：该改动减少自动触发频率，不改变当前可见帧资源；后续可通过长时间桌面观察确认节奏。
已知问题：真实小猫生活动作仍需要后续源视频/序列帧补齐；本次只降低当前动作重复频率。
决定：接受 45-150 秒策略间隔作为当前自动行为默认节奏，降低视觉疲劳。

## 2026-06-15 可灵视频生成优先批次

日期：2026-06-15
源文件：`docs/kling-action-generation-plan.json`、`docs/state-backlog.md`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`；第二批睡眠链路；第三批剩余状态和生活化变化。
问题：动作计划已经覆盖很多动作，但缺少“key 可用后先生成哪些”的执行顺序，容易在生成阶段分散注意力，无法优先解决视觉疲劳和关键交互。
参考片段：13 状态补齐待办、行为策略和可灵动作计划。
帧数：未生成新帧。
FPS：不变，后续仍按 24 fps 接入。
循环方式：按动作计划保留各 action 的 loop 设置。
水印处理：批次文档要求每个生成视频先人工检查无水印、无 logo、无文字，再进入抽帧和 manifest 接入。
重建方法：新增 `npm run kling:generation-batches`，生成 `docs/kling-generation-batches.json` 和 `docs/kling-generation-batches.md`；新增 `npm run validate:kling-generation-batches` 校验批次。
运行时输出：不涉及运行时截图。
验证命令：`npm run validate:kling-generation-batches`、`npm run kling:generation-batches -- --write-json docs/kling-generation-batches.json --write-md docs/kling-generation-batches.md`、`npm run validate:release`。
桌面验收：本次为素材生产排期，不改变运行时；真实视频生成并接入 manifest 后再做桌面多帧验收。
已知问题：可灵 API 鉴权仍需通过后才能按批次真实生成视频。
决定：接受三批生成顺序，优先解决视觉疲劳和关键交互，再补睡眠链路和剩余状态。

## 2026-06-15 可灵批次生成命令

日期：2026-06-15
源文件：`docs/kling-generation-batches.json`、`docs/kling-action-generation-plan.json`
目标动作：按批次选择的可灵动作
问题：虽然已有批次文档，但真实生成时仍需要人工逐条复制命令；需要一个批次入口，让 key 可用后能按第一批、睡眠批等顺序 dry-run 或真实生成。
参考片段：第一批 `fatigue-and-key-interaction`，第二批 `sleep-routine`。
帧数：未生成新帧。
FPS：不变。
循环方式：按动作计划保留各 action 的 loop 设置。
水印处理：不涉及视频处理；生成后仍需人工检查无水印、无 logo、无文字。
重建方法：新增 `npm run kling:generate-batch`，支持 `--batch <number-or-id>`、`--dry-run` 和 `--force`。
运行时输出：不涉及运行时截图。
验证命令：`npm run validate:kling-batch-plan`、`npm run kling:generate-batch -- --batch 1 --dry-run`、`npm run kling:generate-batch -- --batch sleep-routine --dry-run`、`npm run validate:release`。
桌面验收：本次为可灵素材生成入口；真实视频生成并接入 manifest 后再做桌面多帧验收。
已知问题：真实批次生成仍依赖可灵 API 鉴权通过。
决定：接受批次生成命令作为后续素材生产的执行入口。

## 2026-06-15 可灵批次产物状态面板

日期：2026-06-15
源文件：`docs/kling-generation-batches.json`、`assets/origin/generated/kling`
目标动作：第一批可灵生成动作
问题：批次生成后需要快速确认哪些视频已生成、哪些是空文件、哪些仍缺失，方便进入人工验收和后续素材接入。
参考片段：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`。
帧数：未生成新帧。
FPS：不变。
循环方式：不涉及运行时播放。
水印处理：状态面板只判断文件存在和大小；水印仍需人工验收或后续视频处理流程处理。
重建方法：新增 `npm run kling:batch-status`，支持 `--batch <number-or-id>` 和 `--write <path>`；当前输出 `docs/kling-batch-status-first.md`。
运行时输出：不涉及运行时截图。
验证命令：`npm run validate:kling-batch-status`、`npm run kling:batch-status -- --batch 1 --write docs/kling-batch-status-first.md`、`npm run validate:release`。
桌面验收：本次为素材生产状态面板；真实视频接入 manifest 后再做桌面验收。
已知问题：当前第一批 4 个视频均为 missing，仍需可灵 API 鉴权通过后生成。
决定：接受批次状态面板作为可灵生成后的验收入口。

## 2026-06-16 可灵批次素材接入前确认清单

日期：2026-06-16
源文件：`docs/kling-generation-batches.json`、`docs/kling-action-generation-plan.json`、`assets/runtime/animations/manifest.json`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：用户明确要求“下次开始动作前先列一下清单给我看”，所以可灵视频生成后不能直接抽帧、去水印、覆盖 runtime 或修改 manifest；需要先把源视频、目标 action、覆盖路径、manifest 状态和必跑验证集中列出，确认后再执行素材处理。
参考片段：第一批动作由可灵批次计划选出，运行时 manifest 用来判断动作是新增还是覆盖。
帧数：未生成新帧。
FPS：不变，接入时仍按 24 fps 预期处理。
循环方式：按动作计划保留各 action 的 loop 设置，实际接入前需再次确认。
水印处理：本次只生成接入前清单；后续必须先检查并去除水印、logo、文字，再允许进入 runtime。
重建方法：新增 `npm run kling:batch-intake-checklist`，支持 `--batch <number-or-id>` 和 `--write <path>`；当前输出 `docs/kling-batch-intake-first.md`。
运行时输出：不涉及运行时截图。
验证命令：`npm run validate:kling-batch-intake-checklist`、`npm run kling:batch-intake-checklist -- --batch 1 --write docs/kling-batch-intake-first.md`、`npm run validate:release`。
桌面验收：本次为素材接入前确认文档；真实视频生成、验收、抽帧并更新 manifest 后，再执行桌面多帧截图和变化检查。
已知问题：当前第一批视频文件仍未生成，清单中的源视频路径是可灵生成后的预期产物路径。
决定：接受 `docs/kling-batch-intake-first.md` 作为第一批动作处理前必须给用户确认的清单。

## 2026-06-16 可灵生成前置检查

日期：2026-06-16
源文件：`docs/kling-generation-batches.json`、`docs/kling-action-generation-plan.json`、`.env.local`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：真实生成前需要一次集中检查：密钥是否被读取、参考图是否存在、可灵鉴权是否通过、第一批视频是否已生成。否则容易误以为可以开始生成，实际进入 401 或缺素材状态。
参考片段：第一批动作、鱼仔参考图、可灵鉴权探针。
帧数：未生成新帧。
FPS：不变。
循环方式：不涉及运行时播放。
水印处理：本次不处理视频；如果 preflight 通过并生成视频，仍必须先确认无水印、无 logo、无文字，再进入抽帧流程。
重建方法：新增 `npm run kling:preflight`，支持 `--batch <number-or-id>`、`--write <path>` 和 `--strict`；当前输出 `docs/kling-preflight-first.md`。
运行时输出：不涉及运行时截图。
验证命令：`npm run validate:kling-preflight`、`npm run kling:preflight -- --batch 1 --write docs/kling-preflight-first.md`、`npm run validate:release`。
桌面验收：本次为生成前检查，不改变桌宠可见动作；真实视频接入后再做桌面多帧验收。
已知问题：当前 `.env.local` 中 key 已读取，但可灵返回 `401 auth_failed / Auth failed`；第一批 4 个视频仍为 missing。
决定：接受 `docs/kling-preflight-first.md` 作为每次真实生成前的状态入口；只有 preflight 显示鉴权通过后，才进入 `npm run kling:generate-batch -- --batch 1`。

## 2026-06-16 交互插入后恢复日常帧进度

日期：2026-06-16
源文件：`src/core/render/animation-director.ts`、`scripts/validate-animation-director.mjs`
目标动作：所有 `daily` 到 `interactive` 或 `transition` 的切换
问题：交互动作结束后回到日常动作时，旧逻辑会从日常动作入口帧重新开始。用户会感觉日常序列帧被重置，尤其在长日常动作和鼠标靠近/点击频繁插入时，会出现不自然的重复。
参考片段：用户提出“日常动作按照视频转化的序列帧顺序进行播放，当需要交互时插入新的交互序列帧，结束后再切回日常动作”。
帧数：未生成新帧。
FPS：不变。
循环方式：日常动作继续按 24 fps 循环；交互插入前保存日常 zero-based frameIndex，交互结束回到同一个日常 action 时恢复该帧作为新的播放偏移。
水印处理：不涉及视频处理。
重建方法：更新 `AnimationDirector`，在 daily 切入 interactive/transition 前保存当前帧，回到同一个 daily action 时恢复进度；更新 `npm run validate:animation-director` 覆盖该行为。
运行时输出：本次用自动验证覆盖，未新增桌面截图。
验证命令：`npm run validate:animation-director`、`npm run validate:release`。
桌面验收：真实视频补齐后仍需通过多帧截图检查交互插入和回流是否肉眼顺滑。
已知问题：当前真实动作数量仍受 manifest 限制；该改动改善切换时间线，不替代后续可灵视频生成和素材接入。
决定：接受“交互结束恢复日常帧进度”作为序列帧播放器默认规则，减少交互插入带来的重启感。

## 2026-06-16 过渡动作插入调度

日期：2026-06-16
源文件：`src/core/render/animation-director.ts`、`scripts/validate-animation-director.mjs`、`docs/animation-adapter.md`
目标动作：后续可灵生成的 `idle_to_paw_raise`、`paw_raise_to_idle`、`idle_to_cursor_watch` 等 `transition` 动作
问题：manifest 已支持 `transitionIn` 和 `transitionOut` 字段，但播放器此前没有真正插入过渡动作。等可灵生成过渡视频后，如果运行时仍忽略这些字段，日常动作和交互动作之间还是会直接切换，无法充分利用衔接素材。
参考片段：动作计划中的 `idle_to_paw_raise`、`paw_raise_to_idle`、`idle_to_cursor_watch`。
帧数：未生成新帧。
FPS：不变。
循环方式：过渡动作应为非循环 `transition`；`transitionIn` 播放到尾帧后进入目标交互动作，`transitionOut` 播放到尾帧后回到 `returnTo` 日常动作。
水印处理：不涉及视频处理；未来过渡视频仍必须按接入前清单确认无水印、无 logo、无文字。
重建方法：更新 `AnimationDirector`，当目标动作配置 `transitionIn` 时先插入过渡；当交互动作配置 `transitionOut` 时先插入回切过渡，再返回日常动作。
运行时输出：本次用自动验证覆盖，未新增桌面截图。
验证命令：`npm run validate:animation-director`、`npm run validate:release`。
桌面验收：真实过渡视频生成并接入 manifest 后，需要重新做桌面多帧截图，确认过渡动作确实可见且没有闪断。
已知问题：当前 runtime manifest 尚无启用的过渡动作，所以本次改动是先打通调度能力，等待真实素材补齐。
决定：接受 `transitionIn`/`transitionOut` 作为日常动作和交互动作之间的标准衔接机制。

## 2026-06-16 非循环日常动作进入生活变化池

日期：2026-06-16
源文件：`src/core/render/runtime-behavior-schedule.ts`、`scripts/validate-runtime-behavior-schedule.mjs`、`docs/animation-adapter.md`
目标动作：后续可灵生成的 `groom_face_wash`、`desk_sniff`、`stretch_yawn` 等非循环 `daily` 动作
问题：运行时日常变化池此前只接收 `loop: true` 的 daily 动作。这样会把洗脸、嗅闻、伸懒腰等更像真实小猫日常生活的一次性动作排除，导致桌宠仍然主要重复待机和摇尾，容易视觉疲劳。
参考片段：行为计划中的生活化 daily 动作和用户提出“更接近真实小猫每天会干的动作”。
帧数：未生成新帧。
FPS：不变。
循环方式：随机日常池现在允许启用、有帧、category 为 `daily` 的非循环动作；睡眠链路和走路动作仍被排除，避免随机插入破坏状态语义。
水印处理：不涉及视频处理；未来新增视频仍必须先确认无水印、无 logo、无文字。
重建方法：更新 `buildRuntimeDailyRotatorOptions` 的过滤规则，允许 idle 兼容的非循环 daily 进入 variations；更新 `npm run validate:runtime-behavior-schedule` 覆盖 `groom_face_wash`。
运行时输出：本次用自动验证覆盖，当前 manifest 尚无该动作真实帧。
验证命令：`npm run validate:runtime-behavior-schedule`、`npm run validate:release`。
桌面验收：等 `groom_face_wash` 等视频生成并接入 manifest 后，需要做长时间桌面观察和多帧截图，确认生活化动作能自然插入并回到日常。
已知问题：当前 runtime manifest 仍只有 6 个动作；非循环生活化动作只有在真实素材接入后才会实际播放。
决定：接受非循环生活化 daily 进入日常变化池，作为降低视觉疲劳的默认调度规则。

## 2026-06-16 日常动作级冷却调度

日期：2026-06-16
源文件：`src/core/render/daily-animation-rotator.ts`、`src/core/render/runtime-behavior-schedule.ts`、`scripts/validate-daily-animation-rotator.mjs`、`scripts/validate-runtime-behavior-schedule.mjs`
目标动作：所有日常变化池动作，尤其是 `groom_face_wash`、`stretch_yawn`、`desk_sniff` 等生活化动作
问题：日常变化此前只有全局 gap 和固定轮播顺序。等生活化动作接入后，同一个动作仍可能在较短观察窗口里按顺序反复出现，降低“真实小猫在电脑里生活”的感觉。
参考片段：可灵动作计划和行为计划里的 `minCooldownSeconds`。
帧数：未生成新帧。
FPS：不变。
循环方式：`DailyAnimationRotator` 选择动作时会跳过仍在冷却期内的 variation；如果一圈动作都在冷却，则保持默认 idle，并在下一次 gap 后重试。
水印处理：不涉及视频处理。
重建方法：为 `DailyAnimationRotatorOptions` 增加 `variationCooldownMs`；`buildRuntimeDailyRotatorOptions` 从 `dailyPool.minCooldownSeconds` 派生动作级冷却毫秒表。
运行时输出：本次用自动验证覆盖。
验证命令：`npm run validate:daily-animation-rotator`、`npm run validate:runtime-behavior-schedule`、`npm run validate:release`。
桌面验收：真实生活化动作补齐后，需做长时间桌面观察，确认同一动作不会过密重复。
已知问题：当前 runtime manifest 仍缺少第一批可灵生活化动作，所以该规则暂时主要作用于已有日常动作和未来素材。
决定：接受动作级冷却作为日常变化池默认策略，减少重复感和视觉疲劳。

## 2026-06-16 日常动作级播放时长

日期：2026-06-16
源文件：`src/core/render/daily-animation-rotator.ts`、`src/core/render/runtime-behavior-schedule.ts`、`scripts/validate-daily-animation-rotator.mjs`、`scripts/validate-runtime-behavior-schedule.mjs`
目标动作：所有日常变化池动作，尤其是未来不同长度的生活化日常动作
问题：日常变化此前只有一个全局播放时长。等 6 秒嗅闻、6 秒伸懒腰、8 秒洗脸等动作同时接入后，如果全部按最长时长播放，短动作会停留过久，影响自然感。
参考片段：行为计划和可灵动作计划里的 `durationSeconds`。
帧数：未生成新帧。
FPS：不变。
循环方式：`DailyAnimationRotator` 现在优先使用 `variationDurationByActionMs[action]` 作为该动作的播放时长；没有配置时才回退到全局 `variationDurationMs`。
水印处理：不涉及视频处理。
重建方法：为 `DailyAnimationRotatorOptions` 增加 `variationDurationByActionMs`；`buildRuntimeDailyRotatorOptions` 从 `dailyPool.durationSeconds` 派生动作级播放时长。
运行时输出：本次用自动验证覆盖。
验证命令：`npm run validate:daily-animation-rotator`、`npm run validate:runtime-behavior-schedule`、`npm run validate:release`。
桌面验收：真实生活化动作补齐后，需做长时间桌面观察，确认短动作不会被额外拖长。
已知问题：当前 runtime manifest 尚未包含第一批生活化动作，实际可见效果等待素材补齐。
决定：接受动作级播放时长作为日常变化池默认策略，让未来素材按自身视频长度自然播放。

## 2026-06-16 新增左右转头源视频接入前清单

日期：2026-06-16
源文件：`assets/origin/鱼仔左右转头看动作.mp4`、`scripts/animation-intake-checklist.mjs`
目标动作：候选 `look_around`
问题：`assets/origin` 中新增了左右转头观察视频。用户要求“下次开始动作前先列一下清单给我看”，所以不能直接抽帧或修改 manifest，需要先把候选 action、分类、覆盖路径和验证命令列出。
参考片段：`docs/cat-video-prompt-guide.md` 中 `look_around` 左右观察动作；`docs/cat-behavior-schedule.json` 中 `look_around` 为 daily 环境观察动作。
帧数：未生成新帧。
FPS：不变。
循环方式：候选 `look_around` 为非循环 daily，确认并接入后可进入生活化日常变化池。
水印处理：本次不处理视频；确认后仍需先审查并去除水印、logo、文字，再进入 runtime。
重建方法：增强 `npm run animations:intake-checklist`，对“左右/转头/观察/看”类未接入源视频建议 `look_around`；生成当前确认清单 `docs/animation-intake-current.md`。
运行时输出：不涉及运行时截图。
验证命令：`npm run validate:animation-intake-checklist`、`npm run animations:intake-checklist`、`npm run validate:release`。
桌面验收：确认并接入 `look_around` 后，需要做桌面多帧截图，确认左右转头动作可见且能回到日常动作。
已知问题：该源视频仍未确认、未去水印、未抽帧、未写入 manifest。
决定：接受 `docs/animation-intake-current.md` 作为当前新增 origin 视频处理前确认清单，等待用户确认后再处理 `look_around`。

## 2026-06-16 交互触发冷却门控

日期：2026-06-16
源文件：`docs/cat-behavior-schedule.md`、`src/core/render/runtime-interaction-schedule.ts`、`src/core/behavior/interaction-cooldowns.ts`、`src/core/behavior/interaction-controller.ts`、`scripts/validate-runtime-interaction-schedule.mjs`、`scripts/validate-interaction-cooldowns.mjs`
目标动作：`mouse_near`、`click`、`repeated_click`、`drag`、`wake`
问题：鼠标靠近、单击和连点可能在短时间内反复插入同一个交互序列帧，导致日常序列帧被频繁打断，也会放大当前素材不足带来的卡顿感。
参考片段：`docs/cat-behavior-schedule.json` 的 `interactionTriggers.*.cooldownSeconds`。
帧数：未生成新帧。
FPS：不变。
循环方式：交互动作仍由 `AnimationDirector` 插入并在结束后回到日常动作；本次只增加触发门控，冷却期内不重复插入同类交互。
水印处理：不涉及视频处理。
重建方法：`buildRuntimeInteractionSchedule` 把交互冷却转换成毫秒；`InteractionCooldowns` 独立记录每种触发的最后执行时间；`InteractionController` 在鼠标靠近、点击、连点、拖拽和唤醒前检查冷却。
运行时输出：本次用自动验证覆盖。
验证命令：`npm run validate:interaction-cooldowns`、`npm run validate:runtime-interaction-schedule`、`npm run validate:release`。
桌面验收：后续补齐真实交互视频后，需要做鼠标靠近和连续点击桌面验收，确认交互不会刷屏，日常动作能稳定恢复。
已知问题：当前真实交互素材仍未由可灵生成并接入，实际视觉多样性仍受现有 manifest 限制。
决定：接受交互冷却作为第一版平滑策略，先降低重复触发造成的打断，再等待真实交互动作素材补齐。

## 2026-06-16 动作资产契约与缺口报告

日期：2026-06-16
源文件：`docs/kling-action-generation-plan.json`、`assets/runtime/animations/manifest.json`、`scripts/animation-asset-contract.mjs`、`scripts/validate-animation-asset-contract.mjs`、`docs/animation-asset-contract.md`
目标动作：全部计划动作，重点是 13 个日常动作、8 个交互动作和 3 个过渡动作
问题：当前可灵计划已经定义较完整的生活化动作，但 runtime manifest 仍只有少量短动作。缺口如果只靠人工记忆追踪，后续补素材时容易漏掉时长、分类、循环、去水印和回切要求。
参考片段：可灵动作计划中的 `durationSeconds`、`category`、`loop`、`prompt`、`output`；runtime manifest 中的 `frameCount`、`fps`、`enabled`。
帧数：未生成新帧。
FPS：契约目标为 24 FPS，runtime 帧数应达到 `durationSeconds * fps`。
循环方式：本次不改变播放逻辑，只把计划循环字段和 manifest 循环字段纳入一致性报告。
水印处理：报告明确要求 prompt 排除文字、水印和 logo；源视频进入 runtime 前仍必须做水印检查和去除。
重建方法：新增 `npm run animations:asset-contract -- --write docs/animation-asset-contract.md`，生成中文资产契约与缺口报告；新增 `npm run validate:animation-asset-contract`，用 fixture 验证缺失动作和时长不足能被识别。
运行时输出：不涉及桌面截图。
验证命令：`npm run validate:animation-asset-contract`、`npm run animations:asset-contract -- --write docs/animation-asset-contract.md`、`npm run validate:release`。
桌面验收：后续每次接入新动作后，需要刷新该报告并做桌面多帧截图验收，确认覆盖率提升且动作能自然回到日常序列。
已知问题：当前报告显示计划动作 24 个、runtime 可播放动作 6 个、可播放覆盖率 21%、缺失动作 19 个、时长不足动作 5 个，目标项目仍未完成。
决定：接受资产契约报告作为后续素材补齐和回归检查的固定入口，先把“为什么不流畅、缺什么动作、哪些动作太短”变成可追踪状态。

## 2026-06-16 动作缺口优先补齐批次

日期：2026-06-16
源文件：`scripts/animation-asset-contract.mjs`、`scripts/validate-animation-asset-contract.mjs`、`docs/animation-asset-contract.md`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`；第二批睡眠链路；第三批日常探索和情绪变化；第四批过渡动作
问题：缺口报告能列出缺失动作，但如果没有优先级，后续补素材时仍可能先补低收益动作，无法最快缓解日常重复和交互单一。
参考片段：可灵生成批次和行为计划中“降低视觉疲劳”“关键互动”“睡眠作息链路”“动作衔接过渡”的分组。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变运行时播放逻辑。
水印处理：不涉及视频处理；优先批次中的每个动作仍继承资产契约的水印排除与入库检查要求。
重建方法：`buildAssetContractReport` 现在会从缺失动作中生成 `priorityBatches`；报告渲染新增“优先补齐批次”章节；验证脚本覆盖第一批必须包含生活化日常动作和关键鼠标互动动作。
运行时输出：不涉及桌面截图。
验证命令：`npm run validate:animation-asset-contract`、`npm run animations:asset-contract -- --write docs/animation-asset-contract.md`、`npm run validate:release`。
桌面验收：第一批动作真正接入后，需要重点观察待机重复度、鼠标靠近反馈和点击反馈是否明显改善。
已知问题：优先批次只是素材补齐顺序，真实视频仍未生成，runtime 可播放覆盖率仍为 21%。
决定：接受“第一批先补强生活化日常 + 关键互动”的策略，让后续可灵生成和人工素材补充更直接服务于流畅与真实感。

## 2026-06-16 第一批可灵动作执行清单增强

日期：2026-06-16
源文件：`scripts/kling-batch-intake-checklist.mjs`、`scripts/validate-kling-batch-intake-checklist.mjs`、`docs/kling-batch-intake-first.md`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：第一批接入清单原本列出了源视频和目标路径，但没有把批次优先原因、单动作可灵生成命令和资产契约刷新命令放到同一张执行清单里。后续真正生成/接入时容易在多个文档之间来回找。
参考片段：`docs/kling-generation-batches.json` 的第一批 `name`、`reason` 和 action 列表；`docs/animation-asset-contract.md` 的优先补齐批次。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变运行时播放逻辑。
水印处理：不涉及视频处理；清单仍强调生成后、抽帧或覆盖 manifest 前必须先确认，后续仍需检查并去除水印。
重建方法：`buildKlingBatchIntakeChecklist` 现在保留批次名称和优先原因；每个 action 增加 `npm run kling:generate -- --action <action>`；必跑验证增加资产契约报告刷新命令。
运行时输出：不涉及桌面截图。
验证命令：`npm run validate:kling-batch-intake-checklist`、`npm run kling:batch-intake-checklist -- --batch 1 --write docs/kling-batch-intake-first.md`、`npm run validate:release`。
桌面验收：第一批视频真正生成并确认后，再按清单执行抽帧、manifest 更新和桌面多帧截图。
已知问题：该清单仍是接入前执行文档，未生成可灵视频，也未改变 runtime 可见动作。
决定：接受第一批执行清单作为后续生成和接入 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised` 的单页入口。

## 2026-06-16 可灵鉴权诊断增强

日期：2026-06-16
源文件：`scripts/kling/auth-check.mjs`、`scripts/kling/auth-diagnostics.mjs`、`scripts/validate-kling-auth-diagnostics.mjs`、`docs/kling-integration.md`
目标动作：第一批可灵生成动作，尤其是 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：`npm run kling:auth-check` 持续返回 `401 auth_failed`，但旧输出只能说明鉴权失败，不能快速判断是否为本机时间/JWT 时间窗/API 地址问题。
参考片段：可灵 auth-check 响应中的 HTTP status、message、server Date；本地 JWT 生成规则中的 `exp` 和 `nbf`。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变运行时播放逻辑。
水印处理：不涉及视频处理。
重建方法：新增 `buildKlingAuthDiagnostics`，让 `kling:auth-check` 输出 key 是否配置、key 长度、probe URL、JWT 时间窗、服务端时间差和排查建议；验证脚本确认诊断不泄露真实 key。
运行时输出：不涉及桌面截图。
验证命令：`npm run validate:kling-auth-diagnostics`、`npm run kling:auth-check`、`npm run validate:release`。
桌面验收：鉴权通过并生成第一批视频后再进行桌面验收。
已知问题：当前 `npm run kling:auth-check` 仍返回 `401 / Auth failed`；本次诊断显示服务端时间差为 0 秒，JWT 时间窗正常，真实视频仍未生成。
决定：接受增强诊断作为可灵接入的下一步排查入口；在 key/权限/API 入口问题解决前，不继续调用真实生成命令。

## 2026-06-16 可灵 preflight 合并鉴权诊断

日期：2026-06-16
源文件：`scripts/kling-preflight.mjs`、`scripts/validate-kling-preflight.mjs`、`docs/kling-preflight-first.md`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：`kling:auth-check` 已能输出详细诊断，但第一批生成前的 `kling:preflight` 报告仍只显示简短鉴权失败，不能作为单页生成前检查入口。
参考片段：`scripts/kling/auth-diagnostics.mjs` 的 probe URL、JWT 时间窗、服务端时间差和建议字段。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变运行时播放逻辑。
水印处理：不涉及视频处理。
重建方法：`buildKlingPreflightReport` 现在保留 `auth.diagnostics`；Markdown 新增“鉴权诊断”章节；CLI 的 `checkAuth` 复用 `buildKlingAuthDiagnostics`，避免 auth-check 与 preflight 输出漂移。
运行时输出：不涉及桌面截图。
验证命令：`npm run validate:kling-preflight`、`npm run kling:preflight -- --batch 1 --write docs/kling-preflight-first.md`、`npm run validate:release`。
桌面验收：鉴权通过并生成第一批视频后再进行桌面验收。
已知问题：当前 preflight 仍显示 `401 auth_failed`，第一批 4 个视频仍缺失，不能开始真实生成。
决定：接受 `docs/kling-preflight-first.md` 作为第一批可灵生成前的单页状态入口。

## 2026-06-16 可灵官方入口修正与余额阻塞

日期：2026-06-16
源文件：`scripts/kling/config.mjs`、`scripts/kling/client.mjs`、`scripts/kling/auth-check.mjs`、`scripts/kling-preflight.mjs`、`docs/kling-integration.md`、`docs/kling-action-generation-plan.json`、`docs/kling-generation-batches.md`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：旧默认入口 `https://api.klingai.com` 持续返回 `401 auth_failed`；切到官方文档示例入口后，8 秒生成又返回 `duration value '8' is invalid`。
参考片段：可灵官方图生视频文档页显示 `POST /v1/videos/image2video`，示例域名为 `https://api-beijing.klingai.com`，示例模型为 `kling-v2-6`，示例时长为 `5`。
帧数：未生成新帧。
FPS：不变。
循环方式：设计时长仍保留在 `durationSeconds`；新增 `generationDurationSeconds: 5` 作为当前 API 提交时长，后续运行时通过序列帧循环和调度保持日常陪伴时长。
水印处理：未生成视频，尚未进入去水印或人工水印检查。
重建方法：新增 `scripts/kling/config.mjs` 统一默认 API 配置；`client`、`auth-check`、`preflight` 均复用该配置；批次文档显示“设计时长 / API 时长”；本机 `.env.local` 的非密钥配置同步到北京 API 入口和 `kling-v2-6`。
运行时输出：不涉及桌面截图。
验证命令：`npm run validate:kling-auth-diagnostics`、`npm run validate:kling-generation-batches`、`npm run validate:kling-plan-quality`、`npm run kling:auth-check`、`npm run kling:preflight -- --batch 1 --write docs/kling-preflight-first.md`、`npm run kling:generate-batch -- --batch 1`。
桌面验收：第一批视频仍未生成，不能进入抽帧、manifest 接入或桌面动作验收。
已知问题：`npm run kling:generate-batch -- --batch 1` 已通过鉴权并进入业务接口，但返回 `HTTP 429 / Account balance not enough`；当前账号余额不足，第一批视频文件仍缺失。
决定：接受当前可灵 API 接入状态；余额补足后继续执行第一批生成命令，再按清单进行人工检查、去水印、抽帧和 runtime 接入。

## 2026-06-16 可灵批次状态增加生成错误分类

日期：2026-06-16
源文件：`scripts/kling/batch-status.mjs`、`scripts/validate-kling-batch-status.mjs`、`docs/kling-batch-status-first.md`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：第一批生成失败后，旧批次状态页只能显示视频缺失，不能说明缺失原因是余额不足、鉴权失败、参数错误还是网络错误。
参考片段：最近一次真实生成返回 `HTTP 429`，业务信息为 `Account balance not enough`。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变运行时播放逻辑。
水印处理：未生成视频，尚未进入水印检查或去水印。
重建方法：`npm run kling:batch-status` 新增 `--last-error` 参数；状态报告会把最近一次生成错误分类为余额不足、鉴权失败、请求参数错误、网络错误或未知错误，并给出中文恢复步骤。
运行时输出：不涉及桌面截图。
验证命令：`npm run validate:kling-batch-status`、`npm run kling:batch-status -- --batch 1 --write docs/kling-batch-status-first.md --last-error "<最近一次错误>"`
桌面验收：第一批视频仍未生成，不能进入桌面动作验收。
已知问题：账号余额仍不足，第一批 4 个可灵视频仍缺失。
决定：接受 `docs/kling-batch-status-first.md` 作为余额补足前后的批次状态入口；余额补足后重新运行生成命令，并刷新该状态页。

## 2026-06-16 日常动作随机间隔反疲劳

日期：2026-06-16
源文件：`src/core/render/daily-animation-rotator.ts`、`src/core/render/runtime-behavior-schedule.ts`、`scripts/validate-daily-animation-rotator.mjs`、`scripts/validate-runtime-behavior-schedule.mjs`
目标动作：当前已接入的 `tail_wag`、`idle_secondary`，以及后续可灵生成的 `groom_face_wash`、`loaf_breathing`、`desk_sniff`、`stretch_yawn` 等日常动作。
问题：`docs/cat-behavior-schedule.json` 已定义日常动作间隔为 `minDailyGapSeconds` 到 `maxDailyGapSeconds`，但运行时 rotator 只使用固定 `gapMs`，日常变化会像节拍器一样出现，长期陪伴时仍容易产生机械重复感。
参考片段：`cat-behavior-schedule` 的调度原则要求日常动作间隔 45-150 秒，避免短时间重复。
帧数：未生成新帧。
FPS：不变。
循环方式：`DailyAnimationRotator` 现在支持 `maxGapMs` 和可注入 `random`；每次日常变化结束后，在 `gapMs` 到 `maxGapMs` 之间随机安排下一次变化。未配置 `maxGapMs` 时保持旧固定间隔行为。
水印处理：不涉及视频处理。
重建方法：`buildRuntimeDailyRotatorOptions` 现在从策略中的 `maxDailyGapSeconds` 派生 `maxGapMs`；验证脚本用固定随机数确认下一次变化会等待到随机间隔之后再触发。
运行时输出：不涉及桌面截图；这是调度时间行为改动。
验证命令：`npm run validate:daily-animation-rotator`、`npm run validate:runtime-behavior-schedule`、`npm run validate:release`。
桌面验收：后续接入更多真实日常视频后，应观察待机变化是否不再以固定节拍出现，减少视觉疲劳。
已知问题：第一批可灵视频仍因账号余额不足未生成，当前实际可见日常变化仍受运行时已有 6 个 action 限制。
决定：接受随机日常间隔作为真实小猫感的运行时基础；后续可灵视频接入后会自动继承该反疲劳调度。

## 2026-06-16 提醒气泡随机间隔

日期：2026-06-16
源文件：`src/core/behavior/reminder-bubble-controller.ts`、`scripts/validate-reminder-bubble-controller.mjs`、`package.json`、`scripts/validate-all.mjs`
目标动作：喝水提醒、休息提醒，以及后续可连接到 `stretch_yawn`、`sleepy` 等作息类动作的轻量互动。
问题：旧提醒气泡使用固定 `setInterval(45s)`，长期运行时会像闹钟一样机械出现，不符合“像一只小猫住在电脑里”的陪伴感。
参考片段：MVP 要求定时弹气泡提醒喝水/休息；真实小猫感要求减少重复和视觉疲劳。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变动画帧播放；提醒气泡由固定 interval 改为递归 timeout，并在 45-90 秒之间随机安排下一次出现。首次提醒仍保留 900ms，方便启动后快速验证。
水印处理：不涉及视频处理。
重建方法：`ReminderBubbleController` 支持注入 messages、firstDelay、min/max interval、visibleMs、random 和 timer；新增 `npm run validate:reminder-bubble-controller`，并加入 `validate:all`。
运行时输出：不涉及桌面截图；这是提醒节奏改动。
验证命令：`npm run validate:reminder-bubble-controller`、`npm run typecheck`、`npm run validate:release`。
桌面验收：后续可观察气泡不再严格每 45 秒出现，而是在区间内自然浮现。
已知问题：提醒气泡目前只显示文案，尚未把休息提醒主动绑定到 `stretch_yawn` 或 `sleepy` 动作；需要等相关动作视频生成并接入 manifest。
决定：接受随机提醒间隔作为降低机械感的基础；后续作息类动作接入后，再把提醒与姿势变化联动。

## 2026-06-16 可灵本地 key 直接复测

日期：2026-06-16
源文件：`.env.local`、`docs/kling-preflight-first.md`、`docs/kling-batch-status-first.md`、`docs/kling-integration.md`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：用户要求直接使用已提供 key 接入可灵，不再二次确认；需要确认当前阻塞是否仍是项目接入问题。
参考片段：`npm run kling:auth-check` 返回 `ok: true`、`400 auth_accepted`；`npm run kling:generate-batch -- --batch 1` 返回 `HTTP 429 / Account balance not enough`。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变运行时播放逻辑。
水印处理：未生成视频，尚未进入水印检查或去水印。
重建方法：直接使用本机 `.env.local` 中的可灵 key 运行鉴权、preflight 和第一批真实生成；真实密钥仍只保存在本地忽略文件中，没有写入代码、文档或提交历史。
运行时输出：不涉及桌面截图。
验证命令：`npm run kling:auth-check`、`npm run kling:preflight -- --batch 1 --write docs/kling-preflight-first.md`、`npm run kling:generate-batch -- --batch 1`、`npm run kling:batch-status -- --batch 1 --write docs/kling-batch-status-first.md --last-error "<最近一次错误>"`
桌面验收：第一批视频仍未生成，不能进入抽帧、manifest 接入或桌面动作验收。
已知问题：可灵账号余额不足，第一批 4 个视频仍缺失。
决定：确认项目侧已直接接入当前 key 并通过鉴权；余额补足后继续运行第一批生成命令，再按清单进行人工检查、去水印、抽帧和 runtime 接入。

## 2026-06-16 提醒事件类型化

日期：2026-06-16
源文件：`src/core/behavior/reminder-bubble-controller.ts`、`scripts/validate-reminder-bubble-controller.mjs`
目标动作：喝水提醒、休息提醒，以及后续可连接的 `stretch_yawn`、`sleepy`、`call_response` 等作息或回应动作。
问题：提醒气泡只有文案，没有输出“喝水/休息”类型；后续即使相关动作视频接入，也缺少稳定入口把提醒和姿势变化联动。
参考片段：MVP 要求定时弹气泡提醒喝水/休息；最终目标要求小猫像真实家养猫一样有日常陪伴和互动。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变序列帧播放；本次只让提醒显示时额外发出 `kind/message/index` 事件。
水印处理：不涉及视频处理。
重建方法：`ReminderBubbleController` 默认消息从纯字符串升级为 `{ kind, text }`；仍兼容外部传入字符串消息，并按顺序映射为 `water/rest`；新增 `onShow` 回调，后续运行时可根据 `water` 或 `rest` 选择动作。
运行时输出：提醒气泡文案仍保持“喝口水吧”和“休息一下眼睛”，当前不主动切换姿势，避免引用尚未生成的视频动作。
验证命令：`npm run validate:reminder-bubble-controller`
桌面验收：后续接入 `stretch_yawn`、`sleepy` 或 `call_response` 后，再验证气泡出现时是否能自然插入对应动作。
已知问题：第一批可灵视频仍因账号余额不足未生成，当前事件只能作为后续动作联动入口。
决定：接受提醒事件类型化作为作息互动的运行时基础；后续新视频进入 manifest 后，再把 `rest` 类型优先连接到伸懒腰/犯困类动作。

## 2026-06-16 提醒动作桥接

日期：2026-06-16
源文件：`src/core/behavior/reminder-action-bridge.ts`、`src/core/render/animation-manifest.ts`、`src/renderer/main.ts`、`scripts/validate-reminder-action-bridge.mjs`
目标动作：`stretch_yawn`、`sleepy`、`sleep`、`call_response`、`cursor_watch`
问题：提醒气泡已经有 `water/rest` 类型，但运行时尚未建立“提醒类型 -> 可播放动作”的安全桥接；后续视频进入 manifest 后仍需要手工改渲染入口。
参考片段：休息提醒应优先连接伸懒腰、犯困、入睡等真实小猫日常动作；喝水提醒应优先连接回应或看向用户的低强度互动动作。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变序列帧播放；`AnimationDirector` 仍负责在安全帧切换、非循环互动动作结束后回到日常动作。
水印处理：不涉及视频处理。
重建方法：新增 `resolveReminderAnimationAction`，按提醒类型选择候选动作；新增 `isRenderableRuntimeAnimationAction`，只有 manifest 中已存在、启用且有帧的动作才会被请求；renderer 在气泡显示时尝试桥接动作，缺失候选会静默跳过。
运行时输出：当前 manifest 尚未包含上述候选动作，因此桌宠仍只显示提醒气泡，不播放伪动作；后续可灵视频接入 manifest 后会自动触发对应候选。
验证命令：`npm run validate:reminder-action-bridge`、`npm run typecheck`
桌面验收：后续接入 `stretch_yawn` 或 `call_response` 等动作后，再观察气泡出现时是否能插入对应互动序列，并在动作结束后回到日常动作。
已知问题：第一批可灵视频仍因账号余额不足未生成，桥接链路目前只能验证解析与安全跳过。
决定：接受提醒动作桥接作为作息互动入口；后续素材接入时不再需要改提醒控制器，只需补齐 manifest 动作。

## 2026-06-16 鼠标靠近动作桥接

日期：2026-06-16
源文件：`src/core/behavior/proximity-action-bridge.ts`、`src/core/behavior/interaction-controller.ts`、`src/renderer/main.ts`、`scripts/validate-proximity-action-bridge.mjs`
目标动作：`cursor_watch`、`paw_raise`
问题：MVP 要求鼠标靠近有反应；当前状态机能触发靠近状态，但后续 `cursor_watch` 视频接入后，仍缺少独立的“靠近 -> 看向鼠标”动作候选入口。
参考片段：`cursor_watch` 是第一批可灵交互动作，定位为鼠标靠近时的低强度关注反应；`paw_raise` 是当前已接入的可播放互动动作。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变序列帧播放；鼠标靠近被冷却器接受后，只请求一个可播放候选动作，具体切换仍交给 `AnimationDirector`。
水印处理：不涉及视频处理。
重建方法：新增 `resolveProximityAnimationAction`，靠近时优先选择 `cursor_watch`，不可用时退到 `paw_raise`；`InteractionController` 增加 `onMouseNearAccepted` 回调，只在靠近交互真正被接受时通知 renderer。
运行时输出：当前 `cursor_watch` 尚未生成和接入，因此鼠标靠近仍可退到已有 `paw_raise`；未来 `cursor_watch` 进入 manifest 后会自动优先播放。
验证命令：`npm run validate:proximity-action-bridge`、`npm run validate:runtime-interaction-schedule`、`npm run typecheck`
桌面验收：后续接入 `cursor_watch` 后，靠近桌宠时应观察到低强度注视/关注动作，并在动作结束后回到日常动作。
已知问题：第一批可灵视频仍因账号余额不足未生成，`cursor_watch` 尚不可播放。
决定：接受鼠标靠近动作桥接作为交互素材接入入口；后续无需再改交互控制器即可接入 `cursor_watch`。

## 2026-06-16 点击动作桥接

日期：2026-06-16
源文件：`src/core/behavior/click-action-bridge.ts`、`src/core/behavior/interaction-controller.ts`、`src/renderer/main.ts`、`scripts/validate-click-action-bridge.mjs`
目标动作：`click_surprised`、`poke_annoyed`、`shy`、`waking`、`paw_raise`
问题：用户日常和小猫互动时，普通点击、多次点击和叫醒应有不同反应；当前状态机已区分这些交互，但后续视频接入后仍缺少动作候选入口。
参考片段：第一批可灵动作包含 `click_surprised`；后续动作计划包含 `poke_annoyed`、`shy`、`waking` 等互动素材。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变序列帧播放；点击交互被冷却器接受后，只请求一个可播放候选动作，动作切换和结束回日常仍由 `AnimationDirector` 处理。
水印处理：不涉及视频处理。
重建方法：新增 `resolveClickAnimationAction`，普通点击优先 `click_surprised`，多次点击优先 `poke_annoyed` 再 `shy`，睡眠唤醒优先 `waking`；候选缺失时退到已接入的 `paw_raise` 或静默跳过。
运行时输出：当前 `click_surprised`、`poke_annoyed`、`shy`、`waking` 尚未生成和接入，因此点击仍可退到已有 `paw_raise`；后续素材进入 manifest 后会自动优先播放更贴合语义的动作。
验证命令：`npm run validate:click-action-bridge`、`npm run validate:runtime-interaction-schedule`、`npm run typecheck`
桌面验收：后续接入 `click_surprised` 后，普通点击应播放惊讶反馈；接入 `poke_annoyed/shy` 后，多次点击应出现情绪变化；接入 `waking` 后，睡眠叫醒应有独立过渡。
已知问题：第一批可灵视频仍因账号余额不足未生成，真实点击视频动作尚不可播放。
决定：接受点击动作桥接作为用户主动互动入口；后续无需再改点击分支即可接入可灵互动素材。

## 2026-06-16 拖拽动作桥接

日期：2026-06-16
源文件：`src/core/behavior/drag-action-bridge.ts`、`src/core/behavior/interaction-controller.ts`、`src/renderer/main.ts`、`scripts/validate-drag-action-bridge.mjs`
目标动作：`dragging`、`paw_raise`
问题：用户移动桌宠时，应有独立的被抱起/拖动动作；当前拖拽只改变状态和窗口位置，后续 `dragging` 视频接入后仍缺少动作候选入口。
参考片段：动作计划中 `dragging` 是交互动作，用于拖拽专用循环，让移动宠物时仍有生命感。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变序列帧播放；拖拽真正启动且冷却器接受后，只请求一个可播放候选动作。
水印处理：不涉及视频处理。
重建方法：新增 `resolveDragAnimationAction`，拖拽开始优先选择 `dragging`，不可用时退到 `paw_raise`；拖拽结束不请求新动作，仍由原有状态恢复逻辑回到 idle。
运行时输出：当前 `dragging` 尚未生成和接入，因此拖拽开始仍可退到已有 `paw_raise`；后续素材进入 manifest 后会自动优先播放拖拽专用动作。
验证命令：`npm run validate:drag-action-bridge`、`npm run validate:runtime-interaction-schedule`、`npm run typecheck`
桌面验收：后续接入 `dragging` 后，长按拖动桌宠时应播放拖拽专用动作，松开后回到日常状态。
已知问题：可灵 `dragging` 视频仍未生成，真实拖拽视频动作尚不可播放。
决定：接受拖拽动作桥接作为移动桌宠的互动入口；后续无需再改拖拽分支即可接入 `dragging`。

## 2026-06-16 运行时动作桥接矩阵

日期：2026-06-16
源文件：`assets/config/action-bridges.json`、`scripts/runtime-action-bridge-report.mjs`、`scripts/validate-runtime-action-bridge-report.mjs`、`docs/runtime-action-bridge-report.md`
目标动作：提醒、鼠标靠近、普通点击、多次点击、睡眠叫醒和拖拽入口的全部候选动作。
问题：互动入口已经分批接入，但缺少一张统一表格说明每个入口会请求哪些动作，以及当前哪些动作已经可播放，后续排查容易在代码、manifest 和文档之间来回找。
参考片段：用户要求项目过程生成对应中文文档，方便后续查看纠错。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变序列帧播放；本次只生成桥接状态报告。
水印处理：不涉及视频处理。
重建方法：新增 `assets/config/action-bridges.json` 作为桥接候选的单一配置源；提醒、靠近、点击、拖拽桥接模块都读取该配置；`npm run runtime:action-bridge-report -- --write docs/runtime-action-bridge-report.md` 读取配置和 runtime manifest，生成中文矩阵。
运行时输出：当前 manifest 可播放动作仍为 `idle_primary`、`idle_secondary`、`tail_wag`、`walk`、`walk_left`、`paw_raise`；真实互动候选中 `paw_raise` 为 ready，其余候选仍 missing。
验证命令：`npm run validate:runtime-action-bridge-report`、`npm run runtime:action-bridge-report -- --write docs/runtime-action-bridge-report.md`
桌面验收：后续每次接入新动作后，重新生成矩阵，确认对应入口从 `missing` 变为 `ready`，再做桌面交互验收。
已知问题：可灵生成仍受账号余额限制，真实互动视频尚未生成。
决定：接受运行时动作桥接矩阵作为后续素材接入和纠错的主入口；新增动作进入 manifest 后必须刷新该文档。

## 2026-06-16 动作桥接候选契约校验

日期：2026-06-16
源文件：`assets/config/action-bridges.json`、`docs/kling-action-generation-plan.json`、`assets/runtime/animations/manifest.json`、`scripts/action-bridge-contract.mjs`、`scripts/validate-action-bridge-contract.mjs`
目标动作：运行时桥接配置中的全部候选动作。
问题：桥接候选已经集中到配置文件，但如果后续误写 action 名，运行时会静默跳过，素材生成计划也不会覆盖该动作。
参考片段：所有真实互动动作要么已在 runtime manifest 可播放，要么应在可灵动作计划中等待生成。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变序列帧播放；本次只增加配置一致性门禁。
水印处理：不涉及视频处理。
重建方法：新增 `npm run validate:action-bridge-contract`，校验 `assets/config/action-bridges.json` 中每个候选 action 必须存在于 `docs/kling-action-generation-plan.json` 或 `assets/runtime/animations/manifest.json`。
运行时输出：不改变桌宠显示；当前桥接候选总数为 11，均能在可灵计划或 runtime manifest 中找到。
验证命令：`npm run validate:action-bridge-contract`、`node scripts/action-bridge-contract.mjs`
桌面验收：无需单独桌面验收；该门禁用于防止后续接入素材时出现 action 名漂移。
已知问题：该校验不证明视频已生成，只证明候选动作在计划或 manifest 中登记。
决定：接受动作桥接契约校验作为修改 `action-bridges.json` 的必跑门禁，并加入总验证。

## 2026-06-16 可灵第一批生成复测仍余额不足

日期：2026-06-16
源文件：`docs/kling-preflight-first.md`、`docs/kling-batch-status-first.md`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：需要确认外部可灵账号状态是否已经能继续生成第一批真实视频。
参考片段：`npm run kling:auth-check` 返回 `ok: true`；`npm run kling:preflight -- --batch 1 --write docs/kling-preflight-first.md` 显示“可以开始生成”；`npm run kling:generate-batch -- --batch 1` 返回 `HTTP 429 / Account balance not enough`。
帧数：未生成新帧。
FPS：不变。
循环方式：不改变序列帧播放。
水印处理：未生成视频，尚未进入水印检查或去水印。
重建方法：直接使用本地 `.env.local` 中的可灵 key 重新跑鉴权、preflight、第一批生成和批次状态刷新；真实密钥仍未写入仓库。
运行时输出：不涉及桌面截图。
验证命令：`npm run kling:auth-check`、`npm run kling:preflight -- --batch 1 --write docs/kling-preflight-first.md`、`npm run kling:generate-batch -- --batch 1`、`npm run kling:batch-status -- --batch 1 --write docs/kling-batch-status-first.md --last-error "<最近一次错误>"`
桌面验收：第一批真实视频仍未生成，不能进入抽帧、manifest 接入或桌面动作验收。
已知问题：可灵账号余额仍不足，第一批 4 个视频仍缺失。
决定：继续保留运行时桥接和文档门禁；余额补足后再次执行第一批生成命令，并先列素材检查清单给用户确认。

## 2026-06-16 可灵第一批视频生成完成

日期：2026-06-16
源文件：`assets/origin/generated/kling/groom_face_wash.mp4`、`assets/origin/generated/kling/loaf_breathing.mp4`、`assets/origin/generated/kling/cursor_watch.mp4`、`assets/origin/generated/kling/click_surprised.mp4`、`docs/kling-batch-status-first.md`、`docs/kling-batch-intake-first.md`
目标动作：第一批 `groom_face_wash`、`loaf_breathing`、`cursor_watch`、`click_surprised`
问题：用户已给可灵账号充值，需要重新生成第一批真实小猫日常和交互视频。
参考片段：`npm run kling:preflight -- --batch 1 --write docs/kling-preflight-first.md` 显示“可以开始生成”；`npm run kling:generate-batch -- --batch 1` 依次生成并下载 4 个视频。
帧数：尚未抽帧。
FPS：尚未进入抽帧阶段，runtime FPS 不变。
循环方式：不改变序列帧播放；本次只生成原始可灵视频素材。
水印处理：尚未处理；生成后必须先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。
重建方法：使用本地 `.env.local` 中的可灵 key 执行 `npm run kling:generate-batch -- --batch 1`，生成视频保存在 `assets/origin/generated/kling/`；随后刷新 `docs/kling-batch-status-first.md` 和 `docs/kling-batch-intake-first.md`。
运行时输出：不涉及桌面截图；视频尚未接入 runtime manifest。
验证命令：`npm run kling:preflight -- --batch 1 --write docs/kling-preflight-first.md`、`npm run kling:generate-batch -- --batch 1`、`npm run kling:batch-status -- --batch 1 --write docs/kling-batch-status-first.md`、`npm run kling:batch-intake-checklist -- --batch 1 --write docs/kling-batch-intake-first.md`
桌面验收：尚未进行；需用户确认清单和人工素材检查后，才能进入去水印、抽帧、manifest 接入和桌面验收。
已知问题：4 个视频已经生成，但未检查水印和画面质量，不能直接接入桌宠。
决定：暂停在素材处理前确认点；等待用户确认 `docs/kling-batch-intake-first.md` 后，再处理水印、抽帧并接入 runtime。

## 2026-06-16 可灵第二批睡眠作息视频生成完成

日期：2026-06-16
源文件：`assets/origin/generated/kling/sleepy.mp4`、`assets/origin/generated/kling/sleep.mp4`、`assets/origin/generated/kling/sleeping.mp4`、`assets/origin/generated/kling/waking.mp4`、`docs/kling-batch-status-sleep-routine.md`、`docs/kling-batch-intake-sleep-routine.md`
目标动作：第二批 `sleepy`、`sleep`、`sleeping`、`waking`
问题：需要补齐变困、入睡、睡着、唤醒链路，让桌宠不再只有短促待机和简单互动。
参考片段：`npm run kling:preflight -- --batch sleep-routine --write docs/kling-preflight-sleep-routine.md` 显示“可以开始生成”；`npm run kling:generate-batch -- --batch sleep-routine` 依次生成并下载 4 个视频。
帧数：尚未抽帧。
FPS：尚未进入抽帧阶段，runtime FPS 不变。
循环方式：不改变序列帧播放；本次只生成原始可灵视频素材。
水印处理：尚未处理；生成后必须先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。
重建方法：使用本地 `.env.local` 中的可灵 key 执行 `npm run kling:generate-batch -- --batch sleep-routine`；随后刷新 `docs/kling-batch-status-sleep-routine.md` 和 `docs/kling-batch-intake-sleep-routine.md`。
运行时输出：不涉及桌面截图；视频尚未接入 runtime manifest。
验证命令：`npm run kling:preflight -- --batch sleep-routine --write docs/kling-preflight-sleep-routine.md`、`npm run kling:generate-batch -- --batch sleep-routine`、`npm run kling:batch-status -- --batch sleep-routine --write docs/kling-batch-status-sleep-routine.md`、`npm run kling:batch-intake-checklist -- --batch sleep-routine --write docs/kling-batch-intake-sleep-routine.md`
桌面验收：尚未进行；需用户确认清单和人工素材检查后，才能进入去水印、抽帧、manifest 接入和桌面验收。
已知问题：4 个睡眠作息视频已经生成，但未检查水印和画面质量，不能直接接入桌宠。
决定：暂停在素材处理前确认点；等待用户确认 `docs/kling-batch-intake-sleep-routine.md` 后，再处理水印、抽帧并接入 runtime。

## 2026-06-16 可灵第三批剩余状态与生活化变化视频生成完成

日期：2026-06-16
源文件：`assets/origin/generated/kling/desk_sniff.mp4`、`assets/origin/generated/kling/stretch_yawn.mp4`、`assets/origin/generated/kling/poke_annoyed.mp4`、`assets/origin/generated/kling/shy.mp4`、`assets/origin/generated/kling/dragging.mp4`、`assets/origin/generated/kling/call_response.mp4`、`docs/kling-batch-status-remaining-state-and-variety.md`、`docs/kling-batch-intake-remaining-state-and-variety.md`
目标动作：第三批 `desk_sniff`、`stretch_yawn`、`poke_annoyed`、`shy`、`dragging`、`call_response`
问题：需要补齐剩余 fallback 状态和生活化变化，让桌宠有好奇、伸懒腰、被戳烦、害羞、拖拽、呼唤回应等更真实的日常与交互表现。
参考片段：`npm run kling:preflight -- --batch remaining-state-and-variety --write docs/kling-preflight-remaining-state-and-variety.md` 显示“可以开始生成”；`npm run kling:generate-batch -- --batch remaining-state-and-variety` 依次生成并下载 6 个视频。
帧数：尚未抽帧。
FPS：尚未进入抽帧阶段，runtime FPS 不变。
循环方式：不改变序列帧播放；本次只生成原始可灵视频素材。
水印处理：尚未处理；生成后必须先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。
重建方法：使用本地 `.env.local` 中的可灵 key 执行 `npm run kling:generate-batch -- --batch remaining-state-and-variety`；随后刷新 `docs/kling-batch-status-remaining-state-and-variety.md` 和 `docs/kling-batch-intake-remaining-state-and-variety.md`。
运行时输出：不涉及桌面截图；视频尚未接入 runtime manifest。
验证命令：`npm run kling:preflight -- --batch remaining-state-and-variety --write docs/kling-preflight-remaining-state-and-variety.md`、`npm run kling:generate-batch -- --batch remaining-state-and-variety`、`npm run kling:batch-status -- --batch remaining-state-and-variety --write docs/kling-batch-status-remaining-state-and-variety.md`、`npm run kling:batch-intake-checklist -- --batch remaining-state-and-variety --write docs/kling-batch-intake-remaining-state-and-variety.md`
桌面验收：尚未进行；需用户确认清单和人工素材检查后，才能进入去水印、抽帧、manifest 接入和桌面验收。
已知问题：6 个剩余状态与生活化变化视频已经生成，但未检查水印和画面质量，不能直接接入桌宠。
决定：暂停在素材处理前确认点；等待用户确认 `docs/kling-batch-intake-remaining-state-and-variety.md` 后，再处理水印、抽帧并接入 runtime。

## 2026-06-16 可灵生成视频素材审查与视觉初筛

日期：2026-06-16
源文件：`scripts/kling-generated-video-audit.mjs`、`scripts/validate-kling-generated-video-audit.mjs`、`docs/kling-generated-video-audit.md`、`docs/kling-generated-video-visual-review.md`、`assets/reviews/kling-generated/*.png`
目标动作：全部 14 个可灵生成动作视频
问题：生成视频虽然已经存在，但进入 runtime 前仍需要可复现的基础审查、抽样证据和人工水印/画面检查入口。
参考片段：`npm run kling:generated-video-audit -- --batch all --extract-previews --write docs/kling-generated-video-audit.md` 读取 `docs/kling-generation-batches.json` 和本地 mp4，生成元数据审查报告与抽样图。
帧数：尚未抽帧为 runtime 序列帧；本次只抽取 review 证据图。
FPS：runtime FPS 不变。
循环方式：不改变序列帧播放；本次只建立素材审查流程。
水印处理：未执行去水印；抽样总览暂未发现明显文字、水印或 logo，但仍需逐视频人工确认。
重建方法：运行 `npm run kling:generated-video-audit -- --batch all --extract-previews --write docs/kling-generated-video-audit.md`。
运行时输出：不涉及桌面截图；视频尚未接入 runtime manifest。
验证命令：`node scripts/validate-kling-generated-video-audit.mjs`、`npm run kling:generated-video-audit -- --batch all --extract-previews --write docs/kling-generated-video-audit.md`
桌面验收：尚未进行；需用户确认清单和人工素材检查后，才能进入去水印、抽帧、manifest 接入和桌面验收。
已知问题：`cursor_watch` 抽样图中出现额外实体物体，外形像小鼠/道具，不适合作为鼠标靠近交互；已记录在 `docs/kling-generated-video-visual-review.md`，建议重生成或暂缓接入。
决定：先提交审查工具和证据文档；runtime 接入继续等待清单确认与逐视频人工检查。

## 2026-06-16 cursor_watch 重生成候选

日期：2026-06-16
源文件：`docs/kling-cursor-watch-regeneration.md`、`docs/kling-cursor-watch-regeneration-plan.json`、`assets/origin/generated/kling/cursor_watch_clean_candidate.mp4`、`assets/origin/generated/kling/cursor_watch_clean_candidate_v2.mp4`、`assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4`、`assets/reviews/kling-generated/cursor_watch_clean_candidate*.png`
目标动作：`cursor_watch`
问题：原 `cursor_watch` 抽样帧中出现额外实体小鼠/道具；v1 候选出现星光；v2 候选仍有细小亮点。
参考片段：使用 `npm run kling:generate -- --action cursor_watch_clean_candidate_v3 --plan docs/kling-cursor-watch-regeneration-plan.json` 生成 v3 候选。
帧数：尚未抽帧为 runtime 序列帧；本次只抽取 review 证据图。
FPS：runtime FPS 不变。
循环方式：不改变序列帧播放；本次只生成替换候选。
水印处理：未执行去水印；v3 抽样图和时间轴抽样图未发现明显文字、水印、logo、实体物体或光点。
重建方法：运行 `npm run kling:generate -- --action cursor_watch_clean_candidate_v3 --plan docs/kling-cursor-watch-regeneration-plan.json`，再用 ffmpeg 抽取 `assets/reviews/kling-generated/cursor_watch_clean_candidate_v3.png` 和 `assets/reviews/kling-generated/cursor_watch_clean_candidate_v3_sweep.png`。
运行时输出：不涉及桌面截图；候选视频尚未替换正式 `cursor_watch`，也尚未接入 runtime manifest。
验证命令：`npm run kling:generate -- --action cursor_watch_clean_candidate_v3 --plan docs/kling-cursor-watch-regeneration-plan.json --dry-run`、`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -show_entries format=duration -of json assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4`
桌面验收：尚未进行；需逐视频人工检查 v3 并确认替换清单后，才能进入去水印、抽帧、manifest 接入和桌面验收。
已知问题：v3 只完成抽样检查，尚未全程播放确认。
决定：把 `cursor_watch_clean_candidate_v3` 记录为优先替换候选；保留旧 `cursor_watch.mp4`，等待正式替换清单确认。

## 2026-06-16 日常低疲劳补充动作生成

日期：2026-06-16
源文件：`assets/origin/generated/kling/slow_blink.mp4`、`assets/origin/generated/kling/look_around.mp4`、`assets/reviews/kling-generated/slow_blink_sweep.png`、`assets/reviews/kling-generated/look_around_sweep.png`、`docs/kling-daily-antifatigue-supplement.md`
目标动作：`slow_blink`、`look_around`
问题：现有桌宠日常动作仍容易依赖待机循环，长时间观看会重复；需要补充低强度、生活化、不会打扰用户的日常插入动作。
参考片段：`npm run kling:generate -- --action slow_blink`、`npm run kling:generate -- --action look_around` 生成两个动作视频。
帧数：尚未抽帧为 runtime 序列帧；本次只抽取 review 证据图。
FPS：runtime FPS 不变。
循环方式：不改变序列帧播放；本次只生成原始候选视频。
水印处理：未执行去水印；时间轴抽样未发现明显文字、水印、logo、道具或额外物体。
重建方法：分别运行 `npm run kling:generate -- --action slow_blink` 和 `npm run kling:generate -- --action look_around`，再用 ffmpeg 抽取 `slow_blink_sweep.png` 与 `look_around_sweep.png`。
运行时输出：不涉及桌面截图；视频尚未接入 runtime manifest。
验证命令：`npm run kling:generate -- --action slow_blink --dry-run`、`npm run kling:generate -- --action look_around --dry-run`、`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -show_entries format=duration -of json assets/origin/generated/kling/slow_blink.mp4`、`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -show_entries format=duration -of json assets/origin/generated/kling/look_around.mp4`
桌面验收：尚未进行；需逐视频人工检查并确认正式接入清单后，才能进入去水印、抽帧、manifest 接入和桌面验收。
已知问题：两个动作只完成元数据和抽样检查，尚未全程播放确认。
决定：把 `slow_blink` 与 `look_around` 记录为低疲劳日常动作候选；等待正式接入清单确认。

## 2026-06-16 第一波 runtime 接入候选清单

日期：2026-06-16
源文件：`docs/runtime-intake-wave1-checklist.md`、`assets/runtime/animations/manifest.json`、`assets/config/action-bridges.json`
目标动作：`slow_blink`、`look_around`、`cursor_watch`、`click_surprised`、`poke_annoyed`、`call_response`、`stretch_yawn`
问题：已经生成多批可灵素材，但进入抽帧和 runtime 前需要明确第一波接入边界，避免一次接入太多状态导致衔接问题难排查。
参考片段：当前 manifest 只有 6 个 action，多个状态仍回退 `idle_primary`；行为桥接已经预留 reminder、proximity、click、drag 候选。
帧数：尚未抽帧。
FPS：runtime FPS 不变。
循环方式：未修改；清单建议 daily 动作使用安全帧中断，interactive 动作使用 locked 后回到 `idle_primary`。
水印处理：未执行去水印；清单要求确认后先逐视频播放检查再处理。
重建方法：人工维护 `docs/runtime-intake-wave1-checklist.md`，基于当前审查证据和 runtime 行为入口整理。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。
验证命令：`npm run validate:release`
桌面验收：尚未进行；需用户确认第一波清单后，才能进入去水印、抽帧、manifest 接入和桌面验收。
已知问题：第一波清单仍是确认文档，不代表素材已经进入桌宠。
决定：暂停在 runtime 接入前确认点；等待用户确认 `docs/runtime-intake-wave1-checklist.md`。

## 2026-06-17 第一波 P1 候选时间轴抽样审查

日期：2026-06-17
源文件：`assets/origin/generated/kling/click_surprised.mp4`、`assets/origin/generated/kling/poke_annoyed.mp4`、`assets/origin/generated/kling/call_response.mp4`、`assets/origin/generated/kling/stretch_yawn.mp4`、`assets/reviews/kling-generated/*_sweep.png`、`docs/runtime-intake-wave1-sweep-review.md`
目标动作：`click_surprised`、`poke_annoyed`、`call_response`、`stretch_yawn`
问题：第一波 P1 候选只有单张抽样证据，不足以判断动作全程是否有外物、水印或明显裁切风险。
参考片段：使用 `ffmpeg -vf "fps=3,scale=150:-1,tile=5x3"` 为四个动作生成 15 帧时间轴抽样图。
帧数：尚未抽帧为 runtime 序列帧；本次只抽取 review 证据图。
FPS：runtime FPS 不变。
循环方式：未修改；仍等待用户确认第一波清单。
水印处理：未执行去水印；时间轴抽样未发现明显文字、水印、logo 或额外物体。
重建方法：对每个源视频运行 ffmpeg 时间轴抽样命令，输出到 `assets/reviews/kling-generated/<action>_sweep.png`。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。
验证命令：`npm run validate:release`
桌面验收：尚未进行；需用户确认第一波清单并完成全程人工播放检查后，才能进入去水印、抽帧、manifest 接入和桌面验收。
已知问题：`poke_annoyed` 部分帧尾巴和身体接近边缘，后续抽帧裁切要重点检查；`stretch_yawn` 更像打哈欠/抬前爪，不应预期为完整伸懒腰。
决定：补充 P1 时间轴抽样证据，但继续暂停在 runtime 接入前确认点。

## 2026-06-17 第二波/暂缓动作时间轴抽样审查

日期：2026-06-17
源文件：`assets/origin/generated/kling/groom_face_wash.mp4`、`assets/origin/generated/kling/loaf_breathing.mp4`、`assets/origin/generated/kling/desk_sniff.mp4`、`assets/origin/generated/kling/sleepy.mp4`、`assets/origin/generated/kling/sleep.mp4`、`assets/origin/generated/kling/sleeping.mp4`、`assets/origin/generated/kling/waking.mp4`、`assets/origin/generated/kling/shy.mp4`、`assets/origin/generated/kling/dragging.mp4`、`assets/reviews/kling-generated/*_sweep.png`、`docs/runtime-intake-wave2-sweep-review.md`
目标动作：`groom_face_wash`、`loaf_breathing`、`desk_sniff`、`sleepy`、`sleep`、`sleeping`、`waking`、`shy`、`dragging`
问题：第一波暂缓动作只有单张抽样或批次记录，不足以决定第二波接入顺序和睡眠链路分组。
参考片段：使用 `ffmpeg -vf "fps=3,scale=150:-1,tile=5x3"` 为九个动作生成 15 帧时间轴抽样图。
帧数：尚未抽帧为 runtime 序列帧；本次只抽取 review 证据图。
FPS：runtime FPS 不变。
循环方式：未修改；仍等待用户确认任何正式 runtime 接入清单。
水印处理：未执行去水印；时间轴抽样未发现明显文字、水印、logo 或额外物体。
重建方法：对每个源视频运行 ffmpeg 时间轴抽样命令，输出到 `assets/reviews/kling-generated/<action>_sweep.png`。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。
验证命令：`npm run validate:release`
桌面验收：尚未进行；需用户确认第二波接入清单并完成全程人工播放检查后，才能进入去水印、抽帧、manifest 接入和桌面验收。
已知问题：`loaf_breathing` 更像正坐轻呼吸，不是明确香箱趴；`sleeping` 抽样更像正坐轻闭眼，不建议单独作为真正睡眠循环；`dragging` 动作幅度较小，建议留到拖拽专项。
决定：补充第二波/暂缓动作时间轴抽样证据；正式 runtime 接入仍暂停在用户确认清单前。

## 2026-06-17 runtime 接入分波计划门禁

日期：2026-06-17
源文件：`docs/runtime-intake-waves.json`、`scripts/validate-runtime-intake-waves.mjs`、`docs/runtime-intake-wave1-checklist.md`、`docs/runtime-intake-wave2-sweep-review.md`
目标动作：第一波、第二波、睡眠链路和拖拽专项中的可灵生成候选动作
问题：素材审查记录已经分散在多份中文文档中，但正式接入 runtime 前缺少机器可读的分波、桥接入口、衔接策略和确认状态门禁。
参考片段：基于第一波清单、第一波 P1 时间轴审查和第二波/暂缓动作时间轴审查整理 `docs/runtime-intake-waves.json`。
帧数：尚未抽帧为 runtime 序列帧；本次只新增接入计划门禁。
FPS：runtime FPS 不变。
循环方式：未修改；JSON 中只记录建议的 `interruptPolicy`、`returnTo` 和 `transitionPlan`。
水印处理：未执行去水印；JSON 中为每个 action 记录正式抽帧前必须执行的 `watermarkGate`。
重建方法：新增 `npm run validate:runtime-intake-waves`，检查来源视频、审查证据、runtime 输出路径、桥接入口、衔接策略和用户确认状态。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。
验证命令：`npm run validate:runtime-intake-waves`、`npm run validate:release`
桌面验收：尚未进行；本次是接入前门禁，不代表素材已进入桌宠。
已知问题：所有候选仍保持 `needs-user-confirmation`，正式抽帧和 manifest 接入前仍需先列清单确认。
决定：接受 `docs/runtime-intake-waves.json` 作为后续 runtime 接入的机器可读入口，并纳入全量发布校验。

## 2026-06-17 第一波 runtime 接入前用户确认清单生成器

日期：2026-06-17
源文件：`docs/runtime-intake-waves.json`、`scripts/runtime-intake-checklist.mjs`、`scripts/validate-runtime-intake-checklist.mjs`、`docs/runtime-intake-wave1-execution-checklist.md`
目标动作：`slow_blink`、`look_around`、`cursor_watch`、`click_surprised`、`poke_annoyed`、`call_response`、`stretch_yawn`
问题：第一波接入前需要给用户看的确认清单必须稳定、中文、可重复生成，避免后续手工遗漏来源视频、审查证据、桥接入口、衔接策略或禁止项。
参考片段：读取 `docs/runtime-intake-waves.json` 的 `wave1`，渲染到 `docs/runtime-intake-wave1-execution-checklist.md`。
帧数：尚未抽帧为 runtime 序列帧；本次只生成确认清单。
FPS：runtime FPS 不变。
循环方式：未修改；清单只记录建议的 `interruptPolicy`、`returnTo` 和 `transitionPlan`。
水印处理：未执行去水印；清单要求正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和明显变形。
重建方法：新增 `npm run runtime:intake-checklist -- --wave wave1 --write docs/runtime-intake-wave1-execution-checklist.md`，并用 `npm run validate:runtime-intake-checklist` 覆盖渲染行为。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。
验证命令：`npm run validate:runtime-intake-checklist`、`npm run validate:release`
桌面验收：尚未进行；本次是接入前用户确认清单，不代表第一波动作已进入桌宠。
已知问题：清单仍处于 `needs-user-confirmation` 状态，未得到用户确认前禁止抽帧、去水印/抠绿、修改 manifest 或覆盖 runtime 目录。
决定：接受 `docs/runtime-intake-wave1-execution-checklist.md` 作为下一步第一波 runtime 接入前需要展示给用户确认的清单。

## 2026-06-17 全部 runtime 接入波次确认清单同步

日期：2026-06-17
源文件：`docs/runtime-intake-waves.json`、`docs/runtime-intake-wave1-execution-checklist.md`、`docs/runtime-intake-wave2-execution-checklist.md`、`docs/runtime-intake-sleep-routine-execution-checklist.md`、`docs/runtime-intake-dragging-special-execution-checklist.md`、`scripts/validate-runtime-intake-checklists-current.mjs`
目标动作：`docs/runtime-intake-waves.json` 中全部 4 个波次的 16 个候选动作
问题：只有第一波确认清单会让后续第二波、睡眠链路和拖拽专项仍依赖人工临时整理，容易遗漏动作、来源视频、桥接入口或衔接策略。
参考片段：使用 `npm run runtime:intake-checklist -- --wave <wave-id> --write <doc>` 为 `wave2`、`sleep-routine`、`dragging-special` 补齐确认清单。
帧数：尚未抽帧为 runtime 序列帧；本次只生成确认清单并校验同步。
FPS：runtime FPS 不变。
循环方式：未修改；每份清单只记录建议的 `interruptPolicy`、`returnTo` 和 `transitionPlan`。
水印处理：未执行去水印；每份清单继续要求正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和明显变形。
重建方法：新增 `npm run validate:runtime-intake-checklists-current`，检查每个波次清单存在，并包含对应 action 的来源视频、runtime 输出路径和桥接入口。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。
验证命令：`npm run validate:runtime-intake-checklists-current`、`npm run validate:release`
桌面验收：尚未进行；本次是接入前用户确认清单同步，不代表任何新动作已进入桌宠。
已知问题：全部清单仍处于 `needs-user-confirmation` 状态，未得到用户确认前禁止抽帧、去水印/抠绿、修改 manifest 或覆盖 runtime 目录。
决定：接受四份 runtime 接入前用户确认清单，并把同步校验纳入全量发布校验。

## 2026-06-17 第一波 runtime 接入前素材预检

日期：2026-06-17
源文件：`docs/runtime-intake-waves.json`、`assets/origin/generated/kling/slow_blink.mp4`、`assets/origin/generated/kling/look_around.mp4`、`assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4`、`assets/origin/generated/kling/click_surprised.mp4`、`assets/origin/generated/kling/poke_annoyed.mp4`、`assets/origin/generated/kling/call_response.mp4`、`assets/origin/generated/kling/stretch_yawn.mp4`、`scripts/runtime-intake-preflight.mjs`、`scripts/validate-runtime-intake-preflight.mjs`、`docs/runtime-intake-wave1-preflight.md`
目标动作：`slow_blink`、`look_around`、`cursor_watch`、`click_surprised`、`poke_annoyed`、`call_response`、`stretch_yawn`
问题：第一波已经有执行前确认清单，但在用户批准抽帧前还需要可复现地确认来源视频、审查证据、时长、分辨率和确认状态齐全。
参考片段：执行 `npm run runtime:intake-preflight -- --wave wave1 --write docs/runtime-intake-wave1-preflight.md`，读取 ffprobe 元数据和 review 证据文件。
帧数：尚未抽帧为 runtime 序列帧；本次只读取视频元数据并生成预检报告。
FPS：runtime FPS 不变。
循环方式：未修改；报告只记录建议的 `interruptPolicy`、`returnTo` 和 `transitionPlan`。
水印处理：未执行去水印；报告明确仍需逐视频人工播放检查无文字、水印、logo、额外物体、变形和裁切。
重建方法：新增 `npm run runtime:intake-preflight -- --wave wave1 --write docs/runtime-intake-wave1-preflight.md` 和 `npm run validate:runtime-intake-preflight`。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。
验证命令：`npm run validate:runtime-intake-preflight`、`npm run validate:release`
桌面验收：尚未进行；本次是接入前素材预检，不代表第一波动作已进入桌宠。
已知问题：全部 action 仍处于 `needs-user-confirmation` 状态；预检通过只代表可进入人工播放检查，不代表已批准抽帧或 runtime 接入。
决定：接受 `docs/runtime-intake-wave1-preflight.md` 作为第一波接入前素材健康报告，并把预检验证纳入全量发布校验。

## 2026-06-17 全部 runtime 接入波次素材预检同步

日期：2026-06-17
源文件：`docs/runtime-intake-waves.json`、`docs/runtime-intake-wave1-preflight.md`、`docs/runtime-intake-wave2-preflight.md`、`docs/runtime-intake-sleep-routine-preflight.md`、`docs/runtime-intake-dragging-special-preflight.md`、`scripts/validate-runtime-intake-preflights-current.mjs`
目标动作：`docs/runtime-intake-waves.json` 中全部 4 个波次的 16 个候选动作
问题：只有第一波预检报告会让后续第二波、睡眠链路和拖拽专项仍缺少接入前素材健康证据。
参考片段：使用 `npm run runtime:intake-preflight -- --wave <wave-id> --write <doc>` 为 `wave2`、`sleep-routine`、`dragging-special` 补齐预检报告。
帧数：尚未抽帧为 runtime 序列帧；本次只读取视频元数据并生成预检报告。
FPS：runtime FPS 不变。
循环方式：未修改；报告只记录建议的 `interruptPolicy`、`returnTo` 和 `transitionPlan`。
水印处理：未执行去水印；每份报告明确仍需逐视频人工播放检查无文字、水印、logo、额外物体、变形和裁切。
重建方法：新增 `npm run validate:runtime-intake-preflights-current`，检查每个波次预检报告存在，并包含对应 action 的来源视频、桥接入口和水印门禁。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。
验证命令：`npm run validate:runtime-intake-preflights-current`、`npm run validate:release`
桌面验收：尚未进行；本次是接入前素材预检同步，不代表任何新动作已进入桌宠。
已知问题：全部 action 仍处于 `needs-user-confirmation` 状态；预检通过只代表可进入人工播放检查，不代表已批准抽帧或 runtime 接入。
决定：接受四份 runtime 接入前素材预检报告，并把同步校验纳入全量发布校验。

## 2026-06-17 第一波 runtime 接入执行 dry-run 门禁

日期：2026-06-17
源文件：`docs/runtime-intake-waves.json`、`assets/runtime/animations/manifest.json`、`assets/config/action-bridges.json`、`scripts/runtime-intake-executor.mjs`、`scripts/validate-runtime-intake-executor.mjs`、`docs/runtime-intake-wave1-dry-run.md`
目标动作：`slow_blink`、`look_around`、`cursor_watch`、`click_surprised`、`poke_annoyed`、`call_response`、`stretch_yawn`
问题：第一波已经具备清单和素材预检，但真正执行前还需要明确将新增哪些 manifest action、写入哪些 frame 目录、哪些桥接已引用、哪些桥接需要人工设计，并确保未批准时不能写 runtime。
参考片段：执行 `npm run runtime:intake-executor -- --wave wave1 --dry-run --write docs/runtime-intake-wave1-dry-run.md`，生成只读 dry-run 报告。
帧数：尚未抽帧为 runtime 序列帧；本次只生成 dry-run 写入计划。
FPS：runtime FPS 不变。
循环方式：未修改；报告只记录建议的 `interruptPolicy`、`returnTo` 和 `transitionPlan`。
水印处理：未执行去水印；报告继续要求正式抽帧前逐视频人工播放检查。
重建方法：新增 `npm run runtime:intake-executor -- --wave wave1 --dry-run --write docs/runtime-intake-wave1-dry-run.md` 和 `npm run validate:runtime-intake-executor`。非 dry-run 需要批准文件 `docs/runtime-intake-approvals/wave1.approved.json`，当前未创建。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。dry-run 显示第一波会新增 7 个 manifest action 和 7 个帧目录。
验证命令：`npm run validate:runtime-intake-executor`、`npm run validate:release`
桌面验收：尚未进行；本次是接入执行 dry-run，不代表第一波动作已进入桌宠。
已知问题：dry-run 只证明桥接入口和写入计划已经明确；未得到用户确认和批准文件前，仍禁止抽帧、去水印/抠绿、修改 manifest 或覆盖 runtime 目录。
决定：接受 `docs/runtime-intake-wave1-dry-run.md` 作为第一波接入执行前写入计划，并把执行器验证纳入全量发布校验。

## 2026-06-17 低疲劳日常轮换桥接补齐

日期：2026-06-17
源文件：`assets/config/action-bridges.json`、`scripts/action-bridge-contract.mjs`、`scripts/runtime-action-bridge-report.mjs`、`scripts/runtime-intake-executor.mjs`、`docs/runtime-action-bridge-report.md`、`docs/runtime-intake-wave1-dry-run.md`
目标动作：`slow_blink`、`look_around`
问题：第一波 dry-run 中 `slow_blink` 和 `look_around` 已有视频、清单和预检，但还没有被运行时桥接矩阵明确归入日常低疲劳轮换，导致接入后仍需临时设计日常动作入口。
参考片段：新增 `dailyRotation.lowFatigue` 桥接组，包含 `slow_blink`、`look_around`；同步扩展 action bridge 契约、运行时桥接报告和 runtime intake dry-run 的桥接识别。
帧数：尚未抽帧为 runtime 序列帧；本次只补齐桥接配置和报告。
FPS：runtime FPS 不变。
循环方式：未修改；`dailyRotation.lowFatigue` 只是接入后的候选入口，不代表动作已经可播放。
水印处理：未执行去水印；后续正式接入仍需逐视频人工播放检查。
重建方法：更新 `assets/config/action-bridges.json`，重新生成 `docs/runtime-action-bridge-report.md` 和 `docs/runtime-intake-wave1-dry-run.md`。
运行时输出：不涉及桌面截图；尚未接入 runtime manifest。更新后的 dry-run 显示第一波 7 个动作均已被桥接引用。
验证命令：`npm run validate:action-bridge-contract`、`npm run validate:runtime-action-bridge-report`、`npm run validate:runtime-intake-executor`、`npm run validate:release`
桌面验收：尚未进行；本次只是桥接准备，不代表 `slow_blink` 或 `look_around` 已进入桌宠。
已知问题：`slow_blink`、`look_around` 当前在桥接矩阵中仍显示 `missing`，需要用户确认后抽帧并接入 manifest 才会变成 `ready`。
决定：接受 `dailyRotation.lowFatigue` 作为第一波低疲劳日常动作的运行时入口。

## 2026-06-17 第一波 runtime 动作正式接入

日期：2026-06-17
源文件：`docs/runtime-intake-approvals/wave1.approved.json`、`scripts/runtime-intake-executor.mjs`、`assets/runtime/animations/manifest.json`、`assets/runtime/animations/slow_blink/frames`、`assets/runtime/animations/look_around/frames`、`assets/runtime/animations/cursor_watch/frames`、`assets/runtime/animations/click_surprised/frames`、`assets/runtime/animations/poke_annoyed/frames`、`assets/runtime/animations/call_response/frames`、`assets/runtime/animations/stretch_yawn/frames`
目标动作：`slow_blink`、`look_around`、`cursor_watch`、`click_surprised`、`poke_annoyed`、`call_response`、`stretch_yawn`
问题：桌宠之前只有少量原始动作，日常重复度高，鼠标靠近、点击和提醒仍大量回退到 `paw_raise` 或 `idle_primary`，无法形成真实小猫在电脑里生活的感觉。
参考片段：执行 `npm run runtime:intake-executor -- --wave wave1 --execute`，在批准文件存在时从可灵视频抽取 5 秒 24fps 序列帧，并把 7 个新动作写入 runtime manifest。
帧数：每个新动作 120 帧；第一波合计新增 840 张 runtime PNG。
FPS：24fps。
循环方式：`slow_blink`、`look_around`、`stretch_yawn` 作为日常插入动作进入 `DailyAnimationRotator` 可用池；`cursor_watch`、`click_surprised`、`poke_annoyed`、`call_response` 作为交互动作由桥接入口触发，播放结束后回到 `idle_primary`。
水印处理：抽帧时执行绿幕抠像，并对既定水印区域做透明化处理；本次没有把 mp4 源视频加入 Git。
重建方法：保留受控执行器，只允许新增帧目录；若再次 dry-run，报告会显示 7 个动作变为 `manifest=update`、`frames=replace`，提醒禁止误覆盖。
运行时输出：`docs/runtime-action-bridge-report.md` 显示当前可播放动作从 6 个增加到 13 个，第一波桥接动作均为 `ready`。
验证命令：`npm run validate:runtime-intake-executor`、`npm run validate:runtime-animations`、`npm run validate:runtime-behavior-schedule`、`npm run validate:runtime-action-bridge-report`、`npm run validate:release`
桌面验收：待执行；下一步需要启动桌宠截图/序列帧检查，确认透明帧、日常轮换、鼠标靠近、点击、提醒动作在桌面最上层实际可见。
已知问题：睡眠链路、拖拽专项和第二波生活动作尚未进入 runtime；`shy`、`waking`、`dragging`、`sleepy`、`sleep` 仍在桥接报告中显示缺失。
决定：接受第一波 7 个动作作为首批真实可灵素材 runtime 接入结果，后续先做桌面验收，再进入第二波清单确认与接入。

## 2026-06-17 runtime 透明边缘质量修复与桌面验收

日期：2026-06-17
源文件：`scripts/runtime-alpha-cleanup.mjs`、`scripts/validate-runtime-alpha-quality.mjs`、`scripts/runtime-intake-executor.mjs`、`scripts/build-runtime-animations-from-origin.mjs`、`assets/runtime/animations/*/frames`、`assets/reviews/runtime/wave1-alpha-clean-desktop-capture.png`
目标动作：全部已启用 runtime 动作，重点覆盖第一波 7 个可灵动作和原有 `idle_primary`、`idle_secondary`、`tail_wag`、`walk`、`walk_left`、`paw_raise`
问题：第一波桌面截图已经证明桌宠可见并会动，但黑底下能看到绿幕边缘和底部暗绿色阴影，影响桌宠像真实小猫在电脑里的感觉。
参考片段：新增 `npm run validate:runtime-alpha-quality`，检测可见像素中的高绿色/暗绿色残留；新增 `npm run runtime:alpha-cleanup`，对全部 runtime PNG 执行绿色优势像素 alpha 清理。
帧数：当前 runtime 共 1272 张 PNG，全部执行边缘清理。
FPS：不变。
循环方式：不变；本次只处理透明边缘质量，不改变动作调度。
水印处理：保留既有水印区域透明化；新增绿幕残留清理，后续 `runtime:intake-executor` 和 `animations:build-from-origin` 都会自动复用。
重建方法：先执行 `npm run runtime:alpha-cleanup`，再执行 `npm run validate:runtime-alpha-quality`；正式抽帧脚本已内置同样清理步骤。
运行时输出：`YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-alpha-clean.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=1000 npm run dev` 生成 8 张桌面截图，`capture:inspect` 显示 8 张均为 440x440 PNG 且 8 张哈希不同。
验证命令：`npm run validate:runtime-alpha-quality`、`npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-alpha-clean.png --count 8 --min-changed-frames 4 --min-width 200 --min-height 200`
桌面验收：通过；验收拼图保存到 `assets/reviews/runtime/wave1-alpha-clean-desktop-capture.png`。
已知问题：边缘仍可能存在极细的自然抠像痕迹；后续如果要进一步拟真，可设计羽化/去色而不是单纯透明化。
决定：接受当前透明边缘修复作为第一波动作进入桌面可视化验收后的质量补丁，并把 alpha 质量验证纳入全量发布校验。

## 2026-06-17 第二波 runtime 动作正式接入

日期：2026-06-17
源文件：`docs/runtime-intake-approvals/wave2.approved.json`、`docs/runtime-intake-wave2-dry-run.md`、`assets/config/action-bridges.json`、`assets/runtime/animations/manifest.json`、`assets/runtime/animations/groom_face_wash/frames`、`assets/runtime/animations/loaf_breathing/frames`、`assets/runtime/animations/desk_sniff/frames`、`assets/runtime/animations/shy/frames`、`assets/reviews/runtime/wave2-runtime-contact-sheet.png`、`assets/reviews/runtime/wave2-desktop-capture.png`
目标动作：`groom_face_wash`、`loaf_breathing`、`desk_sniff`、`shy`
问题：第一波已经让鼠标、点击和提醒有真实动作，但日常生活感仍不足，连续点击的 `shy` 候选也因为缺少 runtime 帧和 stateMap 映射仍会回退到已有动作。
参考片段：用户回复选项 `2`，确认 wave2 四个动作全部接入；执行 `npm run runtime:intake-executor -- --wave wave2 --execute`，由可灵视频抽取序列帧，并更新 runtime manifest。
帧数：每个新动作 120 帧；第二波合计新增 480 张 runtime PNG。
FPS：24fps。
循环方式：`groom_face_wash` 和 `desk_sniff` 作为日常插入动作，播放后回到 `idle_primary`；`loaf_breathing` 按用户确认纳入低疲劳日常轮换，并通过 `loop=true` 保持轻呼吸循环；`shy` 作为连续点击和温柔互动候选，锁定播放后回到待机。
水印处理：执行绿幕抠像、固定水印区域透明化和绿色残留透明边缘清理；本次没有把 mp4 源视频加入 Git。
重建方法：`docs/runtime-intake-wave2-dry-run.md` 显示四个动作均为新增帧目录且桥接已引用；`scripts/runtime-intake-executor.mjs` 支持 `loop` 字段，后续重新处理同类素材可复用。
运行时输出：`docs/runtime-action-bridge-report.md` 显示可播放动作从 13 个增加到 17 个；`groom_face_wash` 在生活日常轮换 ready，`desk_sniff` 在探索日常轮换 ready，`loaf_breathing` 在低疲劳日常轮换 ready，`shy` 在多次点击和温柔互动 ready。
验证命令：`npm run validate:runtime-intake-executor`、`npm run validate:runtime-animations`、`npm run validate:runtime-alpha-quality`、`npm run validate:runtime-behavior-schedule`、`npm run validate:runtime-interaction-schedule`、`npm run validate:runtime-action-bridge-report`、`npm run validate:release`
桌面验收：通过；执行 `YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-wave2.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=1000 npm run dev`，再执行 `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-wave2.png --count 8 --min-changed-frames 4 --min-width 200 --min-height 200`，8 张截图均为 440x440 PNG 且 8 张哈希不同；验收拼图保存到 `assets/reviews/runtime/wave2-desktop-capture.png`。
已知问题：睡眠链路和拖拽专项尚未正式接入，`sleepy`、`sleep`、`waking`、`dragging` 仍在桥接报告中显示缺失；`loaf_breathing` 当前素材按用户确认进入运行时，但文档保留“更像正坐轻呼吸，不是真正香箱趴”的判断，后续如需更准确香箱趴可重新生成素材。
决定：接受第二波四个动作作为生活感和温柔互动补充；下一步进入睡眠链路或拖拽专项前，仍必须先列清单并得到用户确认。

## 2026-06-17 睡眠作息链路 runtime 动作正式接入

日期：2026-06-17
源文件：`docs/runtime-intake-approvals/sleep-routine.approved.json`、`docs/runtime-intake-sleep-routine-dry-run.md`、`docs/runtime-intake-sleep-routine-execution-checklist.md`、`docs/runtime-intake-sleep-routine-preflight.md`、`assets/config/action-bridges.json`、`assets/runtime/animations/manifest.json`、`assets/runtime/animations/sleepy/frames`、`assets/runtime/animations/sleep/frames`、`assets/runtime/animations/sleeping/frames`、`assets/runtime/animations/waking/frames`、`assets/reviews/runtime/sleep-routine-contact-sheet.png`、`assets/reviews/runtime/sleep-routine-desktop-capture.png`
目标动作：`sleepy`、`sleep`、`sleeping`、`waking`
问题：休息提醒和睡眠叫醒已经有桥接候选，但 `sleepy`、`sleep`、`waking` 仍缺失，`sleeping` 也没有真实 runtime 循环帧；睡眠状态此前会回退到 `idle_primary`，无法形成完整作息链路。
参考片段：用户说明以后动作视频都选多的，本次按四动作方案接入；执行 `npm run runtime:intake-executor -- --wave sleep-routine --execute`，从可灵视频抽取 5 秒 24fps 序列帧并写入 runtime manifest。
帧数：每个新动作 120 帧；睡眠链路合计新增 480 张 runtime PNG。
FPS：24fps。
循环方式：`sleepy` 和 `sleep` 被写为 `transition`，分别自动进入 `sleep` 和 `sleeping`；`sleeping` 是 `daily` 循环动作，`loop=true`，可在安全帧被唤醒切出；`waking` 是 `transition`，播放后回到 `idle_primary`。
水印处理：执行绿幕抠像、固定水印区域透明化和绿色残留透明边缘清理；本次没有把 mp4 源视频加入 Git。
重建方法：`docs/runtime-intake-sleep-routine-dry-run.md` 显示四个动作均为新增帧目录且桥接已引用；`scripts/runtime-intake-executor.mjs` 对 sleep-routine 做 runtime category 映射，避免非循环睡眠过渡段卡住。
运行时输出：`docs/runtime-action-bridge-report.md` 显示可播放动作从 17 个增加到 21 个；睡眠进入、入睡过渡、睡眠循环、睡眠退出和睡眠叫醒均为 `ready`；`docs/state-coverage.md` 显示 13 个状态中 12 个已有独立动作，剩余 `dragging` 仍为 fallback。
验证命令：`npm run validate:runtime-intake-executor`、`npm run validate:runtime-animations`、`npm run validate:runtime-alpha-quality`、`npm run validate:runtime-behavior-schedule`、`npm run validate:runtime-interaction-schedule`、`npm run validate:runtime-action-bridge-report`、`npm run validate:release`
桌面验收：通过；沙盒内首次启动 Electron 出现 `SIGABRT`，按 GUI 权限问题用提升权限重跑 `YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-sleep.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=1000 npm run dev` 成功生成 8 张截图；`capture:inspect` 显示 8 张均为 440x440 PNG 且 8 张哈希不同；验收拼图保存到 `assets/reviews/runtime/sleep-routine-desktop-capture.png`。
已知问题：`sleeping` 当前素材仍偏正坐轻闭眼，不是最终理想蜷伏睡姿；拖拽专项 `dragging` 尚未正式接入，是当前唯一剩余 fallback 状态。
决定：接受睡眠四动作作为完整作息链路的 runtime 接入结果；后续动作选择默认采用用户指令“选多的”，进入拖拽专项前仍需要先列清单。

## 2026-06-17 拖拽专项 runtime 接入前准备

日期：2026-06-17
源文件：`docs/runtime-intake-dragging-special-execution-checklist.md`、`docs/runtime-intake-dragging-special-preflight.md`、`docs/runtime-intake-dragging-special-dry-run.md`、`scripts/validate-runtime-intake-executor.mjs`、`assets/origin/generated/kling/dragging.mp4`、`assets/reviews/kling-generated/dragging_sweep.png`
目标动作：`dragging`
问题：`dragging` 是当前唯一剩余 fallback 状态，但用户要求每次处理新动作前必须先列清单，因此不能直接抽帧、去水印或修改 manifest。
参考片段：执行 `npm run runtime:intake-executor -- --wave dragging-special --dry-run --write docs/runtime-intake-dragging-special-dry-run.md`，只生成写入计划，不执行素材处理。
帧数：未生成 runtime 帧；dry-run 预计批准后新增 1 个动作、创建 1 个帧目录。
FPS：预计沿用 runtime 标准 24fps。
循环方式：计划按 `interactive` 动作接入，`interruptPolicy=locked`，拖拽期间播放 `dragging`，释放后回到 `idle_primary`。
水印处理：未执行；正式接入前仍需逐视频人工播放检查无文字、水印、logo、额外物体和明显变形。
重建方法：先重新生成拖拽专项 dry-run，再创建 `docs/runtime-intake-approvals/dragging-special.approved.json`，最后执行 `npm run runtime:intake-executor -- --wave dragging-special --execute`。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，当前 manifest 仍无 `dragging` action，`stateMap.dragging` 仍回退到 `idle_primary`。
验证命令：`npm run validate:runtime-intake-executor`、`npm run validate:runtime-intake-waves`、`npm run validate:runtime-intake-checklist`、`npm run validate:runtime-intake-preflight`
桌面验收：尚未执行；正式接入后必须验证桌面可见、始终置顶、拖拽窗口移动手感、鼠标释放后自然回到日常动作。
已知问题：`dragging` 源视频预检通过元数据检查，但既有审查意见认为动作幅度较小，真实体验必须结合窗口拖拽手感验收。
决定：保留拖拽专项门禁；未收到用户明确确认前，禁止抽帧、去水印/抠绿、修改 runtime manifest 或覆盖 runtime 动作目录。

## 2026-06-17 runtime dry-run 文档同步门禁

日期：2026-06-17
源文件：`scripts/validate-runtime-intake-dry-runs-current.mjs`、`scripts/validate-all.mjs`、`package.json`、`docs/runtime-intake-wave1-dry-run.md`、`docs/runtime-intake-sleep-routine-dry-run.md`
目标动作：全部 runtime intake 波次，重点覆盖 `wave1`、`wave2`、`sleep-routine`、`dragging-special`
问题：拖拽专项已经补了 dry-run，但发布门禁只校验 checklist 和 preflight；如果某个波次正式接入后 dry-run 仍显示 `manifest=add` 或 `frames=create`，后续查看文档会误判执行风险。
参考片段：先把 `validate:runtime-intake-dry-runs-current` 挂到 `package.json` 和 `validate:all`，红灯显示脚本缺失；实现后发现 `wave1` 和 `sleep-routine` dry-run 与当前 manifest 不一致。
帧数：未生成新 runtime 帧；本次只同步 dry-run 文档。
FPS：不变。
循环方式：不变；本次只校验并同步报告中的 `loop`、`manifest`、`frames`、`bridge` 等字段。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：使用 `npm run runtime:intake-executor -- --wave <wave-id> --dry-run --write docs/runtime-intake-<wave-id>-dry-run.md` 重新生成过期报告，再执行 `npm run validate:runtime-intake-dry-runs-current`。
运行时输出：未修改 `assets/runtime/animations/manifest.json`；`sleep-routine` dry-run 已从新增帧目录更新为覆盖风险提示，`wave1` dry-run 补齐 `loop=false` 字段。
验证命令：`npm run validate:runtime-intake-dry-runs-current`
桌面验收：不涉及桌面运行；这是文档门禁和发布校验增强。
已知问题：该校验只证明 dry-run 文档与当前计划和 manifest 同步，不代表 `dragging-special` 已获批准或已经接入。
决定：接受 dry-run current 校验进入 `validate:all`，后续任何 runtime intake 波次变更都必须同步中文 dry-run 文档。

## 2026-06-17 runtime 批准文件内容门禁

日期：2026-06-17
源文件：`scripts/runtime-intake-executor.mjs`、`scripts/validate-runtime-intake-executor.mjs`、`docs/runtime-intake-wave1-dry-run.md`、`docs/runtime-intake-wave2-dry-run.md`、`docs/runtime-intake-sleep-routine-dry-run.md`、`docs/runtime-intake-dragging-special-dry-run.md`
目标动作：全部 runtime intake 波次，重点保护 `dragging-special`
问题：执行器此前只检查批准文件是否存在；如果误放了错误波次或动作集合不完整的批准文件，仍可能进入正式执行路径。
参考片段：先新增失败测试，证明错误 `waveId` 的批准对象不会被拦截；随后让 `assertRuntimeIntakeApproval` 校验 `waveId` 和 `approvedActions`/`allowedActions` 是否与当前执行计划完全一致。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：正式执行前必须存在 `docs/runtime-intake-approvals/<wave-id>.approved.json`，且其中 `waveId` 等于当前波次，`approvedActions` 或 `allowedActions` 的动作集合等于 dry-run 里的动作集合。
运行时输出：`dragging-special --execute` 在缺少 `docs/runtime-intake-approvals/dragging-special.approved.json` 时会以中文错误中止；dry-run 仍允许查看计划。
验证命令：`npm run validate:runtime-intake-executor`
桌面验收：不涉及桌面运行；这是正式素材处理前的安全门禁。
已知问题：该门禁验证批准文件内容，不替代用户确认清单和逐视频人工播放检查。
决定：接受“批准文件存在且内容匹配”作为 runtime intake 正式执行的最低门槛；未收到用户确认前仍不得创建 `dragging-special` 批准文件。

## 2026-06-17 runtime 已批准波次 current 校验

日期：2026-06-17
源文件：`scripts/validate-runtime-intake-approvals-current.mjs`、`scripts/validate-all.mjs`、`package.json`、`docs/runtime-intake-approvals/*.approved.json`
目标动作：已存在批准文件的 runtime intake 波次，当前为 `wave1`、`wave2`、`sleep-routine`
问题：正式执行器已经校验批准文件内容，但发布门禁还没有主动检查仓库里的批准文件是否和 `docs/runtime-intake-waves.json` 同步。
参考片段：先把 `validate:runtime-intake-approvals-current` 挂到 `package.json` 和 `validate:all`，红灯显示脚本缺失；实现后校验现有 3 个批准文件的 `waveId`、文件名和动作集合。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：新增或修改 `docs/runtime-intake-approvals/*.approved.json` 后，执行 `npm run validate:runtime-intake-approvals-current`；校验只检查已存在批准文件，不要求未确认的 `dragging-special` 批准文件存在。
运行时输出：当前校验输出 `approvalCount=3`，已批准波次为 `sleep-routine`、`wave1`、`wave2`；`dragging-special` 仍未批准。
验证命令：`npm run validate:runtime-intake-approvals-current`
桌面验收：不涉及桌面运行；这是发布门禁增强。
已知问题：该校验不替代正式执行时的逐视频人工播放检查，也不代表未批准波次可接入。
决定：接受批准文件 current 校验进入 `validate:all`，后续每个已批准波次都必须和机器可读分波计划保持一致。

## 2026-06-17 拖拽专项批准模板

日期：2026-06-17
源文件：`docs/runtime-intake-approvals/dragging-special.example.json`、`scripts/validate-runtime-intake-approval-examples.mjs`、`scripts/validate-all.mjs`、`package.json`
目标动作：`dragging`
问题：`dragging-special` 尚未获用户确认，但后续一旦确认，需要快速生成内容匹配的批准文件；如果手工从零写批准文件，容易漏掉动作集合、清单路径或门禁说明。
参考片段：新增 `dragging-special.example.json`，使用 `.example.json` 后缀和 `exampleOnly=true` 标识模板；执行器只接受 `.approved.json`，因此该模板不会触发正式接入。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：用户明确确认拖拽专项清单后，基于 `dragging-special.example.json` 生成 `dragging-special.approved.json`，把 `approvedAt` 改为实际日期，并保留 `approvedActions=["dragging"]`。
运行时输出：`validate:runtime-intake-approval-examples` 输出 `exampleCount=1`，模板波次为 `dragging-special`；`validate:runtime-intake-approvals-current` 仍只显示 3 个正式批准波次，不包含拖拽。
验证命令：`npm run validate:runtime-intake-approval-examples`、`npm run validate:runtime-intake-approvals-current`
桌面验收：尚未执行；模板不代表接入完成。
已知问题：模板只能减少填写错误，不替代用户确认、逐视频人工播放检查和桌面拖拽验收。
决定：接受拖拽专项批准模板进入仓库，但未收到用户确认前仍不得创建 `dragging-special.approved.json`。

## 2026-06-18 拖拽桌面验收测试钩子

日期：2026-06-18
源文件：`electron/main.ts`、`electron/preload.ts`、`src/renderer/main.ts`、`src/renderer/global.d.ts`、`src/core/behavior/interaction-controller.ts`、`scripts/validate-interaction-controller.mjs`、`docs/runtime-intake-dragging-special-dry-run.md`、`docs/runtime-intake-dragging-special-execution-checklist.md`
目标动作：`dragging`
问题：现有 `YUZAI_TEST_MOVE_*` 只能直接移动窗口，不能触发 renderer 中的拖拽状态、拖拽动作桥接和释放后回 idle；正式接入 `dragging` 后仍缺少自动桌面验收路径。
参考片段：新增 `YUZAI_TEST_DRAG_MS`、`YUZAI_TEST_DRAG_X`、`YUZAI_TEST_DRAG_Y`、`YUZAI_TEST_DRAG_HOLD_MS` 测试钩子，由主进程发送 `test:drag`，renderer 调用 `InteractionController.simulateDragForTest`。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：测试钩子会请求当前 runtime drag 状态，触发 `resolveDragAnimationAction`；当前正式素材未接入时仍回退到已有可见动作，接入后会播放 `dragging`。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：正式接入后执行 `YUZAI_TEST_DRAG_MS=700 YUZAI_TEST_DRAG_X=100 YUZAI_TEST_DRAG_Y=70 YUZAI_TEST_DRAG_HOLD_MS=1200 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-dragging.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`，再执行 `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-dragging.png --count 8 --min-changed-frames 4 --min-width 200 --min-height 200`。
运行时输出：本次仅新增测试钩子；未修改 `assets/runtime/animations/manifest.json`，未接入 `dragging` 帧。
验证命令：`npm run validate:interaction-controller`、`npm run validate:all`
桌面验收：尚未执行；需要 `dragging` 正式接入后使用上述命令捕获 8 帧并检查拖拽期间有动作变化、释放后自然回到日常。
已知问题：该钩子模拟拖拽路径，不替代真实鼠标手感检查；真实体验仍需在桌面上手动拖动确认。
决定：接受自动拖拽验收钩子进入发布门禁，作为 `dragging-special` 正式接入后的必跑证据之一。

## 2026-06-18 动作视频候选选择规则

日期：2026-06-18
源文件：`docs/animation-adapter.md`、`docs/runtime-intake-dragging-special-execution-checklist.md`
目标动作：后续所有新增动作视频波次
问题：用户明确要求“以后动作视频都选多的”，需要把该偏好写入项目文档，避免后续同一动作存在多个视频候选时只凭临时判断选择较少素材。
参考片段：在动画资源接入规范中新增候选选择规则；在拖拽专项清单中补充拖拽动作候选选择说明。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：后续新增动作视频前，先列清单；同一动作或同一波次存在多个候选时，默认选择素材数量更多、动作覆盖更完整的方案，除非清单标明质量风险或用户明确要求改选较少集合。
运行时输出：未修改 `assets/runtime/animations/manifest.json`。
验证命令：`npm run validate:all`、`npm run validate:release`
桌面验收：不涉及桌面运行；这是后续素材 intake 的选择规则。
已知问题：该规则不替代逐视频检查，数量更多的视频仍必须通过无水印、无文字、无额外物体、动作自然和桌面手感验收。
决定：接受“动作视频都选多的”作为后续 runtime intake 默认规则。

## 2026-06-18 候选选择规则进入 runtime 分波门禁

日期：2026-06-18
源文件：`docs/runtime-intake-waves.json`、`scripts/validate-runtime-intake-waves.mjs`、`scripts/runtime-intake-executor.mjs`、`docs/runtime-intake-wave1-dry-run.md`、`docs/runtime-intake-wave2-dry-run.md`、`docs/runtime-intake-sleep-routine-dry-run.md`、`docs/runtime-intake-dragging-special-dry-run.md`
目标动作：后续所有 runtime intake 波次
问题：上一条规则已经写入文字规范，但如果后续只看机器分波计划或 dry-run 报告，仍可能漏掉“同一动作或同一波次多候选时默认选多的”。
参考片段：先让 `npm run validate:runtime-intake-waves` 因缺少 `candidateSelection` 失败，再补充 `candidateSelection.defaultPolicy=prefer-more-complete-video-set`、中文规则和质量风险改选条件；dry-run 报告新增“候选选择规则”章节。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：修改 `docs/runtime-intake-waves.json` 后，重新生成四份 dry-run：`wave1`、`wave2`、`sleep-routine`、`dragging-special`；再运行 `npm run validate:runtime-intake-waves` 和 `npm run validate:runtime-intake-dry-runs-current`。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖任何 runtime 帧目录。
验证命令：`npm run validate:runtime-intake-waves`、`npm run validate:runtime-intake-dry-runs-current`
桌面验收：不涉及桌面运行；这是后续素材选择和执行报告门禁。
已知问题：该门禁只保证默认选择策略存在，不自动判断视频质量；多候选视频仍要逐个播放检查水印、文字、logo、额外物体、动作变形和桌面衔接手感。
决定：接受 `candidateSelection` 进入 runtime 分波计划和 dry-run 报告，后续动作视频候选默认选素材更多、覆盖更完整的一组。

## 2026-06-18 MVP 验收证据清单门禁

日期：2026-06-18
源文件：`docs/mvp-evidence.json`、`scripts/validate-mvp-evidence.mjs`、`scripts/validate-all.mjs`、`package.json`、`docs/requirements-mvp.md`
目标动作：MVP 必须项验收证据
问题：`docs/requirements-mvp.md` 记录了第一版验收过程，但证据分散在日志、截图、脚本和临时路径里；后续修改桌宠显示、提醒、交互、尺寸位置或素材接入流程时，容易忘记同步 MVP 证据。
参考片段：先新增 `npm run validate:mvp-evidence`，让它因缺少 `docs/mvp-evidence.json` 失败；随后补充 7 个 MVP 必须项的机器可读证据清单，并接入 `validate:all`。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：更新 MVP 行为或验收证据后，同步修改 `docs/mvp-evidence.json`；执行 `npm run validate:mvp-evidence`，再执行 `npm run validate:all` 和 `npm run validate:release`。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖任何 runtime 帧目录。
验证命令：`npm run validate:mvp-evidence`
桌面验收：本次不重新捕获桌面；证据清单引用仓库内已有桌面验收拼图、manifest、动作桥接报告和对应验证命令。
已知问题：该门禁证明 MVP 证据链完整，不替代未来每次视觉或交互改动后的真实桌面截图/序列帧复查。
决定：接受 MVP 证据清单进入发布门禁，后续 MVP 相关改动必须同步维护 `docs/mvp-evidence.json`。

## 2026-06-18 13 状态待办源视频状态修正

日期：2026-06-18
源文件：`scripts/state-backlog.mjs`、`scripts/validate-state-backlog.mjs`、`docs/state-backlog.md`
目标动作：`dragging`
问题：`docs/state-backlog.md` 仍把剩余 `dragging` 缺口写成“生成源视频并接入 manifest”，但当前 `assets/origin/generated/kling/dragging.mp4` 已存在；真实下一步应是等待用户确认拖拽专项清单后，才能去水印、抽帧、写 manifest 和桌面验收。
参考片段：先让 `npm run validate:state-backlog` 在“源视频已存在但仍提示生成源视频”的断言上失败；随后让 `buildStateBacklog` 根据 planned output 文件是否存在生成不同 next step，并更新总说明。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：执行 `npm run animations:state-backlog -- --write docs/state-backlog.md`，再执行 `npm run validate:state-backlog`。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖任何 runtime 帧目录。
验证命令：`npm run validate:state-backlog`
桌面验收：不涉及桌面运行；这是状态缺口文档的当前性修正。
已知问题：`dragging` 仍未接入 runtime；必须等用户明确确认 `docs/runtime-intake-dragging-special-execution-checklist.md` 后才能创建正式批准文件并执行接入。
决定：接受 `dragging` 待办从“生成源视频”改为“源视频已存在，等待用户确认清单后接入 manifest”。

## 2026-06-18 13 状态待办 current 校验

日期：2026-06-18
源文件：`scripts/validate-state-backlog-current.mjs`、`scripts/validate-all.mjs`、`package.json`、`docs/state-backlog.md`
目标动作：13 状态补齐待办文档
问题：`npm run validate:state-backlog` 只验证生成器逻辑，不会检查 `docs/state-backlog.md` 是否仍由当前 manifest、状态类型和可灵动作计划生成；文档可能在 manifest 或计划变化后过期。
参考片段：先把 `validate:state-backlog-current` 挂到 `package.json` 和 `validate:all`，红灯显示脚本缺失；随后新增脚本，按当前项目状态重新渲染 state backlog，并与 `docs/state-backlog.md` 做字节级比对。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：如果 current 校验失败，执行 `npm run animations:state-backlog -- --write docs/state-backlog.md`，再执行 `npm run validate:state-backlog-current`。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖任何 runtime 帧目录。
验证命令：`npm run validate:state-backlog-current`
桌面验收：不涉及桌面运行；这是状态待办文档 current 门禁。
已知问题：该校验只保证待办文档同步，不代表 `dragging` 已接入 runtime。
决定：接受 `validate:state-backlog-current` 进入 `validate:all`，后续状态待办必须和当前项目状态保持一致。

## 2026-06-18 状态覆盖报告 current 校验

日期：2026-06-18
源文件：`scripts/validate-state-coverage-current.mjs`、`scripts/validate-all.mjs`、`package.json`、`docs/state-coverage.md`
目标动作：13 状态覆盖报告
问题：`docs/state-coverage.md` 由 manifest、状态类型和可灵动作计划生成，但此前只有生成器 fixture 校验，没有检查仓库中的报告是否仍和当前项目状态一致。
参考片段：先把 `validate:state-coverage-current` 挂到 `package.json` 和 `validate:all`，红灯显示脚本缺失；随后新增脚本，重新渲染状态覆盖报告并与 `docs/state-coverage.md` 做字节级比对。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：如果 current 校验失败，执行 `npm run animations:state-coverage -- --write docs/state-coverage.md`，再执行 `npm run validate:state-coverage-current`。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖任何 runtime 帧目录。
验证命令：`npm run validate:state-coverage-current`
桌面验收：不涉及桌面运行；这是状态覆盖报告 current 门禁。
已知问题：该校验只保证覆盖报告同步，不代表 `dragging` 已接入 runtime。
决定：接受 `validate:state-coverage-current` 进入 `validate:all`，后续状态覆盖报告必须和当前项目状态保持一致。

## 2026-06-18 启动头顶文字清理

日期：2026-06-18
源文件：`src/core/behavior/reminder-bubble-controller.ts`、`scripts/validate-reminder-bubble-controller.mjs`、`docs/requirements-mvp.md`、`docs/mvp-evidence.json`
目标动作：启动提醒气泡
问题：启动后 900ms 就在猫咪头顶显示“喝口水吧”，用户要求删除启动时候猫咪头顶的字；但 MVP 仍需要定时喝水/休息提醒，所以不能移除整个提醒系统。
参考片段：先在 `validate-reminder-bubble-controller` 中增加默认启动行为断言：启动后没有立即写入文字、气泡保持隐藏、首次默认提醒进入正常提醒窗口；随后把默认首次提醒延迟从 900ms 调整为 45 秒。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：本次只修改提醒调度和文档，不处理任何源视频或序列帧。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖任何 runtime 帧目录。
验证命令：`npm run validate:reminder-bubble-controller`
桌面验收：本次用提醒控制器验证覆盖启动无文字和后续定时提醒；如需复查真实窗口，可再用 Electron 桌面截图检查启动 1 秒内是否无头顶文字。
已知问题：该改动只清理启动阶段的气泡文字，不改变睡眠 Z 字、素材帧内容或后续提醒文案。
决定：接受“启动初始画面干净，进入正常提醒窗口后再弹出喝水/休息气泡”作为当前 MVP 提醒规则。

补充桌面验收：执行 `YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-after.png npm run dev`，默认 1200ms 捕获桌面窗口。截图为 440x440 RGBA PNG，猫咪头顶区域无“喝口水吧”或其他气泡文字，覆盖原 900ms 启动冒字问题。

## 2026-06-18 动作视频候选数量优先补充

日期：2026-06-18
源文件：`docs/animation-adapter.md`
目标动作：后续动作视频候选选择
问题：用户补充“以后动作视频都选多的”，需要把现有“数量更多、动作覆盖更完整”规则表达得更直接，避免后续多候选素材时误选较少视频集合。
参考片段：在动画资源接入规范中明确：同一动作或同一波次存在多个视频候选时，默认选择视频数量更多、素材帧量更充足、动作覆盖更完整的方案。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：本次只更新中文规范；后续真正接入素材时仍需先列清单确认。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖任何 runtime 帧目录。
验证命令：`npm run validate:all`
桌面验收：不涉及桌面运行；这是素材选择规则补充。
已知问题：视频数量更多不等于质量一定更好；仍必须逐视频检查无水印、无文字、无 logo、无额外物体、无变形和桌面衔接手感。
决定：后续动作视频默认选择数量更多的一组，只有清单标明质量风险或用户明确改选时才使用较少集合。

## 2026-06-18 项目当前状态看板

日期：2026-06-18
源文件：`scripts/project-status.mjs`、`scripts/validate-project-status-current.mjs`、`docs/project-status.md`、`package.json`、`scripts/validate-all.mjs`
目标动作：项目继续推进状态看板
问题：启动头顶文字已清理，但“继续完成项目”需要一个集中入口说明当前 MVP、13 状态覆盖、拖拽专项阻塞点、批准边界和下一步命令，避免后续只靠分散日志判断进度。
参考片段：先将 `validate:project-status-current` 接入 package 和 `validate:all`，确认因缺少校验脚本失败；实现校验脚本后，再确认因缺少 `docs/project-status.md` 失败；最后生成看板并通过 current 校验。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：看板从 `docs/mvp-evidence.json`、`docs/state-coverage.md`、`docs/state-backlog.md`、`docs/runtime-intake-waves.json` 和执行日志派生，执行 `npm run project:status -- --write docs/project-status.md` 可重新生成。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖任何 runtime 帧目录。
验证命令：`npm run validate:project-status-current`
桌面验收：不涉及新桌面运行；看板引用上一条启动 1200ms 截图验收结果。
已知问题：看板只汇总当前状态，不代表 `dragging-special` 已批准或拖拽动作已接入。
决定：接受 `docs/project-status.md` 作为后续继续项目时的第一查看入口，并将 `validate:project-status-current` 加入全量门禁。

## 2026-06-18 拖拽专项正式接入

日期：2026-06-18
源文件：`assets/origin/generated/kling/dragging.mp4`、`docs/runtime-intake-approvals/dragging-special.approved.json`、`assets/runtime/animations/manifest.json`、`assets/runtime/animations/dragging/frames`、`scripts/runtime-intake-executor.mjs`、`scripts/validate-runtime-interaction-schedule.mjs`
目标动作：`dragging`
问题：`dragging` 是 13 状态中最后一个 fallback 状态。用户确认“可以把已有拖拽视频安全接入桌宠”后，可以创建正式批准文件并执行拖拽专项接入。
参考片段：先让 `npm run validate:runtime-interaction-schedule` 因当前拖拽仍回退到 `waving` 失败；随后创建 `dragging-special.approved.json`，执行 `npm run runtime:intake-executor -- --wave dragging-special --execute`，并修正执行器在同名状态接入后同步更新 `stateMap.dragging`。
帧数：120 帧。
FPS：24。
循环方式：`dragging` 按 locked interactive 动作接入，拖拽触发时播放，释放后回到 `idle_primary`。
水印处理：执行 runtime intake 的绿幕抠像、水印区域透明化和绿色残留清理；源视频未提交或覆盖。
重建方法：从 `assets/origin/generated/kling/dragging.mp4` 抽取 5 秒 24fps 透明序列帧，输出到 `assets/runtime/animations/dragging/frames`，并写入 runtime manifest。
运行时输出：`assets/runtime/animations/manifest.json` 新增 `dragging` action，`stateMap.dragging` 从 `idle_primary` 更新为 `dragging`；`docs/state-coverage.md` 显示 13 / 13 状态均为 independent，`docs/state-backlog.md` 显示待补状态数为 0。
验证命令：`npm run validate:runtime-intake-approvals-current`、`npm run validate:runtime-intake-executor`、`npm run validate:runtime-interaction-schedule`、`npm run validate:manifest-contract:current`、`npm run validate:runtime-animations`
桌面验收：执行 `YUZAI_TEST_DRAG_MS=700 YUZAI_TEST_DRAG_X=100 YUZAI_TEST_DRAG_Y=70 YUZAI_TEST_DRAG_HOLD_MS=1200 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-dragging.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`，生成 8 张 440x440 RGBA 桌面截图；再执行 `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-dragging.png --count 8 --min-changed-frames 4 --min-width 200 --min-height 200`，结果 `changedFrames=7`，通过拖拽专项自动验收。
已知问题：既有审查认为 `dragging` 动作幅度较小，正式体验仍要通过桌面拖拽手感观察确认是否足够明显。
决定：接受拖拽专项进入 runtime，完成 13 状态独立动作覆盖。

## 2026-06-18 拖拽手感增强

日期：2026-06-18
源文件：`src/core/render/canvas-renderer.ts`、`scripts/validate-drag-visual-feedback.mjs`、`package.json`、`scripts/validate-all.mjs`
目标动作：`dragging`
问题：`dragging` 动作已接入 runtime，但现场体感仍像没有互动；根因是来源视频本身动作幅度偏小，单纯播放序列帧不够明显。
参考片段：先新增 `npm run validate:drag-visual-feedback`，要求拖拽偏移产生明显上提、缩放和方向倾斜；红灯显示 `dragVisualFeedbackForOffset` 尚不存在。随后在 CanvasRenderer 中对真实序列帧应用中心点变换：拖拽时整体上提、轻微放大，并按横向拖动方向倾斜。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：仍播放现有 `dragging` 序列帧；本次只叠加运行时视觉反馈。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：在渲染阶段根据 `InteractionController.currentDragOffset` 计算反馈强度；小于 8px 的指针噪声保持中性，明显拖拽时最多约 5.5% 放大、上提并倾斜。
运行时输出：拖拽期间猫咪整体更像被提起和拉动，释放后随 `dragOffset` 归零恢复正常绘制。
验证命令：`npm run validate:drag-visual-feedback`、`npm run validate:interaction-controller`、`npm run validate:runtime-interaction-schedule`、`npm run typecheck`
桌面验收：执行 `YUZAI_TEST_DRAG_MS=700 YUZAI_TEST_DRAG_X=100 YUZAI_TEST_DRAG_Y=70 YUZAI_TEST_DRAG_HOLD_MS=1200 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-dragging-boosted.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`，生成 8 张 440x440 RGBA 桌面截图；再执行 `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-dragging-boosted.png --count 8 --min-changed-frames 4 --min-width 200 --min-height 200`，结果 `changedFrames=7`。
已知问题：这是运行时手感增强，不改变原视频动作幅度；如仍觉得不够，可以继续生成更夸张的拖拽候选视频再替换。
决定：接受运行时拖拽反馈增强作为当前体验修复，后续视频重生成作为优化项。

## 2026-06-18 拖拽手感参数化

日期：2026-06-18
源文件：`src/core/config/load-config.ts`、`src/core/render/canvas-renderer.ts`、`src/renderer/main.ts`、`scripts/validate-drag-visual-feedback.mjs`、`docs/drag-visual-feedback.md`
目标动作：`dragging`
问题：上一版已让拖拽更明显，但力度参数写在渲染函数中，后续现场调手感需要反复改渲染逻辑。
参考片段：先更新 `npm run validate:drag-visual-feedback`，要求同一拖拽偏移在自定义强力度配置下产生更大的上提、放大和倾斜；红灯显示自定义配置没有生效。随后新增 `DEFAULT_CONFIG.interaction.dragVisualFeedback`，并让 `CanvasRenderer` 从入口接收该配置。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变；仍播放现有 `dragging` 序列帧。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：修改 `src/core/config/load-config.ts` 中的 `DEFAULT_CONFIG.interaction.dragVisualFeedback` 参数，再运行 `npm run validate:drag-visual-feedback` 和桌面截图验收。
运行时输出：拖拽视觉反馈由配置控制，后续可独立调整上提、跟手、倾斜、放大和噪声阈值。
验证命令：`npm run validate:drag-visual-feedback`
桌面验收：本次为配置化改造，视觉默认值保持上一版表现；桌面验收可复用 `/private/tmp/yuzai-window-dragging-boosted-*.png` 的方案，或按 `docs/drag-visual-feedback.md` 重新生成 `dragging-tuned` 截图序列。
已知问题：配置仍为源码默认值，尚未做用户界面上的实时调参面板。
决定：接受拖拽手感参数化，后续现场微调优先改配置，不直接改渲染公式。

## 2026-06-18 生成动作程序预览入口

日期：2026-06-18
源文件：`electron/main.ts`、`electron/preload.ts`、`src/renderer/main.ts`、`src/renderer/global.d.ts`、`scripts/validate-action-preview-capture.mjs`、`docs/generated-action-preview.md`、`assets/reviews/runtime/generated-action-preview/*.png`
目标动作：`slow_blink`、`look_around`、`cursor_watch`、`click_surprised`、`poke_annoyed`、`call_response`、`stretch_yawn`、`groom_face_wash`、`loaf_breathing`、`desk_sniff`、`shy`、`sleepy`、`sleep`、`sleeping`、`waking`、`dragging`
问题：用户要求把猫咪生成的所有动作都处理写入程序并提前看效果。当前 16 个可灵生成动作已写入程序，但缺少一个可按 action 强制预览的桌面验收入口，逐个看效果不方便。
参考片段：先新增 `npm run validate:action-preview-capture`，红灯显示缺少 `YUZAI_PREVIEW_ACTION`、`test:preview-action` 和 renderer 订阅。随后在主进程读取 `YUZAI_PREVIEW_ACTION`，通过 preload 暴露 `onTestPreviewAction`，renderer 校验 action 可播放后请求 `AnimationDirector`。第一次截图发现部分动作哈希重复，根因是预览 action 被下一帧日常轮换覆盖；修正为预览 action 保持 2400ms 后重新截图。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变；仅新增测试预览入口。
水印处理：未执行；本轮没有抽帧、去水印或抠绿。
重建方法：对每个动作执行 `YUZAI_PREVIEW_ACTION=<action> YUZAI_PREVIEW_ACTION_MS=500 YUZAI_CAPTURE_DELAY_MS=1400 YUZAI_CAPTURE_PATH=assets/reviews/runtime/generated-action-preview/<action>.png npm run dev`。
运行时输出：16 个已接入可灵生成动作均可被程序强制播放并截图；报告位于 `docs/generated-action-preview.md`。
验证命令：`npm run validate:action-preview-capture`、`npm run typecheck`
桌面验收：逐个执行 16 个 action 的桌面预览截图，输出到 `assets/reviews/runtime/generated-action-preview/`。完整性检查显示 16 张截图全部为 440x440 PNG，且 16 张哈希互不重复。
已知问题：本轮为单帧预览，不能完全评估动作全过程是否自然；如要评估流畅性，需要后续按 action 生成多帧序列或短视频 contact sheet。
决定：接受 `YUZAI_PREVIEW_ACTION` 作为生成动作提前看效果的程序入口，后续新增动作写入程序后必须用该入口生成预览证据。

## 2026-06-18 动作衔接淡入淡出优化

日期：2026-06-18
源文件：`src/core/render/canvas-renderer.ts`、`scripts/validate-canvas-transition-smoothing.mjs`、`docs/action-transition-smoothing.md`、`assets/reviews/runtime/action-transition-smoothing/*.png`
目标动作：所有 action 之间的切换，重点是 daily 到 interactive / transition 的切入和回切。
问题：用户反馈猫咪动作衔接太生硬。排查后确认 `AnimationDirector` 已经负责安全帧和 returnTo，但 Canvas 层跨 action 时仍直接从上一动作帧跳到下一动作帧，视觉上形成硬切。
参考片段：先新增 `npm run validate:canvas-transition-smoothing`，红灯显示缺少跨 action 淡入淡出参数和 alpha 计算。随后在 `CanvasRenderer` 记录上一 action 与上一帧，action 变化时用 `180ms` 淡出上一帧、淡入当前帧。
帧数：未生成新 runtime 帧。
FPS：不变。
循环方式：不变；仅改变绘制层跨 action 切换瞬间的混合方式。
水印处理：未执行；没有抽帧、去水印或抠绿。
重建方法：动作切换时自动触发，无需修改 manifest。可通过 `YUZAI_PREVIEW_ACTION=<action>` 触发指定动作并连续截图检查。
运行时输出：动作切换瞬间不再直接硬切，上一动作最后一帧会短暂淡出，当前动作淡入。
验证命令：`npm run validate:canvas-transition-smoothing`、`npm run validate:drag-visual-feedback`、`npm run typecheck`
桌面验收：执行 `YUZAI_PREVIEW_ACTION=click_surprised YUZAI_PREVIEW_ACTION_MS=500 YUZAI_CAPTURE_DELAY_MS=420 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-crossfade.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=80 npm run dev`，再执行 `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-crossfade.png --count 8 --min-changed-frames 5 --min-width 200 --min-height 200`，结果 `changedFrames=7`；截图保存到 `assets/reviews/runtime/action-transition-smoothing/`。
已知问题：如果某些素材本身首尾姿态差异过大，淡入淡出只能缓解切换瞬间，不能替代专门的过渡视频。
决定：接受 Canvas 层跨 action 淡入淡出作为默认衔接优化；后续对仍突兀的单个动作再补 `transitionIn` / `transitionOut` 素材。

## 2026-06-19 动作衔接风险报告

日期：2026-06-19
源文件：`scripts/action-transition-risk-report.mjs`、`scripts/validate-action-transition-risk-report.mjs`、`docs/action-transition-risk-report.md`、`assets/runtime/animations/manifest.json`、`package.json`、`scripts/validate-all.mjs`
目标动作：`interactive` 和 `transition` 分类动作与 `idle_primary` / `returnTo` 的进入、回切衔接。
问题：全局 Canvas 淡入淡出已经能缓解动作切换瞬间的硬切，但用户仍反馈动作衔接太生硬。继续只靠主观观看容易不知道先处理哪个动作，也容易把低风险动作误判成最高优先级。
参考片段：`AnimationDirector` 已支持安全帧和 `transitionIn` / `transitionOut`；当前 manifest 中可灵生成动作多数只有默认 `entryFrames: [1]` 和 `exitFrames: [120]`，尚缺逐动作安全帧标注和专用过渡动作。
帧数：未生成新 runtime 帧。
FPS：不变，仍按当前 manifest 中每个 action 的 `fps` 和 `frameCount` 计算。
循环方式：修正 `idle_primary` 分类为 `daily`，避免默认待机被误判为姿势过渡；其它动作循环策略不变。
水印处理：本次不处理新视频、不重建帧；只比较现有透明 PNG 序列帧。
重建方法：新增 `npm run animations:transition-risk -- --write docs/action-transition-risk-report.md`，用 ImageMagick RMSE 对每个非日常动作的进入帧和回切帧做差异计算；新增 `npm run validate:action-transition-risk-report`，并接入 `validate:all`，确保报告和当前 manifest 同步。
运行时输出：不改变当前桌宠播放行为；本次把“哪里生硬”变成可复查清单，为后续补 `transitionIn` / `transitionOut` 或重新标注安全帧提供依据。
验证命令：`npm run validate:action-transition-risk-report`、`npm run validate:manifest-contract:current`
桌面验收：当前报告显示 20 个切换中 high 4 / medium 12 / low 4。四个 high 风险均被标记为 `tail-not-recovered`，说明最像回切目标的帧都在动作开头，不能靠简单提前回切解决。优先处理 `sleep -> sleeping`、`waking -> idle_primary`、`poke_annoyed -> idle_primary`、`paw_raise -> idle_primary`，处理方式应是补 transitionOut 或重生成动作尾段。
已知问题：RMSE 是帧差异指标，不能完全替代肉眼审美；后续仍需要结合桌面多帧截图或录屏确认动作是否自然。
决定：接受 `docs/action-transition-risk-report.md` 作为衔接优化的固定入口。下一轮如果要继续改善“生硬感”，优先为 high 风险切换生成或接入专用过渡素材。

## 2026-06-19 高风险回切过渡动作清单

日期：2026-06-19
源文件：`docs/transition-out-action-checklist.md`、`docs/kling-action-generation-plan.json`、`docs/cat-video-prompt-guide.md`、`docs/kling-generation-batches.md`、`docs/animation-asset-contract.md`、`scripts/validate-transition-out-checklist.mjs`
目标动作：`sleep_to_sleeping`、`waking_to_idle`、`poke_annoyed_to_idle`、`paw_raise_to_idle`
问题：动作衔接风险报告已经确认 4 个 high 风险回切都属于 `tail-not-recovered`，需要在真正生成或接入素材前先列清单，避免直接处理视频或误改 runtime。
参考片段：`sleep -> sleeping`、`waking -> idle_primary`、`poke_annoyed -> idle_primary`、`paw_raise -> idle_primary`。
帧数：未生成新 runtime 帧。
FPS：未修改；计划过渡动作仍按 24 fps 接入。
循环方式：新增计划动作均为非循环 `transition`，后续接入时应作为原动作的 `transitionOut`。
水印处理：未执行；本次只补提示词和处理前确认清单，仍要求后续生成视频无文字、无水印、无 logo。
重建方法：新增 `docs/transition-out-action-checklist.md`，补充可灵动作计划中的 `sleep_to_sleeping`、`waking_to_idle`、`poke_annoyed_to_idle`，并强化 `paw_raise_to_idle` 提示词；新增 `validate:transition-out-checklist` 并接入 `validate:all`。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖 `assets/runtime/animations/*/frames`。
验证命令：`npm run validate:transition-out-checklist`、`npm run validate:kling-generation-batches`、`npm run validate:kling-plan-quality`
桌面验收：不涉及桌面运行；当前只是生成前清单和提示词准备。
已知问题：`sleep_to_sleeping`、`waking_to_idle`、`poke_annoyed_to_idle`、`paw_raise_to_idle` 仍缺真实视频和 runtime 序列帧，必须等用户确认后再生成或接入。
决定：接受高风险回切过渡清单作为下一轮素材处理前置门禁。后续如果要真实生成或接入这 4 个动作，先展示该清单并取得确认。

## 2026-06-19 高风险回切过渡待确认波次提案

日期：2026-06-19
源文件：`docs/runtime-intake-transition-out-recovery-proposal.md`、`scripts/validate-transition-out-intake-proposal.mjs`、`package.json`、`scripts/validate-all.mjs`
目标动作：`sleep_to_sleeping`、`waking_to_idle`、`poke_annoyed_to_idle`、`paw_raise_to_idle`
问题：如果直接把 4 个还没有源视频和审查证据的过渡动作写入 `docs/runtime-intake-waves.json`，会破坏现有 runtime-intake 门禁，也会越过用户确认边界。
参考片段：现有 `validate:runtime-intake-waves` 要求正式波次中的 `sourceVideo` 和 `reviewEvidence` 已存在。
帧数：未生成新 runtime 帧。
FPS：未修改。
循环方式：未修改；提案仍要求后续作为非循环 `transitionOut` 接入。
水印处理：未执行；当前没有生成或处理视频。
重建方法：新增待确认提案文档，明确 `transition-out-recovery` 不能进入正式 waves、不能创建 approved 文件、不能抽帧、不能修改 manifest；新增 `validate:transition-out-intake-proposal` 并接入 `validate:all`。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增 runtime 帧目录。
验证命令：`npm run validate:transition-out-intake-proposal`
桌面验收：不涉及桌面运行；这是正式素材接入前的边界文档。
已知问题：真实改善仍需要用户确认后生成视频、人工审查和正式接入。
决定：接受 `docs/runtime-intake-transition-out-recovery-proposal.md` 作为 4 个高风险过渡动作进入正式 runtime-intake 波次前的等待区。

## 2026-06-19 16 方向鼠标跟随真实动作接入

日期：2026-06-19
源文件：`assets/origin/generated/kling/look_e.mp4`、`look_ene.mp4`、`look_ne.mp4`、`look_nne.mp4`、`look_n.mp4`、`look_nnw.mp4`、`look_nw.mp4`、`look_wnw.mp4`、`look_w.mp4`、`look_wsw.mp4`、`look_sw.mp4`、`look_ssw.mp4`、`look_s.mp4`、`look_sse.mp4`、`look_se.mp4`、`look_ese.mp4`
目标动作：`look_e`、`look_ene`、`look_ne`、`look_nne`、`look_n`、`look_nnw`、`look_nw`、`look_wnw`、`look_w`、`look_wsw`、`look_sw`、`look_ssw`、`look_s`、`look_sse`、`look_se`、`look_ese`
问题：用户要求真实生成 16 个方向动作视频，并合并到桌宠程序中，让猫咪头部/眼睛能按鼠标方向做 360 度跟随反馈。
参考片段：第五批可灵批次 `mouse-follow-16-direction`，每个动作以 `assets/origin/鱼仔参考图.png` 保持鱼仔身份一致，绿幕背景，禁止文字、水印、logo 和额外物体。
帧数：每个 action 120 帧；本轮新增 runtime 帧 1920 张。
FPS：24 fps。
循环方式：16 个 `look_*` 均为 `interactive`，`loop: true`，由全局鼠标位置按 22.5 度扇区切换；鼠标远离后清空方向动作并回到日常动作。
水印处理：可灵生成视频先通过 `npm run kling:generated-video-audit -- --batch mouse-follow-16-direction --extract-previews --write docs/kling-generated-video-audit-mouse-follow-16.md` 生成 16 张抽样图和总览图；runtime-intake 执行时继续按绿幕抠像和右下透明清理规则输出透明 PNG 帧。
重建方法：新增正式波次 `mouse-follow-16-direction`、批准文件 `docs/runtime-intake-approvals/mouse-follow-16-direction.approved.json`，执行 `npm run runtime:intake-executor -- --wave mouse-follow-16-direction --execute` 抽帧入库；新增 `mouse-follow-direction` 角度映射、Electron 全局鼠标方向 IPC、renderer 方向动作覆盖逻辑，以及基于 ImageMagick RMSE 的 `transition-anchors.json` 自动衔接点。
运行时输出：`assets/runtime/animations/look_*/frames/frame_000001.png` 到 `frame_000120.png`，`assets/runtime/animations/manifest.json` 新增 16 个可播放动作，`assets/runtime/animations/transition-anchors.json` 新增待机到方向、方向回待机、相邻方向之间的 64 条衔接锚点。
验证命令：`npm run validate:mouse-follow-16-plan`、`npm run validate:mouse-follow-direction`、`npm run validate:transition-anchors`、`npm run validate:runtime-intake-approvals-current`、`npm run validate:manifest-contract:current`、`npm run validate:runtime-animations`、`npm run typecheck`、`npm run build`。
桌面验收：使用 `YUZAI_TEST_MOUSE_FOLLOW_16=500 YUZAI_TEST_MOUSE_FOLLOW_16_INTERVAL_MS=180 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-mouse-follow-16.png YUZAI_CAPTURE_SEQUENCE_COUNT=16 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=700 npm run dev` 触发 16 方向预览，再用 `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-mouse-follow-16.png --count 16 --min-changed-frames 10 --min-width 200 --min-height 200` 检查桌面窗口连续变化；截图证据保存到 `assets/reviews/runtime/mouse-follow-16/`。
已知问题：可灵 API 本轮实际返回约 5.04 秒视频，低于计划中的 8 秒目标；因此 `docs/animation-asset-contract.md` 会继续把 16 个 `look_*` 标为 runtime 时长不足。当前先接受为第一版真实方向跟随素材，后续如要更长动作，需要改为更长生成策略或分段生成后再合并。
决定：接受 16 方向真实动作作为鼠标 360 度跟随 MVP 的第一版 runtime 输入；后续如发现某个方向姿态不明显，优先替换对应单个 `look_*` 视频并重跑同一波次接入流程。

## 2026-06-19 桌宠动作自然度长时间观察报告

日期：2026-06-19
源文件：`scripts/runtime-naturalness-observation.mjs`、`scripts/validate-runtime-naturalness-observation.mjs`、`docs/runtime-naturalness-observation.md`、`assets/reviews/runtime/naturalness-observation/`
目标动作：当前 runtime 中全部 38 个可播放 action，重点观察日常动作可见性、截图连续变化、high 风险回切和 runtime 时长不足。
问题：用户确认执行方案 A，需要先做长时间桌面观察与自然度报告，不直接生成新视频、不覆盖 runtime、不修改 manifest，用可复查证据决定下一轮优化优先级。
参考片段：`docs/action-transition-risk-report.md` 中 high 4 / medium 34 / low 14；`docs/animation-asset-contract.md` 中 runtime 时长不足动作数 30。
帧数：未新增 runtime 帧；新增桌面观察截图 12 张。
FPS：运行时 FPS 不变；截图观察间隔为 300ms。
循环方式：运行时动作调度不变；本轮只观察当前桌宠窗口输出。
水印处理：未执行；本轮不处理源视频、不抽帧、不接入新素材。
重建方法：新增 `npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md` 汇总 manifest、衔接风险报告、资产契约和桌面截图证据；新增 `npm run validate:runtime-naturalness-observation` 并接入 `validate:all`，防止报告与证据过期。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖 `assets/runtime/animations/*/frames`；桌面窗口截图保存到 `assets/reviews/runtime/naturalness-observation/`。
验证命令：`YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-naturalness.png YUZAI_CAPTURE_SEQUENCE_COUNT=12 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=300 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`，随后执行 `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-naturalness.png --count 12 --min-changed-frames 6 --min-width 200 --min-height 200`，结果 `changedFrames=12`、尺寸 `440x440`、无失败项。
桌面验收：截图序列证明桌面上可见一只会动的猫；本轮观察入口确认当前最需要后续处理的是 `sleep -> sleeping`、`waking -> idle_primary`、`poke_annoyed -> idle_primary`、`paw_raise -> idle_primary` 四个 high 风险回切，以及 30 个 runtime 时长不足动作。
已知问题：截图序列只能证明当前观察窗口内有连续变化，不能替代长时录屏和人工审美判断；如果继续反馈动作衔接生硬，仍需要先列清单，再生成或接入 transitionOut / 更长 daily 视频。
决定：接受 `docs/runtime-naturalness-observation.md` 作为方案 A 的可复查观察入口；后续进入视频生成或 runtime 覆盖前，继续执行“先列清单确认”的边界。

## 2026-06-20 项目完成度审计与发布级验证

日期：2026-06-20
源文件：`docs/project-completion-audit.md`、`docs/project-status.md`、`docs/runtime-naturalness-observation.md`、`docs/action-transition-risk-report.md`、`docs/animation-asset-contract.md`
目标动作：当前 runtime 中全部 38 个可播放 action，以及本地 macOS 打包产物。
问题：在继续“完成项目”前，需要区分“第一版 MVP/13 状态/本地打包已可验证”和“动作自然度仍未最终完成”，避免把发布验证通过误解为所有质量问题已关闭。
参考片段：MVP 证据 7 / 7 verified；13 状态覆盖 independent 13 / mixed 0 / fallback 0 / missing 0；自然度观察显示 high 风险回切 4 个、runtime 时长不足 30 个。
帧数：未新增 runtime 帧。
FPS：未修改。
循环方式：未修改。
水印处理：未执行；本轮不处理源视频、不抽帧、不接入新素材。
重建方法：新增 `docs/project-completion-audit.md`，汇总当前可交付证据、发布验证结果、剩余自然度缺口和后续确认边界。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖 `assets/runtime/animations/*/frames`。
验证命令：执行 `npm run validate:release`；其中 `validate:all` 通过，`validate:package` 通过，`package:dir` 生成 `release/mac-arm64/鱼仔桌面宠物.app`，并确认 app.asar 与 icon 存在。
桌面验收：本轮不新增桌面截图；继续引用 `assets/reviews/runtime/naturalness-observation/` 中 12 张自然度观察截图作为当前桌面动态证据。
已知问题：本地打包通过不等于签名、公证和最终分发完成；high 风险回切和 30 个时长不足动作仍需要后续视频生成或素材优化。
决定：接受 `docs/project-completion-audit.md` 作为当前项目完成度审计入口。下一轮如要继续解决自然度，应先让用户确认 `docs/transition-out-action-checklist.md`，再生成 4 个 transitionOut 视频。

## 2026-06-20 试用分发手册与 release-readiness 门禁

日期：2026-06-20
源文件：`docs/release-playbook.md`、`scripts/validate-release-readiness.mjs`、`docs/project-completion-audit.md`、`README.md`、`package.json`、`scripts/validate-all.mjs`
目标动作：不涉及单个动作素材；目标是把当前本地可试用应用包的安装、首次打开、回滚和限制说明纳入项目门禁。
问题：当前已经能通过 `npm run validate:release` 生成本地 macOS 应用目录，但 README 和完成度审计缺少给测试者使用的安装、首次打开、回滚和已知限制入口。
参考片段：`release/mac-arm64/鱼仔桌面宠物.app`、`app.asar`、`icon.icns`、`docs/project-completion-audit.md`。
帧数：未新增 runtime 帧。
FPS：未修改。
循环方式：未修改。
水印处理：未执行；本轮不处理源视频、不抽帧、不接入新素材。
重建方法：新增 `docs/release-playbook.md`，新增 `npm run validate:release-readiness` 并接入 `validate:all`；该门禁检查试用分发手册、完成度审计和关键边界文字。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖 `assets/runtime/animations/*/frames`。
验证命令：先执行 `npm run validate:release-readiness`，在 `docs/release-playbook.md` 缺失时得到预期失败；补齐文档后再次执行并通过。
桌面验收：不涉及新桌面截图；本轮只补齐试用分发文档和验证门禁。
已知问题：本地试用手册不等于正式签名、公证或 Windows 实机验收；4 个 high 风险 transitionOut 和 30 个 runtime 时长不足动作仍待后续处理。
决定：接受 `docs/release-playbook.md` 作为试用分发入口。后续给别人试用前，先运行 `npm run validate:release`，再按手册安装和回滚。

## 2026-06-20 试用卸载与版本标签规范

日期：2026-06-20
源文件：`docs/release-playbook.md`、`scripts/validate-release-readiness.mjs`、`docs/project-completion-audit.md`
目标动作：不涉及动作素材；目标是补齐试用包卸载步骤、版本标签和回滚 commit 规范。
问题：试用分发手册已有构建、安装、首次打开和回滚说明，但 release-readiness 门禁尚未强制检查卸载步骤与版本标签，测试者拿到包后仍缺少清晰的清理和回滚锚点。
参考片段：`release/mac-arm64/鱼仔桌面宠物.app`、`npm run validate:release`、`git tag -a yuzai-v0.1.0-test.1`。
帧数：未新增 runtime 帧。
FPS：未修改。
循环方式：未修改。
水印处理：未执行；本轮不处理源视频、不抽帧、不接入新素材。
重建方法：先提高 `validate:release-readiness` 要求，让其因缺少 `卸载步骤`、`版本标签与回滚 commit` 和 `git tag -a` 预期失败；随后补齐文档并重新验证通过。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖 `assets/runtime/animations/*/frames`。
验证命令：`npm run validate:release-readiness`
桌面验收：不涉及新桌面截图；本轮只补齐分发文档和门禁。
已知问题：当前仍不是正式签名、公证包；自然度 high 风险回切和时长不足动作仍待后续素材处理。
决定：接受卸载步骤和版本标签规范作为试用分发的必要条件，并由 `validate:release-readiness` 固化。

## 2026-06-20 第一版试用标签记录

日期：2026-06-20
源文件：`docs/release-tag-record.md`、`docs/release-playbook.md`、`docs/project-completion-audit.md`、`scripts/validate-release-readiness.mjs`
目标动作：不涉及动作素材；目标是把已经推送到 GitHub 的第一版试用标签和回滚 commit 写入项目文档。
问题：`yuzai-v0.1.0-test.1` 已经创建并推送，但如果不写入仓库文档，后续回滚或复查仍需要翻终端历史。
参考片段：标签 `yuzai-v0.1.0-test.1`；回滚 commit `f3e8da05269f4e95195bc6ca39b12a8bf825372e`；远端引用 `refs/tags/yuzai-v0.1.0-test.1`。
帧数：未新增 runtime 帧。
FPS：未修改。
循环方式：未修改。
水印处理：未执行；本轮不处理源视频、不抽帧、不接入新素材。
重建方法：新增 `docs/release-tag-record.md`，并强化 `validate:release-readiness`，要求试用标签记录、release playbook 和完成度审计互相引用。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖 `assets/runtime/animations/*/frames`。
验证命令：`npm run validate:release-readiness`；远端复查命令 `git ls-remote --tags origin yuzai-v0.1.0-test.1` 返回 `refs/tags/yuzai-v0.1.0-test.1`。
桌面验收：不涉及新桌面截图；当前仍引用自然度观察和 release 验证记录。
已知问题：这只是试用标签，不是正式签名/公证分发；动作自然度 high 风险回切和时长不足仍未关闭。
决定：接受 `docs/release-tag-record.md` 作为第一版试用包的回滚锚点记录。

## 2026-06-20 签名包安全提示

日期：2026-06-20
源文件：`docs/signed-release-safety.md`、`docs/release-playbook.md`、`docs/project-completion-audit.md`、`scripts/validate-release-readiness.mjs`
目标动作：不涉及动作素材；目标是补齐未签名试用包、Gatekeeper、正式签名与公证包的安全提示。
问题：当前已经有本地试用包和试用标签，但测试者仍需要明确知道 `release/mac-arm64/鱼仔桌面宠物.app` 是未签名试用包，不能当作正式签名与公证发行包。
参考片段：`yuzai-v0.1.0-test.1`、`release/mac-arm64/鱼仔桌面宠物.app`、`docs/release-tag-record.md`。
帧数：未新增 runtime 帧。
FPS：未修改。
循环方式：未修改。
水印处理：未执行；本轮不处理源视频、不抽帧、不接入新素材。
重建方法：先强化 `validate:release-readiness`，要求 `docs/signed-release-safety.md` 和关键安全文字；确认预期失败后补齐文档并重新验证通过。
运行时输出：未修改 `assets/runtime/animations/manifest.json`，未新增或覆盖 `assets/runtime/animations/*/frames`。
验证命令：`npm run validate:release-readiness`
桌面验收：不涉及新桌面截图；当前仍引用自然度观察和 release 验证记录。
已知问题：正式签名与公证仍未执行；动作自然度 high 风险回切和时长不足仍未关闭。
决定：接受 `docs/signed-release-safety.md` 作为未签名试用包和未来签名包之间的安全边界说明。
