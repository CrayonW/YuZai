# 真实小猫行为调度策略

本文档由 `docs/kling-action-generation-plan.json` 派生，用于说明后续真实视频和运行时 manifest 补齐后，桌宠应如何安排日常动作、交互动作和睡眠链路。

## 调度原则

- 日常动作间隔：45-150 秒，避免短时间重复。
- 日常动作优先使用 6 秒以上的视频。
- 不连续播放同一个日常变化动作。
- 用户交互优先级高于日常动作，交互结束后回到 `idle_primary` 或当前日常基础姿势。
- 只有动作已经生成源视频、抽帧并写入运行时 manifest 后，播放器才允许真正调度该动作。

## 日常动作池

| action | 时长 | 循环 | 冷却 | 作用 |
| --- | ---: | --- | ---: | --- |
| idle_primary | 8s | 是 | 0s | 主待机，提供长时间稳定陪伴，不抢用户注意力 |
| tail_wag | 8s | 是 | 360s | 安静摇尾，作为低强度循环变化 |
| idle_secondary | 8s | 是 | 240s | 备用待机，替代主待机降低重复感 |
| slow_blink | 6s | 否 | 480s | 亲近感插入动作，像小猫在陪用户 |
| look_around | 6s | 否 | 420s | 环境观察，让桌宠显得有自己的注意力 |
| groom_face_wash | 8s | 否 | 900s | 真实小猫生活动作，提供强烈陪伴感 |
| loaf_breathing | 8s | 是 | 1200s | 香箱趴长陪伴状态，可替代长时间坐姿 |
| desk_sniff | 6s | 否 | 600s | 好奇探索动作，让猫像在电脑桌面生活 |
| stretch_yawn | 6s | 否 | 1500s | 作息变化动作，可连接休息提醒或睡前状态 |
| sleepy | 6s | 否 | 1200s | 睡眠链路入口，让日常作息更像真实小猫 |
| sleep | 6s | 否 | 1200s | 入睡过渡，让状态变化有过程 |
| sleeping | 8s | 是 | 1200s | 睡着循环，提供低打扰长期陪伴 |
| walk | 6s | 是 | 300s | 桌面移动动作，让宠物能换位置而不是固定站桩 |

## 交互触发

| 触发 | 主动作 | 兜底动作 | 循环动作 | 冷却 | 回切 |
| --- | --- | --- | --- | ---: | --- |
| 鼠标靠近 | cursor_watch | paw_raise | - | 6s | idle_primary |
| 单次点击 | click_surprised | paw_raise | - | 8s | idle_primary |
| 连续点击 | poke_annoyed | shy | - | 20s | idle_primary |
| 拖拽移动 | dragging | paw_raise | dragging | 0s | idle_primary |
| 唤醒 | waking | idle_primary | - | 60s | idle_primary |
| 召唤回应 | call_response | paw_raise | - | 20s | idle_primary |

## 睡眠链路

推荐顺序：sleepy -> sleep -> sleeping -> waking

睡眠链路不应随机打散。`sleepy` 表示变困，`sleep` 表示入睡过渡，`sleeping` 表示睡着循环，用户靠近或点击时再用 `waking` 回到清醒状态。

## 过渡候选

| action | 时长 | 作用 |
| --- | ---: | --- |
| idle_to_paw_raise | 2s | 待机到抬爪的衔接，降低序列帧切换突兀感 |
| paw_raise_to_idle | 2s | 抬爪回待机的衔接，降低回切跳变 |
| idle_to_cursor_watch | 2s | 待机到注视鼠标的衔接，支持鼠标靠近更自然 |

## 接入顺序

1. 先生成或补充源视频，并运行 `npm run animations:intake-checklist` 列出清单给用户确认。
2. 确认后执行源视频预检、去水印/抠绿、序列帧生成和 manifest 更新。
3. 运行 `npm run validate:release` 和桌面多帧截图验收。
4. 当目标 action 已存在于运行时 manifest 且帧稳定后，再把播放器调度切换到本策略。
