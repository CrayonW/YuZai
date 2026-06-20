# 鱼仔桌宠项目完成度审计

日期：2026-06-20

用途：把当前项目距离“可交付第一版桌宠”的证据、剩余风险和下一步边界放到一个中文入口。本文档不替代 `docs/project-status.md`，也不批准生成视频、抽帧、覆盖 runtime 或修改 manifest。

## 当前结论

- MVP 核心能力：当前证据显示已完成。
- 13 状态覆盖：当前 13 个状态均有 independent runtime 动作。
- 桌面可见动态：已有 12 张连续桌面截图证据，尺寸 `440x440`，变化帧 `12`。
- 运行时动作数：`38`。
- 发布级验证：`npm run validate:release` 已通过。
- 当前剩余产品风险：动作自然度仍有明确缺口，不应把它解释成最终质量已完成。

## 已满足的第一版能力

| 能力 | 当前证据 | 状态 |
| --- | --- | --- |
| 桌面上能看到一只会动的猫 | `docs/mvp-evidence.json`、`docs/runtime-naturalness-observation.md`、`assets/reviews/runtime/naturalness-observation/` | 已验证 |
| 所有应用上层透明窗口 | `docs/requirements-mvp.md`、`docs/mvp-evidence.json` | 已验证 |
| 定时气泡提醒喝水/休息 | `docs/requirements-mvp.md`、`docs/mvp-evidence.json` | 已验证 |
| 角色大小/位置调整 | `docs/requirements-mvp.md`、`docs/mvp-evidence.json` | 已验证 |
| 鼠标靠近/方向跟随反馈 | `docs/runtime-naturalness-observation.md`、`assets/reviews/runtime/mouse-follow-16/` | 已验证 |
| 姿势变换 | `docs/project-status.md`、`docs/state-coverage.md` | 已验证 |
| 13 状态覆盖 | `docs/project-status.md`、`docs/state-coverage.md`、`docs/state-backlog.md` | 已验证 |
| macOS 本地打包目录 | `npm run validate:release`、`release/mac-arm64/鱼仔桌面宠物.app` | 已验证 |

## 发布验证记录

本轮执行：

```bash
npm run validate:release
```

结果：

- `validate:all` 通过。
- `validate:package` 通过。
- `package:dir` 成功生成 `release/mac-arm64/鱼仔桌面宠物.app`。
- app.asar 存在：`release/mac-arm64/鱼仔桌面宠物.app/Contents/Resources/app.asar`。
- 图标存在：`release/.icon-icns/icon.icns` 和 `release/mac-arm64/鱼仔桌面宠物.app/Contents/Resources/icon.icns`。
- macOS 签名被显式跳过：`identity` 为 `null`。这是本地验证包的预期状态，不等于已完成签名/公证分发。

## 仍未完成的质量缺口

### high 风险回切

`docs/action-transition-risk-report.md` 和 `docs/runtime-naturalness-observation.md` 均指向 4 个 high 风险回切：

| transition | 建议动作 | 当前状态 |
| --- | --- | --- |
| `sleep -> sleeping` | 生成并接入 `sleep_to_sleeping` transitionOut | 待用户确认生成 |
| `waking -> idle_primary` | 生成并接入 `waking_to_idle` transitionOut | 待用户确认生成 |
| `poke_annoyed -> idle_primary` | 生成并接入 `poke_annoyed_to_idle` transitionOut | 待用户确认生成 |
| `paw_raise -> idle_primary` | 生成并接入 `paw_raise_to_idle` transitionOut | 待用户确认生成 |

当前已经有处理前清单：`docs/transition-out-action-checklist.md`。在用户确认前，不得执行真实可灵生成、不得抽帧、不得创建正式 approved 文件、不得修改 `assets/runtime/animations/manifest.json`。

### 动作时长不足

`docs/animation-asset-contract.md` 显示 runtime 时长不足动作数为 `30`。其中 `idle_primary`、`idle_secondary`、`tail_wag` 等日常动作当前约 `3s`，低于计划中的 `8s`。这不阻断第一版可见 MVP，但会影响长时间陪伴时的自然度和重复感。

### 分发缺口

当前已通过本地 `package:dir` 打包验证，但还没有完成：

- 正式签名。
- macOS 公证。
- Windows 安装包实机验收。
- 面向最终用户的安装/回滚说明。

## 下一步建议

1. 如果目标是继续解决“动作衔接太生硬”，下一步应由用户确认 `docs/transition-out-action-checklist.md`，然后生成 4 个 transitionOut 视频。
2. 如果目标是提升长时间陪伴自然度，应先为 daily 动作生成更长视频或分段素材清单，再确认后处理。
3. 如果目标是发布给别人试用，应优先补签名、公证、安装说明和一个可回滚的版本标签。

## 当前边界

- 本轮只做完成度审计和发布验证记录。
- 不调用可灵生成视频。
- 不新增或覆盖 `assets/runtime/animations/*/frames`。
- 不修改 `assets/runtime/animations/manifest.json`。
- 不触碰 `assets/references/yuzai-personalized-concept-alpha.png`、`assets/references/yuzai-personalized-concept.png`、`docs/yuzai-personalized-pet-concept.md`。
