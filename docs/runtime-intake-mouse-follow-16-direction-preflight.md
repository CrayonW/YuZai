# runtime 接入预检报告：第五波：16 方向鼠标跟随

用途：本报告用于正式抽帧前检查来源视频、审查证据和接入门禁是否齐全。

硬性门禁：本报告不能直接批准 runtime 接入。即使全部通过，也必须先给用户确认对应执行清单，并逐视频人工播放检查无文字、水印、logo、额外物体和明显变形。

波次 ID：mouse-follow-16-direction
目的：把 16 个真实视频方向动作接入 runtime，让猫咪头部和眼睛能按鼠标相对方向跟随。
确认规则：每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

## 汇总

- 动作数量：16
- 可进入人工播放检查：16
- 需要处理：0
- 缺失：0
- 仍需用户确认：16

## 视频与门禁

| action | 分类 | 状态 | 确认状态 | 尺寸 | 时长 | 大小 | 桥接入口 | 来源视频 | 审查证据 |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- |
| look_e | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5973476 | mouse-follow.direction.e | assets/origin/generated/kling/look_e.mp4 | assets/reviews/kling-generated/look_e.png |
| look_ene | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5743017 | mouse-follow.direction.ene | assets/origin/generated/kling/look_ene.mp4 | assets/reviews/kling-generated/look_ene.png |
| look_ne | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5441563 | mouse-follow.direction.ne | assets/origin/generated/kling/look_ne.mp4 | assets/reviews/kling-generated/look_ne.png |
| look_nne | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5419388 | mouse-follow.direction.nne | assets/origin/generated/kling/look_nne.mp4 | assets/reviews/kling-generated/look_nne.png |
| look_n | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5779773 | mouse-follow.direction.n | assets/origin/generated/kling/look_n.mp4 | assets/reviews/kling-generated/look_n.png |
| look_nnw | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5668146 | mouse-follow.direction.nnw | assets/origin/generated/kling/look_nnw.mp4 | assets/reviews/kling-generated/look_nnw.png |
| look_nw | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5547581 | mouse-follow.direction.nw | assets/origin/generated/kling/look_nw.mp4 | assets/reviews/kling-generated/look_nw.png |
| look_wnw | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6176213 | mouse-follow.direction.wnw | assets/origin/generated/kling/look_wnw.mp4 | assets/reviews/kling-generated/look_wnw.png |
| look_w | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5908909 | mouse-follow.direction.w | assets/origin/generated/kling/look_w.mp4 | assets/reviews/kling-generated/look_w.png |
| look_wsw | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5448953 | mouse-follow.direction.wsw | assets/origin/generated/kling/look_wsw.mp4 | assets/reviews/kling-generated/look_wsw.png |
| look_sw | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5590892 | mouse-follow.direction.sw | assets/origin/generated/kling/look_sw.mp4 | assets/reviews/kling-generated/look_sw.png |
| look_ssw | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5282902 | mouse-follow.direction.ssw | assets/origin/generated/kling/look_ssw.mp4 | assets/reviews/kling-generated/look_ssw.png |
| look_s | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5575318 | mouse-follow.direction.s | assets/origin/generated/kling/look_s.mp4 | assets/reviews/kling-generated/look_s.png |
| look_sse | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5471548 | mouse-follow.direction.sse | assets/origin/generated/kling/look_sse.mp4 | assets/reviews/kling-generated/look_sse.png |
| look_se | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5641252 | mouse-follow.direction.se | assets/origin/generated/kling/look_se.mp4 | assets/reviews/kling-generated/look_se.png |
| look_ese | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5734079 | mouse-follow.direction.ese | assets/origin/generated/kling/look_ese.mp4 | assets/reviews/kling-generated/look_ese.png |

## 逐动作检查

### look_e

来源视频：assets/origin/generated/kling/look_e.mp4
审查证据：assets/reviews/kling-generated/look_e.png
运行帧输出：assets/runtime/animations/look_e/frames
桥接入口：mouse-follow.direction.e
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于正右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_ene

