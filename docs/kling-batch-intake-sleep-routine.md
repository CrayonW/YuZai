## 可灵批次素材接入前确认清单

执行原则：生成视频后、抽帧或覆盖 manifest 前，必须先给用户确认这份清单；确认后才允许处理帧、去水印、覆盖 runtime 路径或修改 manifest。

批次：sleep-routine
批次名称：第二批：睡眠作息链路
优先原因：补齐变困、入睡、睡着、唤醒，让桌宠有更真实的日常作息。

### 本批次动作

- 源视频：assets/origin/generated/kling/sleepy.mp4
  - 目标 action：sleepy
  - 分类：daily
  - 循环：否
  - 时长：6s
  - 生成命令：npm run kling:generate -- --action sleepy
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/sleepy/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/sleep.mp4
  - 目标 action：sleep
  - 分类：daily
  - 循环：否
  - 时长：6s
  - 生成命令：npm run kling:generate -- --action sleep
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/sleep/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/sleeping.mp4
  - 目标 action：sleeping
  - 分类：daily
  - 循环：是
  - 时长：8s
  - 生成命令：npm run kling:generate -- --action sleeping
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/sleeping/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/waking.mp4
  - 目标 action：waking
  - 分类：interactive
  - 循环：否
  - 时长：4s
  - 生成命令：npm run kling:generate -- --action waking
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/waking/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射

### 必跑验证命令

- `npm run kling:batch-status -- --batch sleep-routine`
- `npm run animations:audit-origin`
- `npm run animations:build-from-origin`
- `npm run validate:runtime-animations`
- `npm run validate:manifest-contract:current`
- `npm run animations:asset-contract -- --write docs/animation-asset-contract.md`
- `npm run validate:release`

### 桌面验收方式

- `YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png YUZAI_CAPTURE_SEQUENCE_COUNT=6 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`
- `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-animation.png --count 6 --min-changed-frames 2 --min-width 200 --min-height 200`
