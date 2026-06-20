# 鱼仔桌宠剩余硬缺口报告

更新日期：2026-06-20

跟踪鱼仔桌宠距离可交付第一版的剩余硬缺口。所有条目关闭前，项目不得标记为完全完成。

## 完成策略

- 项目可标记完成：否
- 必须关闭全部 blocker：是
- 必须通过 validate:all：是
- 必须通过 release 验证：是
- 必须有桌面验收证据：是

## Open Blockers

| id | category | status | title | source | required actions | closure evidence |
| --- | --- | --- | --- | --- | --- | --- |
| transition_out_high_risk | animation-naturalness | open | 4 个 high 风险 transitionOut 回切动作未接入 | docs/action-transition-risk-report.md | 生成并接入 sleep_to_sleeping<br>生成并接入 waking_to_idle<br>生成并接入 poke_annoyed_to_idle<br>生成并接入 paw_raise_to_idle<br>重新运行 npm run validate:all<br>重新运行 npm run validate:release<br>补充桌面多帧截图验收 | 未补充 |
| runtime_duration_short | animation-duration | open | 30 个 runtime 动作时长不足 | docs/animation-asset-contract.md | 为 daily 动作补充更长视频或分段素材<br>完成抽帧和水印检查<br>更新 runtime manifest<br>重新运行 npm run validate:all<br>重新运行 npm run validate:release | 未补充 |
| windows_real_machine_smoke | distribution | open | Windows 安装包实机验收未完成 | docs/windows-release-smoke.md | 在 GitHub Actions 或 Windows 环境生成 Windows 安装包<br>在 Windows 10 或 Windows 11 实机安装<br>记录透明置顶、鼠标靠近、定时气泡、拖拽、卸载截图<br>将验收证据写入 docs/windows-release-smoke.md 或后续验收记录 | 未补充 |
| macos_sign_notarize | distribution | open | macOS 正式签名与公证未完成 | docs/signed-release-safety.md | 配置正式 Developer ID 签名身份<br>完成 macOS notarization<br>验证 Gatekeeper 首次打开体验<br>重新运行 npm run validate:release | 未补充 |
| signed_user_safety_recheck | release-safety | open | 签名后普通用户安装安全提示复核未完成 | docs/signed-release-safety.md | 在签名/公证包上复核普通用户安装提示<br>更新 docs/signed-release-safety.md<br>更新 docs/release-playbook.md<br>重新运行 npm run validate:release | 未补充 |

## 关闭规则

- 不得只修改文字就关闭 blocker。
- 每个 blocker 关闭前必须补充 closureEvidence。
- 每个 blocker 关闭前必须重新运行 `npm run validate:all`。
- 涉及发布的 blocker 关闭前必须重新运行 `npm run validate:release`。
- 涉及桌面交互或动画自然度的 blocker 关闭前必须补充桌面多帧截图证据。
- `docs/release-blockers.json` 和本文档必须保持同步。
