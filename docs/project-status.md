# 鱼仔项目当前状态看板

更新日期：2026-06-18

本文档由 `npm run project:status -- --write docs/project-status.md` 生成，用来快速查看当前项目是否满足 MVP、13 状态覆盖和素材接入门禁。后续修改状态、提醒、素材接入或运行时门禁后，应重新生成并通过 `npm run validate:project-status-current`。

## 当前结论

- 启动头顶文字：已清理，并有 1200ms 桌面截图验收记录
- MVP 证据：7 / 7 项 verified
- 13 状态覆盖：independent 12 / mixed 0 / fallback 1 / missing 0
- 待补状态：1 个
- 当前不得越界：`dragging-special` 未正式批准前，禁止抽帧、去水印/抠绿、修改 runtime manifest 或声称拖拽动作已进入桌宠。

## 当前唯一状态缺口

| state | suggested action | category | planned output | current action | next step |
| --- | --- | --- | --- | --- | --- |
| dragging | dragging | interactive | assets/origin/generated/kling/dragging.mp4 | idle_primary | 源视频已存在，等待用户确认清单后接入 manifest |

## runtime 接入批准状态

| wave | name | approval | approval source |
| --- | --- | --- | --- |
| wave1 | 第一波：低疲劳日常与关键交互 | 已批准 | docs/runtime-intake-approvals/wave1.approved.json |
| wave2 | 第二波：日常生活和互动变化 | 已批准 | docs/runtime-intake-approvals/wave2.approved.json |
| sleep-routine | 第三波：睡眠作息链路 | 已批准 | docs/runtime-intake-approvals/sleep-routine.approved.json |
| dragging-special | 拖拽专项 | 未批准 | docs/runtime-intake-approvals/dragging-special.example.json |

## 下一步执行清单

1. 如要继续接入拖拽动作，先让用户确认 `docs/runtime-intake-dragging-special-execution-checklist.md`。
2. 确认后再创建正式批准文件 `docs/runtime-intake-approvals/dragging-special.approved.json`，不能把 example 文件当作批准。
3. 批准后按清单执行逐视频检查、去水印/抠绿、序列帧生成、manifest 更新和拖拽专项桌面验收。
4. 任一 MVP、状态覆盖或素材接入规则变化后，重新运行 `npm run project:status -- --write docs/project-status.md` 和 `npm run validate:all`。

## 复查命令

```bash
npm run validate:project-status-current
npm run validate:mvp-evidence
npm run validate:state-coverage-current
npm run validate:state-backlog-current
npm run validate:runtime-intake-approvals-current
npm run validate:all
```
