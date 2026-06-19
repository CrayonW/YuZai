# runtime 接入执行 dry-run：第五波：16 方向鼠标跟随

本报告不执行抽帧、不去水印、不修改 manifest、不写 runtime 目录。它只列出用户批准后将要执行的写入计划。

波次 ID：mouse-follow-16-direction
目的：把 16 个真实视频方向动作接入 runtime，让猫咪头部和眼睛能按鼠标相对方向跟随。
需要用户批准文件：docs/runtime-intake-approvals/mouse-follow-16-direction.approved.json

## 候选选择规则

- 默认策略：同一动作或同一波次存在多个视频候选时，默认选择数量更多、动作覆盖更完整的视频候选组。
- 改选条件：只有在确认清单里标明质量风险、水印/文字/logo/额外物体风险、动作变形风险，或用户明确要求时，才改选较少的视频集合。

## 汇总

- 动作数量：16
- manifest 新增：0
- manifest 更新：16
- 新建帧目录：0
- 覆盖帧目录：16
- 桥接已引用：0
- 桥接需人工设计：16

## 动作执行计划

### look_e

- sourceVideo=assets/origin/generated/kling/look_e.mp4
- runtimeFrameRoot=assets/runtime/animations/look_e/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.e
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于正右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_e.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_e.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_e/frames/frame_%06d.png

### look_ene

- sourceVideo=assets/origin/generated/kling/look_ene.mp4
- runtimeFrameRoot=assets/runtime/animations/look_ene/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.ene
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于右上偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_ene.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_ene.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_ene/frames/frame_%06d.png

### look_ne

- sourceVideo=assets/origin/generated/kling/look_ne.mp4
- runtimeFrameRoot=assets/runtime/animations/look_ne/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.ne
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于右上方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_ne.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_ne.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_ne/frames/frame_%06d.png

### look_nne

- sourceVideo=assets/origin/generated/kling/look_nne.mp4
- runtimeFrameRoot=assets/runtime/animations/look_nne/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.nne
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于上方偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_nne.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_nne.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_nne/frames/frame_%06d.png

### look_n

- sourceVideo=assets/origin/generated/kling/look_n.mp4
- runtimeFrameRoot=assets/runtime/animations/look_n/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.n
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于正上方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_n.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_n.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_n/frames/frame_%06d.png

### look_nnw

- sourceVideo=assets/origin/generated/kling/look_nnw.mp4
- runtimeFrameRoot=assets/runtime/animations/look_nnw/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.nnw
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于上方偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_nnw.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_nnw.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_nnw/frames/frame_%06d.png

### look_nw

- sourceVideo=assets/origin/generated/kling/look_nw.mp4
- runtimeFrameRoot=assets/runtime/animations/look_nw/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.nw
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于左上方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_nw.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_nw.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_nw/frames/frame_%06d.png

### look_wnw

- sourceVideo=assets/origin/generated/kling/look_wnw.mp4
- runtimeFrameRoot=assets/runtime/animations/look_wnw/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.wnw
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于左上偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_wnw.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_wnw.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_wnw/frames/frame_%06d.png

### look_w

- sourceVideo=assets/origin/generated/kling/look_w.mp4
- runtimeFrameRoot=assets/runtime/animations/look_w/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.w
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于正左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_w.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_w.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_w/frames/frame_%06d.png

### look_wsw

- sourceVideo=assets/origin/generated/kling/look_wsw.mp4
- runtimeFrameRoot=assets/runtime/animations/look_wsw/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.wsw
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于左下偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_wsw.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_wsw.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_wsw/frames/frame_%06d.png

### look_sw

- sourceVideo=assets/origin/generated/kling/look_sw.mp4
- runtimeFrameRoot=assets/runtime/animations/look_sw/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.sw
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于左下方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_sw.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_sw.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_sw/frames/frame_%06d.png

### look_ssw

- sourceVideo=assets/origin/generated/kling/look_ssw.mp4
- runtimeFrameRoot=assets/runtime/animations/look_ssw/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.ssw
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于下方偏左方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_ssw.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_ssw.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_ssw/frames/frame_%06d.png

### look_s

- sourceVideo=assets/origin/generated/kling/look_s.mp4
- runtimeFrameRoot=assets/runtime/animations/look_s/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.s
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于正下方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前重点检查猫咪没有趴下或裁切；同时确认无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_s.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_s.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_s/frames/frame_%06d.png

### look_sse

- sourceVideo=assets/origin/generated/kling/look_sse.mp4
- runtimeFrameRoot=assets/runtime/animations/look_sse/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.sse
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于下方偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_sse.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_sse.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_sse/frames/frame_%06d.png

### look_se

- sourceVideo=assets/origin/generated/kling/look_se.mp4
- runtimeFrameRoot=assets/runtime/animations/look_se/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.se
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于右下方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_se.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_se.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_se/frames/frame_%06d.png

### look_ese

- sourceVideo=assets/origin/generated/kling/look_ese.mp4
- runtimeFrameRoot=assets/runtime/animations/look_ese/frames
- manifest=update
- frames=replace
- loop=true
- bridge=manual
- bridgeKey=mouse-follow.direction.ese
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=鼠标位于右下偏右方向时切入长循环跟随动作；方向变化或离开范围后通过相似帧锚点回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、鼠标实体和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_ese.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_ese.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_ese/frames/frame_%06d.png

## 批准门禁

非 dry-run 执行必须同时满足：

1. 用户明确确认对应执行清单。
2. 存在且内容匹配的批准文件：docs/runtime-intake-approvals/mouse-follow-16-direction.approved.json
3. 逐视频人工播放检查已完成。
4. 本报告重新生成后仍无意外覆盖风险。

确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest、禁止覆盖 runtime 动作目录。

## 验证命令

```bash
npm run validate:runtime-intake-executor
npm run validate:runtime-intake-waves
npm run validate:release
```
