## 可灵批次素材接入前确认清单

执行原则：生成视频后、抽帧或覆盖 manifest 前，必须先给用户确认这份清单；确认后才允许处理帧、去水印、覆盖 runtime 路径或修改 manifest。

批次：remaining-state-and-variety
批次名称：第三批：剩余状态与生活化变化
优先原因：补齐剩余 fallback 状态，并增加好奇、伸懒腰、拖拽等变化。

### 本批次动作

- 源视频：assets/origin/generated/kling/desk_sniff.mp4
  - 目标 action：desk_sniff
  - 分类：daily
  - 循环：否
  - 时长：6s
  - 生成命令：npm run kling:generate -- --action desk_sniff
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/desk_sniff/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/stretch_yawn.mp4
  - 目标 action：stretch_yawn
  - 分类：daily
  - 循环：否
  - 时长：6s
  - 生成命令：npm run kling:generate -- --action stretch_yawn
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/stretch_yawn/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/poke_annoyed.mp4
  - 目标 action：poke_annoyed
  - 分类：interactive
  - 循环：否
  - 时长：4s
  - 生成命令：npm run kling:generate -- --action poke_annoyed
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/poke_annoyed/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/shy.mp4
  - 目标 action：shy
  - 分类：interactive
  - 循环：否
  - 时长：4s
  - 生成命令：npm run kling:generate -- --action shy
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/shy/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/dragging.mp4
  - 目标 action：dragging
  - 分类：interactive
  - 循环：是
  - 时长：4s
  - 生成命令：npm run kling:generate -- --action dragging
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/dragging/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/call_response.mp4
  - 目标 action：call_response
  - 分类：interactive
  - 循环：否
  - 时长：4s
  - 生成命令：npm run kling:generate -- --action call_response
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/call_response/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射

### 必跑验证命令

- `npm run kling:batch-status -- --batch remaining-state-and-variety`
- `npm run animations:audit-origin`
- `npm run animations:build-from-origin`
- `npm run validate:runtime-animations`
- `npm run validate:manifest-contract:current`
- `npm run animations:asset-contract -- --write docs/animation-asset-contract.md`
- `npm run validate:release`

### 桌面验收方式

- `YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png YUZAI_CAPTURE_SEQUENCE_COUNT=6 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`
- `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-animation.png --count 6 --min-changed-frames 2 --min-width 200 --min-height 200`
