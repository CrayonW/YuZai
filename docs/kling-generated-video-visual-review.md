# 可灵生成视频视觉初筛记录

日期：2026-06-16
审查范围：`assets/origin/generated/kling/*.mp4`
抽样证据：`assets/reviews/kling-generated/*.png`
总览图：`assets/reviews/kling-generated/overview.png`

## 当前结论

- 14 个可灵生成视频均已生成抽样图。
- 抽样总览中暂未发现明显文字、水印或 logo。
- 本记录只是抽样初筛，不能替代逐个播放源视频进行全程人工检查。
- 所有视频在进入 runtime 前，仍必须按 `docs/kling-generated-video-audit.md` 和对应批次清单确认无水印、无文字、无 logo、猫咪身份一致、全身入镜、绿幕稳定。

## 需要重点处理

### cursor_watch

证据图：`assets/reviews/kling-generated/cursor_watch.png`

问题：第三个抽样帧出现了额外实体物体，外形像小鼠/道具，不符合“鼠标靠近时小猫关注桌面鼠标指针”的交互设定。

建议：标记为重生成候选。重生成提示词应补充：

- 不要出现任何动物、玩具、实体鼠标、鼠标线、道具、家具或人手。
- 只允许猫咪用眼神、耳朵和头部轻微跟随无形光标或屏幕指针。
- 画面中只保留一只猫和纯绿色绿幕背景。

### cursor_watch 重生成候选

- v1：`assets/reviews/kling-generated/cursor_watch_clean_candidate.png`
  - 修复了实体小鼠/道具问题，但出现白色星光/闪光点，不建议接入。
- v2：`assets/reviews/kling-generated/cursor_watch_clean_candidate_v2.png`
  - 没有实体小鼠/道具，但仍有很小的亮点，不建议作为最终素材。
- v3：`assets/reviews/kling-generated/cursor_watch_clean_candidate_v3.png`
  - 抽样图未发现实体物体、光点、星光、文字、水印或 logo。
  - 更密的时间轴抽样：`assets/reviews/kling-generated/cursor_watch_clean_candidate_v3_sweep.png`
  - 当前建议：把 v3 作为 `cursor_watch` 的优先替换候选；正式替换前仍需逐视频播放检查，并再次列出替换/抽帧/runtime 接入清单。

## 其余动作初筛

以下动作在抽样总览中暂未发现明显多猫、文字、logo 或水印，但仍需要逐视频人工检查：

- `slow_blink`
- `look_around`
- `groom_face_wash`
- `loaf_breathing`
- `click_surprised`
- `sleepy`
- `sleep`
- `sleeping`
- `waking`
- `desk_sniff`
- `stretch_yawn`
- `poke_annoyed`
- `shy`
- `dragging`
- `call_response`

### 日常低疲劳补充动作

- `slow_blink`：`assets/reviews/kling-generated/slow_blink_sweep.png`
  - 时间轴抽样未发现文字、水印、logo、道具或额外物体。
  - 当前建议：作为低频亲近感插入动作候选。
- `look_around`：`assets/reviews/kling-generated/look_around_sweep.png`
  - 时间轴抽样未发现文字、水印、logo、道具或额外物体。
  - 当前建议：作为低频环境观察动作候选。

### 第一波 P1 候选时间轴抽样

- `click_surprised`：`assets/reviews/kling-generated/click_surprised_sweep.png`
  - 未发现文字、水印、logo 或额外物体；适合单次点击反馈候选。
- `poke_annoyed`：`assets/reviews/kling-generated/poke_annoyed_sweep.png`
  - 未发现文字、水印、logo 或额外物体；部分帧尾巴和身体接近边缘，抽帧裁切要重点检查。
- `call_response`：`assets/reviews/kling-generated/call_response_sweep.png`
  - 未发现文字、水印、logo 或额外物体；适合气泡提醒或召唤回应候选。
- `stretch_yawn`：`assets/reviews/kling-generated/stretch_yawn_sweep.png`
  - 未发现文字、水印、logo 或额外物体；更像打哈欠/抬前爪，适合休息提醒候选。

### 第二波/暂缓动作时间轴抽样

- 详细记录：`docs/runtime-intake-wave2-sweep-review.md`
- `groom_face_wash`：`assets/reviews/kling-generated/groom_face_wash_sweep.png`
  - 未发现文字、水印、logo 或额外物体；洗脸/舔爪动作语义清楚，适合作为第二波日常生活动作。
- `loaf_breathing`：`assets/reviews/kling-generated/loaf_breathing_sweep.png`
  - 未发现文字、水印、logo 或额外物体；动作更像正坐轻呼吸，暂不作为明确香箱趴状态。
- `desk_sniff`：`assets/reviews/kling-generated/desk_sniff_sweep.png`
  - 未发现文字、水印、logo 或额外物体；适合作为好奇探索或鼠标靠近后的低强度反馈候选。
- `sleepy`：`assets/reviews/kling-generated/sleepy_sweep.png`
  - 未发现文字、水印、logo 或额外物体；适合作为变困短过渡。
- `sleep`：`assets/reviews/kling-generated/sleep_sweep.png`
  - 未发现文字、水印、logo 或额外物体；从坐姿进入蜷伏睡姿，适合作为入睡过渡。
- `sleeping`：`assets/reviews/kling-generated/sleeping_sweep.png`
  - 未发现文字、水印、logo 或额外物体；抽样更像正坐轻闭眼，不建议单独作为真正睡眠循环。
- `waking`：`assets/reviews/kling-generated/waking_sweep.png`
  - 未发现文字、水印、logo 或额外物体；适合作为醒来后回到日常动作的过渡。
- `shy`：`assets/reviews/kling-generated/shy_sweep.png`
  - 未发现文字、水印、logo 或额外物体；适合作为互动结束后的短反应。
- `dragging`：`assets/reviews/kling-generated/dragging_sweep.png`
  - 未发现文字、水印、logo 或额外物体；动作幅度较小，建议留到拖拽专项验收。

## 后续接入门禁

1. 用户确认本轮素材处理清单。
2. 对 `cursor_watch` 决定是重生成、暂时跳过，还是人工裁剪修复。
3. 对通过素材逐个执行去水印/抠绿、序列帧生成和 manifest 接入。
4. 接入后必须做桌面可视化验收：桌面上能看到会动的猫、置顶显示、鼠标靠近有反应、姿势切换自然、气泡提醒正常。

机器可读分波计划：`docs/runtime-intake-waves.json`。
自动验证命令：`npm run validate:runtime-intake-waves`。
