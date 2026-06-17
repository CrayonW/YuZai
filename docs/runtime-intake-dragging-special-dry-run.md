# runtime 接入执行 dry-run：拖拽专项

本报告不执行抽帧、不去水印、不修改 manifest、不写 runtime 目录。它只列出用户批准后将要执行的写入计划。

波次 ID：dragging-special
目的：拖拽动作必须和窗口移动事件、置顶窗口和鼠标手感一起验收，不能只按普通互动动作接入。
需要用户批准文件：docs/runtime-intake-approvals/dragging-special.approved.json

## 候选选择规则

- 默认策略：同一动作或同一波次存在多个视频候选时，默认选择数量更多、动作覆盖更完整的视频候选组。
- 改选条件：只有在确认清单里标明质量风险、水印/文字/logo/额外物体风险、动作变形风险，或用户明确要求时，才改选较少的视频集合。

## 汇总

- 动作数量：1
- manifest 新增：1
- manifest 更新：0
- 新建帧目录：1
- 覆盖帧目录：0
- 桥接已引用：1
- 桥接需人工设计：0

## 动作执行计划

### dragging

- sourceVideo=assets/origin/generated/kling/dragging.mp4
- runtimeFrameRoot=assets/runtime/animations/dragging/frames
- manifest=add
- frames=create
- loop=false
- bridge=already-referenced
- bridgeKey=drag.active
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=当前动作幅度较小，正式接入前需和窗口拖拽移动、鼠标释放和回到日常动作一起桌面验收。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/dragging_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/dragging.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/dragging/frames/frame_%06d.png

## 批准门禁

非 dry-run 执行必须同时满足：

1. 用户明确确认对应执行清单。
2. 存在且内容匹配的批准文件：docs/runtime-intake-approvals/dragging-special.approved.json
3. 逐视频人工播放检查已完成。
4. 本报告重新生成后仍无意外覆盖风险。

确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest、禁止覆盖 runtime 动作目录。

## 验证命令

```bash
npm run validate:runtime-intake-executor
npm run validate:runtime-intake-waves
npm run validate:interaction-controller
YUZAI_TEST_DRAG_MS=700 YUZAI_TEST_DRAG_X=100 YUZAI_TEST_DRAG_Y=70 YUZAI_TEST_DRAG_HOLD_MS=1200 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-dragging.png YUZAI_CAPTURE_SEQUENCE_COUNT=8 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 YUZAI_CAPTURE_DELAY_MS=900 npm run dev
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-dragging.png --count 8 --min-changed-frames 4 --min-width 200 --min-height 200
npm run validate:release
```
