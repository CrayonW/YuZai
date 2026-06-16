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

## 运行时调度

桌宠运行时通过 `AnimationDirector` 管理序列帧播放。日常动作保持自己的播放时间轴，交互动作通过请求插入，并在结束后回到日常动作。

- `daily` 动作默认循环播放，不因普通渲染 tick 重置到第 1 帧。
- 非循环 `daily` 动作可以作为生活化日常插入，例如洗脸、嗅闻、伸懒腰；它们必须有 `returnTo` 或由导演回到默认日常动作。睡眠链路和走路动作不放入随机日常变化池。
- 日常变化池同时遵守全局间隔和动作级 `minCooldownSeconds`，避免洗脸、伸懒腰等生活化动作短时间反复出现。
- `interactive` 动作在安全退出帧或等待超时后插入播放。
- `interactive` 动作播放结束后根据 `returnTo` 回到日常动作；如果交互前正在播放同一个日常动作，回流时恢复交互插入前的日常帧进度，而不是从入口帧重启。
- `entryFrames` 和 `exitFrames` 用于标注适合切入/切出的安全帧。
- `transitionIn` 用于在日常动作切入交互前插入短过渡动作；`transitionOut` 用于交互结束回到日常前插入短回切动作。过渡动作本身应是非循环 `transition`，播放到尾帧后自动进入目标动作。
- `npm run validate:animation-director` 用于验证调度器不会把交互动作硬切成重复播放。
