# 可灵视频生成优先批次

本文档用于在可灵 API 鉴权通过后，按优先级生成真实小猫桌宠动作视频。

前置要求：先运行 auth-check，确认可灵 API 鉴权通过，再按批次生成。

生成前仍需遵守项目规则：新增、删除或覆盖素材前，先列清单给用户确认；生成后先人工检查无水印、无文字、无 logo、全身入镜，再进入抽帧和 manifest 接入。

## 第一批：降低疲劳与关键交互

优先补最像真实小猫生活的长日常动作，并让鼠标/点击拥有专属反馈。

| action | 分类 | 时长 | 输出 | 覆盖状态 | 生成命令 |
| --- | --- | ---: | --- | --- | --- |
| groom_face_wash | daily | 8s | assets/origin/generated/kling/groom_face_wash.mp4 | - | `npm run kling:generate -- --action groom_face_wash` |
| loaf_breathing | daily | 8s | assets/origin/generated/kling/loaf_breathing.mp4 | - | `npm run kling:generate -- --action loaf_breathing` |
| cursor_watch | interactive | 4s | assets/origin/generated/kling/cursor_watch.mp4 | - | `npm run kling:generate -- --action cursor_watch` |
| click_surprised | interactive | 4s | assets/origin/generated/kling/click_surprised.mp4 | surprised | `npm run kling:generate -- --action click_surprised` |

## 第二批：睡眠作息链路

补齐变困、入睡、睡着、唤醒，让桌宠有更真实的日常作息。

| action | 分类 | 时长 | 输出 | 覆盖状态 | 生成命令 |
| --- | --- | ---: | --- | --- | --- |
| sleepy | daily | 6s | assets/origin/generated/kling/sleepy.mp4 | sleepy | `npm run kling:generate -- --action sleepy` |
| sleep | daily | 6s | assets/origin/generated/kling/sleep.mp4 | sleep | `npm run kling:generate -- --action sleep` |
| sleeping | daily | 8s | assets/origin/generated/kling/sleeping.mp4 | sleeping | `npm run kling:generate -- --action sleeping` |
| waking | interactive | 4s | assets/origin/generated/kling/waking.mp4 | waking | `npm run kling:generate -- --action waking` |

## 第三批：剩余状态与生活化变化

补齐剩余 fallback 状态，并增加好奇、伸懒腰、拖拽等变化。

| action | 分类 | 时长 | 输出 | 覆盖状态 | 生成命令 |
| --- | --- | ---: | --- | --- | --- |
| desk_sniff | daily | 6s | assets/origin/generated/kling/desk_sniff.mp4 | - | `npm run kling:generate -- --action desk_sniff` |
| stretch_yawn | daily | 6s | assets/origin/generated/kling/stretch_yawn.mp4 | - | `npm run kling:generate -- --action stretch_yawn` |
| poke_annoyed | interactive | 4s | assets/origin/generated/kling/poke_annoyed.mp4 | - | `npm run kling:generate -- --action poke_annoyed` |
| shy | interactive | 4s | assets/origin/generated/kling/shy.mp4 | shy | `npm run kling:generate -- --action shy` |
| dragging | interactive | 4s | assets/origin/generated/kling/dragging.mp4 | dragging | `npm run kling:generate -- --action dragging` |
| call_response | interactive | 4s | assets/origin/generated/kling/call_response.mp4 | - | `npm run kling:generate -- --action call_response` |

## 批次后处理

1. 每个视频生成后先人工检查：猫咪身份一致、无水印、无 logo、无文字、全身入镜、绿幕稳定。
2. 通过后运行 `npm run animations:intake-checklist`，列出本批次要接入的源视频、action、分类和目标路径。
3. 得到确认后再执行去水印/抠绿、序列帧生成、manifest 更新和桌面多帧截图验收。
4. 每完成一个 MVP 可见能力，提交并推送到 GitHub。
