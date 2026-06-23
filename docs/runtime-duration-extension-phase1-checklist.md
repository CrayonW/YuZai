# runtime 时长补长第一阶段执行清单

更新日期：2026-06-23

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
| 循环展开 | `walk`、16 方向 `look_*` | 可灵当前实际源视频约 5s，先用已清理 runtime 帧展开到契约帧数，降低长时间停留时快速回环。 | 不等同于重新生成 8s 长视频，后续仍可用更自然素材替换。 |

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

### phase1-d：剩余循环动作

这些动作用于关闭当前 runtime 时长缺口。`look_*` 仍建议后续替换为真正更长的 8 秒源视频，但当前先使用已去水印/抠绿后的 runtime 序列帧展开，保证桌宠运行时有足够帧数。

| action | 当前 | 目标 | 策略 | 验收重点 |
| --- | ---: | ---: | --- | --- |
| walk | 72 帧 / 3s | 144 帧 / 6s | 循环展开 | 行走循环可见，后续仍需结合桌面移动逻辑复查。 |
| look_e | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 鼠标正右方向停留时不会快速回环。 |
| look_ene | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 右上偏右方向头眼跟随保持可见。 |
| look_ne | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 右上方向头眼跟随保持可见。 |
| look_nne | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 上方偏右方向头眼跟随保持可见。 |
| look_n | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 正上方向头眼跟随保持可见。 |
| look_nnw | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 上方偏左方向头眼跟随保持可见。 |
| look_nw | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 左上方向头眼跟随保持可见。 |
| look_wnw | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 左上偏左方向头眼跟随保持可见。 |
| look_w | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 正左方向头眼跟随保持可见。 |
| look_wsw | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 左下偏左方向头眼跟随保持可见。 |
| look_sw | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 左下方向头眼跟随保持可见。 |
| look_ssw | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 下方偏左方向头眼跟随保持可见。 |
| look_s | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 正下方向头眼跟随保持可见。 |
| look_sse | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 下方偏右方向头眼跟随保持可见。 |
| look_se | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 右下方向头眼跟随保持可见。 |
| look_ese | 120 帧 / 5s | 192 帧 / 8s | 循环展开 | 右下偏右方向头眼跟随保持可见。 |

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

phase1-a 已保存证据：

- `idle_primary`：`assets/reviews/runtime/duration-extension-phase1/idle-primary-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`。
- `idle_secondary`：`assets/reviews/runtime/duration-extension-phase1/idle-secondary-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=9`，尺寸 `440x440`。
- `tail_wag`：`assets/reviews/runtime/duration-extension-phase1/tail-wag-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=8`，尺寸 `440x440`。

phase1-b 已保存证据：

- `groom_face_wash`：`assets/reviews/runtime/duration-extension-phase1/groom-face-wash-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`。
- `loaf_breathing`：`assets/reviews/runtime/duration-extension-phase1/loaf-breathing-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=9`，尺寸 `440x440`。
- `sleeping`：`assets/reviews/runtime/duration-extension-phase1/sleeping-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`。

phase1-c 已保存证据：

- `slow_blink`：`assets/reviews/runtime/duration-extension-phase1/slow-blink-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=9`，尺寸 `440x440`。
- `look_around`：`assets/reviews/runtime/duration-extension-phase1/look-around-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`。
- `desk_sniff`：`assets/reviews/runtime/duration-extension-phase1/desk-sniff-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=10`，尺寸 `440x440`。
- `stretch_yawn`：`assets/reviews/runtime/duration-extension-phase1/stretch-yawn-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=8`，尺寸 `440x440`。
- `sleepy`：`assets/reviews/runtime/duration-extension-phase1/sleepy-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=7`，尺寸 `440x440`。
- `sleep`：`assets/reviews/runtime/duration-extension-phase1/sleep-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`。
- `paw_raise`：`assets/reviews/runtime/duration-extension-phase1/paw-raise-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=9`，尺寸 `440x440`。

