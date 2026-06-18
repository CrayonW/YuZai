# 鱼仔项目当前状态看板

更新日期：2026-06-18

本文档由 `npm run project:status -- --write docs/project-status.md` 生成，用来快速查看当前项目是否满足 MVP、13 状态覆盖和素材接入门禁。后续修改状态、提醒、素材接入或运行时门禁后，应重新生成并通过 `npm run validate:project-status-current`。

## 当前结论

- 启动头顶文字：已清理，并有 1200ms 桌面截图验收记录
- MVP 证据：7 / 7 项 verified
- 13 状态覆盖：independent 13 / mixed 0 / fallback 0 / missing 0
- 待补状态：0 个
- runtime 接入边界：当前 4 个波次均已有正式批准文件；后续新增动作仍必须先列清单确认。

## 当前状态缺口

当前 13 个状态均已拥有 independent runtime 动作，没有剩余 fallback 或 missing 状态。

## runtime 接入批准状态

| wave | name | approval | approval source |
| --- | --- | --- | --- |
| wave1 | 第一波：低疲劳日常与关键交互 | 已批准 | docs/runtime-intake-approvals/wave1.approved.json |
| wave2 | 第二波：日常生活和互动变化 | 已批准 | docs/runtime-intake-approvals/wave2.approved.json |
| sleep-routine | 第三波：睡眠作息链路 | 已批准 | docs/runtime-intake-approvals/sleep-routine.approved.json |
| dragging-special | 拖拽专项 | 已批准 | docs/runtime-intake-approvals/dragging-special.approved.json |

## 下一步执行清单

1. 保持当前 MVP 和 13 状态覆盖稳定，后续新增动作视频先列清单确认。
2. 如果继续优化动作自然度，优先做长时间桌面观察和候选视频质量筛选，而不是直接覆盖 runtime。
3. 任一 MVP、状态覆盖或素材接入规则变化后，重新运行 `npm run project:status -- --write docs/project-status.md` 和 `npm run validate:all`。

## 复查命令

```bash
npm run validate:project-status-current
npm run validate:mvp-evidence
npm run validate:state-coverage-current
npm run validate:state-backlog-current
npm run validate:runtime-intake-approvals-current
npm run validate:all
```
