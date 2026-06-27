# 发布阻塞现场检查记录

日期：2026-06-27

用途：记录本轮继续推进“完成项目”时，对分发相关检查做过的现场记录。用户已确认项目只在本人电脑本机运行，因此 Windows 实机验收、macOS 正式签名/公证和签名后普通用户安全复核已取消为完成阻塞。

## 当前结论

- `windows_real_machine_smoke`：canceled。Windows 实机验收已取消，当前只保留 `npm run actions:windows-dispatch` 和 `npm run actions:windows-status` 作为未来 Windows 分发工具。
- `macos_sign_notarize`：canceled。macOS 签名与公证已取消，当前本机自用继续使用未签名验证包。
- `signed_user_safety_recheck`：canceled。签名后普通用户安全提示复核已取消，未来对外分发时再重新启用。

## Windows Actions 查询

本轮执行：

```bash
npm run actions:windows-status
```

沙盒内结果：

```text
Error: getaddrinfo ENOTFOUND api.github.com
```

外部只读网络结果：

```text
GitHub API request failed for /repos/CrayonW/YuZai/actions/workflows/windows-package.yml/runs?per_page=5: API rate limit exceeded
```

判断：

- 当前脚本入口可用，但匿名请求被 GitHub API rate limit 拦截。
- Windows 实机验收已取消为本机自用完成阻塞。
- 如果未来恢复 Windows 分发，再使用只读 `GITHUB_TOKEN` 重新运行 `npm run actions:windows-status`，或在 GitHub Actions 页面补充 run/artifact 截图证据，并按 `docs/windows-release-smoke.md` 验收。

## Windows Actions 手动触发

本轮执行：

```bash
npm run actions:windows-dispatch
npm run actions:windows-dispatch -- --confirm
```

结果：

```text
dryRun: true
ref: refs/heads/main
event: workflow_dispatch
Missing GITHUB_TOKEN; refusing to dispatch workflow.
```

判断：

- 当前项目已有不依赖 `gh` CLI 的手动触发入口。
- 无 `--confirm` 时只 dry-run，不触发远端 workflow。
- 有 `--confirm` 但没有 `GITHUB_TOKEN` 时拒绝触发。
- 真实触发仍需要在本机环境变量中提供具备 Actions workflow 权限的 token；当前本机自用不要求触发。

## macOS 签名身份检查

本轮执行：

```bash
security find-identity -v -p codesigning
```

结果：

```text
0 valid identities found
```

判断：

- 当前本机没有可用代码签名身份。
- `package.json` 的 macOS 打包配置仍显式设置 `identity: null`，本地验证包会跳过签名。
- macOS 签名与公证已取消为本机自用完成阻塞；如未来恢复对外分发，再配置正式 Developer ID Application 签名身份并完成 notarization。

## notarytool 可用性检查

本轮执行：

```bash
xcrun notarytool --help
```

结果：

```text
OVERVIEW: Manage submissions to the Apple notary service
SUBCOMMANDS:
  store-credentials
  submit
  info
  wait
  history
  log
```

判断：

- 当前机器具备 `notarytool` 命令。
- 但没有签名身份、没有已签名归档、也未配置公证凭据时，不执行签名、不调用 notarytool submit、不上传 Apple 公证。

## 下一步闭环条件

1. 当前本机自用：继续以 `npm run validate:release` 生成 `release/mac-arm64/鱼仔桌面宠物.app`。
2. 未来恢复 Windows 分发：使用 `GITHUB_TOKEN=Actions workflow 权限令牌 npm run actions:windows-dispatch -- --confirm` 触发 Windows workflow，再按 `docs/windows-release-smoke.md` 验收。
3. 未来恢复 macOS 对外分发：配置正式 Developer ID Application 签名身份，使用正式签名配置重新构建 macOS 包，并完成 notarization。
4. 未来恢复普通用户分发：在签名/公证包上复核普通用户首次打开、安全提示、安装和卸载体验。

## 当前边界

- 本文档只记录现场检查证据。
- 不调用可灵生成视频。
- 不新增或覆盖 runtime 帧。
- 不修改 runtime manifest。
- Windows 实机验收已取消为当前完成阻塞。
- macOS 签名与公证已取消为当前完成阻塞。
- 不执行签名、不调用 notarytool submit、不上传 Apple 公证。
