## 可灵批次素材接入前确认清单

执行原则：生成视频后、抽帧或覆盖 manifest 前，必须先给用户确认这份清单；确认后才允许处理帧、去水印、覆盖 runtime 路径或修改 manifest。

批次：c1-interaction-transitions
批次名称：第六批：C1 互动动作专用过渡
优先原因：补齐待机与关键交互动作之间的真实过渡视频，解决随机插入互动动作时的硬切和缺少动作语义问题。

### 本批次动作

- 源视频：assets/origin/generated/kling/idle_primary_to_paw_raise.mp4
  - 目标 action：idle_primary_to_paw_raise
  - 分类：transition
  - 循环：否
  - 时长：3s
  - 生成命令：npm run kling:generate -- --action idle_primary_to_paw_raise
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/idle_primary_to_paw_raise/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/paw_raise_to_idle_primary.mp4
  - 目标 action：paw_raise_to_idle_primary
  - 分类：transition
  - 循环：否
  - 时长：3s
  - 生成命令：npm run kling:generate -- --action paw_raise_to_idle_primary
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/paw_raise_to_idle_primary/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/idle_primary_to_cursor_watch.mp4
  - 目标 action：idle_primary_to_cursor_watch
  - 分类：transition
  - 循环：否
  - 时长：3s
  - 生成命令：npm run kling:generate -- --action idle_primary_to_cursor_watch
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/idle_primary_to_cursor_watch/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/cursor_watch_to_idle_primary.mp4
  - 目标 action：cursor_watch_to_idle_primary
  - 分类：transition
  - 循环：否
  - 时长：3s
  - 生成命令：npm run kling:generate -- --action cursor_watch_to_idle_primary
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/cursor_watch_to_idle_primary/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/idle_primary_to_click_surprised.mp4
  - 目标 action：idle_primary_to_click_surprised
  - 分类：transition
  - 循环：否
  - 时长：3s
  - 生成命令：npm run kling:generate -- --action idle_primary_to_click_surprised
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/idle_primary_to_click_surprised/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/click_surprised_to_idle_primary.mp4
  - 目标 action：click_surprised_to_idle_primary
  - 分类：transition
  - 循环：否
  - 时长：3s
  - 生成命令：npm run kling:generate -- --action click_surprised_to_idle_primary
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/click_surprised_to_idle_primary/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/idle_primary_to_poke_annoyed.mp4
  - 目标 action：idle_primary_to_poke_annoyed
  - 分类：transition
  - 循环：否
  - 时长：3s
  - 生成命令：npm run kling:generate -- --action idle_primary_to_poke_annoyed
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/idle_primary_to_poke_annoyed/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/poke_annoyed_to_idle_primary.mp4
  - 目标 action：poke_annoyed_to_idle_primary
  - 分类：transition
  - 循环：否
  - 时长：3s
  - 生成命令：npm run kling:generate -- --action poke_annoyed_to_idle_primary
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/poke_annoyed_to_idle_primary/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射

### 必跑验证命令

- `npm run kling:batch-status -- --batch c1-interaction-transitions`
- `npm run animations:audit-origin`
- `npm run animations:build-from-origin`
- `npm run validate:runtime-animations`
- `npm run validate:manifest-contract:current`
- `npm run animations:asset-contract -- --write docs/animation-asset-contract.md`
- `npm run validate:release`

### 桌面验收方式

- `YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png YUZAI_CAPTURE_SEQUENCE_COUNT=6 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`
- `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-animation.png --count 6 --min-changed-frames 2 --min-width 200 --min-height 200`
