# 发布阻塞现场检查记录

日期：2026-06-23

用途：记录本轮继续推进“完成项目”时，对剩余发布阻塞做过的现场检查。本文档是证据入口，不替代 Windows 实机验收、macOS 正式签名、公证或签名后普通用户安全复核。

## 当前结论

- `windows_real_machine_smoke`：仍为 open。当前环境可以执行查询脚本，但匿名 GitHub API 查询被 rate limit 拦截，尚未确认 `windows-package.yml` 最新 run 或 `yuzai-windows-package` artifact。本轮已补充 `npm run actions:windows-dispatch`，后续可用具备 Actions workflow 权限的 `GITHUB_TOKEN` 手动触发构建。
- `macos_sign_notarize`：仍为 open。本机 Keychain 当前没有可用代码签名身份，项目打包配置仍是 `identity: null`，不能视为正式签名包。
- `signed_user_safety_recheck`：仍为 open。没有签名/公证包时，无法做普通用户安装安全提示复核。

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
- 关闭 `windows_real_machine_smoke` 前，仍需要使用只读 `GITHUB_TOKEN` 重新运行 `npm run actions:windows-status`，或在 GitHub Actions 页面补充 run/artifact 截图证据。
- 即使确认 artifact 存在，也不替代 Windows 实机验收；仍必须按 `docs/windows-release-smoke.md` 完成 Windows 10/11 安装、透明置顶、鼠标靠近、定时气泡、拖拽和卸载检查。

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
- 真实触发仍需要在本机环境变量中提供具备 Actions workflow 权限的 token。

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
- 关闭 `macos_sign_notarize` 前，必须配置正式 Developer ID Application 签名身份，移除未签名配置或使用正式签名配置重新打包，并完成 notarization。

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

1. 使用 `GITHUB_TOKEN=Actions workflow 权限令牌 npm run actions:windows-dispatch -- --confirm` 触发 Windows workflow。
2. 使用 `GITHUB_TOKEN=只读令牌 npm run actions:windows-status` 查询 Windows workflow run 和 artifact。
3. 下载或生成 Windows 安装包后，在 Windows 10/11 环境执行 `docs/windows-release-smoke.md`。
4. 配置正式 Developer ID Application 签名身份。
5. 使用正式签名配置重新构建 macOS 包，并完成 notarization。
6. 在签名/公证包上复核普通用户首次打开、安全提示、安装和卸载体验。
7. 补充 closureEvidence 后，重新运行 `npm run validate:all` 和 `npm run validate:release`。

## 当前边界

- 本文档只记录现场检查证据。
- 不调用可灵生成视频。
- 不新增或覆盖 runtime 帧。
- 不修改 runtime manifest。
- 不关闭任何 release blocker。
- 不替代 Windows 实机验收。
- 不执行签名、不调用 notarytool submit、不上传 Apple 公证。
