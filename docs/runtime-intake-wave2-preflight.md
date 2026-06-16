# runtime 接入预检报告：第二波：日常生活和互动变化

用途：本报告用于正式抽帧前检查来源视频、审查证据和接入门禁是否齐全。

硬性门禁：本报告不能直接批准 runtime 接入。即使全部通过，也必须先给用户确认对应执行清单，并逐视频人工播放检查无文字、水印、logo、额外物体和明显变形。

波次 ID：wave2
目的：补充洗脸、嗅闻、轻呼吸和害羞等生活感动作，让桌宠更像真实小猫在电脑里生活。
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
| groom_face_wash | daily | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 7333436 | daily-rotation.life | assets/origin/generated/kling/groom_face_wash.mp4 | assets/reviews/kling-generated/groom_face_wash_sweep.png |
| loaf_breathing | daily | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 5427337 | daily-rotation.low-fatigue | assets/origin/generated/kling/loaf_breathing.mp4 | assets/reviews/kling-generated/loaf_breathing_sweep.png |
| desk_sniff | daily | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6532065 | daily-rotation.explore | assets/origin/generated/kling/desk_sniff.mp4 | assets/reviews/kling-generated/desk_sniff_sweep.png |
| shy | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 6449961 | interaction.gentle | assets/origin/generated/kling/shy.mp4 | assets/reviews/kling-generated/shy_sweep.png |

## 逐动作检查

### groom_face_wash

来源视频：assets/origin/generated/kling/groom_face_wash.mp4
审查证据：assets/reviews/kling-generated/groom_face_wash_sweep.png
运行帧输出：assets/runtime/animations/groom_face_wash/frames
桥接入口：daily-rotation.life
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：从正坐待机安全帧切入，洗脸/舔爪结束后回到 idle_primary。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### loaf_breathing

来源视频：assets/origin/generated/kling/loaf_breathing.mp4
审查证据：assets/reviews/kling-generated/loaf_breathing_sweep.png
运行帧输出：assets/runtime/animations/loaf_breathing/frames
桥接入口：daily-rotation.low-fatigue
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：当前素材更像正坐轻呼吸，先作为低疲劳循环候选；明确香箱趴需要重新生成素材。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### desk_sniff

来源视频：assets/origin/generated/kling/desk_sniff.mp4
审查证据：assets/reviews/kling-generated/desk_sniff_sweep.png
运行帧输出：assets/runtime/animations/desk_sniff/frames
桥接入口：daily-rotation.explore
中断策略：at-safe-frame
结束返回：idle_primary
衔接策略：作为日常探索或鼠标靠近后的低强度探索动作，注意和 cursor_watch 区分触发语义。
水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。

### shy

来源视频：assets/origin/generated/kling/shy.mp4
审查证据：assets/reviews/kling-generated/shy_sweep.png
运行帧输出：assets/runtime/animations/shy/frames
桥接入口：interaction.gentle
中断策略：locked
结束返回：idle_primary
衔接策略：用于长时间注视、停留或轻互动结束后的短反应，播放结束回到日常。
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
