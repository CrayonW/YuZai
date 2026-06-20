# Windows Package Actions 状态查询

日期：2026-06-20

用途：记录如何查询 GitHub Actions 中 `windows-package.yml` 的远端运行状态和 `yuzai-windows-package` artifact。本文档不替代 Windows 实机验收，也不代表安装包已签名或可正式分发。

## 使用命令

匿名查询可能遇到 GitHub API rate limit。建议使用只读 `GITHUB_TOKEN`：

```bash
GITHUB_TOKEN=你的只读令牌 npm run actions:windows-status
```

也可以不带 token 尝试：

```bash
npm run actions:windows-status
```

脚本会查询：

- workflow：`windows-package.yml`
- artifact：`yuzai-windows-package`
- 仓库：`CrayonW/YuZai`

## 输出含义

- `latestRun.status`：远端 workflow 是否 queued、in_progress 或 completed。
- `latestRun.conclusion`：完成后的结果，例如 success、failure、cancelled。
- `latestRun.htmlUrl`：GitHub Actions 运行页面。
- `artifacts[].name`：应包含 `yuzai-windows-package`。
- `artifacts[].archiveDownloadUrl`：artifact 下载 API 地址，通常需要认证。

## 使用边界

- 本命令只读查询 GitHub Actions 状态。
- 不调用可灵生成视频。
- 不读取或输出可灵密钥。
- 不新增或覆盖 runtime 帧。
- 不替代 Windows 实机验收。
- 即使 artifact 存在，也必须继续按 `docs/windows-release-smoke.md` 做 Windows 10/11 安装、透明置顶、鼠标靠近、定时气泡、拖拽和卸载验收。

## 本轮查询记录

当前环境没有 `gh` CLI；GitHub connector 对 push workflow run 返回空；匿名 GitHub API 查询遇到 GitHub API rate limit。因此本轮只补齐项目内查询工具和操作说明，远端 run 与 artifact 仍需后续用 `GITHUB_TOKEN` 或 GitHub Actions 页面确认。
