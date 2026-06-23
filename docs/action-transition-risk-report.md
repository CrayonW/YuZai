# 动作衔接风险报告

生成来源：assets/runtime/animations/manifest.json
运行时 action 数：42
检查切换数：60
风险摘要：high 4 / medium 34 / low 22

本文档由 `npm run animations:transition-risk -- --write docs/action-transition-risk-report.md` 生成，用于把“动作衔接太生硬”的主观反馈转成可复查的帧差异清单。指标使用 32x32 RGBA 缩略特征计算 RMSE，数值越高，说明切换前后帧差异越大，越需要补安全帧、重生成起止姿态或增加 `transitionIn` / `transitionOut` 专用动作。

## 当前结论

当前存在 4 个高风险切换。全局 Canvas 淡入淡出只能缓解闪切，不能替代专用过渡素材。

## 建议处理顺序

1. 先处理 high 风险里的鼠标靠近、点击、拖拽和睡眠链路，因为这些最容易被用户主动触发。
2. 对同一个动作同时存在进入和回切高风险时，优先生成一组 `transitionIn` / `transitionOut`。
3. 新视频进入 runtime 前，先刷新本报告，再结合桌面多帧截图或录屏判断是否覆盖 manifest。

## 切换明细

| risk | direction | from | to | best frame pair | metric | best source frame | tail diagnosis | current bridge | recommendation | reason |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| high | 回切 | sleep | sleeping | 48 -> 144 | 0.2606 | 1 (0.0300) | tail-not-recovered | sleep_to_sleeping | 已配置 sleep_to_sleeping，需桌面录屏确认 | sleep 播放结束后回到 sleeping |
| high | 回切 | waking | idle_primary | 120 -> 1 | 0.2512 | 8 (0.0691) | tail-not-recovered | waking_to_idle | 已配置 waking_to_idle，需桌面录屏确认 | waking 播放结束后回到 idle_primary |
| high | 回切 | poke_annoyed | idle_primary | 120 -> 1 | 0.2248 | 17 (0.0774) | tail-not-recovered | poke_annoyed_to_idle | 已配置 poke_annoyed_to_idle，需桌面录屏确认 | poke_annoyed 播放结束后回到 idle_primary |
| high | 回切 | paw_raise | idle_primary | 48 -> 96 | 0.1939 | 1 (0.0535) | tail-not-recovered | paw_raise_to_idle | 已配置 paw_raise_to_idle，需桌面录屏确认 | paw_raise 播放结束后回到 idle_primary |
| medium | 回切 | sleepy | sleep | 48 -> 1 | 0.1310 | 2 (0.0451) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleepy 播放结束后回到 sleep |
| medium | 进入 | idle_primary | sleep | 96 -> 1 | 0.1256 | 4 (0.0892) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleep 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | paw_raise_to_idle | 96 -> 1 | 0.1243 | 4 (0.0911) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | paw_raise_to_idle 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | click_surprised | 96 -> 1 | 0.1237 | 7 (0.0900) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | click_surprised 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | dragging | 96 -> 1 | 0.1228 | 4 (0.0888) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | dragging 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | waking | 96 -> 1 | 0.1225 | 4 (0.0881) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | waking 是姿势链路过渡动作 |
| medium | 回切 | click_surprised | idle_primary | 120 -> 96 | 0.1217 | 9 (0.0621) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | click_surprised 播放结束后回到 idle_primary |
| medium | 进入 | idle_primary | look_nw | 96 -> 48 | 0.1213 | 4 (0.0879) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_sw | 96 -> 1 | 0.1157 | 4 (0.0796) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_wnw | 96 -> 48 | 0.1143 | 4 (0.0906) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_wnw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | sleepy | 96 -> 1 | 0.1140 | 4 (0.0786) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleepy 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | call_response | 96 -> 1 | 0.1137 | 7 (0.0779) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | call_response 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | sleep_to_sleeping | 96 -> 1 | 0.1137 | 4 (0.0778) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleep_to_sleeping 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | poke_annoyed | 96 -> 1 | 0.1134 | 4 (0.0754) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | poke_annoyed 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | poke_annoyed_to_idle | 96 -> 1 | 0.1127 | 4 (0.0736) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | poke_annoyed_to_idle 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | waking_to_idle | 96 -> 1 | 0.1120 | 4 (0.0760) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | waking_to_idle 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | look_s | 96 -> 144 | 0.1112 | 7 (0.0774) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_s 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | cursor_watch | 96 -> 1 | 0.1109 | 5 (0.0760) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | cursor_watch 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | shy | 96 -> 1 | 0.1107 | 7 (0.0744) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | shy 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_ene | 96 -> 48 | 0.1107 | 7 (0.0864) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ene 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_wsw | 96 -> 48 | 0.1106 | 4 (0.0745) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_wsw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_ese | 96 -> 144 | 0.1099 | 5 (0.0786) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ese 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_ne | 96 -> 48 | 0.1090 | 4 (0.0767) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ne 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_sse | 96 -> 144 | 0.1083 | 7 (0.0896) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sse 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_nnw | 96 -> 144 | 0.1080 | 5 (0.0765) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nnw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_se | 96 -> 48 | 0.1077 | 4 (0.0876) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_se 是可被用户触发的交互动作 |
| medium | 回切 | look_sw | idle_primary | 48 -> 1 | 0.1064 | 7 (0.0652) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sw 播放结束后回到 idle_primary |
| medium | 进入 | idle_primary | look_e | 96 -> 48 | 0.1054 | 4 (0.0860) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_e 是可被用户触发的交互动作 |
| medium | 回切 | cursor_watch | idle_primary | 120 -> 1 | 0.1042 | 22 (0.0775) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | cursor_watch 播放结束后回到 idle_primary |
| medium | 回切 | call_response | idle_primary | 120 -> 1 | 0.1039 | 12 (0.0720) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | call_response 播放结束后回到 idle_primary |
| medium | 回切 | look_wnw | idle_primary | 144 -> 1 | 0.1035 | 8 (0.0772) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_wnw 播放结束后回到 idle_primary |
| medium | 回切 | shy | idle_primary | 120 -> 96 | 0.1020 | 12 (0.0789) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | shy 播放结束后回到 idle_primary |
| medium | 进入 | idle_primary | look_n | 96 -> 48 | 0.1011 | 5 (0.0765) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_n 是可被用户触发的交互动作 |
| medium | 回切 | look_nw | idle_primary | 48 -> 1 | 0.1008 | 42 (0.0735) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nw 播放结束后回到 idle_primary |
| low | 进入 | idle_primary | look_ssw | 96 -> 144 | 0.0993 | 7 (0.0735) | not-applicable | Canvas crossfade | 当前可接受，低频复查即可 | look_ssw 是可被用户触发的交互动作 |
| low | 进入 | idle_primary | paw_raise | 96 -> 1 | 0.0991 | 2 (0.0513) | not-applicable | Canvas crossfade | 当前可接受，低频复查即可 | paw_raise 是可被用户触发的交互动作 |
| low | 进入 | idle_primary | look_nne | 96 -> 144 | 0.0983 | 5 (0.0699) | not-applicable | Canvas crossfade | 当前可接受，低频复查即可 | look_nne 是可被用户触发的交互动作 |
| low | 回切 | paw_raise_to_idle | idle_primary | 1 -> 1 | 0.0965 | 14 (0.0692) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | paw_raise_to_idle 播放结束后回到 idle_primary |
| low | 回切 | look_e | idle_primary | 144 -> 1 | 0.0951 | 12 (0.0670) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_e 播放结束后回到 idle_primary |
| low | 回切 | look_s | idle_primary | 144 -> 1 | 0.0942 | 5 (0.0716) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_s 播放结束后回到 idle_primary |
| low | 回切 | look_se | idle_primary | 144 -> 1 | 0.0920 | 8 (0.0698) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_se 播放结束后回到 idle_primary |
| low | 回切 | look_sse | idle_primary | 144 -> 1 | 0.0909 | 8 (0.0734) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_sse 播放结束后回到 idle_primary |
| low | 回切 | look_nnw | idle_primary | 144 -> 1 | 0.0909 | 9 (0.0744) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_nnw 播放结束后回到 idle_primary |
| low | 回切 | look_n | idle_primary | 144 -> 1 | 0.0907 | 4 (0.0704) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_n 播放结束后回到 idle_primary |
| low | 回切 | look_wsw | idle_primary | 144 -> 1 | 0.0895 | 8 (0.0740) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_wsw 播放结束后回到 idle_primary |
| low | 回切 | sleep_to_sleeping | sleeping | 120 -> 96 | 0.0892 | 5 (0.0497) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | sleep_to_sleeping 播放结束后回到 sleeping |
| low | 回切 | look_ene | idle_primary | 192 -> 96 | 0.0874 | 3 (0.0806) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_ene 播放结束后回到 idle_primary |
| low | 回切 | look_ne | idle_primary | 144 -> 1 | 0.0867 | 8 (0.0689) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_ne 播放结束后回到 idle_primary |
| low | 回切 | poke_annoyed_to_idle | idle_primary | 1 -> 1 | 0.0854 | 3 (0.0739) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | poke_annoyed_to_idle 播放结束后回到 idle_primary |
| low | 回切 | look_ese | idle_primary | 144 -> 1 | 0.0843 | 7 (0.0692) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_ese 播放结束后回到 idle_primary |
| low | 回切 | look_nne | idle_primary | 144 -> 1 | 0.0829 | 8 (0.0753) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_nne 播放结束后回到 idle_primary |
| low | 回切 | waking_to_idle | idle_primary | 1 -> 1 | 0.0824 | 12 (0.0764) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | waking_to_idle 播放结束后回到 idle_primary |
| low | 进入 | idle_primary | look_w | 96 -> 96 | 0.0815 | 16 (0.0669) | not-applicable | Canvas crossfade | 当前可接受，低频复查即可 | look_w 是可被用户触发的交互动作 |
| low | 回切 | look_w | idle_primary | 96 -> 96 | 0.0815 | 6 (0.0771) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_w 播放结束后回到 idle_primary |
| low | 回切 | look_ssw | idle_primary | 144 -> 1 | 0.0768 | 22 (0.0733) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_ssw 播放结束后回到 idle_primary |
| low | 回切 | dragging | idle_primary | 120 -> 1 | 0.0754 | 14 (0.0699) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | dragging 播放结束后回到 idle_primary |
