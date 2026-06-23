# 桌宠动作自然度长时间观察报告

用途：把桌宠动作自然度、衔接风险和桌面截图证据汇总到一个可复查入口。本报告不批准生成新视频、不覆盖 runtime、不修改 manifest。

## 当前摘要

- runtime action 数：42
- 衔接风险：high 4 / medium 48 / low 8
- runtime 时长不足动作数：17
- 桌面观察截图：12 张，440x440，变化帧 12
- 观察证据状态：通过

## 观察证据

- 截图目录：`assets/reviews/runtime/naturalness-observation`
- 截图命名：`yuzai-window-naturalness-001.png` 到 `yuzai-window-naturalness-012.png`
- 桌面观察命令：

```bash
YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-naturalness.png YUZAI_CAPTURE_SEQUENCE_COUNT=12 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=300 YUZAI_CAPTURE_DELAY_MS=900 npm run dev
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-naturalness.png --count 12 --min-changed-frames 6 --min-width 200 --min-height 200
```

### 证据检查

- 截图序列完整，尺寸和变化帧检查通过。

## high 风险回切

- sleep -> sleeping（回切，metric 0.2606）：已配置 sleep_to_sleeping，需桌面录屏确认
- waking -> idle_primary（回切，metric 0.2512）：已配置 waking_to_idle，需桌面录屏确认
- poke_annoyed -> idle_primary（回切，metric 0.2248）：已配置 poke_annoyed_to_idle，需桌面录屏确认
- paw_raise -> idle_primary（回切，metric 0.1939）：已配置 paw_raise_to_idle，需桌面录屏确认

## runtime 时长不足示例

- `walk`：当前 72 帧（约 3s），契约需要 144 帧（6s）。
- `look_e`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_ene`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_ne`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_nne`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_n`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_nnw`：当前 120 帧（约 5s），契约需要 192 帧（8s）。
- `look_nw`：当前 120 帧（约 5s），契约需要 192 帧（8s）。

## 观察边界

- 本轮只观察和生成报告。
- 不调用可灵生成视频。
- 不新增或覆盖 `assets/runtime/animations/*/frames`。
- 不修改 `assets/runtime/animations/manifest.json`。

## 后续优先级

1. 如果用户继续反馈动作衔接生硬，优先处理 high 风险回切：`sleep -> sleeping`、`waking -> idle_primary`、`poke_annoyed -> idle_primary`、`paw_raise -> idle_primary`。
2. 如果鼠标跟随仍不明显，优先复查 `assets/reviews/runtime/mouse-follow-16/` 和本报告截图，确认进入延迟是否来自测试时序还是动作本身。
3. 如果长时间待机重复感明显，优先生成更长 daily 动作或分段合并素材，但必须先列清单确认。

## 复查命令

```bash
npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md
npm run validate:runtime-naturalness-observation
npm run validate:all
```
