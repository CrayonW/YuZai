# 运行时动作桥接矩阵

本文档由 `npm run runtime:action-bridge-report -- --write docs/runtime-action-bridge-report.md` 生成，用于检查提醒、鼠标、点击和拖拽入口会优先请求哪些动作，以及这些动作当前是否已经接入运行时 manifest。

## 汇总

- 当前 manifest 可播放动作：idle_primary、idle_secondary、tail_wag、walk、walk_left、paw_raise
- 可播放动作数量：6
- 候选缺失数量：12

## 矩阵

| 触发入口 | 优先级 | action | 状态 | 帧数 |
| --- | ---: | --- | --- | ---: |
| 喝水提醒 | 1 | call_response | missing | 0 |
| 喝水提醒 | 2 | cursor_watch | missing | 0 |
| 休息提醒 | 1 | stretch_yawn | missing | 0 |
| 休息提醒 | 2 | sleepy | missing | 0 |
| 休息提醒 | 3 | sleep | missing | 0 |
| 鼠标靠近 | 1 | cursor_watch | missing | 0 |
| 鼠标靠近 | 2 | paw_raise | ready | 72 |
| 普通点击 | 1 | click_surprised | missing | 0 |
| 普通点击 | 2 | paw_raise | ready | 72 |
| 多次点击 | 1 | poke_annoyed | missing | 0 |
| 多次点击 | 2 | shy | missing | 0 |
| 多次点击 | 3 | paw_raise | ready | 72 |
| 睡眠叫醒 | 1 | waking | missing | 0 |
| 睡眠叫醒 | 2 | click_surprised | missing | 0 |
| 睡眠叫醒 | 3 | paw_raise | ready | 72 |
| 拖拽开始 | 1 | dragging | missing | 0 |
| 拖拽开始 | 2 | paw_raise | ready | 72 |

## 接入说明

- `ready` 表示该动作已经在 `assets/runtime/animations/manifest.json` 中启用且帧数大于 0。
- `missing` 表示桥接入口已经准备好，但对应视频尚未生成、抽帧或接入 manifest。
- 后续可灵视频生成后，先按素材清单确认，再做水印检查/去水印、抽帧和 manifest 接入；接入完成后重新生成本文档。
