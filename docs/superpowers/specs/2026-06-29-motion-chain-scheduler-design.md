# 桌宠动作链路调度器设计

## 背景

当前鱼仔已经具备真实视频序列帧播放、13 状态覆盖、16 方向鼠标跟随、C1 互动过渡和相似帧锚点。桌面验收能看到猫在动，但用户反馈仍集中在三类问题：

- 动作衔接生硬，交互结束回到日常时跳变明显。
- 动作之间缺少规律，像是被多个来源反复抢占。
- 个别序列帧存在透明异常，切换时会放大闪动感。

现有代码已经有 `AnimationDirector`、`DailyAnimationRotator`、`transition-anchors` 和交互桥接。下一步不应推倒重写，而应在现有结构上补一层更明确的动作链路协议，让“日常动作、过渡动作、交互动作、回到日常”形成可预测队列。

## 目标

第一版目标是改善运行时动作规律和衔接感，不新增视频素材、不抽帧、不覆盖 runtime manifest。

- 日常动作保持连续播放，不被每帧解析出的同一 action 反复重置。
- 交互动作只作为一次意图进入队列，不能在鼠标靠近或点击期间每帧重复请求。
- 切入交互前优先等待当前动作安全退出帧，再播放 `transitionIn`。
- 交互结束后优先播放 `transitionOut`，再回到日常基线。
- 鼠标 16 方向跟随保持响应性，但方向切换需要节流和稳定窗口，避免短时间高频跳动作。
- 透明闪动不在本阶段直接修图，但必须作为验收门禁：如果调度改动导致 alpha 异常更明显，不能算通过。

## 非目标

- 不生成新的可灵视频。
- 不重新处理 `assets/origin` 源视频。
- 不删除或替换 C1 已接入动作。
- 不重构 Electron 窗口、托盘、拖拽或置顶逻辑。
- 不把序列帧格式迁移成 WebP、图集或视频纹理。
- 不承诺彻底消除所有高风险切换；本阶段先降低运行时调度造成的硬切和无规律感。

## 当前问题判断

现在 `src/renderer/main.ts` 每一帧都会通过 `resolveAnimationAction(now)` 算出目标 action，并在目标变化时调用 `animationDirector.request`。交互回调也会直接调用 `animationDirector.request`。这让系统存在两个意图入口：

- 主循环入口：日常轮播、FSM 状态、鼠标方向跟随。
- 事件入口：鼠标靠近、点击、拖拽、提醒。

两个入口都可以向 `AnimationDirector` 推动作请求，但缺少统一的优先级、冷却、稳定窗口和“当前链路锁定”规则。结果是动作虽然都有 `transitionIn` / `transitionOut`，但运行时仍可能在短时间内被新的目标 action 打断，导致观感像随机硬切。

## 设计方案

新增一个轻量的 `MotionIntentScheduler`，位置在 `src/core/render/`。它不直接渲染帧，也不读取图片；它只负责把所有动作请求整理成稳定的播放意图，然后交给已有 `AnimationDirector`。

建议数据流：

```text
InteractionController / mouse follow / FSM / DailyAnimationRotator
  -> MotionIntentScheduler.submit(...)
  -> MotionIntentScheduler.resolve(now)
  -> AnimationDirector.request(action, now)
  -> AnimationDirector.update(now)
  -> CanvasRenderer.render(...)
```

### 意图类型

| type | 来源 | 示例 | 优先级 | 默认策略 |
| --- | --- | --- | ---: | --- |
| `preview` | 测试预览 | `YUZAI_PREVIEW_ACTION` | 100 | 立即执行，锁定到预览窗口结束 |
| `drag` | 拖拽 | `dragging` | 90 | 立即响应，释放后回到日常 |
| `click` | 点击 | `click_surprised`、`poke_annoyed` | 80 | 排队执行一次，播放完后回日常 |
| `proximity` | 鼠标靠近 | `cursor_watch`、`paw_raise` | 70 | 冷却内忽略重复请求 |
| `mouse-follow` | 16 方向跟随 | `look_e` 等 | 60 | 方向稳定后切换，离开后回日常 |
| `daily` | 日常轮播 | `idle_secondary`、`tail_wag` | 20 | 只在没有交互链路时生效 |
| `base` | FSM 基线 | `idle_primary`、`sleeping` | 10 | 作为兜底基线 |

