# 鱼仔桌宠试用分发手册

日期：2026-06-20

用途：记录当前本地试用包的构建、安装、首次打开、回滚和限制。本文档面向“给自己或少量测试者试用”的阶段，不等同于正式上架分发。

## 当前包形态

- 本地 macOS 应用目录：`release/mac-arm64/鱼仔桌面宠物.app`
- 构建入口：`npm run package:dir`
- 发布验证入口：`npm run validate:release`
- 打包内容只包含运行所需的 `dist/electron`、`dist/renderer` 和 `dist/assets/runtime`。
- 应用包不包含 `assets/origin` 源视频，也不包含 `assets/origin/generated/kling` 中的可灵源视频。

## 构建与验证步骤

1. 确认工作区没有不相关的待提交改动。
2. 执行完整发布验证：

```bash
npm run validate:release
```

3. 验证通过后，检查输出目录：

```bash
ls -la release/mac-arm64
ls -la "release/mac-arm64/鱼仔桌面宠物.app/Contents/Resources"
```

4. 预期存在：

- `release/mac-arm64/鱼仔桌面宠物.app`
- `release/mac-arm64/鱼仔桌面宠物.app/Contents/Resources/app.asar`
- `release/mac-arm64/鱼仔桌面宠物.app/Contents/Resources/icon.icns`

## 安装步骤

当前建议先使用本地应用目录试用，不把 `release/` 提交到 Git。

1. 运行 `npm run validate:release` 生成最新应用目录。
2. 在 Finder 中打开 `release/mac-arm64/`。
3. 将 `鱼仔桌面宠物.app` 拖到 `/Applications`，或直接从 `release/mac-arm64/` 双击试用。
4. 如果只是开发者自己测试，优先直接运行 `release/mac-arm64/鱼仔桌面宠物.app`，避免覆盖已经放入 `/Applications` 的旧版本。

## 首次打开

当前 macOS 包没有正式签名与公证。首次打开可能出现系统安全提示。

建议测试路径：

1. 优先在开发机本地运行，不面向普通用户分发。
2. 如果系统阻止打开，到“系统设置 -> 隐私与安全性”中允许本次打开。
3. 打开后确认桌面上出现透明置顶的鱼仔窗口。
4. 观察至少 30 秒，确认猫咪在桌面上可见、会动，且不会立即显示启动气泡文字。
5. 移动鼠标靠近鱼仔，确认会触发可见反馈。
6. 右键打开菜单，确认隐藏、显示、重置位置和大小选项仍可用。

## 回滚步骤

如果新包有问题，按以下顺序回滚：

1. 退出当前 `鱼仔桌面宠物.app`。
2. 如果旧版应用在 `/Applications`，将当前问题版本移到废纸篓，再恢复旧版。
3. 如果从 Git 回滚开发版本，使用目标提交重新构建：

```bash
git log --oneline -n 10
git switch main
git pull
npm run validate:release
```

4. 如果需要回到某个已知提交，先让维护者确认目标 commit，再用新工作区或临时分支重建；不要直接在当前工作区执行破坏性 reset。

## 卸载步骤

当前应用没有安装额外系统服务或后台守护进程。卸载以删除应用包和可选清理本地设置为主。

1. 退出 `鱼仔桌面宠物.app`。
2. 如果应用在 `/Applications`，将 `/Applications/鱼仔桌面宠物.app` 移到废纸篓。
3. 如果应用只在项目 `release/mac-arm64/` 中试用，删除 `release/mac-arm64/鱼仔桌面宠物.app`，或重新运行 `npm run validate:release` 覆盖本地构建产物。
4. 如需清理本地设置，先确认当前使用的设置文件路径。开发验证常用 `YUZAI_SETTINGS_PATH=/private/tmp/yuzai-settings-test.json`；正式默认路径以运行时设置模块为准，不要盲删用户目录。
5. 卸载后重新打开旧版或新构建包，确认桌面上只剩一个鱼仔窗口。

## 版本标签与回滚 commit

给测试者发包前，必须记录一个可回滚的 Git commit。建议在通过 `npm run validate:release` 后创建注释标签：

```bash
git status --short
git log --oneline -n 5
git tag -a yuzai-v0.1.0-test.1 -m "YuZai desktop pet test build 1"
git push origin yuzai-v0.1.0-test.1
```

规则：

1. 标签只能指向已经通过 `npm run validate:release` 的提交。
2. 标签名使用 `yuzai-v版本-test.序号`，例如 `yuzai-v0.1.0-test.1`。
3. 如果只是本地自测，可以先不打标签，但必须记录 commit hash。
4. 如果测试包需要回滚，用标签或 commit 重新 checkout 到新工作区构建，不在当前工作区执行破坏性 reset。
5. 如果后续生成 transitionOut 或更长 daily 动作，应使用新的标签，不复用旧标签。

当前已创建的第一版试用标签记录见 `docs/release-tag-record.md`。

## 已知限制

- 当前 `release/mac-arm64/鱼仔桌面宠物.app` 是本地验证包，不是已签名、公证的正式发行包。
- `package:mac` 和 `package:win` 只是安装包入口，仍需要分别做 macOS 公证和 Windows 实机验收。
- 当前动作自然度仍有 4 个 high 风险回切，后续应生成并接入对应的 transitionOut 动作。
- 当前 runtime 时长不足动作数仍为 30，长时间陪伴可能出现重复感。
- 当前应用包不包含 `assets/origin`，因此不能从应用包内反向恢复源视频或重新抽帧。

## 后续正式分发前检查

正式分发前至少补齐：

1. 正式应用图标复核。
2. macOS 签名与公证。
3. Windows 安装包实机验收。
4. 普通用户安装、卸载和安全提示复核。
5. 一个明确的版本标签和回滚 commit。
6. transitionOut 自然度修复是否纳入本版本的最终决策。

## 当前边界

- 本文档只补齐试用分发说明和回滚路径。
- 不调用可灵生成视频。
- 不新增或覆盖 `assets/runtime/animations/*/frames`。
- 不修改 `assets/runtime/animations/manifest.json`。
