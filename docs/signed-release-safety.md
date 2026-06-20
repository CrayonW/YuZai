# 鱼仔桌宠签名包安全提示

日期：2026-06-20

用途：说明当前未签名试用包和未来正式签名与公证包的安全边界，避免测试者把开发验证包误当成正式分发包。

## 当前状态

- 当前试用标签：`yuzai-v0.1.0-test.1`
- 当前本地应用目录：`release/mac-arm64/鱼仔桌面宠物.app`
- 当前包形态：未签名试用包。
- 当前分发方式：仅建议开发者或少量测试者本地试用。
- 当前不代表正式签名与公证发布。

## 未签名试用包

未签名试用包可能触发 macOS Gatekeeper 安全提示。测试者应知道：

1. 这是开发阶段测试包，不是面向普通用户的正式安装包。
2. 只能从当前 GitHub 仓库或维护者提供的可信渠道获取。
3. 打开前先确认标签和 commit，对应 `docs/release-tag-record.md`。
4. 不要绕过未知来源安全提示去运行来历不明的同名应用。
5. 如果系统提示来源未知，应先联系维护者确认，不要把“允许打开”当作常规安装步骤。

## 正式签名与公证

正式签名与公证包发布前必须满足：

1. 使用正式开发者证书签名。
2. 完成 macOS notarization，并确认 Gatekeeper 不再把应用识别为未知开发者包。
3. 重新运行 `npm run validate:release`。
4. 记录新的版本标签和回滚 commit。
5. 更新 `docs/release-tag-record.md` 或创建新的版本记录。
6. 明确这次版本是否包含 transitionOut 自然度修复。

## 给测试者的安全提示

发送试用包时应同时附带：

- 标签名：`yuzai-v0.1.0-test.1`
- 回滚 commit：见 `docs/release-tag-record.md`
- 安装和回滚说明：见 `docs/release-playbook.md`
- 已知限制：当前仍有 4 个 high 风险 transitionOut 和 30 个 runtime 时长不足动作。
- 安全说明：当前是未签名试用包，不是正式签名与公证发行包。

## 当前边界

- 本文档只补齐签名包安全提示。
- 不调用可灵生成视频。
- 不新增或覆盖 `assets/runtime/animations/*/frames`。
- 不修改 `assets/runtime/animations/manifest.json`。
