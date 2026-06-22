# runtime 时长补长第一阶段执行清单

更新日期：2026-06-22

用途：把 `runtime_duration_short` blocker 的第一阶段拆成可确认、可执行、可回滚的动作补长清单。本清单只用于用户确认前审查，不批准生成视频、不抽帧、不覆盖 runtime、不修改 manifest。

## 确认规则

用户明确确认本清单前，禁止执行以下动作：

- 禁止新增或覆盖 `assets/runtime/animations/*/frames`。
- 禁止修改 `assets/runtime/animations/manifest.json`。
- 禁止声称 `runtime_duration_short` 已关闭。
- 禁止删除或改动用户个人参考文件：
  - `assets/references/yuzai-personalized-concept-alpha.png`
  - `assets/references/yuzai-personalized-concept.png`
  - `docs/yuzai-personalized-pet-concept.md`

确认后，本阶段只允许使用现有 runtime 序列帧做补长，不调用可灵生成新视频，不改源视频素材。

## 第一阶段目标

- 先降低长时间待机的重复感。
- 先关闭或减少最常见 daily 动作的时长缺口。
- 用现有帧构造更长播放序列，避免等待新视频生成。
- 保留后续“重新生成更自然长视频”的空间。

## 补长方法

本阶段使用“派生序列帧”方式，不伪改 manifest 数字：

1. 读取当前动作目录中的真实帧。
2. 根据动作类型选择补长策略。
3. 生成新的 runtime 帧文件，目标帧数达到契约要求。
4. 更新 manifest 中对应动作 `frameCount`、`entryFrames`、`exitFrames`。
5. 刷新 `docs/animation-asset-contract.md` 和相关完成度文档。
6. 通过桌面多帧截图验收动作仍然可见、会动、能回到日常状态。

## 补长策略

| 策略 | 适用动作 | 说明 | 风险 |
| --- | --- | --- | --- |
| 安全正放循环 | `idle_primary`、`idle_secondary`、`tail_wag`、`loaf_breathing`、`sleeping` | 重复完整源序列，适合首尾姿态接近的循环动作。 | 如果首尾差距大，循环点会轻微跳变。 |
| 往返循环 | `slow_blink`、`look_around`、`desk_sniff`、`stretch_yawn` | 正放后倒放回安全姿态，适合非循环生活动作。 | 动作可能出现“回放感”，但比硬切更平滑。 |
| 尾段缓冲 | `paw_raise`、睡眠链路短动作 | 在动作尾段安全帧附近做短暂停留或微循环。 | 适合补 1 秒以内，不适合大幅补长。 |
| 暂缓重生成 | 16 方向 `look_*` | 鼠标跟随方向动作当前为 5s，要到 8s 更适合后续统一生成长视频。 | 本阶段不优先处理，避免 16 个方向产生机械重复感。 |

## 建议执行波次

### phase1-a：高频待机动作

优先处理。目标是最直接改善桌面常驻时的重复感。

| action | 当前 | 目标 | 策略 | 验收重点 |
| --- | ---: | ---: | --- | --- |
| idle_primary | 72 帧 / 3s | 192 帧 / 8s | 安全正放循环 | 长时间待机不快速重复跳动。 |
| idle_secondary | 72 帧 / 3s | 192 帧 / 8s | 安全正放循环 | 与 `idle_primary` 切换后不突兀。 |
| tail_wag | 72 帧 / 3s | 192 帧 / 8s | 安全正放循环 | 尾巴动作循环点不明显闪跳。 |

### phase1-b：长陪伴日常动作

phase1-a 验收通过后处理。目标是扩大日常动作池的有效时长。

| action | 当前 | 目标 | 策略 | 验收重点 |
| --- | ---: | ---: | --- | --- |
| groom_face_wash | 120 帧 / 5s | 192 帧 / 8s | 往返循环或尾段缓冲 | 洗脸动作不要显得突然倒放。 |
| loaf_breathing | 120 帧 / 5s | 192 帧 / 8s | 安全正放循环 | 呼吸循环点自然。 |
| sleeping | 120 帧 / 5s | 192 帧 / 8s | 安全正放循环 | 睡眠循环稳定，不抖动。 |

### phase1-c：短缺口动作

只补 1 秒左右的动作，风险较低。

| action | 当前 | 目标 | 策略 | 验收重点 |
| --- | ---: | ---: | --- | --- |
| slow_blink | 120 帧 / 5s | 144 帧 / 6s | 尾段缓冲 | 闭眼后回正自然。 |
| look_around | 120 帧 / 5s | 144 帧 / 6s | 往返循环 | 回视线不要明显倒放。 |
| desk_sniff | 120 帧 / 5s | 144 帧 / 6s | 尾段缓冲 | 嗅探尾段不僵。 |
| stretch_yawn | 120 帧 / 5s | 144 帧 / 6s | 尾段缓冲 | 伸懒腰结束能回待机。 |
| sleepy | 120 帧 / 5s | 144 帧 / 6s | 尾段缓冲 | 能继续进入 sleep。 |
| sleep | 120 帧 / 5s | 144 帧 / 6s | 尾段缓冲 | 能继续进入 sleep_to_sleeping。 |
| paw_raise | 72 帧 / 3s | 96 帧 / 4s | 尾段缓冲 | 抬爪后能进入 paw_raise_to_idle。 |

### phase1-d：暂缓动作

这些动作本阶段不建议用机械补长一次性处理。

| 范围 | 数量 | 暂缓原因 | 后续建议 |
| --- | ---: | --- | --- |
| 16 方向 `look_*` | 16 | 鼠标跟随动作停留时间长，机械循环容易被用户感知。 | 后续统一生成 8 秒长视频或做方向间混合。 |
| `walk` | 1 | 行走动作与桌宠位置移动、拖拽体验相关。 | 后续结合桌面移动逻辑单独验收。 |

## 执行后必须刷新

确认执行后，每完成一个波次都必须刷新：

- `docs/animation-asset-contract.md`
- `docs/runtime-duration-extension-plan.md`
- `docs/runtime-naturalness-observation.md`
- `docs/project-completion-audit.md`
- `docs/release-blockers.json`
- `docs/release-blockers.md`
- `docs/animation-production-log.md`

## 必跑验证

每个波次完成后必须运行：

```bash
npm run animations:asset-contract -- --write docs/animation-asset-contract.md
npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md
npm run validate:runtime-duration-extension-plan-current
npm run validate:runtime-naturalness-observation
npm run validate:all
npm run validate:release
```

## 桌面验收

每个波次完成后必须补充桌面多帧截图证据：

```bash
YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-duration-phase1.png YUZAI_CAPTURE_SEQUENCE_COUNT=12 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=300 YUZAI_CAPTURE_DELAY_MS=900 npm run dev
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-duration-phase1.png --count 12 --min-changed-frames 6 --min-width 200 --min-height 200
```

建议保存证据到：

- `assets/reviews/runtime/duration-extension-phase1/`

## Git 记录规则

- 每完成一个波次并通过验证后，单独提交。
- 提交前确认不包含用户个人参考文件。
- 提交后推送 GitHub，方便回滚。

## 推荐下一步

建议先确认并执行 `phase1-a`：

1. `idle_primary`
2. `idle_secondary`
3. `tail_wag`

这 3 个动作是最常见待机动作，收益最高，且当前都有 72 帧真实素材，适合先用安全正放循环补到 192 帧。
