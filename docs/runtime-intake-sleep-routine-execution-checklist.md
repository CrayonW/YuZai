# runtime 接入前用户确认清单：第三波：睡眠作息链路

波次 ID：sleep-routine
目的：把变困、入睡、睡眠循环和醒来设计成成组状态，避免睡眠相关动作硬切。

## 确认规则

每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

只允许在用户明确确认本清单后执行去水印/抠绿、序列帧抽取、runtime manifest 修改和桌面验收。

## 摘要

- 动作数量：4
- 推荐接入：3
- 暂缓候选：1
- 仍需用户确认：4

## 动作清单

### sleepy

- 目标 action：sleepy
- 分类：sleep-routine
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/sleepy.mp4
- 审查证据：assets/reviews/kling-generated/sleepy_sweep.png
- 运行帧输出：assets/runtime/animations/sleepy/frames
- 桥接入口：sleep.entering
- 中断策略：locked
- 结束返回：sleep
- 衔接策略：作为变困入口，播放结束后进入 sleep 入睡过渡。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### sleep

- 目标 action：sleep
- 分类：sleep-routine
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/sleep.mp4
- 审查证据：assets/reviews/kling-generated/sleep_sweep.png
- 运行帧输出：assets/runtime/animations/sleep/frames
- 桥接入口：sleep.transition
- 中断策略：locked
- 结束返回：sleeping
- 衔接策略：从正坐进入蜷伏睡姿，锁定播放结束后进入 sleeping 或后续更明确睡眠循环。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### sleeping

- 目标 action：sleeping
- 分类：sleep-routine
- 当前状态：deferred
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/sleeping.mp4
- 审查证据：assets/reviews/kling-generated/sleeping_sweep.png
- 运行帧输出：assets/runtime/animations/sleeping/frames
- 桥接入口：sleep.loop
- 中断策略：at-safe-frame
- 结束返回：waking
- 衔接策略：当前素材更像正坐轻闭眼；可短期作为低能量循环，真实睡眠循环建议重新生成更明确蜷伏睡姿。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### waking

- 目标 action：waking
- 分类：sleep-routine
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/waking.mp4
- 审查证据：assets/reviews/kling-generated/waking_sweep.png
- 运行帧输出：assets/runtime/animations/waking/frames
- 桥接入口：sleep.exit
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：作为睡眠结束后回到正坐日常的过渡，播放结束后回到 idle_primary。
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
