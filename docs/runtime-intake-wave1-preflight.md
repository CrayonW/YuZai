# runtime 接入预检报告：第一波：低疲劳日常与关键交互

用途：本报告用于正式抽帧前检查来源视频、审查证据和接入门禁是否齐全。

硬性门禁：本报告不能直接批准 runtime 接入。即使全部通过，也必须先给用户确认对应执行清单，并逐视频人工播放检查无文字、水印、logo、额外物体和明显变形。

波次 ID：wave1
目的：先降低待机重复感，并让鼠标靠近、点击和提醒拥有更真实的小猫反馈。
确认规则：每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

## 汇总

- 动作数量：7
- 可进入人工播放检查：7
- 需要处理：0
- 缺失：0
- 仍需用户确认：7

## 视频与门禁

| action | 分类 | 状态 | 确认状态 | 尺寸 | 时长 | 大小 | 桥接入口 | 来源视频 | 审查证据 |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- |
| slow_blink | daily | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5647487 | daily-rotation.low-fatigue | assets/origin/generated/kling/slow_blink.mp4 | assets/reviews/kling-generated/slow_blink_sweep.png |
| look_around | daily | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6131403 | daily-rotation.low-fatigue | assets/origin/generated/kling/look_around.mp4 | assets/reviews/kling-generated/look_around_sweep.png |
| cursor_watch | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5653203 | proximity.mouse_near | assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4 | assets/reviews/kling-generated/cursor_watch_clean_candidate_v3_sweep.png |
| click_surprised | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6447862 | click.single | assets/origin/generated/kling/click_surprised.mp4 | assets/reviews/kling-generated/click_surprised_sweep.png |
| poke_annoyed | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6835619 | click.repeated | assets/origin/generated/kling/poke_annoyed.mp4 | assets/reviews/kling-generated/poke_annoyed_sweep.png |
| call_response | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5719691 | reminder.water | assets/origin/generated/kling/call_response.mp4 | assets/reviews/kling-generated/call_response_sweep.png |
| stretch_yawn | daily | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 7024257 | reminder.rest | assets/origin/generated/kling/stretch_yawn.mp4 | assets/reviews/kling-generated/stretch_yawn_sweep.png |

## 逐动作检查

### slow_blink

来源视频：assets/origin/generated/kling/slow_blink.mp4
审查证据：assets/reviews/kling-generated/slow_blink_sweep.png
运行帧输出：assets/runtime/animations/slow_blink/frames
桥接入口：daily-rotation.low-fatigue
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：从 idle_primary 或 idle_secondary 的安全帧切入，播放一轮后回到 idle_primary。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_around

来源视频：assets/origin/generated/kling/look_around.mp4
审查证据：assets/reviews/kling-generated/look_around_sweep.png
运行帧输出：assets/runtime/animations/look_around/frames
桥接入口：daily-rotation.low-fatigue
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：作为低频环境观察动作，从正坐待机安全帧切入，结束回到 idle_primary。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### cursor_watch

来源视频：assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4
审查证据：assets/reviews/kling-generated/cursor_watch_clean_candidate_v3_sweep.png
运行帧输出：assets/runtime/animations/cursor_watch/frames
桥接入口：proximity.mouse_near
中断策略：locked
结束返回：idle_primary
衔接策略：鼠标靠近时插入一轮关注动作；结束后回到当前日常基线，避免原 cursor_watch 的实体道具问题。
水印门禁：正式替换前逐视频播放检查 v3 全程无文字、水印、logo、光点和额外实体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### click_surprised

来源视频：assets/origin/generated/kling/click_surprised.mp4
审查证据：assets/reviews/kling-generated/click_surprised_sweep.png
运行帧输出：assets/runtime/animations/click_surprised/frames
桥接入口：click.single
中断策略：locked
结束返回：idle_primary
衔接策略：单次点击触发短反应，锁定播放结束后回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### poke_annoyed

来源视频：assets/origin/generated/kling/poke_annoyed.mp4
审查证据：assets/reviews/kling-generated/poke_annoyed_sweep.png
运行帧输出：assets/runtime/animations/poke_annoyed/frames
桥接入口：click.repeated
中断策略：locked
结束返回：idle_primary
衔接策略：连续点击后触发情绪变化；抽帧时重点检查尾巴和身体边缘裁切。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和边缘裁切问题。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### call_response

来源视频：assets/origin/generated/kling/call_response.mp4
审查证据：assets/reviews/kling-generated/call_response_sweep.png
运行帧输出：assets/runtime/animations/call_response/frames
桥接入口：reminder.water
中断策略：locked
结束返回：idle_primary
衔接策略：气泡提醒或用户召唤时插入回应动作，结束后回到日常。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### stretch_yawn

来源视频：assets/origin/generated/kling/stretch_yawn.mp4
审查证据：assets/reviews/kling-generated/stretch_yawn_sweep.png
运行帧输出：assets/runtime/animations/stretch_yawn/frames
桥接入口：reminder.rest
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：休息提醒或低频日常变化时播放；按打哈欠/抬前爪语义接入，不按完整伸懒腰预期。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

## 确认前禁止

- 禁止抽帧。
- 禁止去水印/抠绿。
- 禁止修改 runtime manifest。
- 禁止覆盖 runtime 动作目录。
- 禁止把 mp4 强制加入 Git。
- 禁止声称本波动作已经进入桌宠。

## 验证命令

```bash
npm run validate:runtime-intake-preflight
npm run validate:runtime-intake-waves
npm run validate:release
```
