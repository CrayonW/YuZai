# 可灵批次产物状态

批次：第一批：降低疲劳与关键交互 (fatigue-and-key-interaction)
汇总：ready 0 / empty 0 / missing 4 / total 4

| action | status | size | output |
| --- | --- | ---: | --- |
| groom_face_wash | missing | 0 | assets/origin/generated/kling/groom_face_wash.mp4 |
| loaf_breathing | missing | 0 | assets/origin/generated/kling/loaf_breathing.mp4 |
| cursor_watch | missing | 0 | assets/origin/generated/kling/cursor_watch.mp4 |
| click_surprised | missing | 0 | assets/origin/generated/kling/click_surprised.mp4 |

## 最近一次生成阻塞

- 类型：余额不足
- 信息：可灵账号余额不足，真实视频没有生成。
- 处理：账号余额补足后，重新运行批次生成命令。

## 下一步

- 生成缺失视频：`npm run kling:generate-batch -- --batch 1`
- 生成后先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。
- 通过人工检查后，再运行素材接入清单并进入抽帧/manifest 流程。
