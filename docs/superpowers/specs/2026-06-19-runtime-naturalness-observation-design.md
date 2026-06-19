# 桌宠动作自然度长时间观察设计

## 背景

当前桌宠已经完成 MVP、13 状态 independent 覆盖、拖拽专项和 16 方向鼠标跟随。项目看板明确下一步应优先做长时间桌面观察和候选视频质量筛选，而不是直接覆盖 runtime。动作衔接风险报告仍显示 4 个 high 风险回切，且 16 方向动作已接入但仍需要更长观察来判断进入延迟、方向变化和回到日常动作是否自然。

本阶段目标是把“动作自然不自然”从主观反馈转成可复查证据。它只新增观察工具、报告和验证门禁，不生成新视频、不抽帧、不修改 manifest、不接入新 transitionOut。

## 目标

- 生成中文自然度观察报告 `docs/runtime-naturalness-observation.md`。
- 复用已有桌面连续截图能力，保存观察证据到 `assets/reviews/runtime/naturalness-observation/`。
- 把当前高风险切换、runtime 动作时长不足、16 方向跟随截图变化和后续处理建议汇总到同一入口。
- 增加验证脚本，确保报告和当前 manifest、风险报告、资产契约、截图证据同步。

## 非目标

- 不调用可灵生成视频。
- 不新增或覆盖 `assets/runtime/animations/*/frames`。
- 不修改 `assets/runtime/animations/manifest.json` 的动作、帧数或 `transitionOut`。
- 不修改用户未跟踪的个性化参考文件。
- 不声称动作自然度已最终解决；本阶段只建立观察和排序机制。

## 架构

新增 `scripts/runtime-naturalness-observation.mjs` 作为报告生成器。它读取：

- `assets/runtime/animations/manifest.json`
- `docs/action-transition-risk-report.md`
- `docs/animation-asset-contract.md`
- `assets/reviews/runtime/naturalness-observation/*.png`

脚本输出结构化摘要和中文 Markdown。报告包含：

- 当前 runtime 动作总数和截图证据数量。
- 动作衔接风险摘要，突出 high 风险回切。
- runtime 时长不足摘要，提示哪些动作仍低于契约目标。
- 桌面观察截图序列摘要，记录截图数量、尺寸、变化帧和证据目录。
- 下一步建议：先观察/筛选，再决定是否生成 transitionOut 或更长动作视频。

新增 `scripts/validate-runtime-naturalness-observation.mjs` 作为门禁。它重新生成报告文本并与 `docs/runtime-naturalness-observation.md` 对比，同时确认截图目录存在、报告包含 high 风险和不越界声明。

## 桌面观察流程

第一版观察使用已有 Electron 截图钩子：

```bash
YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-naturalness.png \
YUZAI_CAPTURE_SEQUENCE_COUNT=12 \
YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=300 \
YUZAI_CAPTURE_DELAY_MS=900 \
npm run dev
```

然后检查截图：

```bash
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-naturalness.png --count 12 --min-changed-frames 6 --min-width 200 --min-height 200
```

通过后将截图复制到：

```text
assets/reviews/runtime/naturalness-observation/
```

## 验证

- `npm run validate:runtime-naturalness-observation`
- `npm run validate:project-status-current`
- `npm run validate:all`
- `git diff --check`
- 密钥扫描确认没有真实可灵 key 入库。

## 后续决策

报告生成后，下一阶段根据证据选择：

1. 如果 high 风险回切仍是主要问题，进入 transitionOut 视频生成和接入清单。
2. 如果 16 方向跟随进入延迟明显，优先优化鼠标跟随调度和测试钩子。
3. 如果长期待机重复感明显，优先生成更长 daily 动作或合并分段素材。
