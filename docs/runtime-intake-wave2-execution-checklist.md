# runtime 接入前用户确认清单：第二波：日常生活和互动变化

波次 ID：wave2
目的：补充洗脸、嗅闻、轻呼吸和害羞等生活感动作，让桌宠更像真实小猫在电脑里生活。

## 确认规则

每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

只允许在用户明确确认本清单后执行去水印/抠绿、序列帧抽取、runtime manifest 修改和桌面验收。

## 摘要

- 动作数量：4
- 推荐接入：3
- 暂缓候选：1
- 仍需用户确认：4

## 动作清单

### groom_face_wash

- 目标 action：groom_face_wash
- 分类：daily
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/groom_face_wash.mp4
- 审查证据：assets/reviews/kling-generated/groom_face_wash_sweep.png
- 运行帧输出：assets/runtime/animations/groom_face_wash/frames
- 桥接入口：daily-rotation.life
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：从正坐待机安全帧切入，洗脸/舔爪结束后回到 idle_primary。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### loaf_breathing

- 目标 action：loaf_breathing
- 分类：daily
- 当前状态：deferred
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/loaf_breathing.mp4
- 审查证据：assets/reviews/kling-generated/loaf_breathing_sweep.png
- 运行帧输出：assets/runtime/animations/loaf_breathing/frames
- 桥接入口：daily-rotation.low-fatigue
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：当前素材更像正坐轻呼吸，先作为低疲劳循环候选；明确香箱趴需要重新生成素材。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### desk_sniff

- 目标 action：desk_sniff
- 分类：daily
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/desk_sniff.mp4
- 审查证据：assets/reviews/kling-generated/desk_sniff_sweep.png
- 运行帧输出：assets/runtime/animations/desk_sniff/frames
- 桥接入口：daily-rotation.explore
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：作为日常探索或鼠标靠近后的低强度探索动作，注意和 cursor_watch 区分触发语义。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

### shy

- 目标 action：shy
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/shy.mp4
- 审查证据：assets/reviews/kling-generated/shy_sweep.png
- 运行帧输出：assets/runtime/animations/shy/frames
- 桥接入口：interaction.gentle
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：用于长时间注视、停留或轻互动结束后的短反应，播放结束回到日常。
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
