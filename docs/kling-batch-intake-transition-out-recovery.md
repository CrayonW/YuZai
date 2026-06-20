## 可灵批次素材接入前确认清单

执行原则：生成视频后、抽帧或覆盖 manifest 前，必须先给用户确认这份清单；确认后才允许处理帧、去水印、覆盖 runtime 路径或修改 manifest。

批次：transition-out-recovery
批次名称：第四批：高风险回切过渡
优先原因：补齐动作衔接风险报告中 tail-not-recovered 的回切过渡，降低尾段回到日常或睡眠循环时的跳变。

### 本批次动作

- 源视频：assets/origin/generated/kling/sleep_to_sleeping.mp4
  - 目标 action：sleep_to_sleeping
  - 分类：transition
  - 循环：否
  - 时长：2s
  - 生成命令：npm run kling:generate -- --action sleep_to_sleeping
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/sleep_to_sleeping/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/waking_to_idle.mp4
  - 目标 action：waking_to_idle
  - 分类：transition
  - 循环：否
  - 时长：2s
  - 生成命令：npm run kling:generate -- --action waking_to_idle
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/waking_to_idle/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/poke_annoyed_to_idle.mp4
  - 目标 action：poke_annoyed_to_idle
  - 分类：transition
  - 循环：否
  - 时长：2s
  - 生成命令：npm run kling:generate -- --action poke_annoyed_to_idle
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/poke_annoyed_to_idle/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/paw_raise_to_idle.mp4
  - 目标 action：paw_raise_to_idle
  - 分类：transition
  - 循环：否
  - 时长：2s
  - 生成命令：npm run kling:generate -- --action paw_raise_to_idle
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/paw_raise_to_idle/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射

### 必跑验证命令

- `npm run kling:batch-status -- --batch transition-out-recovery`
- `npm run animations:audit-origin`
- `npm run animations:build-from-origin`
- `npm run validate:runtime-animations`
- `npm run validate:manifest-contract:current`
- `npm run animations:asset-contract -- --write docs/animation-asset-contract.md`
- `npm run validate:release`

### 桌面验收方式

- `YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png YUZAI_CAPTURE_SEQUENCE_COUNT=6 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`
- `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-animation.png --count 6 --min-changed-frames 2 --min-width 200 --min-height 200`
