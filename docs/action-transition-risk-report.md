# 动作衔接风险报告

生成来源：assets/runtime/animations/manifest.json
运行时 action 数：42
检查切换数：60
风险摘要：high 4 / medium 38 / low 18

本文档由 `npm run animations:transition-risk -- --write docs/action-transition-risk-report.md` 生成，用于把“动作衔接太生硬”的主观反馈转成可复查的帧差异清单。数值越高，说明切换前后帧差异越大，越需要补安全帧、重生成起止姿态或增加 `transitionIn` / `transitionOut` 专用动作。

## 当前结论

当前存在 4 个高风险切换。全局 Canvas 淡入淡出只能缓解闪切，不能替代专用过渡素材。

## 建议处理顺序

1. 先处理 high 风险里的鼠标靠近、点击、拖拽和睡眠链路，因为这些最容易被用户主动触发。
2. 对同一个动作同时存在进入和回切高风险时，优先生成一组 `transitionIn` / `transitionOut`。
3. 新视频进入 runtime 前，先刷新本报告，再结合桌面多帧截图或录屏判断是否覆盖 manifest。

## 切换明细

| risk | direction | from | to | best frame pair | metric | best source frame | tail diagnosis | current bridge | recommendation | reason |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| high | 回切 | sleep | sleeping | 120 -> 1 | 0.3146 | 1 (0.0106) | tail-not-recovered | sleep_to_sleeping | 已配置 sleep_to_sleeping，需桌面录屏确认 | sleep 播放结束后回到 sleeping |
| high | 回切 | waking | idle_primary | 120 -> 1 | 0.2412 | 1 (0.0376) | tail-not-recovered | waking_to_idle | 已配置 waking_to_idle，需桌面录屏确认 | waking 播放结束后回到 idle_primary |
| high | 回切 | poke_annoyed | idle_primary | 120 -> 1 | 0.2201 | 1 (0.0376) | tail-not-recovered | poke_annoyed_to_idle | 已配置 poke_annoyed_to_idle，需桌面录屏确认 | poke_annoyed 播放结束后回到 idle_primary |
| high | 回切 | paw_raise | idle_primary | 72 -> 24 | 0.2009 | 1 (0.0155) | tail-not-recovered | paw_raise_to_idle | 已配置 paw_raise_to_idle，需桌面录屏确认 | paw_raise 播放结束后回到 idle_primary |
| medium | 回切 | sleepy | sleep | 120 -> 1 | 0.1343 | 1 (0.0110) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleepy 播放结束后回到 sleep |
| medium | 回切 | look_sse | idle_primary | 120 -> 1 | 0.1261 | 8 (0.0338) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sse 播放结束后回到 idle_primary |
| medium | 回切 | click_surprised | idle_primary | 120 -> 24 | 0.1134 | 1 (0.0374) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | click_surprised 播放结束后回到 idle_primary |
| medium | 回切 | look_ssw | idle_primary | 120 -> 1 | 0.1052 | 1 (0.0376) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ssw 播放结束后回到 idle_primary |
| medium | 回切 | look_nw | idle_primary | 120 -> 1 | 0.1051 | 5 (0.0357) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nw 播放结束后回到 idle_primary |
| medium | 回切 | look_n | idle_primary | 120 -> 1 | 0.1049 | 3 (0.0364) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_n 播放结束后回到 idle_primary |
| medium | 回切 | shy | idle_primary | 120 -> 1 | 0.1035 | 1 (0.0374) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | shy 播放结束后回到 idle_primary |
| medium | 进入 | idle_primary | sleep | 24 -> 1 | 0.1028 | 1 (0.0375) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleep 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | paw_raise_to_idle | 24 -> 1 | 0.1028 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | paw_raise_to_idle 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | look_ese | 24 -> 1 | 0.1028 | 1 (0.0375) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ese 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | dragging | 24 -> 1 | 0.1028 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | dragging 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | poke_annoyed | 24 -> 1 | 0.1028 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | poke_annoyed 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_n | 24 -> 1 | 0.1028 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_n 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | sleepy | 24 -> 1 | 0.1028 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleepy 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | look_ssw | 24 -> 1 | 0.1028 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ssw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_ne | 24 -> 1 | 0.1028 | 1 (0.0377) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ne 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_sse | 24 -> 1 | 0.1027 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sse 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_se | 24 -> 1 | 0.1027 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_se 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_sw | 24 -> 1 | 0.1027 | 1 (0.0375) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_wsw | 24 -> 1 | 0.1027 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_wsw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_ene | 24 -> 1 | 0.1027 | 1 (0.0375) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ene 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_nw | 24 -> 1 | 0.1027 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | call_response | 24 -> 1 | 0.1027 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | call_response 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_s | 24 -> 1 | 0.1027 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_s 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | sleep_to_sleeping | 24 -> 1 | 0.1027 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleep_to_sleeping 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | click_surprised | 24 -> 1 | 0.1027 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | click_surprised 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_w | 24 -> 1 | 0.1027 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_w 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | shy | 24 -> 1 | 0.1027 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | shy 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_e | 24 -> 1 | 0.1027 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_e 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | poke_annoyed_to_idle | 24 -> 1 | 0.1027 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | poke_annoyed_to_idle 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | look_nne | 24 -> 1 | 0.1027 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nne 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_nnw | 24 -> 1 | 0.1026 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nnw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | waking | 24 -> 1 | 0.1026 | 1 (0.0376) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | waking 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | cursor_watch | 24 -> 1 | 0.1026 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | cursor_watch 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | waking_to_idle | 24 -> 1 | 0.1026 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | waking_to_idle 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | look_wnw | 24 -> 1 | 0.1026 | 1 (0.0374) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_wnw 是可被用户触发的交互动作 |
| medium | 回切 | look_ese | idle_primary | 120 -> 1 | 0.1004 | 5 (0.0353) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ese 播放结束后回到 idle_primary |
| medium | 回切 | look_e | idle_primary | 120 -> 1 | 0.1003 | 1 (0.0376) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_e 播放结束后回到 idle_primary |
| low | 回切 | look_se | idle_primary | 120 -> 1 | 0.0999 | 1 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_se 播放结束后回到 idle_primary |
| low | 回切 | look_wnw | idle_primary | 120 -> 1 | 0.0997 | 1 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_wnw 播放结束后回到 idle_primary |
| low | 回切 | look_wsw | idle_primary | 120 -> 1 | 0.0983 | 1 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_wsw 播放结束后回到 idle_primary |
| low | 回切 | look_nne | idle_primary | 120 -> 1 | 0.0971 | 1 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_nne 播放结束后回到 idle_primary |
| low | 进入 | idle_primary | paw_raise | 24 -> 1 | 0.0961 | 1 (0.0155) | not-applicable | Canvas crossfade | 当前可接受，低频复查即可 | paw_raise 是可被用户触发的交互动作 |
| low | 回切 | look_sw | idle_primary | 120 -> 1 | 0.0961 | 8 (0.0327) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_sw 播放结束后回到 idle_primary |
| low | 回切 | look_ne | idle_primary | 120 -> 1 | 0.0907 | 5 (0.0363) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_ne 播放结束后回到 idle_primary |
| low | 回切 | look_nnw | idle_primary | 120 -> 1 | 0.0902 | 1 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_nnw 播放结束后回到 idle_primary |
| low | 回切 | look_s | idle_primary | 120 -> 1 | 0.0901 | 2 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_s 播放结束后回到 idle_primary |
| low | 回切 | look_ene | idle_primary | 120 -> 1 | 0.0876 | 1 (0.0375) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_ene 播放结束后回到 idle_primary |
| low | 回切 | sleep_to_sleeping | sleeping | 120 -> 1 | 0.0771 | 1 (0.0108) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | sleep_to_sleeping 播放结束后回到 sleeping |
| low | 回切 | cursor_watch | idle_primary | 120 -> 1 | 0.0692 | 1 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | cursor_watch 播放结束后回到 idle_primary |
| low | 回切 | call_response | idle_primary | 120 -> 1 | 0.0641 | 5 (0.0365) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | call_response 播放结束后回到 idle_primary |
| low | 回切 | look_w | idle_primary | 120 -> 1 | 0.0564 | 1 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_w 播放结束后回到 idle_primary |
| low | 回切 | dragging | idle_primary | 120 -> 1 | 0.0529 | 14 (0.0364) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | dragging 播放结束后回到 idle_primary |
| low | 回切 | paw_raise_to_idle | idle_primary | 1 -> 1 | 0.0376 | 1 (0.0376) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | paw_raise_to_idle 播放结束后回到 idle_primary |
| low | 回切 | waking_to_idle | idle_primary | 1 -> 1 | 0.0374 | 1 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | waking_to_idle 播放结束后回到 idle_primary |
| low | 回切 | poke_annoyed_to_idle | idle_primary | 1 -> 1 | 0.0374 | 1 (0.0374) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | poke_annoyed_to_idle 播放结束后回到 idle_primary |
