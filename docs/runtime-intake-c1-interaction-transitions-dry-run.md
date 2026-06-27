# runtime 接入执行 dry-run：第七波：C1 互动动作专用过渡

本报告不执行抽帧、不去水印、不修改 manifest、不写 runtime 目录。它只列出用户批准后将要执行的写入计划。

波次 ID：c1-interaction-transitions
目的：把待机进入关键互动、关键互动回到待机的 8 个真实过渡视频接入 runtime，让鼠标靠近、点击、连续点击和抬爪动作不再硬切。
需要用户批准文件：docs/runtime-intake-approvals/c1-interaction-transitions.approved.json

## 候选选择规则

- 默认策略：同一动作或同一波次存在多个视频候选时，默认选择数量更多、动作覆盖更完整的视频候选组。
- 改选条件：只有在确认清单里标明质量风险、水印/文字/logo/额外物体风险、动作变形风险，或用户明确要求时，才改选较少的视频集合。

## 汇总

- 动作数量：8
- manifest 新增：0
- manifest 更新：8
- 新建帧目录：0
- 覆盖帧目录：8
- 桥接已引用：0
- 桥接需人工设计：8

## 动作执行计划

### idle_primary_to_paw_raise

- sourceVideo=assets/origin/generated/kling/idle_primary_to_paw_raise.mp4
- runtimeFrameRoot=assets/runtime/animations/idle_primary_to_paw_raise/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-in.idle_primary_to_paw_raise
- interruptPolicy=locked
- returnTo=paw_raise
- transitionPlan=鼠标靠近或打招呼触发 paw_raise 前，先从 idle_primary 播放本过渡动作，再进入 paw_raise。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/idle_primary_to_paw_raise.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/idle_primary_to_paw_raise.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/idle_primary_to_paw_raise/frames/frame_%06d.png

### paw_raise_to_idle_primary

- sourceVideo=assets/origin/generated/kling/paw_raise_to_idle_primary.mp4
- runtimeFrameRoot=assets/runtime/animations/paw_raise_to_idle_primary/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-out.paw_raise_to_idle_primary
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=paw_raise 播放结束后先进入本过渡动作，再回到 idle_primary，替代旧的 paw_raise_to_idle。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/paw_raise_to_idle_primary.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/paw_raise_to_idle_primary.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/paw_raise_to_idle_primary/frames/frame_%06d.png

### idle_primary_to_cursor_watch

- sourceVideo=assets/origin/generated/kling/idle_primary_to_cursor_watch.mp4
- runtimeFrameRoot=assets/runtime/animations/idle_primary_to_cursor_watch/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-in.idle_primary_to_cursor_watch
- interruptPolicy=locked
- returnTo=cursor_watch
- transitionPlan=鼠标靠近触发 cursor_watch 前，先从 idle_primary 播放本过渡动作，再进入关注鼠标动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/idle_primary_to_cursor_watch.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/idle_primary_to_cursor_watch.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/idle_primary_to_cursor_watch/frames/frame_%06d.png

### cursor_watch_to_idle_primary

- sourceVideo=assets/origin/generated/kling/cursor_watch_to_idle_primary.mp4
- runtimeFrameRoot=assets/runtime/animations/cursor_watch_to_idle_primary/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-out.cursor_watch_to_idle_primary
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=cursor_watch 播放结束后先进入本过渡动作，再回到 idle_primary，避免观察动作尾段直接跳回待机。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/cursor_watch_to_idle_primary.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/cursor_watch_to_idle_primary.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/cursor_watch_to_idle_primary/frames/frame_%06d.png

### idle_primary_to_click_surprised

- sourceVideo=assets/origin/generated/kling/idle_primary_to_click_surprised.mp4
- runtimeFrameRoot=assets/runtime/animations/idle_primary_to_click_surprised/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-in.idle_primary_to_click_surprised
- interruptPolicy=locked
- returnTo=click_surprised
- transitionPlan=单次点击触发 click_surprised 前，先从 idle_primary 播放本过渡动作，再进入惊讶反应。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/idle_primary_to_click_surprised.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/idle_primary_to_click_surprised.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/idle_primary_to_click_surprised/frames/frame_%06d.png

### click_surprised_to_idle_primary

- sourceVideo=assets/origin/generated/kling/click_surprised_to_idle_primary.mp4
- runtimeFrameRoot=assets/runtime/animations/click_surprised_to_idle_primary/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-out.click_surprised_to_idle_primary
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=click_surprised 播放结束后先进入本过渡动作，再回到 idle_primary，避免惊讶尾段直接跳回待机。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/click_surprised_to_idle_primary.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/click_surprised_to_idle_primary.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/click_surprised_to_idle_primary/frames/frame_%06d.png

### idle_primary_to_poke_annoyed

- sourceVideo=assets/origin/generated/kling/idle_primary_to_poke_annoyed.mp4
- runtimeFrameRoot=assets/runtime/animations/idle_primary_to_poke_annoyed/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-in.idle_primary_to_poke_annoyed
- interruptPolicy=locked
- returnTo=poke_annoyed
- transitionPlan=连续点击触发 poke_annoyed 前，先从 idle_primary 播放本过渡动作，再进入不满反应。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/idle_primary_to_poke_annoyed.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/idle_primary_to_poke_annoyed.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/idle_primary_to_poke_annoyed/frames/frame_%06d.png

### poke_annoyed_to_idle_primary

- sourceVideo=assets/origin/generated/kling/poke_annoyed_to_idle_primary.mp4
- runtimeFrameRoot=assets/runtime/animations/poke_annoyed_to_idle_primary/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-out.poke_annoyed_to_idle_primary
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=poke_annoyed 播放结束后先进入本过渡动作，再回到 idle_primary，替代旧的 poke_annoyed_to_idle。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前抽样图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/poke_annoyed_to_idle_primary.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/poke_annoyed_to_idle_primary.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/poke_annoyed_to_idle_primary/frames/frame_%06d.png

## 批准门禁

非 dry-run 执行必须同时满足：

1. 用户明确确认对应执行清单。
2. 存在且内容匹配的批准文件：docs/runtime-intake-approvals/c1-interaction-transitions.approved.json
3. 逐视频人工播放检查已完成。
4. 本报告重新生成后仍无意外覆盖风险。

确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest、禁止覆盖 runtime 动作目录。

## 验证命令

```bash
npm run validate:runtime-intake-executor
npm run validate:runtime-intake-waves
npm run validate:release
```
