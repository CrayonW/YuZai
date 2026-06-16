## 可灵批次素材接入前确认清单

执行原则：生成视频后、抽帧或覆盖 manifest 前，必须先给用户确认这份清单；确认后才允许处理帧、去水印、覆盖 runtime 路径或修改 manifest。

批次：1

### 本批次动作

- 源视频：assets/origin/generated/kling/groom_face_wash.mp4
  - 目标 action：groom_face_wash
  - 分类：daily
  - 循环：否
  - 时长：8s
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/groom_face_wash/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/loaf_breathing.mp4
  - 目标 action：loaf_breathing
  - 分类：daily
  - 循环：是
  - 时长：8s
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/loaf_breathing/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/cursor_watch.mp4
  - 目标 action：cursor_watch
  - 分类：interactive
  - 循环：否
  - 时长：4s
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/cursor_watch/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射
- 源视频：assets/origin/generated/kling/click_surprised.mp4
  - 目标 action：click_surprised
  - 分类：interactive
  - 循环：否
  - 时长：4s
  - manifest 状态：待新增
  - 会覆盖路径：assets/runtime/animations/click_surprised/frames
  - 状态映射建议：待确认
  - 预期帧率：24 fps
  - 需要确认：确认新增 manifest action 和状态映射

### 必跑验证命令

- `npm run kling:batch-status -- --batch 1`
- `npm run animations:audit-origin`
- `npm run animations:build-from-origin`
- `npm run validate:runtime-animations`
- `npm run validate:manifest-contract:current`
- `npm run validate:release`

### 桌面验收方式

- `YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png YUZAI_CAPTURE_SEQUENCE_COUNT=6 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`
- `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-animation.png --count 6 --min-changed-frames 2 --min-width 200 --min-height 200`
