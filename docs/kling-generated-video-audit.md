# 可灵生成视频素材审查报告

用途：本报告只用于审查可灵生成的原始视频素材，帮助决定后续是否去水印、抽帧并接入桌宠 runtime。

硬性门禁：即使基础元数据通过，也必须人工确认无水印/无文字/无 logo、猫咪身份一致、全身入镜、绿幕稳定后，才能进入抽帧或 manifest 修改。当前报告不能直接接入 runtime。

批次：transition-out-recovery
证据目录：assets/reviews/kling-generated
总览图：assets/reviews/kling-generated/overview.png
汇总：ready 4 / needsRepair 0 / missing 0 / total 4
分类：daily 0 / interactive 0 / transition 4
基础要求：宽度 >= 512px，高度 >= 512px，时长 >= 3s

| action | 分类 | 状态 | 尺寸 | 时长 | 大小 | 抽样图 | 建议 |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| sleep_to_sleeping | transition | ready_for_manual_review | 856x1072 | 5.042 | 8204002 | assets/reviews/kling-generated/sleep_to_sleeping.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| waking_to_idle | transition | ready_for_manual_review | 856x1072 | 5.042 | 6501686 | assets/reviews/kling-generated/waking_to_idle.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| poke_annoyed_to_idle | transition | ready_for_manual_review | 856x1072 | 5.042 | 6767911 | assets/reviews/kling-generated/poke_annoyed_to_idle.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| paw_raise_to_idle | transition | ready_for_manual_review | 856x1072 | 5.042 | 6749702 | assets/reviews/kling-generated/paw_raise_to_idle.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |

## 人工画面检查项

### sleep_to_sleeping

源视频：assets/origin/generated/kling/sleep_to_sleeping.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### waking_to_idle

源视频：assets/origin/generated/kling/waking_to_idle.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### poke_annoyed_to_idle

源视频：assets/origin/generated/kling/poke_annoyed_to_idle.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### paw_raise_to_idle

源视频：assets/origin/generated/kling/paw_raise_to_idle.mp4

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
