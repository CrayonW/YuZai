# 第一波 runtime 接入候选时间轴抽样审查

日期：2026-06-17
范围：第一波 P1 候选动作 `click_surprised`、`poke_annoyed`、`call_response`、`stretch_yawn`

## 抽样证据

| action | 源视频 | 时间轴抽样 | 初筛结论 |
| --- | --- | --- | --- |
| `click_surprised` | `assets/origin/generated/kling/click_surprised.mp4` | `assets/reviews/kling-generated/click_surprised_sweep.png` | 未发现文字、水印、logo、额外物体；张嘴/惊讶姿态明确，适合单次点击反馈候选。 |
| `poke_annoyed` | `assets/origin/generated/kling/poke_annoyed.mp4` | `assets/reviews/kling-generated/poke_annoyed_sweep.png` | 未发现文字、水印、logo、额外物体；部分帧尾巴和身体接近左侧/底部边缘，后续抽帧裁切要重点检查。 |
| `call_response` | `assets/origin/generated/kling/call_response.mp4` | `assets/reviews/kling-generated/call_response_sweep.png` | 未发现文字、水印、logo、额外物体；张嘴回应姿态明确，适合气泡提醒或召唤回应候选。 |
| `stretch_yawn` | `assets/origin/generated/kling/stretch_yawn.mp4` | `assets/reviews/kling-generated/stretch_yawn_sweep.png` | 未发现文字、水印、logo、额外物体；动作更像张嘴打哈欠并抬前爪，伸展幅度不大，适合作为休息提醒候选但不应预期为完整伸懒腰。 |

## 接入前风险

- 这些结果仍是抽样初筛，不等于全程人工播放检查。
- `poke_annoyed` 需要额外检查抽帧后是否裁切尾巴、脚掌或身体边缘。
- `stretch_yawn` 的命名和实际表现略有差异，第一波接入时 UI/调度应把它看作“休息提醒/打哈欠”动作。

## 下一步

1. 用户确认 `docs/runtime-intake-wave1-checklist.md` 后，再逐视频全程播放检查。
2. 全程检查通过后，才能执行去水印/抠绿、抽帧和 manifest 接入。
3. 接入后必须做桌面截图/序列验收，确认点击、鼠标靠近和提醒动作实际可见。
