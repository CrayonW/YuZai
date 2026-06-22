# 小猫动作资产契约与缺口报告

用途：把可灵视频生成计划、运行时 manifest 和后续源视频接入流程对齐。该报告不会替代用户确认；任何新视频在抽帧或覆盖 runtime 之前，仍需要先生成处理清单给用户确认。

## 契约规则

- 计划动作必须包含字段：`action`、`category`、`loop`、`durationSeconds`、`minCooldownSeconds`、`antiFatigueRole`、`prompt`、`output`。
- 分类只允许：`daily`、`interactive`、`transition`。
- 目标 FPS：24。runtime 帧数应至少达到 `durationSeconds * fps`，否则会被列为“时长不足”。
- 水印规则：prompt 必须明确排除文字、水印和 logo；源视频进 runtime 前必须完成水印检查和去除。
- 日常动作应优先补齐 6-8 秒生活化动作；交互动作应有明确回切；transition 动作用于降低序列帧切换跳变。

## 当前摘要

- 计划动作数：43
- runtime 可播放动作数：42
- 可播放覆盖率：95%
- 缺失动作数：2
- runtime 时长不足动作数：30
- manifest 元数据不一致数：4

## 分类覆盖

| 分类 | 计划动作 | 可播放动作 | 缺失动作 |
| --- | ---: | ---: | ---: |
| daily | 13 | 13 | 0 |
| interactive | 24 | 24 | 0 |
| transition | 6 | 4 | 2 |

## 优先补齐批次

### 第四批：动作衔接过渡
补齐短过渡动作，用于降低待机到交互、交互回待机、入睡回睡眠循环时的序列帧跳变。

| action | 分类 | 时长 | 预期源视频 |
| --- | --- | ---: | --- |
| idle_to_paw_raise | transition | 2s | assets/origin/generated/kling/idle_to_paw_raise.mp4 |
| idle_to_cursor_watch | transition | 2s | assets/origin/generated/kling/idle_to_cursor_watch.mp4 |


## 缺失动作

- `idle_to_paw_raise`（transition，2s）：待机到抬爪的衔接，降低序列帧切换突兀感；预期源视频：assets/origin/generated/kling/idle_to_paw_raise.mp4
- `idle_to_cursor_watch`（transition，2s）：待机到注视鼠标的衔接，支持鼠标靠近更自然；预期源视频：assets/origin/generated/kling/idle_to_cursor_watch.mp4

## runtime 时长不足

- `idle_primary`：当前 72 帧（约 3s），契约需要 192 帧（8s）。
- `idle_secondary`：当前 72 帧（约 3s），契约需要 192 帧（8s）。
- `tail_wag`：当前 72 帧（约 3s），契约需要 192 帧（8s）。
- `slow_blink`：当前 120 帧（约 5s），契约需要 144 帧（6s）。
- `look_around`：当前 120 帧（约 5s），契约需要 144 帧（6s）。
- `groom_face_wash`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `loaf_breathing`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `desk_sniff`：当前 120 帧（约 5s），契约需要 144 帧（6s）。
- `stretch_yawn`：当前 120 帧（约 5s），契约需要 144 帧（6s）。
- `sleepy`：当前 120 帧（约 5s），契约需要 144 帧（6s）。
- `sleep`：当前 120 帧（约 5s），契约需要 144 帧（6s）。
- `sleeping`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `walk`：当前 72 帧（约 3s），契约需要 144 帧（6s）。
- `paw_raise`：当前 72 帧（约 3s），契约需要 96 帧（4s）。
- `look_e`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_ene`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_ne`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_nne`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_n`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_nnw`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_nw`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_wnw`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_w`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_wsw`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_sw`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_ssw`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_s`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_sse`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_se`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_ese`：当前 120 帧（约 5s），契约需要 192 帧（8s）。

## manifest 元数据不一致

- `sleepy`：category 计划为 `daily`，runtime 为 `transition`。
- `sleep`：category 计划为 `daily`，runtime 为 `transition`。
- `dragging`：loop 计划为 `true`，runtime 为 `false`。
- `waking`：category 计划为 `interactive`，runtime 为 `transition`。

## 计划字段问题

当前计划动作字段满足契约。

## 后续接入顺序

1. 每次新增或替换源视频前，先运行 `npm run animations:intake-checklist` 并给用户确认。
2. 确认后再做源视频预检、去水印、抽帧和 manifest 更新。
3. 接入后运行 `npm run animations:asset-contract -- --write docs/animation-asset-contract.md` 刷新缺口报告。
4. 运行 `npm run validate:release` 和桌面多帧截图验收，确认桌面宠物可见、动作连续、交互能回到日常动作。