### 链路锁定

交互动作进入后形成一个短链路：

```text
daily -> transitionIn -> interactive -> transitionOut -> daily
```

在这条链路结束前：

- 更低优先级意图不能抢占。
- 同一类型重复意图会被合并，而不是重复排队。
- 更高优先级意图可以抢占，但必须通过 `AnimationDirector` 的安全帧规则。
- 当前链路结束后，调度器再处理最新的日常或鼠标跟随意图。

这样可以避免鼠标靠近、方向跟随和日常轮播在交互动作尚未结束时不断切换目标。

### 日常动作规则

日常动作由现有 `DailyAnimationRotator` 继续决定候选，但只在调度器空闲时提交：

1. 默认基线是 `idle_primary`。
2. 日常变化动作进入后至少播放配置时长，除非被交互抢占。
3. 日常变化动作结束后回到 `idle_primary`，不连续播放同一个变化动作。
4. 睡眠链路仍按 `sleepy -> sleep -> sleeping -> waking -> idle_primary`，不纳入普通日常随机池。

### 鼠标方向跟随规则

16 方向鼠标跟随属于连续意图，但不能每次方向抖动都切 action。第一版增加两个约束：

- 稳定窗口：同一个方向连续保持 160ms 后才提交。
- 最小保持：方向动作提交后至少保持 300ms，除非鼠标离开或更高优先级交互发生。

鼠标离开后，不直接硬切回 `idle_primary`。调度器提交 `base` 意图，由 `AnimationDirector` 通过当前 action 的安全帧、锚点或 crossfade 回到日常。

### 透明闪动门禁

本阶段不直接修改帧图，但必须保留并强化验证：

- `npm run validate:runtime-alpha-quality` 必须通过。
- 桌面多帧截图需要覆盖一条完整链路，例如 `idle_primary -> idle_primary_to_paw_raise -> paw_raise -> paw_raise_to_idle_primary -> idle_primary`。
- 新增链路验收报告需要记录 changedFrames、画布尺寸、预览动作和结论。

如果透明异常来自已有帧素材，调度器不会伪装成“已修复”；文档中要明确标记为素材级问题，后续进入 alpha cleanup 或重新生成视频。

## 实现范围

第一版代码修改建议：

1. 新增 `src/core/render/motion-intent-scheduler.ts`。
2. 新增 `scripts/validate-motion-intent-scheduler.mjs`，用 esbuild 打包最小测试，验证优先级、合并、锁定和方向稳定窗口。
3. 修改 `src/renderer/main.ts`：
   - 交互回调改为提交意图，不直接 request。
   - 鼠标方向跟随改为提交连续意图。
   - 每帧只从调度器拿一个稳定目标 action，再调用 `AnimationDirector.request`。
4. 更新 `docs/runtime-naturalness-observation.md` 或新增链路验收记录。
5. 将验证脚本接入 `npm run validate:all`。

## 测试与验收

必须通过的自动验证：

```bash
npm run validate:motion-intent-scheduler
npm run validate:animation-director
npm run validate:transition-anchors
npm run validate:runtime-alpha-quality
npm run typecheck
npm run build
```

桌面验收：

```bash
YUZAI_PREVIEW_ACTION=paw_raise \
YUZAI_PREVIEW_ACTION_MS=700 \
YUZAI_CAPTURE_DELAY_MS=1400 \
YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-motion-chain-paw.png \
YUZAI_CAPTURE_SEQUENCE_COUNT=18 \
YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=150 \
npm run dev
```

验收标准：

- 截图序列中猫可见，画布尺寸不低于 200x200。
- changedFrames 不低于 8。
- 交互链路不会在中途被日常轮播或鼠标方向跟随打断。
- 没有新增黑帧、空白帧或明显透明闪动。

## 风险

- 如果源视频本身起止姿态差异大，调度器只能减少抢占和重置，不能完全消除姿态跳变。
- 如果透明闪动来自帧素材 alpha 缺口，需要后续 alpha cleanup 或重新生成视频。
- 如果鼠标方向跟随稳定窗口太长，会显得跟手性下降；太短则继续抖动。第一版选择 160ms / 300ms，后续按桌面观感调参。

## 后续

本设计确认后，下一步写实现计划并进入 Phase A 实现。实现完成后需要更新项目文档、运行验证、提交并推送 GitHub，方便回滚。
