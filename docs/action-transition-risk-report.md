# 动作衔接风险报告

生成来源：assets/runtime/animations/manifest.json
运行时 action 数：22
检查切换数：20
风险摘要：high 4 / medium 12 / low 4

本文档由 `npm run animations:transition-risk -- --write docs/action-transition-risk-report.md` 生成，用于把“动作衔接太生硬”的主观反馈转成可复查的帧差异清单。数值越高，说明切换前后帧差异越大，越需要补安全帧、重生成起止姿态或增加 `transitionIn` / `transitionOut` 专用动作。

## 当前结论

当前存在 4 个高风险切换。全局 Canvas 淡入淡出只能缓解闪切，不能替代专用过渡素材。

## 建议处理顺序

1. 先处理 high 风险里的鼠标靠近、点击、拖拽和睡眠链路，因为这些最容易被用户主动触发。
2. 对同一个动作同时存在进入和回切高风险时，优先生成一组 `transitionIn` / `transitionOut`。
3. 新视频进入 runtime 前，先刷新本报告，再结合桌面多帧截图或录屏判断是否覆盖 manifest。

## 切换明细

| risk | direction | from | to | best frame pair | metric | current bridge | recommendation | reason |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| high | 回切 | sleep | sleeping | 120 -> 1 | 0.3146 | Canvas crossfade | 优先生成 sleep_to_sleeping 或给 sleep 标注更自然 exitFrames | sleep 播放结束后回到 sleeping |
| high | 回切 | waking | idle_primary | 120 -> 1 | 0.2412 | Canvas crossfade | 优先生成 waking_to_idle_primary 或给 waking 标注更自然 exitFrames | waking 播放结束后回到 idle_primary |
| high | 回切 | poke_annoyed | idle_primary | 120 -> 1 | 0.2201 | Canvas crossfade | 优先生成 poke_annoyed_to_idle_primary 或给 poke_annoyed 标注更自然 exitFrames | poke_annoyed 播放结束后回到 idle_primary |
| high | 回切 | paw_raise | idle_primary | 72 -> 24 | 0.2009 | Canvas crossfade | 优先生成 paw_raise_to_idle_primary 或给 paw_raise 标注更自然 exitFrames | paw_raise 播放结束后回到 idle_primary |
| medium | 回切 | sleepy | sleep | 120 -> 1 | 0.1343 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleepy 播放结束后回到 sleep |
| medium | 回切 | click_surprised | idle_primary | 120 -> 24 | 0.1134 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | click_surprised 播放结束后回到 idle_primary |
| medium | 回切 | shy | idle_primary | 120 -> 1 | 0.1035 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | shy 播放结束后回到 idle_primary |
| medium | 进入 | idle_primary | sleep | 24 -> 1 | 0.1028 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleep 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | dragging | 24 -> 1 | 0.1028 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | dragging 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | poke_annoyed | 24 -> 1 | 0.1028 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | poke_annoyed 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | sleepy | 24 -> 1 | 0.1028 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleepy 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | call_response | 24 -> 1 | 0.1027 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | call_response 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | click_surprised | 24 -> 1 | 0.1027 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | click_surprised 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | shy | 24 -> 1 | 0.1027 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | shy 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | waking | 24 -> 1 | 0.1026 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | waking 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | cursor_watch | 24 -> 1 | 0.1026 | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | cursor_watch 是可被用户触发的交互动作 |
| low | 进入 | idle_primary | paw_raise | 24 -> 1 | 0.0961 | Canvas crossfade | 当前可接受，低频复查即可 | paw_raise 是可被用户触发的交互动作 |
| low | 回切 | cursor_watch | idle_primary | 120 -> 1 | 0.0692 | Canvas crossfade | 当前可接受，低频复查即可 | cursor_watch 播放结束后回到 idle_primary |
| low | 回切 | call_response | idle_primary | 120 -> 1 | 0.0641 | Canvas crossfade | 当前可接受，低频复查即可 | call_response 播放结束后回到 idle_primary |
| low | 回切 | dragging | idle_primary | 120 -> 1 | 0.0529 | Canvas crossfade | 当前可接受，低频复查即可 | dragging 播放结束后回到 idle_primary |
