# 可灵批次产物状态

批次：第一批：降低疲劳与关键交互 (fatigue-and-key-interaction)
汇总：ready 4 / empty 0 / missing 0 / total 4

| action | status | size | output |
| --- | --- | ---: | --- |
| groom_face_wash | ready | 7333436 | assets/origin/generated/kling/groom_face_wash.mp4 |
| loaf_breathing | ready | 5427337 | assets/origin/generated/kling/loaf_breathing.mp4 |
| cursor_watch | ready | 6248472 | assets/origin/generated/kling/cursor_watch.mp4 |
| click_surprised | ready | 6447862 | assets/origin/generated/kling/click_surprised.mp4 |

## 下一步

- 生成缺失视频：`npm run kling:generate-batch -- --batch 1`
- 生成后先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。
- 通过人工检查后，再运行素材接入清单并进入抽帧/manifest 流程。
