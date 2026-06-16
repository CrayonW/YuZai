# 可灵生成视频素材审查报告

用途：本报告只用于审查可灵生成的原始视频素材，帮助决定后续是否去水印、抽帧并接入桌宠 runtime。

硬性门禁：即使基础元数据通过，也必须人工确认无水印/无文字/无 logo、猫咪身份一致、全身入镜、绿幕稳定后，才能进入抽帧或 manifest 修改。当前报告不能直接接入 runtime。

批次：all
证据目录：assets/reviews/kling-generated
总览图：assets/reviews/kling-generated/overview.png
汇总：ready 14 / needsRepair 0 / missing 0 / total 14
分类：daily 7 / interactive 7 / transition 0
基础要求：宽度 >= 512px，高度 >= 512px，时长 >= 3s

| action | 分类 | 状态 | 尺寸 | 时长 | 大小 | 抽样图 | 建议 |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| groom_face_wash | daily | ready_for_manual_review | 856x1072 | 5.042 | 7333436 | assets/reviews/kling-generated/groom_face_wash.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| loaf_breathing | daily | ready_for_manual_review | 856x1072 | 5.042 | 5427337 | assets/reviews/kling-generated/loaf_breathing.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| cursor_watch | interactive | ready_for_manual_review | 856x1072 | 5.042 | 6248472 | assets/reviews/kling-generated/cursor_watch.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| click_surprised | interactive | ready_for_manual_review | 856x1072 | 5.042 | 6447862 | assets/reviews/kling-generated/click_surprised.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| sleepy | daily | ready_for_manual_review | 856x1072 | 5.042 | 5519059 | assets/reviews/kling-generated/sleepy.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| sleep | daily | ready_for_manual_review | 856x1072 | 5.042 | 7509762 | assets/reviews/kling-generated/sleep.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| sleeping | daily | ready_for_manual_review | 856x1072 | 5.042 | 5501864 | assets/reviews/kling-generated/sleeping.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| waking | interactive | ready_for_manual_review | 856x1072 | 5.042 | 7114078 | assets/reviews/kling-generated/waking.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| desk_sniff | daily | ready_for_manual_review | 856x1072 | 5.042 | 6532065 | assets/reviews/kling-generated/desk_sniff.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| stretch_yawn | daily | ready_for_manual_review | 856x1072 | 5.042 | 7024257 | assets/reviews/kling-generated/stretch_yawn.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| poke_annoyed | interactive | ready_for_manual_review | 856x1072 | 5.042 | 6835619 | assets/reviews/kling-generated/poke_annoyed.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| shy | interactive | ready_for_manual_review | 856x1072 | 5.042 | 6449961 | assets/reviews/kling-generated/shy.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| dragging | interactive | ready_for_manual_review | 856x1072 | 5.042 | 7698504 | assets/reviews/kling-generated/dragging.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |
| call_response | interactive | ready_for_manual_review | 856x1072 | 5.042 | 5719691 | assets/reviews/kling-generated/call_response.png | 可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。 |

## 人工画面检查项

### groom_face_wash

源视频：assets/origin/generated/kling/groom_face_wash.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 日常动作节奏自然，不会像短促循环一样快速重复。

### loaf_breathing

源视频：assets/origin/generated/kling/loaf_breathing.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 日常动作节奏自然，不会像短促循环一样快速重复。

### cursor_watch

源视频：assets/origin/generated/kling/cursor_watch.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### click_surprised

源视频：assets/origin/generated/kling/click_surprised.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### sleepy

源视频：assets/origin/generated/kling/sleepy.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 日常动作节奏自然，不会像短促循环一样快速重复。

### sleep

源视频：assets/origin/generated/kling/sleep.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 日常动作节奏自然，不会像短促循环一样快速重复。

### sleeping

源视频：assets/origin/generated/kling/sleeping.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 日常动作节奏自然，不会像短促循环一样快速重复。

### waking

源视频：assets/origin/generated/kling/waking.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### desk_sniff

源视频：assets/origin/generated/kling/desk_sniff.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 日常动作节奏自然，不会像短促循环一样快速重复。

### stretch_yawn

源视频：assets/origin/generated/kling/stretch_yawn.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 日常动作节奏自然，不会像短促循环一样快速重复。

### poke_annoyed

源视频：assets/origin/generated/kling/poke_annoyed.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### shy

源视频：assets/origin/generated/kling/shy.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### dragging

源视频：assets/origin/generated/kling/dragging.mp4

- [ ] 无水印、无文字、无 logo、无边框或 UI 元素。
- [ ] 猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。
- [ ] 全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。
- [ ] 绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。
- [ ] 动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。
- [ ] 交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。

### call_response

源视频：assets/origin/generated/kling/call_response.mp4

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
