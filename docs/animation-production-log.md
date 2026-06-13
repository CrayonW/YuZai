# 动画制作日志

本文档记录每次动画制作、验证和清理过程。每个加入 `assets/origin` 的源视频，在对应帧被接入运行时前，都必须在这里留下记录。

## 当前源素材清单

| 源文件 | 目标动作 | 状态 | 备注 |
| --- | --- | --- | --- |
| `assets/origin/鱼仔待机动作1.mp4` | `idle_primary` | 待处理 | 默认待机参考。需要重建干净透明帧，不能复用水印像素。 |
| `assets/origin/鱼仔待机动作2.mp4` | `idle_secondary` | 待处理 | 备用待机循环参考。 |
| `assets/origin/鱼仔晃动尾巴视频.mp4` | `tail_wag` | 待处理 | 空闲变化动作参考。 |
| `assets/origin/鱼仔走路视频.mp4` | `walk` | 待处理 | 走路动作参考。确认 `walk` 后再镜像生成 `walk_left`。 |
| `assets/origin/鱼仔参考图.png` | 身份参考 | 待处理 | 重建干净帧时用于保持鱼仔身份一致。 |

## 记录模板

```text
日期：
源文件：
目标动作：
参考片段：
帧数：
FPS：
循环方式：
水印处理：
重建方法：
运行时输出：
验证命令：
桌面验收：
已知问题：
决定：
```

## 接受规则

- 原始源视频必须保留在 `assets/origin`。
- 运行帧必须是干净重建的透明帧，不能直接使用源视频像素。
- 水印像素不能出现在运行输出中。
- 每个被接受的动作都必须写入运行时 manifest。
- 每个被接受的动作都必须在 Electron 桌面窗口中检查。
- 被拒绝的产物不能进入运行时路径。
- 开始任何生成、删除、覆盖动作前，必须先把清单发给用户确认。

## 2026-06-13 第一阶段设置

日期：2026-06-13
源文件：`assets/origin`
目标动作：`idle_primary`、`idle_secondary`、`tail_wag`、`walk`
参考片段：抽帧时再检查完整源视频。
帧数：manifest 初始为禁用状态，`frameCount: 0`；只有干净重建帧存在后才启用对应动作。
FPS：初始目标为 30 fps。
循环方式：`idle_primary`、`idle_secondary`、`walk` 循环；`tail_wag` 作为短空闲变化动作播放。
水印处理：源视频只作为参考。运行帧必须干净重建，不能包含水印像素。
重建方法：基于源视频动作和 `鱼仔参考图.png` 身份参考，重建透明序列帧。
运行时输出：`assets/runtime/animations/<action>/frames/frame_000001.png`。
验证命令：`npm run validate:runtime-animations`、`npm run typecheck`、`npm run build`。
桌面验收：需要在运行帧生成后执行。
已知问题：运行动作仍处于禁用状态，直到重建帧目录存在。
决定：先推进 manifest 驱动的第一阶段实现，再生成最终运行帧。

## 2026-06-13 桌面烟雾测试

日期：2026-06-13
源文件：`assets/runtime/animations/manifest.json`
目标动作：第一阶段 manifest 加载器 fallback
参考片段：尚未生成重建运行帧。
帧数：启用动作仍为 `frameCount: 0`。
FPS：manifest 为后续重建动作保留 30 fps 目标。
循环方式：第一阶段动作禁用时显示占位兜底渲染。
水印处理：本次测试没有渲染任何源视频像素。
重建方法：尚未开始；本次只验证 manifest 驱动运行壳。
运行时输出：Electron 透明桌面窗口截图 `/private/tmp/yuzai-window-phase1.png`。
验证命令：`npm run validate:runtime-animations`、`npm run typecheck`、`npm run build`、`YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-phase1.png npm run dev`。
桌面验收：Electron 成功启动并捕获非空 560x560 RGBA 窗口。可见桌宠是占位兜底渲染，不是原始视频重建动作。
已知问题：Electron 打印开发环境 CSP 警告；该问题与动画 manifest 流程无关，应在单独安全/配置任务中处理。
决定：manifest 驱动加载器和占位兜底渲染阶段的桌面烟雾测试通过。不能将此结果表述为“已用原始素材实现动作”。

## 2026-06-14 旧资产清理

日期：2026-06-14
源文件：`npm run list:animation-cleanup` 输出的旧生成动画目录
目标动作：为第一阶段源视频工作流清理旧产物
参考片段：不适用。
帧数：删除了未跟踪旧帧目录；没有删除运行时 manifest 帧。
FPS：不适用。
循环方式：不适用。
水印处理：删除旧生成/参考输出；保留 `assets/origin` 中的全部原始视频和身份图。
重建方法：不适用，本次仅清理。
运行时输出：保留 `assets/runtime/animations/.gitkeep` 和 `assets/runtime/animations/manifest.json`。
验证命令：`npm run list:animation-cleanup`、`npm run validate:runtime-animations`、`npm run typecheck`、`npm run build`。
桌面验收：清理后未重复执行桌面验收，因为没有删除任何已启用运行帧，manifest 仍处于禁用动作和占位兜底渲染状态。
已知问题：清理候选为未跟踪目录，删除本身没有 git diff；本日志记录已批准的清理结果。
决定：已完成批准的清理。`npm run list:animation-cleanup` 现在返回空 `candidates` 列表。
