# 小猫动作资产契约与缺口报告

用途：把可灵视频生成计划、运行时 manifest 和后续源视频接入流程对齐。该报告不会替代用户确认；任何新视频在抽帧或覆盖 runtime 之前，仍需要先生成处理清单给用户确认。

## 契约规则

- 计划动作必须包含字段：`action`、`category`、`loop`、`durationSeconds`、`minCooldownSeconds`、`antiFatigueRole`、`prompt`、`output`。
- 分类只允许：`daily`、`interactive`、`transition`。
- 目标 FPS：24。runtime 帧数应至少达到 `durationSeconds * fps`，否则会被列为“时长不足”。
- 水印规则：prompt 必须明确排除文字、水印和 logo；源视频进 runtime 前必须完成水印检查和去除。
- 日常动作应优先补齐 6-8 秒生活化动作；交互动作应有明确回切；transition 动作用于降低序列帧切换跳变。

## 当前摘要

- 计划动作数：24
- runtime 可播放动作数：6
- 可播放覆盖率：21%
- 缺失动作数：19
- runtime 时长不足动作数：5
- manifest 元数据不一致数：0

## 分类覆盖

| 分类 | 计划动作 | 可播放动作 | 缺失动作 |
| --- | ---: | ---: | ---: |
| daily | 13 | 4 | 9 |
| interactive | 8 | 1 | 7 |
| transition | 3 | 0 | 3 |

## 优先补齐批次

### 第一批：降低视觉疲劳并补关键互动
优先补一个强生活化日常动作和一个鼠标靠近反馈，让桌宠不再只重复短待机，也让用户靠近时有专属反应。

| action | 分类 | 时长 | 预期源视频 |
| --- | --- | ---: | --- |
| groom_face_wash | daily | 8s | assets/origin/generated/kling/groom_face_wash.mp4 |
| loaf_breathing | daily | 8s | assets/origin/generated/kling/loaf_breathing.mp4 |
| cursor_watch | interactive | 4s | assets/origin/generated/kling/cursor_watch.mp4 |
| click_surprised | interactive | 4s | assets/origin/generated/kling/click_surprised.mp4 |

### 第二批：睡眠作息链路
补齐变困、入睡、睡着和唤醒，让桌宠更像在电脑里生活，而不是永远站桩。

| action | 分类 | 时长 | 预期源视频 |
| --- | --- | ---: | --- |
| sleepy | daily | 6s | assets/origin/generated/kling/sleepy.mp4 |
| sleep | daily | 6s | assets/origin/generated/kling/sleep.mp4 |
| sleeping | daily | 8s | assets/origin/generated/kling/sleeping.mp4 |
| waking | interactive | 4s | assets/origin/generated/kling/waking.mp4 |

### 第三批：日常探索与情绪变化
补充观察、嗅闻、伸懒腰和连续点击后的情绪变化，增加真实小猫的随机生活感。

| action | 分类 | 时长 | 预期源视频 |
| --- | --- | ---: | --- |
| slow_blink | daily | 6s | assets/origin/generated/kling/slow_blink.mp4 |
| look_around | daily | 6s | assets/origin/generated/kling/look_around.mp4 |
| desk_sniff | daily | 6s | assets/origin/generated/kling/desk_sniff.mp4 |
| stretch_yawn | daily | 6s | assets/origin/generated/kling/stretch_yawn.mp4 |
| poke_annoyed | interactive | 4s | assets/origin/generated/kling/poke_annoyed.mp4 |
| shy | interactive | 4s | assets/origin/generated/kling/shy.mp4 |
| dragging | interactive | 4s | assets/origin/generated/kling/dragging.mp4 |
| call_response | interactive | 4s | assets/origin/generated/kling/call_response.mp4 |

### 第四批：动作衔接过渡
补齐短过渡动作，用于降低待机到交互、交互回待机时的序列帧跳变。

| action | 分类 | 时长 | 预期源视频 |
| --- | --- | ---: | --- |
| idle_to_paw_raise | transition | 2s | assets/origin/generated/kling/idle_to_paw_raise.mp4 |
| paw_raise_to_idle | transition | 2s | assets/origin/generated/kling/paw_raise_to_idle.mp4 |
| idle_to_cursor_watch | transition | 2s | assets/origin/generated/kling/idle_to_cursor_watch.mp4 |


