# 动画资源接入规范

MVP 阶段没有正式美术帧，渲染由 `src/core/render/placeholder-yuzai.ts` 完成。

后续接入正式帧图时建议保持以下约定：

## 目录

```text
assets/sprites/
  idle/
  walking/
  sleeping/
  interaction/
```

## 命名

```text
{state}_{view}_{index}.png
```

示例：

```text
idle_front_0001.png
walking_left_0003.png
surprised_front_0001.png
```

## 状态约束

- `idle` 是所有非强制动作的回流中心。
- `sleeping` 唤醒必须经过 `waking`。
- `walking` 停止或撞边必须经过过渡计时，不能硬切。
- 同一时间只渲染一个情绪。
