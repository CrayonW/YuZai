# runtime 动作时长补长清单

更新日期：2026-06-20

把 runtime_duration_short blocker 拆成可执行的补长动作清单。本文档不批准生成视频、抽帧、去水印或修改 manifest。

## 当前摘要

- runtime 时长不足动作数：30
- daily：13
- interactive：17
- transition：0

## 补长动作清单

| action | 分类 | 当前 | 契约目标 | 缺口 | 预期源视频 | 补长策略 |
| --- | --- | ---: | ---: | ---: | --- | --- |
| idle_primary | daily | 72 帧 / 3s | 192 帧 / 8s | 120 帧 / 5s | assets/origin/generated/kling/idle_primary.mp4 | 优先补 8 秒日常循环源视频，保持首尾安全帧接近。 |
| idle_secondary | daily | 72 帧 / 3s | 192 帧 / 8s | 120 帧 / 5s | assets/origin/generated/kling/idle_secondary.mp4 | 优先补 8 秒日常循环源视频，保持首尾安全帧接近。 |
| tail_wag | daily | 72 帧 / 3s | 192 帧 / 8s | 120 帧 / 5s | assets/origin/generated/kling/tail_wag.mp4 | 优先补 8 秒日常循环源视频，保持首尾安全帧接近。 |
| slow_blink | daily | 120 帧 / 5s | 144 帧 / 6s | 24 帧 / 1s | assets/origin/generated/kling/slow_blink.mp4 | 补充更长生活化分段素材，接入前复查尾段回到安全姿态。 |
| look_around | daily | 120 帧 / 5s | 144 帧 / 6s | 24 帧 / 1s | assets/origin/generated/kling/look_around.mp4 | 补充更长生活化分段素材，接入前复查尾段回到安全姿态。 |
| groom_face_wash | daily | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/groom_face_wash.mp4 | 补充更长生活化分段素材，接入前复查尾段回到安全姿态。 |
| loaf_breathing | daily | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/loaf_breathing.mp4 | 补长为可循环源视频，首尾姿态保持一致。 |
| desk_sniff | daily | 120 帧 / 5s | 144 帧 / 6s | 24 帧 / 1s | assets/origin/generated/kling/desk_sniff.mp4 | 补充更长生活化分段素材，接入前复查尾段回到安全姿态。 |
| stretch_yawn | daily | 120 帧 / 5s | 144 帧 / 6s | 24 帧 / 1s | assets/origin/generated/kling/stretch_yawn.mp4 | 补充更长生活化分段素材，接入前复查尾段回到安全姿态。 |
| sleepy | daily | 120 帧 / 5s | 144 帧 / 6s | 24 帧 / 1s | assets/origin/generated/kling/sleepy.mp4 | 补充更长生活化分段素材，接入前复查尾段回到安全姿态。 |
| sleep | daily | 120 帧 / 5s | 144 帧 / 6s | 24 帧 / 1s | assets/origin/generated/kling/sleep.mp4 | 补充更长生活化分段素材，接入前复查尾段回到安全姿态。 |
| sleeping | daily | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/sleeping.mp4 | 补长为可循环源视频，首尾姿态保持一致。 |
| walk | daily | 72 帧 / 3s | 144 帧 / 6s | 72 帧 / 3s | assets/origin/generated/kling/walk.mp4 | 补长为可循环源视频，首尾姿态保持一致。 |
| paw_raise | interactive | 72 帧 / 3s | 96 帧 / 4s | 24 帧 / 1s | assets/origin/generated/kling/paw_raise.mp4 | 补充更长交互源视频，结束姿态需能自然回到待机或后续 transitionOut。 |
| look_e | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_e.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_ene | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_ene.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_ne | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_ne.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_nne | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_nne.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_n | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_n.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_nnw | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_nnw.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_nw | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_nw.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_wnw | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_wnw.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_w | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_w.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_wsw | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_wsw.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_sw | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_sw.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_ssw | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_ssw.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_s | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_s.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_sse | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_sse.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_se | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_se.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |
| look_ese | interactive | 120 帧 / 5s | 192 帧 / 8s | 72 帧 / 3s | assets/origin/generated/kling/look_ese.mp4 | 重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。 |

## 处理规则

- 不得只修改 manifest 帧数来关闭时长缺口。
- 每个补长动作必须先补充更长源视频或分段素材，并完成人工水印检查。
- 进入 runtime 前必须完成去水印、抠绿、抽帧和 manifest 更新。
- 关闭 `runtime_duration_short` 前必须重新运行 `npm run animations:asset-contract -- --write docs/animation-asset-contract.md`、`npm run validate:all`、`npm run validate:release`。
- 涉及桌面观感的补长动作关闭前必须补充桌面多帧截图或录屏证据。

## 推荐执行顺序

1. 先补 `idle_primary`、`idle_secondary`、`tail_wag`，降低最常见待机重复感。
2. 再补 `groom_face_wash`、`loaf_breathing`、`sleeping` 等长时间陪伴动作。
3. 然后补 16 方向 `look_*` 鼠标跟随动作，让鼠标停留时动作长度足够。
4. 最后补短交互动作 `paw_raise`、`walk` 和睡眠链路中仍短的动作。

## 当前边界

- 本清单只描述补长范围，不生成视频。
- 本清单不抽帧、不去水印、不修改 `assets/runtime/animations/manifest.json`。
- 本清单不关闭 `runtime_duration_short` blocker。
