# 第一波 runtime 接入候选确认清单

日期：2026-06-16
目的：把已经生成并完成抽样初筛的可灵动作，整理成第一波可确认的 runtime 接入范围。确认前禁止抽帧、禁止去水印/抠绿、禁止修改 `assets/runtime/animations/manifest.json`。

机器可读执行计划：`docs/runtime-intake-waves.json` 中的 `wave1`。后续正式执行时，以该 JSON 的来源视频、审查证据、桥接入口、衔接策略和确认状态作为自动验证依据。

## 当前 runtime 现状

- 当前 manifest 已启用 action：`idle_primary`、`idle_secondary`、`tail_wag`、`walk`、`walk_left`、`paw_raise`。
- `sleep`、`sleepy`、`sleeping`、`waking`、`surprised`、`shy`、`dragging` 等状态仍主要回退到 `idle_primary`。
- 行为桥接已预留 `reminder`、`proximity`、`click`、`drag` 的候选 action，但只有 runtime manifest 中存在的 action 才会实际播放。

## 第一波推荐接入

第一波只接入低风险、高收益动作，目标是先降低待机重复感，并让鼠标靠近/点击/提醒有更真实的小猫反馈。

| 优先级 | action | 来源视频 | 分类 | 建议 runtime 用途 | 接入动作 |
| --- | --- | --- | --- | --- | --- |
| P0 | `slow_blink` | `assets/origin/generated/kling/slow_blink.mp4` | daily | 长时间待机时低频亲近感插入 | 新增 manifest action；加入日常轮换 |
| P0 | `look_around` | `assets/origin/generated/kling/look_around.mp4` | daily | 无交互时环境观察，降低固定站桩感 | 新增 manifest action；加入日常轮换 |
| P0 | `cursor_watch` | `assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4` | interactive | 鼠标靠近时低强度关注反应 | 用 v3 候选作为正式 `cursor_watch` 来源；接入 `proximity.mouse_near` |
| P1 | `click_surprised` | `assets/origin/generated/kling/click_surprised.mp4` | interactive | 单次点击反馈 | 新增 manifest action；接入 `click.single` |
| P1 | `poke_annoyed` | `assets/origin/generated/kling/poke_annoyed.mp4` | interactive | 多次点击后的情绪变化；抽帧时重点检查尾巴/身体边缘裁切 | 新增 manifest action；接入 `click.repeated` |
| P1 | `call_response` | `assets/origin/generated/kling/call_response.mp4` | interactive | 喝水/休息气泡或用户召唤回应 | 新增 manifest action；接入 `reminder.water` |
| P1 | `stretch_yawn` | `assets/origin/generated/kling/stretch_yawn.mp4` | daily | 休息提醒或作息变化；抽样更像打哈欠/抬前爪，不应预期为完整伸懒腰 | 新增 manifest action；接入 `reminder.rest` 和日常低频轮换 |

## 第一波暂缓接入

这些动作已经有素材或抽样证据，但第一波先不接入，避免状态跨度太大导致衔接问题难排查。

| action | 暂缓原因 | 后续波次 |
| --- | --- | --- |
| `groom_face_wash` | 时间轴抽样干净，洗脸/舔爪语义清楚；第一波先控制接入范围，暂缓到第二波做日常生活动作。 | 第二波日常生活动作 |
| `loaf_breathing` | 时间轴抽样干净，但更像正坐轻呼吸，不是明确香箱趴；适合后续作为低疲劳待机补充。 | 第二波长陪伴状态 |
| `desk_sniff` | 时间轴抽样干净，适合好奇探索；需要和 `cursor_watch` 的鼠标靠近语义区分。 | 第二波日常探索 |
| `sleepy`、`sleep`、`sleeping`、`waking` | 时间轴抽样干净，但属于睡眠链路，需要成组接入并设计状态持续时间、锁定播放和回到日常的衔接。 | 睡眠作息波次 |
| `shy` | 时间轴抽样干净，可作为互动结束后的轻反应；第一波已有点击反馈动作，暂缓到第二波互动变化。 | 第二波互动变化 |
| `dragging` | 时间轴抽样干净但动作幅度较小，拖拽状态会和窗口移动交互绑定，需要单独桌面验收。 | 拖拽专项波次 |

## 不建议接入

| action | 原因 |
| --- | --- |
| 原 `cursor_watch.mp4` | 抽样帧出现额外实体小鼠/道具，不符合桌宠鼠标靠近设定。 |
| `cursor_watch_clean_candidate.mp4` | v1 候选有星光/闪光点。 |
| `cursor_watch_clean_candidate_v2.mp4` | v2 候选仍有细小亮点。 |

## 确认后允许执行的步骤

只有用户确认本清单后，才允许执行以下步骤：

1. 对第一波每个源视频逐视频播放检查，确认全程无水印、无文字、无 logo、无额外物体、无明显变形。
2. 将通过的视频转为透明序列帧，输出到 `assets/runtime/animations/<action>/frames`。
3. 更新 `assets/runtime/animations/manifest.json`：
   - 新增第一波 action。
   - 为 non-loop 交互动作设置 `loop: false`、`interruptPolicy: locked`、`returnTo: idle_primary`。
   - 为 daily 低频动作设置 `interruptPolicy: at-safe-frame`。
4. 更新日常轮换/行为桥接，使第一波 action 能被 runtime 选择。
5. 执行桌面验收：
   - 桌面上能看到会动的猫。
   - 窗口始终置顶。
   - 鼠标靠近触发 `cursor_watch` 或回退到 `paw_raise`。
   - 点击触发 `click_surprised` / `poke_annoyed`。
   - 气泡提醒可触发 `call_response` 或 `stretch_yawn`。

## 补充抽样证据

- 第一波 P1 时间轴抽样记录：`docs/runtime-intake-wave1-sweep-review.md`
- 第二波/暂缓动作时间轴抽样记录：`docs/runtime-intake-wave2-sweep-review.md`
- 机器可读分波计划：`docs/runtime-intake-waves.json`
- 抽样图：
  - `assets/reviews/kling-generated/click_surprised_sweep.png`
  - `assets/reviews/kling-generated/poke_annoyed_sweep.png`
  - `assets/reviews/kling-generated/call_response_sweep.png`
  - `assets/reviews/kling-generated/stretch_yawn_sweep.png`

## 确认前仍然禁止

- 禁止覆盖 `assets/origin/generated/kling/*.mp4`。
- 禁止删除旧 runtime 资源。
- 禁止修改 manifest 指向未检查素材。
- 禁止把候选 mp4 提交到 Git。
- 禁止声称已经完成桌宠最终动作优化。