## 缺失动作

- `slow_blink`（daily，6s）：亲近感插入动作，像小猫在陪用户；预期源视频：assets/origin/generated/kling/slow_blink.mp4
- `look_around`（daily，6s）：环境观察，让桌宠显得有自己的注意力；预期源视频：assets/origin/generated/kling/look_around.mp4
- `groom_face_wash`（daily，8s）：真实小猫生活动作，提供强烈陪伴感；预期源视频：assets/origin/generated/kling/groom_face_wash.mp4
- `loaf_breathing`（daily，8s）：香箱趴长陪伴状态，可替代长时间坐姿；预期源视频：assets/origin/generated/kling/loaf_breathing.mp4
- `desk_sniff`（daily，6s）：好奇探索动作，让猫像在电脑桌面生活；预期源视频：assets/origin/generated/kling/desk_sniff.mp4
- `stretch_yawn`（daily，6s）：作息变化动作，可连接休息提醒或睡前状态；预期源视频：assets/origin/generated/kling/stretch_yawn.mp4
- `sleepy`（daily，6s）：睡眠链路入口，让日常作息更像真实小猫；预期源视频：assets/origin/generated/kling/sleepy.mp4
- `sleep`（daily，6s）：入睡过渡，让状态变化有过程；预期源视频：assets/origin/generated/kling/sleep.mp4
- `sleeping`（daily，8s）：睡着循环，提供低打扰长期陪伴；预期源视频：assets/origin/generated/kling/sleeping.mp4
- `cursor_watch`（interactive，4s）：鼠标靠近时的低强度关注反应；预期源视频：assets/origin/generated/kling/cursor_watch.mp4
- `click_surprised`（interactive，4s）：点击反馈，给用户明确互动感；预期源视频：assets/origin/generated/kling/click_surprised.mp4
- `poke_annoyed`（interactive，4s）：多次点击后的情绪变化，避免交互只有一种反应；预期源视频：assets/origin/generated/kling/poke_annoyed.mp4
- `shy`（interactive，4s）：温柔互动反馈，可用于停留或夸奖触发；预期源视频：assets/origin/generated/kling/shy.mp4
- `dragging`（interactive，4s）：拖拽专用循环，让移动宠物时仍有生命感；预期源视频：assets/origin/generated/kling/dragging.mp4
- `waking`（interactive，4s）：从睡眠回到互动的状态恢复；预期源视频：assets/origin/generated/kling/waking.mp4
- `call_response`（interactive，4s）：用户召唤或气泡互动时的回应；预期源视频：assets/origin/generated/kling/call_response.mp4
- `idle_to_paw_raise`（transition，2s）：待机到抬爪的衔接，降低序列帧切换突兀感；预期源视频：assets/origin/generated/kling/idle_to_paw_raise.mp4
- `paw_raise_to_idle`（transition，2s）：抬爪回待机的衔接，降低回切跳变；预期源视频：assets/origin/generated/kling/paw_raise_to_idle.mp4
- `idle_to_cursor_watch`（transition，2s）：待机到注视鼠标的衔接，支持鼠标靠近更自然；预期源视频：assets/origin/generated/kling/idle_to_cursor_watch.mp4

## runtime 时长不足

- `idle_primary`：当前 72 帧（约 3s），契约需要 192 帧（8s）。
- `idle_secondary`：当前 72 帧（约 3s），契约需要 192 帧（8s）。
- `tail_wag`：当前 72 帧（约 3s），契约需要 192 帧（8s）。
- `walk`：当前 72 帧（约 3s），契约需要 144 帧（6s）。
- `paw_raise`：当前 72 帧（约 3s），契约需要 96 帧（4s）。

## manifest 元数据不一致

当前没有发现计划与 runtime manifest 的分类或循环字段不一致。

## 计划字段问题

当前计划动作字段满足契约。

## 后续接入顺序

1. 每次新增或替换源视频前，先运行 `npm run animations:intake-checklist` 并给用户确认。
2. 确认后再做源视频预检、去水印、抽帧和 manifest 更新。
3. 接入后运行 `npm run animations:asset-contract -- --write docs/animation-asset-contract.md` 刷新缺口报告。
4. 运行 `npm run validate:release` 和桌面多帧截图验收，确认桌面宠物可见、动作连续、交互能回到日常动作。
