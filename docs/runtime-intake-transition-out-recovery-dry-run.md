# runtime 接入执行 dry-run：第六波：高风险回切过渡

本报告不执行抽帧、不去水印、不修改 manifest、不写 runtime 目录。它只列出用户批准后将要执行的写入计划。

波次 ID：transition-out-recovery
目的：补齐动作衔接风险报告中 tail-not-recovered 的 4 个高风险回切过渡，降低动作结束回到日常或睡眠循环时的跳变。
需要用户批准文件：docs/runtime-intake-approvals/transition-out-recovery.approved.json

## 候选选择规则

- 默认策略：同一动作或同一波次存在多个视频候选时，默认选择数量更多、动作覆盖更完整的视频候选组。
- 改选条件：只有在确认清单里标明质量风险、水印/文字/logo/额外物体风险、动作变形风险，或用户明确要求时，才改选较少的视频集合。

## 汇总

- 动作数量：4
- manifest 新增：0
- manifest 更新：4
- 新建帧目录：0
- 覆盖帧目录：4
- 桥接已引用：0
- 桥接需人工设计：4

## 动作执行计划

### sleep_to_sleeping

- sourceVideo=assets/origin/generated/kling/sleep_to_sleeping.mp4
- runtimeFrameRoot=assets/runtime/animations/sleep_to_sleeping/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-out.sleep_to_sleeping
- interruptPolicy=locked
- returnTo=sleeping
- transitionPlan=sleep 播放结束后先进入本过渡动作，再回到 sleeping 循环，避免直接从入睡尾帧跳回睡眠首帧。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/sleep_to_sleeping.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/sleep_to_sleeping.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/sleep_to_sleeping/frames/frame_%06d.png

### waking_to_idle

- sourceVideo=assets/origin/generated/kling/waking_to_idle.mp4
- runtimeFrameRoot=assets/runtime/animations/waking_to_idle/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-out.waking_to_idle
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=waking 播放结束后先进入本过渡动作，再回到 idle_primary，降低醒来尾段回待机的姿态跳变。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/waking_to_idle.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/waking_to_idle.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/waking_to_idle/frames/frame_%06d.png

### poke_annoyed_to_idle

- sourceVideo=assets/origin/generated/kling/poke_annoyed_to_idle.mp4
- runtimeFrameRoot=assets/runtime/animations/poke_annoyed_to_idle/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-out.poke_annoyed_to_idle
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=poke_annoyed 播放结束后先进入本过渡动作，再回到 idle_primary，降低被戳反应尾段回待机的姿态跳变。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/poke_annoyed_to_idle.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/poke_annoyed_to_idle.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/poke_annoyed_to_idle/frames/frame_%06d.png

### paw_raise_to_idle

- sourceVideo=assets/origin/generated/kling/paw_raise_to_idle.mp4
- runtimeFrameRoot=assets/runtime/animations/paw_raise_to_idle/frames
- manifest=update
- frames=replace
- loop=false
- bridge=manual
- bridgeKey=transition-out.paw_raise_to_idle
- interruptPolicy=locked
- returnTo=idle_primary
- transitionPlan=paw_raise 播放结束后先进入本过渡动作，再回到 idle_primary，降低抬爪尾段回待机的姿态跳变。
- watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo、额外物体和身体裁切；当前总览图未见明显水印。
- reviewEvidence=assets/reviews/kling-generated/paw_raise_to_idle.png
- frameCommand=ffmpeg -i assets/origin/generated/kling/paw_raise_to_idle.mp4 -t 5 -vf fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba assets/runtime/animations/paw_raise_to_idle/frames/frame_%06d.png

## 批准门禁

非 dry-run 执行必须同时满足：

1. 用户明确确认对应执行清单。
2. 存在且内容匹配的批准文件：docs/runtime-intake-approvals/transition-out-recovery.approved.json
3. 逐视频人工播放检查已完成。
4. 本报告重新生成后仍无意外覆盖风险。

确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest、禁止覆盖 runtime 动作目录。

## 验证命令

```bash
npm run validate:runtime-intake-executor
npm run validate:runtime-intake-waves
npm run validate:release
```
