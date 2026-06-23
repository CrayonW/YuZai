# 鱼仔桌宠 Windows 试用验收清单

日期：2026-06-23

用途：记录 Windows 安装包的构建、安装、桌面可视化、交互和卸载验收步骤。当前文档是后续实机测试的操作票；本机 macOS 不能替代 Windows 实机验收。

## 当前结论

- Windows 安装包入口：`npm run package:win`
- Windows 远端打包入口：`.github/workflows/windows-package.yml`
- Windows Actions 状态查询：`docs/windows-actions-status.md`
- 当前状态：验收清单已补齐，Windows 实机验收尚未执行。
- 适用环境：Windows 10 或 Windows 11 实机、虚拟机或可信 CI 产物下载后实机安装。
- 验收边界：本清单只验证已有 runtime 桌宠能力和安装包行为，不调用可灵生成视频，不新增或覆盖 runtime 帧，不修改 `assets/runtime/animations/manifest.json`。

## 打包前检查

在 Windows 或可构建 Windows NSIS 安装包的环境执行：

```bash
npm run validate:release
npm run package:win
```

也可以在 GitHub Actions 中手动触发 `.github/workflows/windows-package.yml`，下载 `yuzai-windows-package` artifact 后再按本文档执行 Windows 实机验收。
远端 run 和 artifact 可先按 `docs/windows-actions-status.md` 使用 `npm run actions:windows-status` 查询；该查询不替代 Windows 实机验收。

预期：

- `npm run validate:release` 通过。
- `npm run package:win` 生成 Windows 安装包或 `win-unpacked` 目录。
- `.github/workflows/windows-package.yml` 能上传 `yuzai-windows-package` artifact。
- 打包产物不包含 `assets/origin` 源视频。
- 打包产物不包含 `assets/origin/generated/kling` 中的可灵源视频。
- 打包过程不调用可灵生成视频。

## 安装包验收

在 Windows 10 或 Windows 11 上执行：

1. 双击安装包。
2. 按安装向导完成安装。
3. 从开始菜单或桌面快捷方式启动鱼仔桌宠。
4. 记录安装包文件名、测试机器系统版本、测试日期和对应 Git commit。

通过标准：

- 安装过程没有崩溃。
- 启动后桌面上能看到一只会动的猫。
- 没有出现源视频、调试窗口或无关控制台。

## 桌面可视化验收

启动后至少观察 60 秒：

1. 桌宠窗口保持透明背景。
2. 桌宠显示在所有应用最上层。
3. 切换到浏览器、编辑器或资源管理器后，猫仍可见。
4. 猫咪保持连续动作，不应静止成空白或黑框。
5. 定时气泡能弹出喝水或休息提醒。

通过标准：

- 透明置顶可见。
- 动画连续播放。
- 定时气泡不遮挡系统关键区域。

## 交互验收

逐项操作并截图留证：

1. 鼠标靠近猫咪，确认有明显反馈。
2. 移动鼠标到不同方向，确认方向跟随或姿势变化可见。
3. 拖拽猫咪，确认位置跟随鼠标移动。
4. 调整角色大小，确认大小变化后仍能正常播放。
5. 右键打开菜单，确认隐藏、显示、重置位置和大小入口可用。
6. 隐藏后从托盘或菜单恢复，确认猫重新出现在桌面。

通过标准：

- 鼠标靠近有反应。
- 拖拽有手感，不应卡死或丢失窗口。
- 姿势变换后能回到日常动作。
- 设置改变后重启仍符合预期。

## 卸载验收

1. 退出鱼仔桌宠。
2. 从 Windows 设置或安装包卸载入口执行卸载。
3. 卸载后确认开始菜单、桌面快捷方式和安装目录已清理。
4. 如果保留用户设置，记录设置文件位置；如果清理用户设置，先确认不会误删其他文件。

通过标准：

- 卸载过程没有崩溃。
- 卸载后不能再启动旧版本。
- 重新安装后能正常打开并显示猫咪。

## 必须记录的证据

每次 Windows 实机验收完成后，至少记录：

- Git commit 或版本标签。
- Windows 版本。
- 安装包文件名。
- 安装成功截图。
- 桌面透明置顶截图。
- 鼠标靠近反馈截图。
- 定时气泡截图。
- 卸载结果截图。
- 失败项和复现步骤。

## 已知限制

- 当前正式签名尚未完成。
- macOS 公证不适用于 Windows，但 Windows 安装包仍需要后续签名策略。
- 当前 4 个高风险回切已接入 `transitionOut` bridge，并已补 macOS 桌面多帧截图证据；Windows 实机仍需单独验收同类交互。
- 当前 runtime 时长不足动作数为 0；phase1-d 方向跟随动作采用已清理 runtime 帧循环展开，Windows 实机仍需观察长时间播放是否有明显重复感。
- 本清单完成前，不能把 Windows 安装包视为已经完成实机验收。
