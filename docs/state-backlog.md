## 13 状态动作补齐待办

待补状态数：7

先生成/补充源视频，再运行素材处理前确认清单，确认后才允许抽帧、覆盖 runtime 路径或修改 manifest。

| state | suggested action | category | planned output | current action | next step |
| --- | --- | --- | --- | --- | --- |
| sleep | 待补提示词 | 待确认 | 待确认 | idle_primary | 先补动作提示词和目标 action |
| sleepy | 待补提示词 | 待确认 | 待确认 | idle_primary | 先补动作提示词和目标 action |
| sleeping | 待补提示词 | 待确认 | 待确认 | idle_primary | 先补动作提示词和目标 action |
| waking | waking | interactive | assets/origin/generated/kling/waking.mp4 | idle_primary | 生成源视频并接入 manifest |
| surprised | click_surprised | interactive | assets/origin/generated/kling/click_surprised.mp4 | idle_primary | 生成源视频并接入 manifest |
| shy | shy | interactive | assets/origin/generated/kling/shy.mp4 | idle_primary | 生成源视频并接入 manifest |
| dragging | dragging | interactive | assets/origin/generated/kling/dragging.mp4 | idle_primary | 生成源视频并接入 manifest |
