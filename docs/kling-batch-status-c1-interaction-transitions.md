# 可灵批次产物状态

批次：第六批：C1 互动动作专用过渡 (c1-interaction-transitions)
汇总：ready 8 / empty 0 / missing 0 / total 8

| action | status | size | output |
| --- | --- | ---: | --- |
| idle_primary_to_paw_raise | ready | 7032094 | assets/origin/generated/kling/idle_primary_to_paw_raise.mp4 |
| paw_raise_to_idle_primary | ready | 7039161 | assets/origin/generated/kling/paw_raise_to_idle_primary.mp4 |
| idle_primary_to_cursor_watch | ready | 7142592 | assets/origin/generated/kling/idle_primary_to_cursor_watch.mp4 |
| cursor_watch_to_idle_primary | ready | 6546810 | assets/origin/generated/kling/cursor_watch_to_idle_primary.mp4 |
| idle_primary_to_click_surprised | ready | 6657090 | assets/origin/generated/kling/idle_primary_to_click_surprised.mp4 |
| click_surprised_to_idle_primary | ready | 6797937 | assets/origin/generated/kling/click_surprised_to_idle_primary.mp4 |
| idle_primary_to_poke_annoyed | ready | 7078768 | assets/origin/generated/kling/idle_primary_to_poke_annoyed.mp4 |
| poke_annoyed_to_idle_primary | ready | 6848643 | assets/origin/generated/kling/poke_annoyed_to_idle_primary.mp4 |

## 下一步

- 生成缺失视频：`npm run kling:generate-batch -- --batch c1-interaction-transitions`
- 生成后先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。
- 通过人工检查后，再运行素材接入清单并进入抽帧/manifest 流程。
