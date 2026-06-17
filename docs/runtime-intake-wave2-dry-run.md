# runtime 接入执行 dry-run：第二波：日常生活和互动变化

本报告不执行抽帧、不去水印、不修改 manifest、不写 runtime 目录。它只列出用户批准后将要执行的写入计划。

波次 ID：wave2
目的：补充洗脸、嗅闻、轻呼吸和害羞等生活感动作，让桌宠更像真实小猫在电脑里生活。
需要用户批准文件：docs/runtime-intake-approvals/wave2.approved.json

## 汇总

- 动作数量：4
- manifest 新增：0
- manifest 更新：4
- 新建帧目录：0
- 覆盖帧目录：4
- 桥接已引用：4
- 桥接需人工设计：0

## 动作执行计划

### groom_face_wash

- sourceVideo=assets/origin/generated/kling/groom_face_wash.mp4
- runtimeFrameRoot=assets/runtime/animations/groom_face_wash/frames
- manifest=update
- frames=replace
- loop=false
- bridge=already-referenced
- bridgeKey=daily-rotation.life
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=从正坐待机安全帧切入，洗脸/舔爪结束后回到 idle_primary。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/groom_face_wash_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/groom_face_wash.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/groom_face_wash/frames/frame_%06d.png

### loaf_breathing

- sourceVideo=assets/origin/generated/kling/loaf_breathing.mp4
- runtimeFrameRoot=assets/runtime/animations/loaf_breathing/frames
- manifest=update
- frames=replace
- loop=true
- bridge=already-referenced
- bridgeKey=daily-rotation.low-fatigue
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=当前素材更像正坐轻呼吸，先作为低疲劳循环候选；明确香箱趴需要重新生成素材。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/loaf_breathing_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/loaf_breathing.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/loaf_breathing/frames/frame_%06d.png

### desk_sniff

- sourceVideo=assets/origin/generated/kling/desk_sniff.mp4
- runtimeFrameRoot=assets/runtime/animations/desk_sniff/frames
- manifest=update
- frames=replace
- loop=false
- bridge=already-referenced
- bridgeKey=daily-rotation.explore
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=作为日常探索或鼠标靠近后的低强度探索动作，注意和 cursor_watch 区分触发语义。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/desk_sniff_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/desk_sniff.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/desk_sniff/frames/frame_%06d.png

### shy

- sourceVideo=assets/origin/generated/kling/shy.mp4
- runtimeFrameRoot=assets/runtime/animations/shy/frames
- manifest=update
- frames=replace
- loop=false
- bridge=already-referenced
- bridgeKey=interaction.gentle
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=用于长时间注视、停留或轻互动结束后的短反应，播放结束回到日常。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/shy_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/shy.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/shy/frames/frame_%06d.png

## 批准门禁

非 dry-run 执行必须同时满足：

1. 用户明确确认对应执行清单。
2. 存在且内容匹配的批准文件：docs/runtime-intake-approvals/wave2.approved.json
3. 逐视频人工播放检查已完成。
4. 本报告重新生成后仍无意外覆盖风险。

确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest、禁止覆盖 runtime 动作目录。

## 验证命令

```bash
npm run validate:runtime-intake-executor
npm run validate:runtime-intake-waves
npm run validate:release
```
