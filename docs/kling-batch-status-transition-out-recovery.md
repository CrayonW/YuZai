# 可灵批次产物状态

批次：第四批：高风险回切过渡 (transition-out-recovery)
汇总：ready 0 / empty 0 / missing 4 / total 4

| action | status | size | output |
| --- | --- | ---: | --- |
| sleep_to_sleeping | missing | 0 | assets/origin/generated/kling/sleep_to_sleeping.mp4 |
| waking_to_idle | missing | 0 | assets/origin/generated/kling/waking_to_idle.mp4 |
| poke_annoyed_to_idle | missing | 0 | assets/origin/generated/kling/poke_annoyed_to_idle.mp4 |
| paw_raise_to_idle | missing | 0 | assets/origin/generated/kling/paw_raise_to_idle.mp4 |

## 下一步

- 生成缺失视频：`npm run kling:generate-batch -- --batch transition-out-recovery`
- 生成后先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。
- 通过人工检查后，再运行素材接入清单并进入抽帧/manifest 流程。
