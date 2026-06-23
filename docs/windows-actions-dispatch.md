# Windows Package Actions 手动触发

日期：2026-06-23

用途：记录如何在没有 `gh` CLI 的环境中，使用项目脚本手动触发 GitHub Actions 的 Windows 试用包构建。本文档不替代 Windows 实机验收，也不代表 artifact 已经生成。

## 使用命令

先 dry-run 查看目标：

```bash
npm run actions:windows-dispatch
```

确认要触发后，使用具备 Actions workflow 权限的 `GITHUB_TOKEN`：

```bash
GITHUB_TOKEN=你的只读或 Actions workflow 权限令牌 npm run actions:windows-dispatch -- --confirm
```

脚本会触发：

- 仓库：`CrayonW/YuZai`
- workflow：`windows-package.yml`
- ref：`main`
- GitHub API：`/repos/CrayonW/YuZai/actions/workflows/windows-package.yml/dispatches`

## 输出含义

- `dryRun: true`：没有发起远端 workflow，只展示将要触发的目标。
- `dryRun: false`：GitHub API 已接受 workflow dispatch 请求。
- `message`：下一步提示。触发后继续使用 `npm run actions:windows-status` 查询 run 和 artifact。

## 权限要求

触发 workflow dispatch 需要可访问仓库并具备 Actions workflow 权限的 GitHub token。当前项目不会提交 token；只通过本机环境变量 `GITHUB_TOKEN` 读取。

如果 token 权限不足，GitHub API 会返回错误；这不代表项目代码构建失败，只代表远端触发权限不足。

## 验收边界

- 本脚本只触发远端 Windows 试用包构建。
- 本脚本不调用可灵生成视频。
- 本脚本不读取或输出可灵密钥。
- 本脚本不新增或覆盖 runtime 帧。
- 本脚本不替代 Windows 实机验收。
- 即使 workflow 成功并生成 `yuzai-windows-package` artifact，也必须继续按 `docs/windows-release-smoke.md` 完成 Windows 10/11 安装、透明置顶、鼠标靠近、定时气泡、拖拽和卸载检查。

## 后续闭环

1. 执行 `GITHUB_TOKEN=... npm run actions:windows-dispatch -- --confirm`。
2. 执行 `GITHUB_TOKEN=... npm run actions:windows-status` 查询 latest run 和 `yuzai-windows-package` artifact。
3. 下载 artifact，在 Windows 10/11 环境安装并按 `docs/windows-release-smoke.md` 记录证据。
4. 补充 closureEvidence 后，重新运行 `npm run validate:all` 和 `npm run validate:release`。
