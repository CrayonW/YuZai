# 动画升级执行计划

本文档用于替代旧的生成式动作流程，后续统一采用“原始视频参考 + 重建透明序列帧 + 桌面窗口验收”的桌宠动画工作流。

## 当前原则

鱼仔桌宠运行时应播放透明序列帧，并由状态机控制动作切换。`assets/origin` 下的视频只作为动作节奏、姿态和性格参考，不直接作为运行素材。最终进入运行时的帧必须是干净重建的透明帧，不能包含原视频水印像素。

重要说明：当前桌面烟雾测试只验证了 manifest 驱动加载器和占位兜底渲染能在 Electron 桌面窗口中稳定显示。它还没有把 `assets/origin` 中的原始视频素材重建成真正动作帧，因此不能称为“已由原始素材实现桌宠动作”。

项目文档默认使用中文。后续如需新增英文说明，应同时提供中文主说明，避免执行过程理解偏差。

## 开工前确认清单

每次开始生成、删除、替换或接入动作素材前，必须先把清单发给用户确认，确认后再执行。

清单至少包含：

- 本次要处理的源素材文件。
- 本次要生成或修改的动作名称。
- 本次会删除或覆盖的路径。
- 本次会保留的路径，尤其是 `assets/origin` 和 `assets/runtime/animations`。
- 本次验证命令和桌面验收方式。
- 是否会改变运行时 manifest。

未得到明确确认前，不删除素材、不覆盖运行帧、不声称动作已经由原始视频实现。

## 第一阶段范围

第一阶段只覆盖当前已经存在源视频的动作：

| 源文件 | 运行时动作 | 行为 |
| --- | --- | --- |
| `assets/origin/鱼仔待机动作1.mp4` | `idle_primary` | 默认待机和回退中心。 |
| `assets/origin/鱼仔待机动作2.mp4` | `idle_secondary` | 备用待机循环。 |
| `assets/origin/鱼仔晃动尾巴视频.mp4` | `tail_wag` | 待机变化动作。 |
| `assets/origin/鱼仔走路视频.mp4` | `walk` | 移动循环。 |

`walk_left` 应在 `walk` 帧确认后由水平镜像生成。

缺失交互和缺失状态暂时回退到第一阶段已批准动作，通常是 `idle_primary`。完整 13 状态优化要等对应参考视频补齐后统一进行。

## 工作过程记录

每个源视频、每次接入运行素材，都必须更新 `docs/animation-production-log.md`。每条记录至少包含：

- 源文件。
- 目标动作。
- 使用的视频片段。
- 帧数和 FPS。
- 循环方式。
- 水印处理方式。
- 重建方法。
- 运行时输出路径。
- 验证命令。
- Electron 桌面窗口验收结果。
- 已知问题和最终决定。

## 清理规则

删除任何旧素材前，必须先确认替代路径已经写入文档，并确认目标不属于 `assets/origin`。

可清理对象：

- 旧生成动作 GIF。
- 旧生成照片和 AI 图片输出。
- 旧生成预览图。
- 旧临时抽帧。
- 旧派生 sprite 目录。
- 旧 HyperFrames 动作生成输出。
- 仍把旧生成 GIF 流程描述成当前流程的过期文档。

必须保留：

- `assets/origin`
- `assets/origin/鱼仔参考图.png`
- 源代码。
- 可继续复用的验证脚本。
- 描述当前决策的文档。

预览清理候选：

```bash
npm run list:animation-cleanup
```

该命令只做 dry-run，不会删除文件。实际删除必须经过单独确认和复核。

## 运行素材协议

后续实现应使用 manifest 驱动动画加载器。每个启用动作需要在 manifest 中描述：

```json
{
  "name": "idle_primary",
  "source": "assets/origin/鱼仔待机动作1.mp4",
  "frameRoot": "assets/runtime/animations/idle_primary",
  "frameCount": 60,
  "fps": 30,
  "loop": true,
  "interruptible": true,
  "fallback": "idle_primary"
}
```

实际 `frameCount`、`fps` 和输出路径应在检查源视频后确定。关键要求是这些值由 manifest 管理，而不是散落在硬编码中。

## 播放逻辑

- `idle_primary` 是默认回流中心。
- 空闲变化可以偶尔播放 `idle_secondary` 或 `tail_wag`，播放完回到 `idle_primary`。
- 移动时播放 `walk` 或镜像生成的 `walk_left`。
- 点击、悬停、拖拽、睡眠、唤醒和表情状态，在对应源视频补齐前使用第一阶段回退行为。
- 后续每个新动作视频加入 `assets/origin` 后，都按同一制作日志和 manifest 流程处理。

## 验证

运行：

```bash
npm run validate:runtime-animations
npm run typecheck
npm run build
```

自动检查应确认：

- 启用的 manifest 动作存在。
- 帧文件数量与 manifest 一致。
- 运行帧有可见像素和 alpha 透明通道。
- 启用动作没有指向旧生成 GIF 输出。
- `walk_left` 是由已批准 `walk` 镜像生成。

桌面检查应确认：

- 鱼仔出现在 Electron 透明置顶桌面窗口中。
- 没有水印。
- 循环中没有空白帧或闪烁。
- 循环首尾顺滑。
- 相关动作之间没有比例和位置跳变。
- 走路速度与步态匹配。

## 后续 13 状态完成

当 `assets/origin` 中补齐 13 个状态参考视频后，再统一执行优化：

1. 统一比例、构图、身份特征、光照和透明边缘。
2. 调整全部状态的 FPS 和循环节奏。
3. 用真实状态动作替换临时回退映射。
4. 重新检查状态切换时长和打断优先级。
5. 在 Electron 桌面窗口中验收。

这属于后续阶段，不纳入当前四个源视频的第一阶段流程。
