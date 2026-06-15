## 桌宠状态动作覆盖报告

状态总数：13
运行时 action 数：6
覆盖摘要：independent 6 / mixed 0 / fallback 7 / missing 0

| state | status | runtime actions | source | prompt hint |
| --- | --- | --- | --- | --- |
| idle | independent | idle_primary | assets/origin/鱼仔待机动作1.mp4 | 无 |
| walk | independent | walk | assets/origin/鱼仔走路视频.mp4 | prompt: walk |
| walk_left | independent | walk_left | assets/origin/鱼仔走路视频.mp4 | prompt: walk |
| walking | independent | walk_left、walk | assets/origin/鱼仔走路视频.mp4 | prompt: walk |
| sleep | fallback | idle_primary | assets/origin/鱼仔待机动作1.mp4 | prompt: sleep |
| sleepy | fallback | idle_primary | assets/origin/鱼仔待机动作1.mp4 | prompt: sleepy |
| sleeping | fallback | idle_primary | assets/origin/鱼仔待机动作1.mp4 | prompt: sleeping |
| waking | fallback | idle_primary | assets/origin/鱼仔待机动作1.mp4 | prompt: waking |
| surprised | fallback | idle_primary | assets/origin/鱼仔待机动作1.mp4 | prompt: click_surprised |
| shy | fallback | idle_primary | assets/origin/鱼仔待机动作1.mp4 | prompt: shy |
| dragging | fallback | idle_primary | assets/origin/鱼仔待机动作1.mp4 | prompt: dragging |
| waving | independent | paw_raise | assets/origin/鱼仔前肢抬起视频.mp4 | prompt: paw_raise |
| teaser | independent | paw_raise | assets/origin/鱼仔前肢抬起视频.mp4 | prompt: paw_raise |
