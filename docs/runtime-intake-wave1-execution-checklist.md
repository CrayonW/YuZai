# runtime 接入前用户确认清单：第一波：低疲劳日常与关键交互

波次 ID：wave1
目的：先降低待机重复感，并让鼠标靠近、点击和提醒拥有更真实的小猫反馈。

## 确认规则

每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

只允许在用户明确确认本清单后执行去水印/抠绿、序列帧抽取、runtime manifest 修改和桌面验收。

## 摘要

- 动作数量：7
- 推荐接入：7
- 暂缓候选：0
- 仍需用户确认：7

## 动作清单

### slow_blink

- 目标 action：slow_blink
- 分类：daily
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/slow_blink.mp4
- 审查证据：assets/reviews/kling-generated/slow_blink_sweep.png
- 运行帧输出：assets/runtime/animations/slow_blink/frames
- 桥接入口：daily-rotation.low-fatigue
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：从 idle_primary 或 idle_secondary 的安全帧切入，播放一轮后回到 idle_primary。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### look_around

- 目标 action：look_around
- 分类：daily
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_around.mp4
- 审查证据：assets/reviews/kling-generated/look_around_sweep.png
- 运行帧输出：assets/runtime/animations/look_around/frames
- 桥接入口：daily-rotation.low-fatigue
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：作为低频环境观察动作，从正坐待机安全帧切入，结束回到 idle_primary。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### cursor_watch

- 目标 action：cursor_watch
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4
- 审查证据：assets/reviews/kling-generated/cursor_watch_clean_candidate_v3_sweep.png
- 运行帧输出：assets/runtime/animations/cursor_watch/frames
- 桥接入口：proximity.mouse_near
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：鼠标靠近时插入一轮关注动作；结束后回到当前日常基线，避免原 cursor_watch 的实体道具问题。
- 水印门禁：正式替换前逐视频播放检查 v3 全程无文字、水印、logo、光点和额外实体。

### click_surprised

- 目标 action：click_surprised
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/click_surprised.mp4
- 审查证据：assets/reviews/kling-generated/click_surprised_sweep.png
- 运行帧输出：assets/runtime/animations/click_surprised/frames
- 桥接入口：click.single
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：单次点击触发短反应，锁定播放结束后回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### poke_annoyed

- 目标 action：poke_annoyed
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/poke_annoyed.mp4
- 审查证据：assets/reviews/kling-generated/poke_annoyed_sweep.png
- 运行帧输出：assets/runtime/animations/poke_annoyed/frames
- 桥接入口：click.repeated
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：连续点击后触发情绪变化；抽帧时重点检查尾巴和身体边缘裁切。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和边缘裁切问题。

### call_response

- 目标 action：call_response
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/call_response.mp4
- 审查证据：assets/reviews/kling-generated/call_response_sweep.png
- 运行帧输出：assets/runtime/animations/call_response/frames
- 桥接入口：reminder.water
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：气泡提醒或用户召唤时插入回应动作，结束后回到日常。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### stretch_yawn

- 目标 action：stretch_yawn
- 分类：daily
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/stretch_yawn.mp4
- 审查证据：assets/reviews/kling-generated/stretch_yawn_sweep.png
- 运行帧输出：assets/runtime/animations/stretch_yawn/frames
- 桥接入口：reminder.rest
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：休息提醒或低频日常变化时播放；按打哈欠/抬前爪语义接入，不按完整伸懒腰预期。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

## 批准后允许执行

1. 逐个播放来源视频，确认无文字、水印、logo、额外物体和明显变形。
2. 对确认通过的视频执行去水印、抠绿、序列帧生成。
3. 更新 `assets/runtime/animations/manifest.json` 和对应行为桥接。
4. 执行桌面可视化验收：桌面可见、始终置顶、鼠标靠近/点击/提醒触发正确、姿势回切自然。

## 确认前禁止

- 禁止抽帧。
- 禁止去水印/抠绿。
- 禁止修改 runtime manifest。
- 禁止覆盖已有 runtime 动作目录。
- 禁止把 mp4 强制加入 Git。
- 禁止声称本波动作已经进入桌宠。

## 验证命令

```bash
npm run validate:runtime-intake-waves
npm run validate:runtime-intake-checklist
npm run validate:release
```
