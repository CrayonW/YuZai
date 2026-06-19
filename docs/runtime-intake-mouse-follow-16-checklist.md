# runtime 接入前用户确认清单：第五波：16 方向鼠标跟随

波次 ID：mouse-follow-16-direction
目的：把 16 个真实视频方向动作接入 runtime，让猫咪头部和眼睛能按鼠标相对方向跟随。

## 确认规则

每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

只允许在用户明确确认本清单后执行去水印/抠绿、序列帧抽取、runtime manifest 修改和桌面验收。

## 摘要

- 动作数量：16
- 推荐接入：16
- 暂缓候选：0
- 仍需用户确认：16

## 动作清单

### look_e

- 目标 action：look_e
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_e.mp4
- 审查证据：assets/reviews/kling-generated/look_e.png
- 运行帧输出：assets/runtime/animations/look_e/frames
- 桥接入口：mouse-follow.direction.e
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于正右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_ene

- 目标 action：look_ene
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_ene.mp4
- 审查证据：assets/reviews/kling-generated/look_ene.png
- 运行帧输出：assets/runtime/animations/look_ene/frames
- 桥接入口：mouse-follow.direction.ene
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于右上偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_ne

- 目标 action：look_ne
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_ne.mp4
- 审查证据：assets/reviews/kling-generated/look_ne.png
- 运行帧输出：assets/runtime/animations/look_ne/frames
- 桥接入口：mouse-follow.direction.ne
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于右上方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_nne

- 目标 action：look_nne
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_nne.mp4
- 审查证据：assets/reviews/kling-generated/look_nne.png
- 运行帧输出：assets/runtime/animations/look_nne/frames
- 桥接入口：mouse-follow.direction.nne
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于上方偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_n

- 目标 action：look_n
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_n.mp4
- 审查证据：assets/reviews/kling-generated/look_n.png
- 运行帧输出：assets/runtime/animations/look_n/frames
- 桥接入口：mouse-follow.direction.n
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于正上方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_nnw

- 目标 action：look_nnw
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_nnw.mp4
- 审查证据：assets/reviews/kling-generated/look_nnw.png
- 运行帧输出：assets/runtime/animations/look_nnw/frames
- 桥接入口：mouse-follow.direction.nnw
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于上方偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_nw

- 目标 action：look_nw
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_nw.mp4
- 审查证据：assets/reviews/kling-generated/look_nw.png
- 运行帧输出：assets/runtime/animations/look_nw/frames
- 桥接入口：mouse-follow.direction.nw
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于左上方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_wnw

- 目标 action：look_wnw
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_wnw.mp4
- 审查证据：assets/reviews/kling-generated/look_wnw.png
- 运行帧输出：assets/runtime/animations/look_wnw/frames
- 桥接入口：mouse-follow.direction.wnw
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于左上偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_w

- 目标 action：look_w
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_w.mp4
- 审查证据：assets/reviews/kling-generated/look_w.png
- 运行帧输出：assets/runtime/animations/look_w/frames
- 桥接入口：mouse-follow.direction.w
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于正左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_wsw

- 目标 action：look_wsw
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_wsw.mp4
- 审查证据：assets/reviews/kling-generated/look_wsw.png
- 运行帧输出：assets/runtime/animations/look_wsw/frames
- 桥接入口：mouse-follow.direction.wsw
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于左下偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_sw

- 目标 action：look_sw
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_sw.mp4
- 审查证据：assets/reviews/kling-generated/look_sw.png
- 运行帧输出：assets/runtime/animations/look_sw/frames
- 桥接入口：mouse-follow.direction.sw
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于左下方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_ssw

- 目标 action：look_ssw
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_ssw.mp4
- 审查证据：assets/reviews/kling-generated/look_ssw.png
- 运行帧输出：assets/runtime/animations/look_ssw/frames
- 桥接入口：mouse-follow.direction.ssw
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于下方偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_s

- 目标 action：look_s
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_s.mp4
- 审查证据：assets/reviews/kling-generated/look_s.png
- 运行帧输出：assets/runtime/animations/look_s/frames
- 桥接入口：mouse-follow.direction.s
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于正下方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前重点检查猫咪没有趴下或裁切；同时确认无文字、水印、logo、鼠标实体和额外物体。

### look_sse

- 目标 action：look_sse
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_sse.mp4
- 审查证据：assets/reviews/kling-generated/look_sse.png
- 运行帧输出：assets/runtime/animations/look_sse/frames
- 桥接入口：mouse-follow.direction.sse
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于下方偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_se

- 目标 action：look_se
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_se.mp4
- 审查证据：assets/reviews/kling-generated/look_se.png
- 运行帧输出：assets/runtime/animations/look_se/frames
- 桥接入口：mouse-follow.direction.se
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于右下方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

### look_ese

- 目标 action：look_ese
- 分类：interactive
- 当前状态：recommended
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/look_ese.mp4
- 审查证据：assets/reviews/kling-generated/look_ese.png
- 运行帧输出：assets/runtime/animations/look_ese/frames
- 桥接入口：mouse-follow.direction.ese
- 中断策略：at-safe-frame
- 结束返回：idle_primary
- 衔接策略：鼠标位于右下偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。

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
