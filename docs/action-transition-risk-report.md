# 动作衔接风险报告

生成来源：assets/runtime/animations/manifest.json
运行时 action 数：42
检查切换数：60
风险摘要：high 4 / medium 48 / low 8

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
| high | 回切 | sleep | sleeping | 120 -> 1 | 0.3445 | 1 (0.0300) | tail-not-recovered | sleep_to_sleeping | 已配置 sleep_to_sleeping，需桌面录屏确认 | sleep 播放结束后回到 sleeping |
| high | 回切 | waking | idle_primary | 120 -> 1 | 0.2512 | 8 (0.0691) | tail-not-recovered | waking_to_idle | 已配置 waking_to_idle，需桌面录屏确认 | waking 播放结束后回到 idle_primary |
| high | 回切 | poke_annoyed | idle_primary | 120 -> 1 | 0.2248 | 17 (0.0774) | tail-not-recovered | poke_annoyed_to_idle | 已配置 poke_annoyed_to_idle，需桌面录屏确认 | poke_annoyed 播放结束后回到 idle_primary |
| high | 回切 | paw_raise | idle_primary | 72 -> 96 | 0.1993 | 1 (0.0535) | tail-not-recovered | paw_raise_to_idle | 已配置 paw_raise_to_idle，需桌面录屏确认 | paw_raise 播放结束后回到 idle_primary |
| medium | 回切 | sleepy | sleep | 120 -> 1 | 0.1681 | 2 (0.0451) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleepy 播放结束后回到 sleep |
| medium | 回切 | look_sse | idle_primary | 120 -> 96 | 0.1390 | 8 (0.0734) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sse 播放结束后回到 idle_primary |
| medium | 回切 | look_ssw | idle_primary | 120 -> 1 | 0.1279 | 22 (0.0733) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ssw 播放结束后回到 idle_primary |
| medium | 回切 | look_ne | idle_primary | 120 -> 1 | 0.1276 | 8 (0.0689) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ne 播放结束后回到 idle_primary |
| medium | 回切 | look_wnw | idle_primary | 120 -> 1 | 0.1271 | 8 (0.0772) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_wnw 播放结束后回到 idle_primary |
| medium | 回切 | look_nne | idle_primary | 120 -> 96 | 0.1261 | 8 (0.0753) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nne 播放结束后回到 idle_primary |
| medium | 进入 | idle_primary | sleep | 96 -> 1 | 0.1256 | 4 (0.0892) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleep 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | paw_raise_to_idle | 96 -> 1 | 0.1243 | 4 (0.0911) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | paw_raise_to_idle 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | look_e | 96 -> 1 | 0.1240 | 4 (0.0909) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_e 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_wnw | 96 -> 1 | 0.1239 | 4 (0.0906) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_wnw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | click_surprised | 96 -> 1 | 0.1237 | 7 (0.0900) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | click_surprised 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_ene | 96 -> 1 | 0.1236 | 4 (0.0903) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ene 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_sse | 96 -> 1 | 0.1230 | 5 (0.0898) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sse 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | dragging | 96 -> 1 | 0.1228 | 4 (0.0888) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | dragging 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | waking | 96 -> 1 | 0.1225 | 4 (0.0881) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | waking 是姿势链路过渡动作 |
| medium | 回切 | look_se | idle_primary | 120 -> 1 | 0.1223 | 8 (0.0698) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_se 播放结束后回到 idle_primary |
| medium | 进入 | idle_primary | look_nw | 96 -> 1 | 0.1219 | 4 (0.0879) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_nne | 96 -> 1 | 0.1219 | 4 (0.0880) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nne 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_se | 96 -> 1 | 0.1218 | 4 (0.0876) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_se 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_n | 96 -> 1 | 0.1217 | 4 (0.0878) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_n 是可被用户触发的交互动作 |
| medium | 回切 | click_surprised | idle_primary | 120 -> 96 | 0.1217 | 9 (0.0621) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | click_surprised 播放结束后回到 idle_primary |
| medium | 回切 | look_ese | idle_primary | 120 -> 1 | 0.1212 | 7 (0.0692) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ese 播放结束后回到 idle_primary |
| medium | 回切 | look_n | idle_primary | 120 -> 96 | 0.1192 | 4 (0.0704) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_n 播放结束后回到 idle_primary |
| medium | 回切 | look_wsw | idle_primary | 120 -> 1 | 0.1188 | 8 (0.0740) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_wsw 播放结束后回到 idle_primary |
| medium | 回切 | look_nw | idle_primary | 120 -> 1 | 0.1158 | 42 (0.0735) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nw 播放结束后回到 idle_primary |
| medium | 进入 | idle_primary | look_sw | 96 -> 1 | 0.1157 | 4 (0.0796) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | sleepy | 96 -> 1 | 0.1140 | 4 (0.0786) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleepy 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | look_ese | 96 -> 1 | 0.1138 | 5 (0.0786) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ese 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | call_response | 96 -> 1 | 0.1137 | 7 (0.0779) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | call_response 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | sleep_to_sleeping | 96 -> 1 | 0.1137 | 4 (0.0778) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | sleep_to_sleeping 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | look_wsw | 96 -> 1 | 0.1134 | 4 (0.0745) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_wsw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | poke_annoyed | 96 -> 1 | 0.1134 | 4 (0.0754) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | poke_annoyed 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_s | 96 -> 1 | 0.1133 | 7 (0.0774) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_s 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | poke_annoyed_to_idle | 96 -> 1 | 0.1127 | 4 (0.0736) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | poke_annoyed_to_idle 是姿势链路过渡动作 |
| medium | 进入 | idle_primary | look_ne | 96 -> 1 | 0.1124 | 4 (0.0767) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ne 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_ssw | 96 -> 1 | 0.1122 | 4 (0.0765) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_ssw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | waking_to_idle | 96 -> 1 | 0.1120 | 4 (0.0760) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | waking_to_idle 是姿势链路过渡动作 |
| medium | 回切 | look_e | idle_primary | 120 -> 1 | 0.1115 | 12 (0.0670) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_e 播放结束后回到 idle_primary |
| medium | 进入 | idle_primary | look_nnw | 96 -> 1 | 0.1112 | 5 (0.0765) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nnw 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | cursor_watch | 96 -> 1 | 0.1109 | 5 (0.0760) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | cursor_watch 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | look_w | 96 -> 1 | 0.1108 | 4 (0.0753) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_w 是可被用户触发的交互动作 |
| medium | 进入 | idle_primary | shy | 96 -> 1 | 0.1107 | 7 (0.0744) | not-applicable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | shy 是可被用户触发的交互动作 |
| medium | 回切 | look_nnw | idle_primary | 120 -> 1 | 0.1106 | 9 (0.0744) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_nnw 播放结束后回到 idle_primary |
| medium | 回切 | cursor_watch | idle_primary | 120 -> 1 | 0.1042 | 22 (0.0775) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | cursor_watch 播放结束后回到 idle_primary |
| medium | 回切 | call_response | idle_primary | 120 -> 1 | 0.1039 | 12 (0.0720) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | call_response 播放结束后回到 idle_primary |
| medium | 回切 | look_s | idle_primary | 120 -> 1 | 0.1036 | 5 (0.0716) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_s 播放结束后回到 idle_primary |
| medium | 回切 | look_sw | idle_primary | 120 -> 1 | 0.1030 | 7 (0.0652) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | look_sw 播放结束后回到 idle_primary |
| medium | 回切 | shy | idle_primary | 120 -> 96 | 0.1020 | 12 (0.0789) | acceptable | Canvas crossfade | 保留 Canvas crossfade，并用多帧截图复查 | shy 播放结束后回到 idle_primary |
| low | 进入 | idle_primary | paw_raise | 96 -> 1 | 0.0991 | 2 (0.0513) | not-applicable | Canvas crossfade | 当前可接受，低频复查即可 | paw_raise 是可被用户触发的交互动作 |
| low | 回切 | paw_raise_to_idle | idle_primary | 1 -> 1 | 0.0965 | 14 (0.0692) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | paw_raise_to_idle 播放结束后回到 idle_primary |
| low | 回切 | sleep_to_sleeping | sleeping | 120 -> 1 | 0.0922 | 1 (0.0512) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | sleep_to_sleeping 播放结束后回到 sleeping |
| low | 回切 | look_ene | idle_primary | 120 -> 96 | 0.0900 | 3 (0.0806) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_ene 播放结束后回到 idle_primary |
| low | 回切 | look_w | idle_primary | 120 -> 1 | 0.0873 | 6 (0.0771) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | look_w 播放结束后回到 idle_primary |
| low | 回切 | poke_annoyed_to_idle | idle_primary | 1 -> 1 | 0.0854 | 3 (0.0739) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | poke_annoyed_to_idle 播放结束后回到 idle_primary |
| low | 回切 | waking_to_idle | idle_primary | 1 -> 1 | 0.0824 | 12 (0.0764) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | waking_to_idle 播放结束后回到 idle_primary |
| low | 回切 | dragging | idle_primary | 120 -> 1 | 0.0754 | 14 (0.0699) | acceptable | Canvas crossfade | 当前可接受，低频复查即可 | dragging 播放结束后回到 idle_primary |
