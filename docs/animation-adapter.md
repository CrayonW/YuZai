# 动画资源接入规范

MVP 动画以 `assets/origin` 中的源视频为唯一动作来源，先构建透明 PNG 序列帧，再由 `assets/runtime/animations/manifest.json` 映射到运行时状态。占位绘制只作为资源缺失时的兜底，不能作为验收结果。

生成新的猫咪动作视频前，先使用 `docs/cat-video-prompt-guide.md` 中的提示词模板。该文档以 `assets/origin/鱼仔参考图.png` 为默认参考，也支持替换成其他猫咪参考图后生成同一套桌宠动作。

## 当前流程

```text
assets/origin/*.mp4
  -> npm run animations:build-from-origin
  -> assets/runtime/animations/<action>/frames/frame_000001.png
  -> assets/runtime/animations/manifest.json
  -> Electron 桌面窗口播放
```

## 当前动作映射

| 状态/动作 | 运行时 action | 来源 |
| --- | --- | --- |
| 默认待机 | `idle_primary` | `assets/origin/鱼仔待机动作1.mp4` |
| 备用待机 | `idle_secondary` | `assets/origin/鱼仔待机动作2.mp4` |
| 摇尾 | `tail_wag` | `assets/origin/鱼仔晃动尾巴视频.mp4` |
| 向右走 | `walk` | `assets/origin/鱼仔走路视频.mp4` |
| 向左走 | `walk_left` | 从 `walk` 镜像生成 |
| 鼠标靠近/招手 | `paw_raise` | `assets/origin/鱼仔前肢抬起视频.mp4` |

## 序列帧规则

- 输出尺寸固定为 512x512。
- 命名固定为 `frame_000001.png` 到 `frame_000072.png`。
- 当前帧率为 24 fps，每个动作取 3 秒、72 帧，避免第一版 12 fps 造成明显卡顿。
- `npm run validate:animation-smoothness` 必须通过，防止运行帧回退到过低帧率或过少帧数。
- 源视频中的绿幕背景必须转为透明 alpha。
- 源视频右下角水印区域必须透明化，不能进入运行时输出。
- 任何新增动作视频接入前，先列出源文件、目标 action、覆盖路径和验证方式，得到确认后再执行生成。

## 状态约束

- `idle` 是所有非强制动作的回流中心。
- `sleeping` 唤醒必须经过 `waking`。
- `walking` 停止或撞边必须经过过渡计时，不能硬切。
- 同一时间只渲染一个情绪。
