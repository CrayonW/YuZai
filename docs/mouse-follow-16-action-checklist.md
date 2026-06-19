# 16 方向鼠标跟随动作处理前确认清单

用途：本清单用于准备后续生成 16 个方向的猫咪头眼跟随视频。当前清单不代表已经批准生成、抽帧、去水印、覆盖 runtime 或修改 manifest。

## 本次目标

- 用真实视频素材实现猫咪头部和眼睛 360 度跟随鼠标。
- 采用 16 个方向动作，每个方向覆盖 22.5 度。
- 每个方向视频按长视频标准生成，目标 8 秒、24fps、192 帧。
- 后续切换时通过帧相似度锚点降低方向变化和回到日常动作时的生硬感。

## 当前禁止事项

- 禁止在用户确认前生成视频。
- 禁止在用户确认前抽帧、去水印、抠绿或写入 runtime。
- 禁止把 16 个 `look_*` 动作加入 `assets/runtime/animations/manifest.json`。
- 禁止创建正式 runtime-intake 批准文件。
- 禁止声称 16 方向鼠标跟随已经进入桌宠。

## 待确认动作清单

| action | 角度中心 | 鼠标方向语义 | category | loop | 目标时长 | planned source video | runtime target after approval |
| --- | ---: | --- | --- | --- | ---: | --- | --- |
| `look_e` | 0° | 正右 | interactive | true | 8s | `assets/origin/generated/kling/look_e.mp4` | `assets/runtime/animations/look_e/frames` |
| `look_ene` | 22.5° | 右上偏右 | interactive | true | 8s | `assets/origin/generated/kling/look_ene.mp4` | `assets/runtime/animations/look_ene/frames` |
| `look_ne` | 45° | 右上 | interactive | true | 8s | `assets/origin/generated/kling/look_ne.mp4` | `assets/runtime/animations/look_ne/frames` |
| `look_nne` | 67.5° | 上方偏右 | interactive | true | 8s | `assets/origin/generated/kling/look_nne.mp4` | `assets/runtime/animations/look_nne/frames` |
| `look_n` | 90° | 正上 | interactive | true | 8s | `assets/origin/generated/kling/look_n.mp4` | `assets/runtime/animations/look_n/frames` |
| `look_nnw` | 112.5° | 上方偏左 | interactive | true | 8s | `assets/origin/generated/kling/look_nnw.mp4` | `assets/runtime/animations/look_nnw/frames` |
| `look_nw` | 135° | 左上 | interactive | true | 8s | `assets/origin/generated/kling/look_nw.mp4` | `assets/runtime/animations/look_nw/frames` |
| `look_wnw` | 157.5° | 左上偏左 | interactive | true | 8s | `assets/origin/generated/kling/look_wnw.mp4` | `assets/runtime/animations/look_wnw/frames` |
| `look_w` | 180° | 正左 | interactive | true | 8s | `assets/origin/generated/kling/look_w.mp4` | `assets/runtime/animations/look_w/frames` |
| `look_wsw` | 202.5° | 左下偏左 | interactive | true | 8s | `assets/origin/generated/kling/look_wsw.mp4` | `assets/runtime/animations/look_wsw/frames` |
| `look_sw` | 225° | 左下 | interactive | true | 8s | `assets/origin/generated/kling/look_sw.mp4` | `assets/runtime/animations/look_sw/frames` |
| `look_ssw` | 247.5° | 下方偏左 | interactive | true | 8s | `assets/origin/generated/kling/look_ssw.mp4` | `assets/runtime/animations/look_ssw/frames` |
| `look_s` | 270° | 正下 | interactive | true | 8s | `assets/origin/generated/kling/look_s.mp4` | `assets/runtime/animations/look_s/frames` |
| `look_sse` | 292.5° | 下方偏右 | interactive | true | 8s | `assets/origin/generated/kling/look_sse.mp4` | `assets/runtime/animations/look_sse/frames` |
| `look_se` | 315° | 右下 | interactive | true | 8s | `assets/origin/generated/kling/look_se.mp4` | `assets/runtime/animations/look_se/frames` |
| `look_ese` | 337.5° | 右下偏右 | interactive | true | 8s | `assets/origin/generated/kling/look_ese.mp4` | `assets/runtime/animations/look_ese/frames` |

## 生成提示词模板

每个方向替换 `{directionName}` 和 `{directionDescription}`。

```text
使用参考图中的同一只猫作为唯一角色。生成一个桌面宠物鼠标跟随方向动作视频，竖版 4:5，固定机位，纯绿色绿幕背景。猫咪全身入镜，居中，脚底、耳朵和尾巴不要被裁切。猫咪保持稳定坐姿，身体只有轻微自然呼吸，头部和眼睛持续自然看向 {directionName}，也就是 {directionDescription}。眼神要像正在追踪用户鼠标位置，耳朵轻微朝向目标方向，动作温和、连续、可爱，适合转成透明序列帧循环播放。开始和结束姿势尽量一致，方便无缝循环。保持猫咪脸型、毛色、眼睛颜色、花纹位置、身体比例和毛发质感与参考图一致。画面中只能有这一只猫，没有人、没有道具、没有文字、没有水印、没有 logo。
```

## 生成命令草案

以下命令仅作为确认后的执行入口；未确认前不要执行真实生成。

```bash
npm run kling:generate-batch -- --batch mouse-follow-16-direction --dry-run
```

确认真实生成后：

```bash
npm run kling:generate-batch -- --batch mouse-follow-16-direction
```

## 生成后接入门禁

1. 生成 16 个源视频后先生成审查图或抽样图。
2. 人工检查每个视频：无水印、无文字、无 logo、无额外物体、猫咪身份一致、动作方向正确。
3. 下方方向重点检查不能变成趴下或离开坐姿；上方方向重点检查耳朵和头顶不能裁切。
4. 通过后再创建正式 runtime-intake checklist、preflight 和 dry-run。
5. 得到确认后再抽帧、去水印/抠绿、写入 manifest。
6. 接入后生成相似帧锚点，并捕获 16 方向桌面截图序列验收。
7. 运行 `npm run validate:all`、`npm run validate:release`。

## 当前决定

当前只完成 16 方向处理前清单和设计文档。尚未生成视频，尚未新增 runtime 帧，尚未修改 manifest。
