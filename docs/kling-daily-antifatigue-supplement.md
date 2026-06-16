# 可灵日常低疲劳补充动作记录

日期：2026-06-16
目的：补齐更安静、更生活化的低强度日常动作，减少桌宠长时间待机重复感。

## 本次补充动作

| action | 分类 | 源视频 | 抽样证据 | 初筛结果 |
| --- | --- | --- | --- | --- |
| `slow_blink` | daily | `assets/origin/generated/kling/slow_blink.mp4` | `assets/reviews/kling-generated/slow_blink_sweep.png` | 抽样未发现文字、水印、logo、道具或额外物体；适合作为低频亲近感插入动作候选。 |
| `look_around` | daily | `assets/origin/generated/kling/look_around.mp4` | `assets/reviews/kling-generated/look_around_sweep.png` | 抽样未发现文字、水印、logo、道具或额外物体；左右观察姿态明显，适合作为低频环境观察动作候选。 |

## 元数据

- `slow_blink`：856x1072，约 5.04 秒，24 fps。
- `look_around`：856x1072，约 5.04 秒，24 fps。

## 推荐用途

- `slow_blink`：在长时间待机时低频插入，让小猫像在安静陪伴用户。
- `look_around`：在桌宠无交互时低频插入，让小猫显得会观察电脑桌面环境。

## 接入门禁

这些视频尚未接入 runtime，不能直接替换或新增 manifest。进入 runtime 前必须先完成：

1. 逐视频播放检查全程无水印、无文字、无 logo、无额外物体、无猫咪变形。
2. 列出正式接入清单，确认会新增的 action、状态映射、目标路径和是否覆盖现有资源。
3. 执行去水印/抠绿、抽帧、manifest 更新。
4. 运行桌面验收：桌面可见小猫、置顶、鼠标靠近反馈、姿势变换、气泡提醒仍正常。
