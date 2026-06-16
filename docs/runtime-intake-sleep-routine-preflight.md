# runtime 接入预检报告：第三波：睡眠作息链路

用途：本报告用于正式抽帧前检查来源视频、审查证据和接入门禁是否齐全。

硬性门禁：本报告不能直接批准 runtime 接入。即使全部通过，也必须先给用户确认对应执行清单，并逐视频人工播放检查无文字、水印、logo、额外物体和明显变形。

波次 ID：sleep-routine
目的：把变困、入睡、睡眠循环和醒来设计成成组状态，避免睡眠相关动作硬切。
确认规则：每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

## 汇总

- 动作数量：4
- 可进入人工播放检查：4
- 需要处理：0
- 缺失：0
- 仍需用户确认：4

## 视频与门禁

| action | 分类 | 状态 | 确认状态 | 尺寸 | 时长 | 大小 | 桥接入口 | 来源视频 | 审查证据 |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- |
| sleepy | sleep-routine | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5519059 | sleep.entering | assets/origin/generated/kling/sleepy.mp4 | assets/reviews/kling-generated/sleepy_sweep.png |
| sleep | sleep-routine | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 7509762 | sleep.transition | assets/origin/generated/kling/sleep.mp4 | assets/reviews/kling-generated/sleep_sweep.png |
| sleeping | sleep-routine | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5501864 | sleep.loop | assets/origin/generated/kling/sleeping.mp4 | assets/reviews/kling-generated/sleeping_sweep.png |
| waking | sleep-routine | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 7114078 | sleep.exit | assets/origin/generated/kling/waking.mp4 | assets/reviews/kling-generated/waking_sweep.png |

## 逐动作检查

### sleepy

来源视频：assets/origin/generated/kling/sleepy.mp4
审查证据：assets/reviews/kling-generated/sleepy_sweep.png
运行帧输出：assets/runtime/animations/sleepy/frames
桥接入口：sleep.entering
中断策略：locked
结束返回：sleep
衔接策略：作为变困入口，播放结束后进入 sleep 入睡过渡。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### sleep

来源视频：assets/origin/generated/kling/sleep.mp4
审查证据：assets/reviews/kling-generated/sleep_sweep.png
运行帧输出：assets/runtime/animations/sleep/frames
桥接入口：sleep.transition
中断策略：locked
结束返回：sleeping
衔接策略：从正坐进入蜷伏睡姿，锁定播放结束后进入 sleeping 或后续更明确睡眠循环。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### sleeping

来源视频：assets/origin/generated/kling/sleeping.mp4
审查证据：assets/reviews/kling-generated/sleeping_sweep.png
运行帧输出：assets/runtime/animations/sleeping/frames
桥接入口：sleep.loop
中断策略：never
结束返回：waking
衔接策略：当前素材更像正坐轻闭眼；可短期作为低能量循环，真实睡眠循环建议重新生成更明确蜷伏睡姿。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### waking

来源视频：assets/origin/generated/kling/waking.mp4
审查证据：assets/reviews/kling-generated/waking_sweep.png
运行帧输出：assets/runtime/animations/waking/frames
桥接入口：sleep.exit
中断策略：locked
结束返回：idle_primary
衔接策略：作为睡眠结束后回到正坐日常的过渡，播放结束后回到 idle_primary。
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
