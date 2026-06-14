# 序列帧动作调度设计

## 背景

当前桌宠已经能从 `assets/origin` 源视频生成透明序列帧，并以 24 fps、72 帧播放。但播放逻辑仍然偏状态映射：FSM 状态变化后直接切换到对应 action。这个方式容易在交互发生时重置动作起点，导致日常动作和交互动作用硬切衔接，视觉上仍可能不流畅。

新的目标是让日常动作像视频一样持续按序播放；当需要交互时，插入交互动作序列；交互动作结束后再回到日常动作，并尽量在可控的安全帧上衔接。

## 设计目标

- 日常动作按源视频序列帧顺序连续播放，默认不因普通状态轮询重置到第 1 帧。
- 交互动作作为一次性片段插入播放队列，播放完成后回到日常动作。
- 支持按动作类别管理资源，方便后续新增日常动作和交互动作。
- 切换动作时优先等待安全退出帧，避免在姿势差异最大的中间帧硬切。
- 没有专门过渡素材时，使用短时淡入兜底；有过渡素材后优先播放过渡动作。
- 文档和 manifest 能表达动作分类、进入帧、退出帧、打断策略和回切目标。

## 动作分类

运行时动作分为三类：

| 分类 | 用途 | 示例 | 播放方式 |
| --- | --- | --- | --- |
| `daily` | 日常循环动作 | `idle_primary`、`idle_secondary`、`daily_tail_wag` | 循环播放，保持时间轴连续 |
| `interactive` | 鼠标靠近、点击、拖拽等交互动作 | `paw_raise`、`click_surprised` | 一次性播放，结束后回到日常动作 |
| `transition` | 两个动作之间的专用衔接动作 | `idle_to_paw_raise`、`paw_raise_to_idle` | 一次性播放，只由调度器调用 |

当前 MVP 阶段可以先不强制迁移目录结构，但 manifest 中必须先加入分类字段。后续资源整理时建议使用下面的目录结构：

```text
assets/runtime/animations/
  daily/
    idle_primary/
    idle_secondary/
  interactive/
    paw_raise/
  transition/
    idle_to_paw_raise/
```

## Manifest 扩展

每个 action 增加播放调度字段：

```json
{
  "category": "daily",
  "entryFrames": [1, 24, 48],
  "exitFrames": [24, 48, 72],
  "interruptPolicy": "at-safe-frame",
  "returnTo": "idle_primary",
  "transitionIn": null,
  "transitionOut": null
}
```

字段含义：

| 字段 | 含义 |
| --- | --- |
| `category` | `daily`、`interactive` 或 `transition` |
| `entryFrames` | 适合从其他动作切入本动作的帧号 |
| `exitFrames` | 适合从本动作切出的帧号 |
| `interruptPolicy` | 打断策略，第一版支持 `immediate`、`at-safe-frame`、`locked` |
| `returnTo` | 交互动作结束后回到的日常 action |
| `transitionIn` | 切入本动作前可播放的过渡 action |
| `transitionOut` | 本动作结束后可播放的过渡 action |

第一版的安全帧可以手工标注。没有标注时使用默认规则：

- `daily`：入口帧为第 1 帧，退出帧为最后一帧。
- `interactive`：入口帧为第 1 帧，退出帧为最后一帧。
- `transition`：入口帧为第 1 帧，退出帧为最后一帧。

## 播放调度器

新增 `AnimationDirector` 作为 FSM 和 CanvasRenderer 之间的播放层。FSM 仍然负责行为状态，AnimationDirector 负责决定当前应该播放哪个 action、从哪一帧开始、何时允许切换。

核心职责：

- 维护当前日常 action 的播放时间轴。
- 接收交互请求并放入待播放队列。
- 判断当前 action 是否到达安全退出帧。
- 选择是否播放 transition action。
- 播放 interactive action。
- interactive 播完后回到 daily action。
- 向 CanvasRenderer 输出当前帧，而不是让 CanvasRenderer 自己根据 FSM 直接取 sequence。

建议数据流：

```text
FSM / InteractionController / AutonomousBehavior
  -> AnimationDirector.request(action, reason)
  -> AnimationDirector.update(now)
  -> CanvasRenderer.drawFrame(frame)
```

## 切换规则

### 日常到交互

1. 当前播放 `daily` action。
2. 鼠标靠近、点击或其他事件请求 `interactive` action。
3. 如果当前帧在 `exitFrames` 内，立刻切换。
4. 如果不在安全退出帧，最多等待 `120ms`。
5. 超过等待时间后仍未到安全退出帧，则按 `interruptPolicy` 执行：
   - `immediate`：立即切换。
   - `at-safe-frame`：等待到最近安全帧，但最多等待 `120ms`。
   - `locked`：忽略本次请求或排队到当前动作结束。
6. 如果存在 `transitionIn`，先播放 transition，再播放 interactive。
7. 没有 transition 时，使用 `80-120ms` 的短淡入兜底。

### 交互到日常

1. `interactive` action 播放到最后一帧或安全退出帧。
2. 如果存在 `transitionOut`，先播放 transition。
3. 回到 `returnTo` 指定的 daily action。
4. 如果 daily action 有 `entryFrames`，从最近的安全进入帧开始。
5. 没有 entryFrames 时，从第 1 帧开始。

### 日常到日常

日常动作之间也使用同一套安全帧规则。例如 `idle_primary` 切到 `idle_secondary` 时，不应随机硬切到第 1 帧，而应在 `idle_primary.exitFrames` 附近切出，再从 `idle_secondary.entryFrames` 切入。

## 第一版范围

第一版只做调度基础，不做复杂图像相似度算法：

- manifest 增加分类和衔接字段。
- 新增 `AnimationDirector`。
- CanvasRenderer 改为接收 director 给出的当前 frame。
- 鼠标靠近触发 `paw_raise`，结束后回到 `idle_primary`。
- 日常动作默认从 `idle_primary` 开始循环。
- `idle_secondary` 可以作为后续日常随机动作，但第一版不强制加入随机轮换。
- 切换淡入只用于 action 切换瞬间，不能持续跨帧混合，避免拖影。

## 暂不实现

- 自动计算最相似入口帧和出口帧。
- 自动生成 transition 序列帧。
- 完整 13 状态动作统一优化。
- WebP 或图集格式迁移。
- 复杂动作优先级系统。

这些内容留到动作素材补齐后再统一优化。

## 测试与验收

新增验证应覆盖：

- `daily` 动作在没有交互时不会反复重置到第 1 帧。
- 请求 `interactive` 后，调度器在安全退出帧或等待超时后切换。
- `interactive` 播完后回到 `returnTo` 的 daily action。
- manifest 缺少 `category`、`entryFrames` 或 `exitFrames` 时能使用默认规则。
- `npm run validate:runtime-animations` 校验扩展字段合法性。
- `npm run validate:animation-smoothness` 继续保证帧率和帧数底线。

桌面验收：

- 启动后日常动作持续循环播放。
- 鼠标靠近后播放前肢交互动作。
- 交互动作结束后自然回到日常待机。
- 切换时没有明显黑帧、空白帧或从头硬跳。

## 后续新增动作流程

新增动作视频时先确认清单：

```text
源文件：
动作名称：
分类：daily / interactive / transition
目标路径：
是否循环：
entryFrames：
exitFrames：
returnTo：
transitionIn：
transitionOut：
验证方式：
```

得到确认后再生成帧并更新 manifest。这样后续无论新增日常动作还是交互动作，都能按同一套调度规则接入。
