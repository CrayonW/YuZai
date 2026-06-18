# 动作衔接优化记录

日期：2026-06-18

## 问题

桌宠动作切换时体感偏硬。根因不是序列帧播放 FPS 不够，而是不同 action 之间切换时，Canvas 直接从上一动作当前帧跳到下一动作当前帧。即使 `AnimationDirector` 已经等待安全帧，画面仍会出现明显跳切。

## 本次方案

在 Canvas 渲染层增加短时跨 action 淡入淡出：

- 检测到 `selection.action` 变化时，保留上一动作最后一帧。
- 在 `180ms` 内让上一帧从 `1 -> 0` 淡出。
- 同时让当前动作从 `0.25 -> 1` 淡入。
- 原有序列帧内部相邻帧混合仍保留。

这样不会改变素材、manifest 或动作调度，只是在最终绘制时给动作切换增加一个视觉缓冲。

## 验证

```bash
npm run validate:canvas-transition-smoothing
npm run validate:drag-visual-feedback
npm run typecheck
YUZAI_PREVIEW_ACTION=click_surprised YUZAI_PREVIEW_ACTION_MS=500 YUZAI_CAPTURE_DELAY_MS=420 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-crossfade.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=80 npm run dev
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-crossfade.png --count 8 --min-changed-frames 5 --min-width 200 --min-height 200
```

桌面连续截图已保存到：

`assets/reviews/runtime/action-transition-smoothing/`

本次截图检查结果：8 张均为 440x440 PNG，`changedFrames=7`。

## 后续

这次优化解决的是“切换瞬间硬切”的问题。如果某个动作本身首尾姿态差异太大，仍需要重新生成更贴近待机姿势的原始视频，或者补专门的 `transitionIn` / `transitionOut` 过渡动作。
