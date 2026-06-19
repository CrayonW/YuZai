# runtime 接入待确认提案：高风险回切过渡

波次候选 ID：`transition-out-recovery`

状态：待生成视频、待人工审查、待用户确认。当前不是正式 runtime-intake 波次，不能写入 `docs/runtime-intake-waves.json`。

## 为什么不能直接进入正式波次

`docs/runtime-intake-waves.json` 的现有门禁要求每个正式波次动作都已经具备：

- 来源视频文件。
- 审查证据图。
- runtime 目标路径。
- 水印门禁和衔接策略。

当前 4 个过渡动作还没有真实视频和审查证据，因此只能先作为待确认提案保留。等视频生成、人工检查通过后，再升级为正式 runtime-intake 波次。

## 候选动作

| risk transition | planned action | source video after generation | review evidence after generation | runtime frame root | future manifest link |
| --- | --- | --- | --- | --- | --- |
| `sleep -> sleeping` | `sleep_to_sleeping` | `assets/origin/generated/kling/sleep_to_sleeping.mp4` | `assets/reviews/kling-generated/sleep_to_sleeping_sweep.png` | `assets/runtime/animations/sleep_to_sleeping/frames` | `sleep.transitionOut = "sleep_to_sleeping"` |
| `waking -> idle_primary` | `waking_to_idle` | `assets/origin/generated/kling/waking_to_idle.mp4` | `assets/reviews/kling-generated/waking_to_idle_sweep.png` | `assets/runtime/animations/waking_to_idle/frames` | `waking.transitionOut = "waking_to_idle"` |
| `poke_annoyed -> idle_primary` | `poke_annoyed_to_idle` | `assets/origin/generated/kling/poke_annoyed_to_idle.mp4` | `assets/reviews/kling-generated/poke_annoyed_to_idle_sweep.png` | `assets/runtime/animations/poke_annoyed_to_idle/frames` | `poke_annoyed.transitionOut = "poke_annoyed_to_idle"` |
| `paw_raise -> idle_primary` | `paw_raise_to_idle` | `assets/origin/generated/kling/paw_raise_to_idle.mp4` | `assets/reviews/kling-generated/paw_raise_to_idle_sweep.png` | `assets/runtime/animations/paw_raise_to_idle/frames` | `paw_raise.transitionOut = "paw_raise_to_idle"` |

## 升级为正式波次前必须满足

1. 用户确认 `docs/transition-out-action-checklist.md`。
2. 执行可灵生成，得到 4 个源视频。
3. 生成并人工检查审查证据图。
4. 确认每个视频无文字、无水印、无 logo、无额外物体、猫咪身份一致。
5. 确认动作尾段确实回到目标姿态，而不是继续停留在高风险动作尾帧。
6. 生成正式 runtime-intake execution checklist、preflight 和 dry-run。
7. 创建正式批准文件 `docs/runtime-intake-approvals/transition-out-recovery.approved.json`。

## 当前禁止事项

- 禁止创建 `docs/runtime-intake-approvals/transition-out-recovery.approved.json`。
- 禁止把本提案加入 `docs/runtime-intake-waves.json`。
- 禁止抽帧或新增 `assets/runtime/animations/*_to_*/frames`。
- 禁止修改 `assets/runtime/animations/manifest.json` 的 `transitionOut` 字段。
- 禁止声称 4 个过渡动作已经进入桌宠。

## 当前允许事项

- 维护提示词、批次计划和处理前清单。
- dry-run 可灵生成命令。
- 用户确认后再进入真实生成。
