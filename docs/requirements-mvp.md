# 鱼仔桌面宠物 MVP 需求规格

## MVP 核心目标

第一版必须让用户在桌面上直接看到一只会动的猫。它不是只验证 Electron 窗口、状态机或占位图，而是要形成最小可感知的桌宠体验：看得见、会动、能打扰用户一下、能对鼠标靠近做反应，并且能调整基本显示状态。

## 当前实现范围

- 透明、无边框、置顶 Electron 窗口
- 基于 `assets/origin` 源视频生成的透明序列帧动画
- 启动后定时气泡提醒喝水、休息
- Canvas 2D 简易绘制鱼仔
- `front / left / right` 三视角
- `idle / walking / sleepy / sleeping / waking / surprised / shy / dragging / waving`
- Idle 作为全局回流中心
- 所有状态切换进入过渡计时
- 点击、连续点击、长按拖拽
- 默认鼠标穿透，宠物命中区域可交互
- 右键菜单：隐藏、显示、重置位置、动作频率、退出
- 右键菜单：角色大小支持小、标准、大三档
- 本地设置：角色大小、窗口位置、动作频率可持久保存
- 托盘菜单：隐藏后可恢复显示，并支持退出
- 桌面边缘 20px 回弹

## MVP 必须包含

- 桌面上能看到一只会动的猫，动作应来自 `assets/origin` 源素材重建后的透明序列帧，不能只显示占位兜底渲染。
- 桌宠要在所有应用最上层显示，保持透明、无边框、置顶。
- 定时弹出气泡说话，用于提醒喝水、休息等轻量提醒。
- 支持角色大小和位置设定调整，至少能重置位置，并能配置或调整显示尺寸。
- 鼠标靠近时有反应，例如看向鼠标、轻微动作、摇尾巴或其他已批准互动动作。
- 支持姿势变换，至少包含待机、走动、摇尾巴或同等可见变化；后续 13 状态补齐后再统一优化。

## MVP 验收标准

- 启动后，鱼仔出现在真实桌面窗口中，而不是只在网页、截图或调试页中可见。
- 窗口在常用应用上方可见，且不会被普通应用窗口遮挡。
- 至少一个待机循环和一个姿势变化动作能连续播放，没有明显空白帧、闪烁或水印。
- 鼠标靠近桌宠时，状态机触发可见反馈。
- 定时气泡能自动出现，并显示喝水或休息提醒文案。
- 用户能调整或重置桌宠位置，并能调整角色大小或使用默认尺寸配置。
- 验收前必须先列出本次源素材、生成动作、覆盖路径和验证方式清单，得到确认后再执行。

## 2026-06-14 第一版验收记录

- 源视频序列帧：已通过 `npm run validate:runtime-animations`、`npm run typecheck`、`npm run build` 和 Electron 截图 `/private/tmp/yuzai-window-source-mvp.png`。
- 定时气泡：已通过 `npm run typecheck`、`npm run build` 和 Electron 截图 `/private/tmp/yuzai-window-bubble-mvp.png`，启动后可见“喝口水吧”提醒。
- 角色大小/位置：已通过 `npm run typecheck`、`npm run build` 和 Electron 截图 `/private/tmp/yuzai-window-size-mvp.png`；位置支持拖拽和右键重置，角色大小支持小、标准、大三档。
- 设置持久化：已接入本地 JSON 设置文件，保存角色大小、窗口位置和动作频率；已通过临时 `YUZAI_SETTINGS_PATH=/private/tmp/yuzai-settings-test.json` 验证重启加载 340 尺寸，并通过 `YUZAI_TEST_MOVE_MS=500 YUZAI_TEST_MOVE_X=120 YUZAI_TEST_MOVE_Y=140` 验证移动后写回位置。
- 鼠标靠近：已接入 Electron 主进程全局鼠标位置轮询，通过 `mouse:proximity` 通知渲染进程触发交互动作；已通过 `npm run typecheck`、`npm run build`、`npm run validate:animation-director` 和 Electron 自动触发截图 `/private/tmp/yuzai-window-proximity-paw-raise.png`。截图中可见 `paw_raise` 抬爪反馈。
- 隐藏恢复：已接入托盘菜单，隐藏后可通过托盘重新显示桌宠；已通过 `YUZAI_TEST_HIDE_MS=500 YUZAI_TEST_SHOW_MS=1100 YUZAI_CAPTURE_DELAY_MS=1700 YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-tray-restore.png npm run dev` 自动复现隐藏和恢复路径。
- 打包入口：已接入 electron-builder 配置，支持 `npm run package:dir` 本机应用包验证，并提供 `npm run package:mac`、`npm run package:win` 安装包脚本入口；产物输出到 `release/`，不提交 Git。

## 明确不实现

- 办公软件检测
- 低电量、系统弹窗、保存成功等系统联动
- 配饰系统
- 用户自定义动作导入

## 后续允许扩展

- 正式图标、签名和公证后的 exe/dmg 分发包
- 天气联动动作
- 日程提醒动作
