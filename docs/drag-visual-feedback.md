# 拖拽手感参数说明

日期：2026-06-18

## 目标

当前 `dragging` 动作来自已有序列帧，但源视频动作幅度偏小。为了让桌面拖拽有明显互动感，运行时会在播放拖拽序列帧的同时叠加一层视觉反馈：上提、跟手偏移、轻微放大和方向倾斜。

## 配置位置

默认参数位于 `src/core/config/load-config.ts` 的 `DEFAULT_CONFIG.interaction.dragVisualFeedback`。

实际桌面渲染入口位于 `src/renderer/main.ts`，会把这组参数传给 `CanvasRenderer`。

## 参数含义

| 参数 | 含义 | 当前值 |
| --- | --- | --- |
| `neutralDistancePx` | 鼠标小幅抖动忽略距离，低于该距离不做视觉反馈 | `8` |
| `fullStrengthDistancePx` | 达到完整反馈强度所需的拖拽距离 | `96` |
| `horizontalFollowRatio` | 横向跟手比例 | `0.2` |
| `verticalFollowRatio` | 纵向跟手比例 | `0.08` |
| `maxTranslateX` | 最大横向偏移像素 | `28` |
| `minTranslateY` | 最大向上/负向纵向偏移限制 | `-10` |
| `maxTranslateY` | 最大向下/正向纵向偏移限制 | `16` |
| `minLiftPx` | 一旦进入拖拽后的最小上提像素 | `14` |
| `maxLiftPx` | 拖拽强度满时的最大上提像素 | `24` |
| `rotationDistancePx` | 计算倾斜角度的横向距离基准；越小越容易倾斜 | `520` |
| `maxRotationRadians` | 最大倾斜弧度 | `0.18` |
| `maxScaleBoost` | 最大额外放大比例 | `0.055` |

## 调参建议

- 觉得拖拽仍不明显：优先提高 `minLiftPx`、`maxLiftPx`、`maxScaleBoost`，或降低 `rotationDistancePx`。
- 觉得猫咪晃得太夸张：降低 `maxRotationRadians`、`maxScaleBoost`，或提高 `rotationDistancePx`。
- 觉得不够跟手：提高 `horizontalFollowRatio`，谨慎提高 `verticalFollowRatio`。
- 觉得轻微移动也在抖：提高 `neutralDistancePx`。

## 验证命令

```bash
npm run validate:drag-visual-feedback
npm run validate:all
```

桌面截图验收可以复用：

```bash
YUZAI_TEST_DRAG_MS=700 YUZAI_TEST_DRAG_X=100 YUZAI_TEST_DRAG_Y=70 YUZAI_TEST_DRAG_HOLD_MS=1200 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-dragging-tuned.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=900 npm run dev
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-dragging-tuned.png --count 8 --min-changed-frames 4 --min-width 200 --min-height 200
```

## 后续原则

如果后续生成更夸张的拖拽视频，应先走素材清单和 runtime intake 流程。运行时参数仍保留，用于现场微调手感，不替代原始动作质量。
