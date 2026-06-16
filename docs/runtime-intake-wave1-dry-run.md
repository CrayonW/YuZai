# runtime 接入执行 dry-run：第一波：低疲劳日常与关键交互

本报告不执行抽帧、不去水印、不修改 manifest、不写 runtime 目录。它只列出用户批准后将要执行的写入计划。

波次 ID：wave1
目的：先降低待机重复感，并让鼠标靠近、点击和提醒拥有更真实的小猫反馈。
需要用户批准文件：docs/runtime-intake-approvals/wave1.approved.json

## 汇总

- 动作数量：7
- manifest 新增：7
- manifest 更新：0
- 新建帧目录：7
- 覆盖帧目录：0
- 桥接已引用：7
- 桥接需人工设计：0

## 动作执行计划

### slow_blink

- sourceVideo=assets/origin/generated/kling/slow_blink.mp4
- runtimeFrameRoot=assets/runtime/animations/slow_blink/frames
- manifest=add
- frames=create
- bridge=already-referenced
- bridgeKey=daily-rotation.low-fatigue
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=从 idle_primary 或 idle_secondary 的安全帧切入，播放一轮后回到 idle_primary。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/slow_blink_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/slow_blink.mp4 -t 3 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/slow_blink/frames/frame_%06d.png

### look_around

- sourceVideo=assets/origin/generated/kling/look_around.mp4
- runtimeFrameRoot=assets/runtime/animations/look_around/frames
- manifest=add
- frames=create
- bridge=already-referenced
- bridgeKey=daily-rotation.low-fatigue
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=作为低频环境观察动作，从正坐待机安全帧切入，结束回到 idle_primary。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/look_around_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/look_around.mp4 -t 3 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/look_around/frames/frame_%06d.png

### cursor_watch

- sourceVideo=assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4
- runtimeFrameRoot=assets/runtime/animations/cursor_watch/frames
- manifest=add
- frames=create
- bridge=already-referenced
- bridgeKey=proximity.mouse_near
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=鼠标靠近时插入一轮关注动作；结束后回到当前日常基线，避免原 cursor_watch 的实体道具问题。
- watermarkGate=正式替换前逐视频播放检查 v3 全程无文字、水印、logo、光点和额外实体。
- reviewEvidence=assets/reviews/kling-generated/cursor_watch_clean_candidate_v3_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4 -t 3 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/cursor_watch/frames/frame_%06d.png

### click_surprised

- sourceVideo=assets/origin/generated/kling/click_surprised.mp4
- runtimeFrameRoot=assets/runtime/animations/click_surprised/frames
- manifest=add
- frames=create
- bridge=already-referenced
- bridgeKey=click.single
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=单次点击触发短反应，锁定播放结束后回到日常动作。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/click_surprised_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/click_surprised.mp4 -t 3 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/click_surprised/frames/frame_%06d.png

### poke_annoyed

- sourceVideo=assets/origin/generated/kling/poke_annoyed.mp4
- runtimeFrameRoot=assets/runtime/animations/poke_annoyed/frames
- manifest=add
- frames=create
- bridge=already-referenced
- bridgeKey=click.repeated
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=连续点击后触发情绪变化；抽帧时重点检查尾巴和身体边缘裁切。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和边缘裁切问题。
- reviewEvidence=assets/reviews/kling-generated/poke_annoyed_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/poke_annoyed.mp4 -t 3 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/poke_annoyed/frames/frame_%06d.png

### call_response

- sourceVideo=assets/origin/generated/kling/call_response.mp4
- runtimeFrameRoot=assets/runtime/animations/call_response/frames
- manifest=add
- frames=create
- bridge=already-referenced
- bridgeKey=reminder.water
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=气泡提醒或用户召唤时插入回应动作，结束后回到日常。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/call_response_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/call_response.mp4 -t 3 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/call_response/frames/frame_%06d.png

### stretch_yawn

- sourceVideo=assets/origin/generated/kling/stretch_yawn.mp4
- runtimeFrameRoot=assets/runtime/animations/stretch_yawn/frames
- manifest=add
- frames=create
- bridge=already-referenced
- bridgeKey=reminder.rest
- interruptPolicy=at-safe-frame
- returnTo=idle_primary
- transitionPlan=休息提醒或低频日常变化时播放；按打哈欠/抬前爪语义接入，不按完整伸懒腰预期。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。
- reviewEvidence=assets/reviews/kling-generated/stretch_yawn_sweep.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/stretch_yawn.mp4 -t 3 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/stretch_yawn/frames/frame_%06d.png

## 批准门禁

非 dry-run 执行必须同时满足：

1. 用户明确确认对应执行清单。
2. 存在批准文件：docs/runtime-intake-approvals/wave1.approved.json
3. 逐视频人工播放检查已完成。
4. 本报告重新生成后仍无意外覆盖风险。

确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest、禁止覆盖 runtime 动作目录。

## 验证命令

```bash
npm run validate:runtime-intake-executor
npm run validate:runtime-intake-waves
npm run validate:release
```
