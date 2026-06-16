## 动作素材处理前确认清单

执行原则：在删除、覆盖或重新生成动作素材之前，先把这份清单给用户确认；用户确认后再处理帧和 manifest。

### 本次扫描到的源视频

- 源视频：assets/origin/鱼仔待机动作1.mp4
  - 目标 action：idle_primary
  - 分类：daily
  - 当前状态：已接入
  - 会覆盖路径：assets/runtime/animations/idle_primary/frames
  - 预期帧数：72
  - 是否修改 manifest：否，除非本次要覆盖调度字段
- 源视频：assets/origin/鱼仔待机动作2.mp4
  - 目标 action：idle_secondary
  - 分类：daily
  - 当前状态：已接入
  - 会覆盖路径：assets/runtime/animations/idle_secondary/frames
  - 预期帧数：72
  - 是否修改 manifest：否，除非本次要覆盖调度字段
- 源视频：assets/origin/鱼仔晃动尾巴视频.mp4
  - 目标 action：tail_wag
  - 分类：daily
  - 当前状态：已接入
  - 会覆盖路径：assets/runtime/animations/tail_wag/frames
  - 预期帧数：72
  - 是否修改 manifest：否，除非本次要覆盖调度字段
- 源视频：assets/origin/鱼仔前肢抬起视频.mp4
  - 目标 action：paw_raise
  - 分类：interactive
  - 当前状态：已接入
  - 会覆盖路径：assets/runtime/animations/paw_raise/frames
  - 预期帧数：72
  - 是否修改 manifest：否，除非本次要覆盖调度字段
- 源视频：assets/origin/鱼仔走路视频.mp4
  - 目标 action：walk、walk_left
  - 分类：daily
  - 当前状态：已接入
  - 会覆盖路径：assets/runtime/animations/walk/frames、assets/runtime/animations/walk_left/frames
  - 预期帧数：72
  - 是否修改 manifest：否，除非本次要覆盖调度字段
- 源视频：assets/origin/鱼仔左右转头看动作.mp4
  - 目标 action：look_around
  - 分类：daily
  - 当前状态：待确认
  - 会覆盖路径：待确认
  - 预期帧数：待确认
  - 是否修改 manifest：是，确认后新增 manifest action

### 必跑验证命令

- `npm run animations:audit-origin`
- `npm run animations:build-from-origin`
- `npm run validate:runtime-animations`
- `npm run validate:manifest-contract:current`
- `npm run validate:animation-director`
- `npm run validate:release`

### 桌面验收方式

- `YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png YUZAI_CAPTURE_SEQUENCE_COUNT=6 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 YUZAI_CAPTURE_DELAY_MS=900 npm run dev`
- `npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-animation.png --count 6 --min-changed-frames 2 --min-width 200 --min-height 200`
