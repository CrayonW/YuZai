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
