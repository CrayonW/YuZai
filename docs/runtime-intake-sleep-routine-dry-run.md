# runtime 接入执行 dry-run：第三波：睡眠作息链路

本报告不执行抽帧、不去水印、不修改 manifest、不写 runtime 目录。它只列出用户批准后将要执行的写入计划。

波次 ID：sleep-routine
目的：把变困、入睡、睡眠循环和醒来设计成成组状态，避免睡眠相关动作硬切。
需要用户批准文件：docs/runtime-intake-approvals/sleep-routine.approved.json

## 汇总

- 动作数量：4
- manifest 新增：0
- manifest 更新：4
- 新建帧目录：0
- 覆盖帧目录：4
- 桥接已引用：4
- 桥接需人工设计：0

## 动作执行计划

### sleepy

- sourceVideo=assets/origin/generated/kling/sleepy.mp4
- runtimeFrameRoot=assets/runtime/animations/sleepy/frames
- manifest=update
- frames=replace
- loop=false
- bridge=already-referenced
- bridgeKey=sleep.entering
- interruptPolicy=locked
- returnTo=sleep
- transitionPlan=作为变困入口，播放结束后进入 sleep 入睡过渡。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/sleepy_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/sleepy.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/sleepy/frames/frame_%06d.png

### sleep

- sourceVideo=assets/origin/generated/kling/sleep.mp4
- runtimeFrameRoot=assets/runtime/animations/sleep/frames
- manifest=update
- frames=replace
- loop=false
- bridge=already-referenced
- bridgeKey=sleep.transition
- interruptPolicy=locked
- returnTo=sleeping
- transitionPlan=从正坐进入蜷伏睡姿，锁定播放结束后进入 sleeping 或后续更明确睡眠循环。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/sleep_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/sleep.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/sleep/frames/frame_%06d.png

### sleeping

- sourceVideo=assets/origin/generated/kling/sleeping.mp4
- runtimeFrameRoot=assets/runtime/animations/sleeping/frames
- manifest=update
- frames=replace
- loop=true
- bridge=already-referenced
- bridgeKey=sleep.loop
- interruptPolicy=at-safe-frame
- returnTo=waking
- transitionPlan=当前素材更像正坐轻闭眼；可短期作为低能量循环，真实睡眠循环建议重新生成更明确蜷伏睡姿。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/sleeping_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/sleeping.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/sleeping/frames/frame_%06d.png

### waking

- sourceVideo=assets/origin/generated/kling/waking.mp4
- runtimeFrameRoot=assets/runtime/animations/waking/frames
- manifest=update
- frames=replace
- loop=false
- bridge=already-referenced
- bridgeKey=sleep.exit
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=作为睡眠结束后回到正坐日常的过渡，播放结束后回到 idle_primary。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/waking_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/waking.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/waking/frames/frame_%06d.png

## 批准门禁

非 dry-run 执行必须同时满足：

1. 用户明确确认对应执行清单。
2. 存在批准文件：docs/runtime-intake-approvals/sleep-routine.approved.json
3. 逐视频人工播放检查已完成。
4. 本报告重新生成后仍无意外覆盖风险。

确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest、禁止覆盖 runtime 动作目录。

## 验证命令

```bash
npm run validate:runtime-intake-executor
npm run validate:runtime-intake-waves
npm run validate:release
```
