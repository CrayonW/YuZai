# 鱼仔桌宠项目完成度审计

日期：2026-06-20

用途：把当前项目距离“可交付第一版桌宠”的证据、剩余风险和下一步边界放到一个中文入口。本文档不替代 `docs/project-status.md`，也不批准生成视频、抽帧、覆盖 runtime 或修改 manifest。

## 当前结论

- MVP 核心能力：当前证据显示已完成。
- 13 状态覆盖：当前 13 个状态均有 independent runtime 动作。
- 桌面可见动态：已有 12 张连续桌面截图证据，尺寸 `440x440`，变化帧 `12`。
- 运行时动作数：`38`。
- 发布级验证：`npm run validate:release` 已通过。
- 试用分发说明：`docs/release-playbook.md` 已补齐本地安装、首次打开、卸载步骤、回滚步骤、版本标签和已知限制。
- 试用标签记录：`docs/release-tag-record.md` 已记录 `yuzai-v0.1.0-test.1` 和回滚 commit。
- 签名包安全提示：`docs/signed-release-safety.md` 已说明未签名试用包、Gatekeeper 和正式签名与公证边界。
- Windows 实机验收清单：`docs/windows-release-smoke.md` 已补齐安装包、透明置顶、鼠标靠近、定时气泡和卸载检查项；实际 Windows 实机验收尚未执行。
- Windows 远端打包入口：`.github/workflows/windows-package.yml` 已补齐 GitHub Actions 试用包 artifact 工作流；仍需远端运行和实机安装验证。
- Windows Actions 状态查询：`docs/windows-actions-status.md` 已补齐 `npm run actions:windows-status` 只读查询入口；当前仍缺少可用 token 或 GitHub 页面证据来确认 artifact。
- 剩余硬缺口清单：`docs/release-blockers.json` 已记录 `transition_out_high_risk`、`runtime_duration_short`、`windows_real_machine_smoke`、`macos_sign_notarize`、`signed_user_safety_recheck`，中文报告见 `docs/release-blockers.md`；这些条目关闭前，项目不得标记为完全完成。
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
| 面向最终用户的安装/卸载/回滚说明 | `docs/release-playbook.md` | 已补齐试用版说明 |
| 版本标签与回滚 commit 规范 | `docs/release-playbook.md` | 已补齐试用版说明 |
| 实际试用标签记录 | `docs/release-tag-record.md` | 已记录 `yuzai-v0.1.0-test.1` |
| 签名包安全提示 | `docs/signed-release-safety.md` | 已补齐试用版说明 |
| Windows 安装包实机验收清单 | `docs/windows-release-smoke.md` | 已补齐清单，未执行实机验收 |
| Windows 远端试用包工作流 | `.github/workflows/windows-package.yml` | 已补齐，未完成实机验收 |
| Windows Actions 状态查询入口 | `docs/windows-actions-status.md` | 已补齐，未确认远端 artifact |
| 剩余硬缺口机器清单 | `docs/release-blockers.json`、`docs/release-blockers.md` | 已补齐，仍有 open blocker |

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
机器可读 blocker：`transition_out_high_risk`，记录于 `docs/release-blockers.json`。

### 动作时长不足

`docs/animation-asset-contract.md` 显示 runtime 时长不足动作数为 `30`。其中 `idle_primary`、`idle_secondary`、`tail_wag` 等日常动作当前约 `3s`，低于计划中的 `8s`。这不阻断第一版可见 MVP，但会影响长时间陪伴时的自然度和重复感。
机器可读 blocker：`runtime_duration_short`，记录于 `docs/release-blockers.json`。

### 分发缺口

当前已通过本地 `package:dir` 打包验证，并已补齐面向最终用户的安装/回滚说明、卸载说明和版本标签规范：`docs/release-playbook.md`。实际试用标签记录在 `docs/release-tag-record.md`，签名包安全提示见 `docs/signed-release-safety.md`，Windows 实机验收清单见 `docs/windows-release-smoke.md`，Windows 远端试用包工作流见 `.github/workflows/windows-package.yml`，Windows Actions 状态查询见 `docs/windows-actions-status.md`。但正式分发还没有完成：

- 正式签名。
- macOS 公证。
- Windows 安装包实机验收，目前已有清单和远端打包入口，尚未在 Windows 10/11 实机完成。
- 签名后普通用户安装安全提示复核。

机器可读 blocker：`windows_real_machine_smoke`、`macos_sign_notarize`、`signed_user_safety_recheck`，记录于 `docs/release-blockers.json`。

## 下一步建议

1. 如果目标是继续解决“动作衔接太生硬”，下一步应由用户确认 `docs/transition-out-action-checklist.md`，然后生成 4 个 transitionOut 视频。
2. 如果目标是提升长时间陪伴自然度，应先为 daily 动作生成更长视频或分段素材清单，再确认后处理。
3. 如果目标是发布给别人试用，应优先补签名、公证和 Windows 实机验收，并按 `docs/release-playbook.md` 创建可回滚版本标签。

## 当前边界

- 本轮只做完成度审计和发布验证记录。
- 不调用可灵生成视频。
- 不新增或覆盖 `assets/runtime/animations/*/frames`。
- 不修改 `assets/runtime/animations/manifest.json`。
- 不触碰 `assets/references/yuzai-personalized-concept-alpha.png`。
- 不触碰 `assets/references/yuzai-personalized-concept.png`。
- 不触碰 `docs/yuzai-personalized-pet-concept.md`。
