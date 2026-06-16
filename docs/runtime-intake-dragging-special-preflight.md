# runtime 接入预检报告：拖拽专项

用途：本报告用于正式抽帧前检查来源视频、审查证据和接入门禁是否齐全。

硬性门禁：本报告不能直接批准 runtime 接入。即使全部通过，也必须先给用户确认对应执行清单，并逐视频人工播放检查无文字、水印、logo、额外物体和明显变形。

波次 ID：dragging-special
目的：拖拽动作必须和窗口移动事件、置顶窗口和鼠标手感一起验收，不能只按普通互动动作接入。
确认规则：每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

## 汇总

- 动作数量：1
- 可进入人工播放检查：1
- 需要处理：0
- 缺失：0
- 仍需用户确认：1

## 视频与门禁

| action | 分类 | 状态 | 确认状态 | 尺寸 | 时长 | 大小 | 桥接入口 | 来源视频 | 审查证据 |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- |
| dragging | interactive | ready_for_manual_review | needs-user-confirmation | 856x1072 | 5.042s | 7698504 | drag.active | assets/origin/generated/kling/dragging.mp4 | assets/reviews/kling-generated/dragging_sweep.png |

## 逐动作检查

### dragging

来源视频：assets/origin/generated/kling/dragging.mp4
审查证据：assets/reviews/kling-generated/dragging_sweep.png
运行帧输出：assets/runtime/animations/dragging/frames
桥接入口：drag.active
中断策略：locked
结束返回：idle_primary
衔接策略：当前动作幅度较小，正式接入前需和窗口拖拽移动、鼠标释放和回到日常动作一起桌面验收。
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
