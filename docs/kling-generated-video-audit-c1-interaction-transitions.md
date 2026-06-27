# 可灵生成视频素材审查报告

用途：本报告只用于审查可灵生成的原始视频素材，帮助决定后续是否去水印、抽帧并接入桌宠 runtime。

硬性门禁：即使基础元数据通过，也必须人工确认无水印/无文字/无 logo、猫咪身份一致、全身入镜、绿幕稳定后，才能进入抽帧或 manifest 修改。当前报告不能直接接入 runtime。

批次：c1-interaction-transitions
证据目录：assets/reviews/kling-generated
总览图：assets/reviews/kling-generated/overview.png
汇总：ready 8 / needsRepair 0 / missing 0 / total 8
分类：daily 0 / interactive 0 / transition 8
基础要求：宽度 >= 512px，高度 >= 512px，时长 >= 3s

| action | 分类 | 状态 | 尺寸 | 时长 | 大小 | 抽样图 | 建议 |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| idle_primary_to_paw_raise | transition | ready_for_manual_review | 856x1072 | 5.042 | 7032094 | assets/reviews/kling-generated/idle_primary_to_paw_raise.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| paw_raise_to_idle_primary | transition | ready_for_manual_review | 856x1072 | 5.042 | 7039161 | assets/reviews/kling-generated/paw_raise_to_idle_primary.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| idle_primary_to_cursor_watch | transition | ready_for_manual_review | 856x1072 | 5.042 | 7142592 | assets/reviews/kling-generated/idle_primary_to_cursor_watch.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| cursor_watch_to_idle_primary | transition | ready_for_manual_review | 856x1072 | 5.042 | 6546810 | assets/reviews/kling-generated/cursor_watch_to_idle_primary.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| idle_primary_to_click_surprised | transition | ready_for_manual_review | 856x1072 | 5.042 | 6657090 | assets/reviews/kling-generated/idle_primary_to_click_surprised.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| click_surprised_to_idle_primary | transition | ready_for_manual_review | 856x1072 | 5.042 | 6797937 | assets/reviews/kling-generated/click_surprised_to_idle_primary.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| idle_primary_to_poke_annoyed | transition | ready_for_manual_review | 856x1072 | 5.042 | 7078768 | assets/reviews/kling-generated/idle_primary_to_poke_annoyed.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| poke_annoyed_to_idle_primary | transition | ready_for_manual_review | 856x1072 | 5.042 | 6848643 | assets/reviews/kling-generated/poke_annoyed_to_idle_primary.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |

## 人工画面检查项

### idle_primary_to_paw_raise

源视频：assets/origin/generated/kling/idle_primary_to_paw_raise.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### paw_raise_to_idle_primary

源视频：assets/origin/generated/kling/paw_raise_to_idle_primary.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### idle_primary_to_cursor_watch

源视频：assets/origin/generated/kling/idle_primary_to_cursor_watch.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### cursor_watch_to_idle_primary

源视频：assets/origin/generated/kling/cursor_watch_to_idle_primary.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### idle_primary_to_click_surprised

源视频：assets/origin/generated/kling/idle_primary_to_click_surprised.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### click_surprised_to_idle_primary

源视频：assets/origin/generated/kling/click_surprised_to_idle_primary.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### idle_primary_to_poke_annoyed

源视频：assets/origin/generated/kling/idle_primary_to_poke_annoyed.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### poke_annoyed_to_idle_primary

源视频：assets/origin/generated/kling/poke_annoyed_to_idle_primary.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

## 下一步

1. 逐个打开抽样图和源视频，人工标记是否存在水印、文字、logo、猫咪变形、身体裁切、绿幕不稳定。
2. 对通过动作，回到对应 `docs/kling-batch-intake-*.md` 清单确认接入范围。
3. 只有确认后，才允许执行去水印/抠绿、序列帧生成、manifest 更新和桌面截图验收。
