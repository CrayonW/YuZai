# runtime 接入前用户确认清单：拖拽专项

波次 ID：dragging-special
目的：拖拽动作必须和窗口移动事件、置顶窗口和鼠标手感一起验收，不能只按普通互动动作接入。

## 确认规则

每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。

只允许在用户明确确认本清单后执行去水印/抠绿、序列帧抽取、runtime manifest 修改和桌面验收。

## 摘要

- 动作数量：1
- 推荐接入：0
- 暂缓候选：1
- 仍需用户确认：1

## 动作清单

### dragging

- 目标 action：dragging
- 分类：interactive
- 当前状态：deferred
- 确认状态：needs-user-confirmation
- 来源视频：assets/origin/generated/kling/dragging.mp4
- 候选选择规则：后续如果同一拖拽动作补充了多个视频，默认选择视频数量更多、覆盖更完整的候选组，再按质量和桌面手感验收剔除不合格素材。
- 审查证据：assets/reviews/kling-generated/dragging_sweep.png
- 运行帧输出：assets/runtime/animations/dragging/frames
- 桥接入口：drag.active
- 中断策略：locked
- 结束返回：idle_primary
- 衔接策略：当前动作幅度较小，正式接入前需和窗口拖拽移动、鼠标释放和回到日常动作一起桌面验收。
- 水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。

## 批准后允许执行

1. 逐个播放来源视频，确认无文字、水印、logo、额外物体和明显变形。
2. 对确认通过的视频执行去水印、抠绿、序列帧生成。
3. 更新 `assets/runtime/animations/manifest.json` 和对应行为桥接。
4. 执行桌面可视化验收：桌面可见、始终置顶、鼠标靠近/点击/提醒触发正确、姿势回切自然。
5. 执行拖拽专项自动验收：`YUZAI_TEST_DRAG_MS=700 YUZAI_TEST_DRAG_X=100 YUZAI_TEST_DRAG_Y=70 YUZAI_TEST_DRAG_HOLD_MS=1200 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-dragging.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`，再运行 `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-dragging.png --count 8 --min-changed-frames 4 --min-width 200 --min-height 200`。

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
