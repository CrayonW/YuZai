# runtime 接入前用户确认清单：第七波：C1 互动动作专用过渡

波次 ID：c1-interaction-transitions
目的：把待机进入关键互动、关键互动回到待机的 8 个真实过渡视频接入 runtime，让鼠标靠近、点击、连续点击和抬爪动作不再硬切。

## 确认规则

每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

只允许在用户明确确认本清单后执行去水印/抠绿、序列帧抽取、runtime manifest 修改和桌面验收。

## 摘要

- 动作数量：8
- 推荐接入：8
- 暂缓候选：0
- 仍需用户确认：8

## 动作清单

### idle_primary_to_paw_raise

- 目标 action：idle_primary_to_paw_raise
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/idle_primary_to_paw_raise.mp4
- 审查证据：assets/reviews/kling-generated/idle_primary_to_paw_raise.png
- 运行帧输出：assets/runtime/animations/idle_primary_to_paw_raise/frames
- 桥接入口：transition-in.idle_primary_to_paw_raise
- 中断策略：locked
- 结束返回：paw_raise
- 衔接策略：鼠标靠近或打招呼触发 paw_raise 前，先从 idle_primary 播放本过渡动作，再进入 paw_raise。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

### paw_raise_to_idle_primary

- 目标 action：paw_raise_to_idle_primary
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/paw_raise_to_idle_primary.mp4
- 审查证据：assets/reviews/kling-generated/paw_raise_to_idle_primary.png
- 运行帧输出：assets/runtime/animations/paw_raise_to_idle_primary/frames
- 桥接入口：transition-out.paw_raise_to_idle_primary
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：paw_raise 播放结束后先进入本过渡动作，再回到 idle_primary，替代旧的 paw_raise_to_idle。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

### idle_primary_to_cursor_watch

- 目标 action：idle_primary_to_cursor_watch
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/idle_primary_to_cursor_watch.mp4
- 审查证据：assets/reviews/kling-generated/idle_primary_to_cursor_watch.png
- 运行帧输出：assets/runtime/animations/idle_primary_to_cursor_watch/frames
- 桥接入口：transition-in.idle_primary_to_cursor_watch
- 中断策略：locked
- 结束返回：cursor_watch
- 衔接策略：鼠标靠近触发 cursor_watch 前，先从 idle_primary 播放本过渡动作，再进入关注鼠标动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

### cursor_watch_to_idle_primary

- 目标 action：cursor_watch_to_idle_primary
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/cursor_watch_to_idle_primary.mp4
- 审查证据：assets/reviews/kling-generated/cursor_watch_to_idle_primary.png
- 运行帧输出：assets/runtime/animations/cursor_watch_to_idle_primary/frames
- 桥接入口：transition-out.cursor_watch_to_idle_primary
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：cursor_watch 播放结束后先进入本过渡动作，再回到 idle_primary，避免观察动作尾段直接跳回待机。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

### idle_primary_to_click_surprised

- 目标 action：idle_primary_to_click_surprised
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/idle_primary_to_click_surprised.mp4
- 审查证据：assets/reviews/kling-generated/idle_primary_to_click_surprised.png
- 运行帧输出：assets/runtime/animations/idle_primary_to_click_surprised/frames
- 桥接入口：transition-in.idle_primary_to_click_surprised
- 中断策略：locked
- 结束返回：click_surprised
- 衔接策略：单次点击触发 click_surprised 前，先从 idle_primary 播放本过渡动作，再进入惊讶反应。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

### click_surprised_to_idle_primary

- 目标 action：click_surprised_to_idle_primary
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/click_surprised_to_idle_primary.mp4
- 审查证据：assets/reviews/kling-generated/click_surprised_to_idle_primary.png
- 运行帧输出：assets/runtime/animations/click_surprised_to_idle_primary/frames
- 桥接入口：transition-out.click_surprised_to_idle_primary
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：click_surprised 播放结束后先进入本过渡动作，再回到 idle_primary，避免惊讶尾段直接跳回待机。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

### idle_primary_to_poke_annoyed

- 目标 action：idle_primary_to_poke_annoyed
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/idle_primary_to_poke_annoyed.mp4
- 审查证据：assets/reviews/kling-generated/idle_primary_to_poke_annoyed.png
- 运行帧输出：assets/runtime/animations/idle_primary_to_poke_annoyed/frames
- 桥接入口：transition-in.idle_primary_to_poke_annoyed
- 中断策略：locked
- 结束返回：poke_annoyed
- 衔接策略：连续点击触发 poke_annoyed 前，先从 idle_primary 播放本过渡动作，再进入不满反应。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

### poke_annoyed_to_idle_primary

- 目标 action：poke_annoyed_to_idle_primary
- 分类：transition
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/poke_annoyed_to_idle_primary.mp4
- 审查证据：assets/reviews/kling-generated/poke_annoyed_to_idle_primary.png
- 运行帧输出：assets/runtime/animations/poke_annoyed_to_idle_primary/frames
- 桥接入口：transition-out.poke_annoyed_to_idle_primary
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：poke_annoyed 播放结束后先进入本过渡动作，再回到 idle_primary，替代旧的 poke_annoyed_to_idle。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。

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
