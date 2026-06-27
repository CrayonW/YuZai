# runtime 接入预检报告：第七波：C1 互动动作专用过渡

用途：本报告用于正式抽帧前检查来源视频、审查证据和接入门禁是否齐全。

硬性门禁：本报告不能直接批准 runtime 接入。即使全部通过，也必须先给用户确认对应执行清单，并逐视频人工播放检查无文字、水印、logo、额外物体和明显变形。

波次 ID：c1-interaction-transitions
目的：把待机进入关键互动、关键互动回到待机的 8 个真实过渡视频接入 runtime，让鼠标靠近、点击、连续点击和抬爪动作不再硬切。
确认规则：每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

## 汇总

- 动作数量：8
- 可进入人工播放检查：8
- 需要处理：0
- 缺失：0
- 仍需用户确认：8

## 视频与门禁

| action | 分类 | 状态 | 确认状态 | 尺寸 | 时长 | 大小 | 桥接入口 | 来源视频 | 审查证据 |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- |
| idle_primary_to_paw_raise | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 7032094 | transition-in.idle_primary_to_paw_raise | assets/origin/generated/kling/idle_primary_to_paw_raise.mp4 | assets/reviews/kling-generated/idle_primary_to_paw_raise.png |
| paw_raise_to_idle_primary | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 7039161 | transition-out.paw_raise_to_idle_primary | assets/origin/generated/kling/paw_raise_to_idle_primary.mp4 | assets/reviews/kling-generated/paw_raise_to_idle_primary.png |
| idle_primary_to_cursor_watch | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 7142592 | transition-in.idle_primary_to_cursor_watch | assets/origin/generated/kling/idle_primary_to_cursor_watch.mp4 | assets/reviews/kling-generated/idle_primary_to_cursor_watch.png |
| cursor_watch_to_idle_primary | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6546810 | transition-out.cursor_watch_to_idle_primary | assets/origin/generated/kling/cursor_watch_to_idle_primary.mp4 | assets/reviews/kling-generated/cursor_watch_to_idle_primary.png |
| idle_primary_to_click_surprised | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6657090 | transition-in.idle_primary_to_click_surprised | assets/origin/generated/kling/idle_primary_to_click_surprised.mp4 | assets/reviews/kling-generated/idle_primary_to_click_surprised.png |
| click_surprised_to_idle_primary | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6797937 | transition-out.click_surprised_to_idle_primary | assets/origin/generated/kling/click_surprised_to_idle_primary.mp4 | assets/reviews/kling-generated/click_surprised_to_idle_primary.png |
| idle_primary_to_poke_annoyed | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 7078768 | transition-in.idle_primary_to_poke_annoyed | assets/origin/generated/kling/idle_primary_to_poke_annoyed.mp4 | assets/reviews/kling-generated/idle_primary_to_poke_annoyed.png |
| poke_annoyed_to_idle_primary | transition | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6848643 | transition-out.poke_annoyed_to_idle_primary | assets/origin/generated/kling/poke_annoyed_to_idle_primary.mp4 | assets/reviews/kling-generated/poke_annoyed_to_idle_primary.png |

## 逐动作检查

### idle_primary_to_paw_raise

来源视频：assets/origin/generated/kling/idle_primary_to_paw_raise.mp4
审查证据：assets/reviews/kling-generated/idle_primary_to_paw_raise.png
运行帧输出：assets/runtime/animations/idle_primary_to_paw_raise/frames
桥接入口：transition-in.idle_primary_to_paw_raise
中断策略：locked
结束返回：paw_raise
衔接策略：鼠标靠近或打招呼触发 paw_raise 前，先从 idle_primary 播放本过渡动作，再进入 paw_raise。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### paw_raise_to_idle_primary

来源视频：assets/origin/generated/kling/paw_raise_to_idle_primary.mp4
审查证据：assets/reviews/kling-generated/paw_raise_to_idle_primary.png
运行帧输出：assets/runtime/animations/paw_raise_to_idle_primary/frames
桥接入口：transition-out.paw_raise_to_idle_primary
中断策略：locked
结束返回：idle_primary
衔接策略：paw_raise 播放结束后先进入本过渡动作，再回到 idle_primary，替代旧的 paw_raise_to_idle。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### idle_primary_to_cursor_watch

来源视频：assets/origin/generated/kling/idle_primary_to_cursor_watch.mp4
审查证据：assets/reviews/kling-generated/idle_primary_to_cursor_watch.png
运行帧输出：assets/runtime/animations/idle_primary_to_cursor_watch/frames
桥接入口：transition-in.idle_primary_to_cursor_watch
中断策略：locked
结束返回：cursor_watch
衔接策略：鼠标靠近触发 cursor_watch 前，先从 idle_primary 播放本过渡动作，再进入关注鼠标动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### cursor_watch_to_idle_primary

来源视频：assets/origin/generated/kling/cursor_watch_to_idle_primary.mp4
审查证据：assets/reviews/kling-generated/cursor_watch_to_idle_primary.png
运行帧输出：assets/runtime/animations/cursor_watch_to_idle_primary/frames
桥接入口：transition-out.cursor_watch_to_idle_primary
中断策略：locked
结束返回：idle_primary
衔接策略：cursor_watch 播放结束后先进入本过渡动作，再回到 idle_primary，避免观察动作尾段直接跳回待机。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### idle_primary_to_click_surprised

来源视频：assets/origin/generated/kling/idle_primary_to_click_surprised.mp4
审查证据：assets/reviews/kling-generated/idle_primary_to_click_surprised.png
运行帧输出：assets/runtime/animations/idle_primary_to_click_surprised/frames
桥接入口：transition-in.idle_primary_to_click_surprised
中断策略：locked
结束返回：click_surprised
衔接策略：单次点击触发 click_surprised 前，先从 idle_primary 播放本过渡动作，再进入惊讶反应。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### click_surprised_to_idle_primary

来源视频：assets/origin/generated/kling/click_surprised_to_idle_primary.mp4
审查证据：assets/reviews/kling-generated/click_surprised_to_idle_primary.png
运行帧输出：assets/runtime/animations/click_surprised_to_idle_primary/frames
桥接入口：transition-out.click_surprised_to_idle_primary
中断策略：locked
结束返回：idle_primary
衔接策略：click_surprised 播放结束后先进入本过渡动作，再回到 idle_primary，避免惊讶尾段直接跳回待机。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### idle_primary_to_poke_annoyed

来源视频：assets/origin/generated/kling/idle_primary_to_poke_annoyed.mp4
审查证据：assets/reviews/kling-generated/idle_primary_to_poke_annoyed.png
运行帧输出：assets/runtime/animations/idle_primary_to_poke_annoyed/frames
桥接入口：transition-in.idle_primary_to_poke_annoyed
中断策略：locked
结束返回：poke_annoyed
衔接策略：连续点击触发 poke_annoyed 前，先从 idle_primary 播放本过渡动作，再进入不满反应。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### poke_annoyed_to_idle_primary

来源视频：assets/origin/generated/kling/poke_annoyed_to_idle_primary.mp4
审查证据：assets/reviews/kling-generated/poke_annoyed_to_idle_primary.png
运行帧输出：assets/runtime/animations/poke_annoyed_to_idle_primary/frames
桥接入口：transition-out.poke_annoyed_to_idle_primary
中断策略：locked
结束返回：idle_primary
衔接策略：poke_annoyed 播放结束后先进入本过渡动作，再回到 idle_primary，替代旧的 poke_annoyed_to_idle。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

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
