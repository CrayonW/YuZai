# runtime 接入前用户确认清单：第六波：高风险回切过渡

波次 ID：transition-out-recovery
目的：补齐动作衔接风险报告中 tail-not-recovered 的 4 个高风险回切过渡，降低动作结束回到日常或睡眠循环时的跳变。

## 确认规则

每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

只允许在用户明确确认本清单后执行去水印/抠绿、序列帧抽取、runtime manifest 修改和桌面验收。

## 摘要

- 动作数量：4
- 推荐接入：4
- 暂缓候选：0
- 仍需用户确认：4

## 动作清单

### sleep_to_sleeping

- 目标 action：sleep_to_sleeping
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/sleep_to_sleeping.mp4
- 审查证据：assets/reviews/kling-generated/sleep_to_sleeping.png
- 运行帧输出：assets/runtime/animations/sleep_to_sleeping/frames
- 桥接入口：transition-out.sleep_to_sleeping
- 中断策略：locked
- 结束返回：sleeping
- 衔接策略：sleep 播放结束后先进入本过渡动作，再回到 sleeping 循环，避免直接从入睡尾帧跳回睡眠首帧。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。

### waking_to_idle

- 目标 action：waking_to_idle
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/waking_to_idle.mp4
- 审查证据：assets/reviews/kling-generated/waking_to_idle.png
- 运行帧输出：assets/runtime/animations/waking_to_idle/frames
- 桥接入口：transition-out.waking_to_idle
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：waking 播放结束后先进入本过渡动作，再回到 idle_primary，降低醒来尾段回待机的姿态跳变。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。

### poke_annoyed_to_idle

- 目标 action：poke_annoyed_to_idle
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/poke_annoyed_to_idle.mp4
- 审查证据：assets/reviews/kling-generated/poke_annoyed_to_idle.png
- 运行帧输出：assets/runtime/animations/poke_annoyed_to_idle/frames
- 桥接入口：transition-out.poke_annoyed_to_idle
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：poke_annoyed 播放结束后先进入本过渡动作，再回到 idle_primary，降低被戳反应尾段回待机的姿态跳变。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。

### paw_raise_to_idle

- 目标 action：paw_raise_to_idle
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/paw_raise_to_idle.mp4
- 审查证据：assets/reviews/kling-generated/paw_raise_to_idle.png
- 运行帧输出：assets/runtime/animations/paw_raise_to_idle/frames
- 桥接入口：transition-out.paw_raise_to_idle
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：paw_raise 播放结束后先进入本过渡动作，再回到 idle_primary，降低抬爪尾段回待机的姿态跳变。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。

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
