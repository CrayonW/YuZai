# 可灵批次产物状态

批次：第二批：睡眠作息链路 (sleep-routine)
汇总：ready 4 / empty 0 / missing 0 / total 4

| action | status | size | output |
| --- | --- | ---: | --- |
| sleepy | ready | 5519059 | assets/origin/generated/kling/sleepy.mp4 |
| sleep | ready | 7509762 | assets/origin/generated/kling/sleep.mp4 |
| sleeping | ready | 5501864 | assets/origin/generated/kling/sleeping.mp4 |
| waking | ready | 7114078 | assets/origin/generated/kling/waking.mp4 |

## 下一步

- 生成缺失视频：`npm run kling:generate-batch -- --batch sleep-routine`
- 生成后先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。
- 通过人工检查后，再运行素材接入清单并进入抽帧/manifest 流程。