来源视频：assets/origin/generated/kling/look_ene.mp4
审查证据：assets/reviews/kling-generated/look_ene.png
运行帧输出：assets/runtime/animations/look_ene/frames
桥接入口：mouse-follow.direction.ene
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于右上偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_ne

来源视频：assets/origin/generated/kling/look_ne.mp4
审查证据：assets/reviews/kling-generated/look_ne.png
运行帧输出：assets/runtime/animations/look_ne/frames
桥接入口：mouse-follow.direction.ne
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于右上方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_nne

来源视频：assets/origin/generated/kling/look_nne.mp4
审查证据：assets/reviews/kling-generated/look_nne.png
运行帧输出：assets/runtime/animations/look_nne/frames
桥接入口：mouse-follow.direction.nne
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于上方偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_n

来源视频：assets/origin/generated/kling/look_n.mp4
审查证据：assets/reviews/kling-generated/look_n.png
运行帧输出：assets/runtime/animations/look_n/frames
桥接入口：mouse-follow.direction.n
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于正上方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_nnw

来源视频：assets/origin/generated/kling/look_nnw.mp4
审查证据：assets/reviews/kling-generated/look_nnw.png
运行帧输出：assets/runtime/animations/look_nnw/frames
桥接入口：mouse-follow.direction.nnw
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于上方偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_nw

来源视频：assets/origin/generated/kling/look_nw.mp4
审查证据：assets/reviews/kling-generated/look_nw.png
运行帧输出：assets/runtime/animations/look_nw/frames
桥接入口：mouse-follow.direction.nw
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于左上方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_wnw

来源视频：assets/origin/generated/kling/look_wnw.mp4
审查证据：assets/reviews/kling-generated/look_wnw.png
运行帧输出：assets/runtime/animations/look_wnw/frames
桥接入口：mouse-follow.direction.wnw
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于左上偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_w

来源视频：assets/origin/generated/kling/look_w.mp4
审查证据：assets/reviews/kling-generated/look_w.png
运行帧输出：assets/runtime/animations/look_w/frames
桥接入口：mouse-follow.direction.w
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于正左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_wsw

来源视频：assets/origin/generated/kling/look_wsw.mp4
审查证据：assets/reviews/kling-generated/look_wsw.png
运行帧输出：assets/runtime/animations/look_wsw/frames
桥接入口：mouse-follow.direction.wsw
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于左下偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_sw

来源视频：assets/origin/generated/kling/look_sw.mp4
审查证据：assets/reviews/kling-generated/look_sw.png
运行帧输出：assets/runtime/animations/look_sw/frames
桥接入口：mouse-follow.direction.sw
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于左下方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_ssw

来源视频：assets/origin/generated/kling/look_ssw.mp4
审查证据：assets/reviews/kling-generated/look_ssw.png
运行帧输出：assets/runtime/animations/look_ssw/frames
桥接入口：mouse-follow.direction.ssw
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于下方偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_s

来源视频：assets/origin/generated/kling/look_s.mp4
审查证据：assets/reviews/kling-generated/look_s.png
运行帧输出：assets/runtime/animations/look_s/frames
桥接入口：mouse-follow.direction.s
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于正下方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前重点检查猫咪没有趴下或裁切；同时确认无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_sse

来源视频：assets/origin/generated/kling/look_sse.mp4
审查证据：assets/reviews/kling-generated/look_sse.png
运行帧输出：assets/runtime/animations/look_sse/frames
桥接入口：mouse-follow.direction.sse
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于下方偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_se

来源视频：assets/origin/generated/kling/look_se.mp4
审查证据：assets/reviews/kling-generated/look_se.png
运行帧输出：assets/runtime/animations/look_se/frames
桥接入口：mouse-follow.direction.se
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于右下方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### look_ese

来源视频：assets/origin/generated/kling/look_ese.mp4
审查证据：assets/reviews/kling-generated/look_ese.png
运行帧输出：assets/runtime/animations/look_ese/frames
桥接入口：mouse-follow.direction.ese
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：鼠标位于右下偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

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
