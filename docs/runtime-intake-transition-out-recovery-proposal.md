# runtime 接入状态：高风险回切过渡

波次 ID：`transition-out-recovery`

状态：视频已生成，基础审查已完成，已升级为正式 runtime-intake 波次。当前允许按批准文件进入抽帧、去水印/抠绿、写入 runtime manifest 和桌面验收流程。

下一步允许抽帧、去水印/抠绿、写入 runtime manifest。

## 为什么升级为正式波次

`docs/action-transition-risk-report.md` 仍记录 4 个 high 风险回切：

- `sleep -> sleeping`
- `waking -> idle_primary`
- `poke_annoyed -> idle_primary`
- `paw_raise -> idle_primary`

这 4 个切换都被标记为 `tail-not-recovered`，只靠 Canvas crossfade 不能完全解决动作尾段跳回日常姿势的生硬感。现在 4 个对应的可灵视频已经生成，并通过 `docs/kling-generated-video-audit.md` 的基础元数据检查，可以进入正式 runtime 接入流程。

## 正式 runtime-intake 波次

正式 runtime-intake 波次已写入 `docs/runtime-intake-waves.json`，批准文件为 `docs/runtime-intake-approvals/transition-out-recovery.approved.json`。

| risk transition | action | source video | review evidence | runtime frame root | manifest link |
| --- | --- | --- | --- | --- | --- |
| `sleep -> sleeping` | `sleep_to_sleeping` | `assets/origin/generated/kling/sleep_to_sleeping.mp4` | `assets/reviews/kling-generated/sleep_to_sleeping.png` | `assets/runtime/animations/sleep_to_sleeping/frames` | `sleep.transitionOut = "sleep_to_sleeping"` |
| `waking -> idle_primary` | `waking_to_idle` | `assets/origin/generated/kling/waking_to_idle.mp4` | `assets/reviews/kling-generated/waking_to_idle.png` | `assets/runtime/animations/waking_to_idle/frames` | `waking.transitionOut = "waking_to_idle"` |
| `poke_annoyed -> idle_primary` | `poke_annoyed_to_idle` | `assets/origin/generated/kling/poke_annoyed_to_idle.mp4` | `assets/reviews/kling-generated/poke_annoyed_to_idle.png` | `assets/runtime/animations/poke_annoyed_to_idle/frames` | `poke_annoyed.transitionOut = "poke_annoyed_to_idle"` |
| `paw_raise -> idle_primary` | `paw_raise_to_idle` | `assets/origin/generated/kling/paw_raise_to_idle.mp4` | `assets/reviews/kling-generated/paw_raise_to_idle.png` | `assets/runtime/animations/paw_raise_to_idle/frames` | `paw_raise.transitionOut = "paw_raise_to_idle"` |

## 当前人工审查结论

- 总览图：`assets/reviews/kling-generated/overview.png`
- 单动作抽样图：`assets/reviews/kling-generated/*_to_*.png`
- 基础结论：4 个视频尺寸、时长和文件大小均达标。
- 画面结论：抽样图未见明显水印、文字、logo、额外物体或身体裁切。
- 风险：动作幅度偏保守，接入后必须用 `docs/action-transition-risk-report.md` 和桌面多帧截图复查是否真正降低 high 风险。

## 当前允许事项

- 运行 `npm run runtime:intake-executor -- --wave transition-out-recovery --dry-run --write docs/runtime-intake-transition-out-recovery-dry-run.md`。
- 运行 `npm run runtime:intake-executor -- --wave transition-out-recovery --execute`。
- 新增 4 个 `assets/runtime/animations/*_to_*/frames` 目录。
- 写入 4 个 transition action 到 `assets/runtime/animations/manifest.json`。
- 把 `sleep`、`waking`、`poke_annoyed`、`paw_raise` 的 `transitionOut` 字段指向对应过渡动作。

## 关闭 blocker 前仍需完成

1. 生成 runtime 序列帧。
2. 更新 manifest 的 transition action 和 4 个原动作的 `transitionOut`。
3. 重新生成 `docs/action-transition-risk-report.md`，确认 high 风险下降。
4. 运行 `npm run validate:all` 和 `npm run validate:release`。
5. 补充桌面多帧截图或录屏验收。
