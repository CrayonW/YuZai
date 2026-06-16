# 可灵批次产物状态

批次：第三批：剩余状态与生活化变化 (remaining-state-and-variety)
汇总：ready 6 / empty 0 / missing 0 / total 6

| action | status | size | output |
| --- | --- | ---: | --- |
| desk_sniff | ready | 6532065 | assets/origin/generated/kling/desk_sniff.mp4 |
| stretch_yawn | ready | 7024257 | assets/origin/generated/kling/stretch_yawn.mp4 |
| poke_annoyed | ready | 6835619 | assets/origin/generated/kling/poke_annoyed.mp4 |
| shy | ready | 6449961 | assets/origin/generated/kling/shy.mp4 |
| dragging | ready | 7698504 | assets/origin/generated/kling/dragging.mp4 |
| call_response | ready | 5719691 | assets/origin/generated/kling/call_response.mp4 |

## 下一步

- 生成缺失视频：`npm run kling:generate-batch -- --batch remaining-state-and-variety`
- 生成后先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。
- 通过人工检查后，再运行素材接入清单并进入抽帧/manifest 流程。
