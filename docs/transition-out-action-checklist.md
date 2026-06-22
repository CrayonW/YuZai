# 高风险回切过渡动作处理前确认清单

用途：本清单只用于准备后续生成和接入 `transitionOut` 过渡动作，解决 `docs/action-transition-risk-report.md` 中标记为 `tail-not-recovered` 的高风险回切。当前清单不代表已经批准生成、抽帧、去水印、覆盖 runtime 或修改 manifest。

## 本次目标

- 降低动作结束回切时的生硬感。
- 只处理风险报告中 high 且 `tail-not-recovered` 的回切。
- 优先补短过渡视频，而不是直接截断原动作。

## 处理前总规则

- 不得在用户确认前生成视频、抽帧、删除、覆盖或修改 runtime 帧。
- 每个视频进入 runtime 前必须人工确认无水印、无文字、无 logo、猫咪身份一致、全身入镜、绿幕稳定。
- 生成后先放入 `assets/origin/generated/kling`，再进入素材审查、去水印/抠绿、序列帧生成和 manifest 更新。
- 接入时必须把目标动作的 `transitionOut` 指向对应过渡 action，并通过桌面多帧截图或录屏验收。

## 待确认动作清单

| risk transition | planned transitionOut action | category | loop | planned source video | runtime target | manifest link after approval | reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `sleep -> sleeping` | `sleep_to_sleeping` | `transition` | false | `assets/origin/generated/kling/sleep_to_sleeping.mp4` | `assets/runtime/animations/sleep_to_sleeping/frames` | `sleep.transitionOut = "sleep_to_sleeping"` | `sleep` 尾段没有自然回到 `sleeping` 第一帧 |
| `waking -> idle_primary` | `waking_to_idle` | `transition` | false | `assets/origin/generated/kling/waking_to_idle.mp4` | `assets/runtime/animations/waking_to_idle/frames` | `waking.transitionOut = "waking_to_idle"` | `waking` 尾段没有自然回到待机 |
| `poke_annoyed -> idle_primary` | `poke_annoyed_to_idle` | `transition` | false | `assets/origin/generated/kling/poke_annoyed_to_idle.mp4` | `assets/runtime/animations/poke_annoyed_to_idle/frames` | `poke_annoyed.transitionOut = "poke_annoyed_to_idle"` | `poke_annoyed` 尾段没有自然回到待机 |
| `paw_raise -> idle_primary` | `paw_raise_to_idle` | `transition` | false | `assets/origin/generated/kling/paw_raise_to_idle.mp4` | `assets/runtime/animations/paw_raise_to_idle/frames` | `paw_raise.transitionOut = "paw_raise_to_idle"` | `paw_raise` 尾段没有自然回到待机 |

## 生成命令草案

以下命令仅作为确认后的执行入口；未确认前不要执行真实生成。

```bash
npm run kling:generate -- --dry-run --action sleep_to_sleeping
npm run kling:generate -- --dry-run --action waking_to_idle
npm run kling:generate -- --dry-run --action poke_annoyed_to_idle
npm run kling:generate -- --dry-run --action paw_raise_to_idle
```

确认真实生成后：

```bash
npm run kling:generate -- --action sleep_to_sleeping
npm run kling:generate -- --action waking_to_idle
npm run kling:generate -- --action poke_annoyed_to_idle
npm run kling:generate -- --action paw_raise_to_idle
```

也可以按批次生成：

```bash
npm run kling:generate-batch -- --batch transition-out-recovery --dry-run
npm run kling:generate-batch -- --batch transition-out-recovery
```

## 生成后接入门禁

1. 运行 `npm run kling:generated-video-audit -- --batch transition-out-recovery --write docs/kling-generated-video-audit.md` 或等价审查命令。
2. 人工检查抽样图和源视频：无水印、无文字、无 logo、猫咪身份一致、动作尾段能接回目标姿态。
3. 通过后再生成 runtime intake 清单，列出要新增的 action、目标路径和 manifest 修改。
4. 得到确认后再执行抽帧、去水印/抠绿、manifest 更新。
5. 接入后运行 `npm run animations:transition-risk -- --write docs/action-transition-risk-report.md`，确认 high 风险下降。
6. 运行 `npm run validate:all`、`npm run validate:release` 和桌面多帧截图验收。

## 当前决定

4 个 transitionOut 视频已生成并接入 runtime：

- `sleep.transitionOut = "sleep_to_sleeping"`
- `waking.transitionOut = "waking_to_idle"`
- `poke_annoyed.transitionOut = "poke_annoyed_to_idle"`
- `paw_raise.transitionOut = "paw_raise_to_idle"`

桌面多帧截图证据已保存到 `assets/reviews/runtime/transition-out-recovery/`。如果后续人工观感仍生硬，应优先重生成尾段更明确回到目标姿态的视频，而不是继续叠加 transitionOut。