phase1-d 已保存证据：

- `walk`：`assets/reviews/runtime/duration-extension-phase1/walk-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=7`，尺寸 `440x440`，阈值 `minChangedFrames=6`。
- `look_e`：`assets/reviews/runtime/duration-extension-phase1/look-e-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=5`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_ene`：`assets/reviews/runtime/duration-extension-phase1/look-ene-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_ne`：`assets/reviews/runtime/duration-extension-phase1/look-ne-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=7`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_nne`：`assets/reviews/runtime/duration-extension-phase1/look-nne-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=6`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_n`：`assets/reviews/runtime/duration-extension-phase1/look-n-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_nnw`：`assets/reviews/runtime/duration-extension-phase1/look-nnw-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_nw`：`assets/reviews/runtime/duration-extension-phase1/look-nw-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=6`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_wnw`：`assets/reviews/runtime/duration-extension-phase1/look-wnw-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_w`：`assets/reviews/runtime/duration-extension-phase1/look-w-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_wsw`：`assets/reviews/runtime/duration-extension-phase1/look-wsw-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_sw`：`assets/reviews/runtime/duration-extension-phase1/look-sw-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=10`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_ssw`：`assets/reviews/runtime/duration-extension-phase1/look-ssw-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_s`：`assets/reviews/runtime/duration-extension-phase1/look-s-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=12`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_sse`：`assets/reviews/runtime/duration-extension-phase1/look-sse-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=11`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_se`：`assets/reviews/runtime/duration-extension-phase1/look-se-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=7`，尺寸 `440x440`，阈值 `minChangedFrames=4`。
- `look_ese`：`assets/reviews/runtime/duration-extension-phase1/look-ese-contact-sheet.png`，`capture:inspect` 结果 `changedFrames=4`，尺寸 `440x440`，阈值 `minChangedFrames=4`。

## Git 记录规则

- 每完成一个波次并通过验证后，单独提交。
- 提交前确认不包含用户个人参考文件。
- 提交后推送 GitHub，方便回滚。

## 推荐下一步

下一步建议转向发布分发 blocker：

1. Windows 实机安装验收。
2. macOS 正式签名与公证。
3. 签名后普通用户安装安全提示复核。

动作侧仍保留一个质量优化建议：未来如果有预算或新素材，应重新生成更自然的 8 秒方向跟随源视频，替换当前 phase1-d 的循环展开版本。

## 执行状态

- `phase1-a`：已确认执行，已用现有序列帧补长 `idle_primary`、`idle_secondary`、`tail_wag`。
- `phase1-b`：已确认执行，已用现有序列帧补长 `groom_face_wash`、`loaf_breathing`、`sleeping`。
- `phase1-c`：已确认执行，已用现有序列帧补长 `slow_blink`、`look_around`、`desk_sniff`、`stretch_yawn`、`sleepy`、`sleep`、`paw_raise`。
- `phase1-d`：已确认执行，已用现有序列帧补长 `walk` 和 16 个 `look_*` 鼠标方向动作。
- 当前结果：phase1-a 三项均从 72 帧补到 192 帧；phase1-b 三项均从 120 帧补到 192 帧；phase1-c 中 6 项从 120 帧补到 144 帧，`paw_raise` 从 72 帧补到 96 帧；phase1-d 中 `walk` 从 72 帧补到 144 帧，16 个 `look_*` 均从 120 帧补到 192 帧；仍使用原始 runtime 帧派生，不调用可灵生成新视频。
- 已新增门禁：`npm run validate:runtime-duration-phase1`。
- 已补桌面验收：phase1-a、phase1-b、phase1-c、phase1-d 共 30 项均已生成 12 帧桌面截图和 contact sheet，且 `capture:inspect` 均通过。
- 当前范围：`runtime_duration_short` 已满足资产契约，剩余项目 blocker 转向 Windows 实机验收、macOS 签名/公证和签名后安全复核。
