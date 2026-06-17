## 桌宠状态动作覆盖报告

状态总数：13
运行时 action 数：21
覆盖摘要：independent 12 / mixed 0 / fallback 1 / missing 0

| state | status | runtime actions | source | prompt hint |
| --- | --- | --- | --- | --- |
| idle | independent | idle_primary | assets/origin/鱼仔待机动作1.mp4 | 无 |
| walk | independent | walk | assets/origin/鱼仔走路视频.mp4 | prompt: walk |
| walk_left | independent | walk_left | assets/origin/鱼仔走路视频.mp4 | prompt: walk |
| walking | independent | walk_left、walk | assets/origin/鱼仔走路视频.mp4 | prompt: walk |
| sleep | independent | sleep | assets/origin/generated/kling/sleep.mp4 | prompt: sleep |
| sleepy | independent | sleepy | assets/origin/generated/kling/sleepy.mp4 | prompt: sleepy |
| sleeping | independent | sleeping | assets/origin/generated/kling/sleeping.mp4 | prompt: sleeping |
| waking | independent | waking | assets/origin/generated/kling/waking.mp4 | prompt: waking |
| surprised | independent | click_surprised | assets/origin/generated/kling/click_surprised.mp4 | prompt: click_surprised |
| shy | independent | shy | assets/origin/generated/kling/shy.mp4 | prompt: shy |
| dragging | fallback | idle_primary | assets/origin/鱼仔待机动作1.mp4 | prompt: dragging |
| waving | independent | paw_raise | assets/origin/鱼仔前肢抬起视频.mp4 | prompt: paw_raise |
| teaser | independent | cursor_watch | assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4 | prompt: paw_raise |
