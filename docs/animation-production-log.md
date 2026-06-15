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
