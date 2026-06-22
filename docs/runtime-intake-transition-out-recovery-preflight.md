# runtime 接入预检报告：第六波：高风险回切过渡

用途：本报告用于正式抽帧前检查来源视频、审查证据和接入门禁是否齐全。

硬性门禁：本报告不能直接批准 runtime 接入。即使全部通过，也必须先给用户确认对应执行清单，并逐视频人工播放检查无文字、水印、logo、额外物体和明显变形。

波次 ID：transition-out-recovery
目的：补齐动作衔接风险报告中 tail-not-recovered 的 4 个高风险回切过渡，降低动作结束回到日常或睡眠循环时的跳变。
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
| sleep_to_sleeping | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 8204002 | transition-out.sleep_to_sleeping | assets/origin/generated/kling/sleep_to_sleeping.mp4 | assets/reviews/kling-generated/sleep_to_sleeping.png |
| waking_to_idle | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6501686 | transition-out.waking_to_idle | assets/origin/generated/kling/waking_to_idle.mp4 | assets/reviews/kling-generated/waking_to_idle.png |
| poke_annoyed_to_idle | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6767911 | transition-out.poke_annoyed_to_idle | assets/origin/generated/kling/poke_annoyed_to_idle.mp4 | assets/reviews/kling-generated/poke_annoyed_to_idle.png |
| paw_raise_to_idle | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6749702 | transition-out.paw_raise_to_idle | assets/origin/generated/kling/paw_raise_to_idle.mp4 | assets/reviews/kling-generated/paw_raise_to_idle.png |

## 逐动作检查

### sleep_to_sleeping

来源视频：assets/origin/generated/kling/sleep_to_sleeping.mp4
审查证据：assets/reviews/kling-generated/sleep_to_sleeping.png
运行帧输出：assets/runtime/animations/sleep_to_sleeping/frames
桥接入口：transition-out.sleep_to_sleeping
中断策略：locked
结束返回：sleeping
衔接策略：sleep 播放结束后先进入本过渡动作，再回到 sleeping 循环，避免直接从入睡尾帧跳回睡眠首帧。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### waking_to_idle

来源视频：assets/origin/generated/kling/waking_to_idle.mp4
审查证据：assets/reviews/kling-generated/waking_to_idle.png
运行帧输出：assets/runtime/animations/waking_to_idle/frames
桥接入口：transition-out.waking_to_idle
中断策略：locked
结束返回：idle_primary
衔接策略：waking 播放结束后先进入本过渡动作，再回到 idle_primary，降低醒来尾段回待机的姿态跳变。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### poke_annoyed_to_idle

来源视频：assets/origin/generated/kling/poke_annoyed_to_idle.mp4
审查证据：assets/reviews/kling-generated/poke_annoyed_to_idle.png
运行帧输出：assets/runtime/animations/poke_annoyed_to_idle/frames
桥接入口：transition-out.poke_annoyed_to_idle
中断策略：locked
结束返回：idle_primary
衔接策略：poke_annoyed 播放结束后先进入本过渡动作，再回到 idle_primary，降低被戳反应尾段回待机的姿态跳变。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### paw_raise_to_idle

来源视频：assets/origin/generated/kling/paw_raise_to_idle.mp4
审查证据：assets/reviews/kling-generated/paw_raise_to_idle.png
运行帧输出：assets/runtime/animations/paw_raise_to_idle/frames
桥接入口：transition-out.paw_raise_to_idle
中断策略：locked
结束返回：idle_primary
衔接策略：paw_raise 播放结束后先进入本过渡动作，再回到 idle_primary，降低抬爪尾段回待机的姿态跳变。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。

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
