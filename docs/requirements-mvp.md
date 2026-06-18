# 鱼仔桌面宠物 MVP 需求规格

## MVP 核心目标

第一版必须让用户在桌面上直接看到一只会动的猫。它不是只验证 Electron 窗口、状态机或占位图，而是要形成最小可感知的桌宠体验：看得见、会动、能打扰用户一下、能对鼠标靠近做反应，并且能调整基本显示状态。

## 当前实现范围

- 透明、无边框、置顶 Electron 窗口
- 基于 `assets/origin` 源视频生成的透明序列帧动画
- 启动后不立即在猫咪头顶显示文字；进入正常提醒窗口后，定时气泡提醒喝水、休息
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
- 启动初始画面保持干净，不立即显示头顶文字；进入正常提醒窗口后，定时气泡能自动出现，并显示喝水或休息提醒文案。
- 用户能调整或重置桌宠位置，并能调整角色大小或使用默认尺寸配置。
- 验收前必须先列出本次源素材、生成动作、覆盖路径和验证方式清单，得到确认后再执行。

## 2026-06-14 第一版验收记录

当前 MVP 验收证据已同步到 `docs/mvp-evidence.json`，并通过 `npm run validate:mvp-evidence` 和 `npm run validate:all` 校验。后续修改桌宠显示、提醒、交互、位置尺寸或素材接入流程时，必须同步更新该证据清单。

- 源视频序列帧：已通过 `npm run validate:runtime-animations`、`npm run typecheck`、`npm run build` 和 Electron 截图 `/private/tmp/yuzai-window-source-mvp.png`。
- 定时气泡：已通过 `npm run validate:reminder-bubble-controller`、`npm run typecheck`、`npm run build` 和 Electron 截图 `/private/tmp/yuzai-window-bubble-mvp.png`；当前规则为启动初始画面不立即显示头顶文字，进入正常提醒窗口后再显示“喝口水吧”或“休息一下眼睛”提醒。
- 角色大小/位置：已通过 `npm run typecheck`、`npm run build` 和 Electron 截图 `/private/tmp/yuzai-window-size-mvp.png`；位置支持拖拽和右键重置，角色大小支持小、标准、大三档。
- 设置持久化：已接入本地 JSON 设置文件，保存角色大小、窗口位置和动作频率；已通过临时 `YUZAI_SETTINGS_PATH=/private/tmp/yuzai-settings-test.json` 验证重启加载 340 尺寸，并通过 `YUZAI_TEST_MOVE_MS=500 YUZAI_TEST_MOVE_X=120 YUZAI_TEST_MOVE_Y=140` 验证移动后写回位置。
- 日常姿势变化：idle 状态已自动插入 `tail_wag` 和 `idle_secondary` 日常动作，已通过 `YUZAI_CAPTURE_DELAY_MS=2600 YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-daily-variation.png npm run dev` 桌面截图确认可见摇尾姿态。
- 鼠标靠近：已接入 Electron 主进程全局鼠标位置轮询，通过 `mouse:proximity` 通知渲染进程触发交互动作；已通过 `npm run typecheck`、`npm run build`、`npm run validate:animation-director` 和 Electron 自动触发截图 `/private/tmp/yuzai-window-proximity-paw-raise.png`。截图中可见 `paw_raise` 抬爪反馈。
- 隐藏恢复：已接入托盘菜单，隐藏后可通过托盘重新显示桌宠；已通过 `YUZAI_TEST_HIDE_MS=500 YUZAI_TEST_SHOW_MS=1100 YUZAI_CAPTURE_DELAY_MS=1700 YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-tray-restore.png npm run dev` 自动复现隐藏和恢复路径。
- 打包入口：已接入 electron-builder 配置和临时鱼仔应用图标，支持 `npm run package:dir` 本机应用包验证，并提供 `npm run package:mac`、`npm run package:win` 安装包脚本入口；产物输出到 `release/`，不提交 Git。
- 多帧动画验收：已接入 `YUZAI_CAPTURE_SEQUENCE_PATH`、`YUZAI_CAPTURE_SEQUENCE_COUNT` 和 `YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS` 测试钩子，可一次捕获连续桌面帧，用于检查播放过程中的空白帧、闪烁、卡顿和姿势切换；路径规划已通过 `npm run validate:capture-plan` 验证，截图序列存在性、非空、PNG 有效性、尺寸和变化检查已通过 `npm run validate:capture-sequence-inspector` 验证。
- Manifest 合约：已接入 `npm run validate:manifest-contract:current`，自动确认当前 13 个 `PetStateName` 都在运行时 manifest 中有映射，并检查动作分类、安全帧、打断策略和非循环交互动作回流配置。
- 素材处理确认：已接入 `npm run animations:intake-checklist`，用于在新增、删除、覆盖或重新生成动作素材前输出中文确认清单，列出源视频、目标 action、分类、覆盖路径、manifest 修改判断和验证方式。
- 源视频预检：已接入 `npm run animations:audit-origin`，在抽帧前检查 manifest 引用的源视频是否存在、包含视频流、时长足够生成当前 72 帧、尺寸不低于最低阈值。
- 13 状态覆盖跟踪：已接入 `npm run animations:state-coverage`，输出每个桌宠状态当前是否有独立/复用动作、是否仍 fallback 到待机，以及可灵提示词计划中的候选动作；当前缺口面板可写入 `docs/state-coverage.md`。
- 13 状态补齐待办：已接入 `npm run animations:state-backlog -- --write docs/state-backlog.md`，将 fallback / missing 状态转成建议生成 action、计划输出路径和下一步接入动作；当前 7 个 fallback 状态均已有候选生成动作。

## 明确不实现

- 办公软件检测
- 低电量、系统弹窗、保存成功等系统联动
- 配饰系统
- 用户自定义动作导入

## 后续允许扩展

- 优化后的正式图标、签名和公证后的 exe/dmg 分发包
- 天气联动动作
- 日程提醒动作
