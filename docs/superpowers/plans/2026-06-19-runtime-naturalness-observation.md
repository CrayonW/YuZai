# Runtime Naturalness Observation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a non-destructive runtime naturalness observation report and validation gate for the YuZai desktop pet.

**Architecture:** Add one report generator and one validator under `scripts/`. The generator reads existing manifest, transition-risk report, asset contract, and saved desktop captures, then writes a Chinese Markdown report. The validator regenerates expected content and fails if the report or evidence is stale.

**Tech Stack:** Node.js ESM scripts, existing Electron capture hooks, existing `capture:inspect`, Markdown docs, npm validation scripts.

---

### Task 1: Add Naturalness Observation Report Generator

**Files:**
- Create: `scripts/runtime-naturalness-observation.mjs`
- Output: `docs/runtime-naturalness-observation.md`

- [ ] **Step 1: Implement report parsing helpers**

Create `scripts/runtime-naturalness-observation.mjs` with functions:

```js
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { inspectCaptureSequence } from "./capture-sequence-inspector.mjs";

const root = process.cwd();
const defaultOutput = "docs/runtime-naturalness-observation.md";
const evidenceDir = "assets/reviews/runtime/naturalness-observation";
const evidenceSequencePath = `${evidenceDir}/yuzai-window-naturalness.png`;

export function buildRuntimeNaturalnessObservation(rootDir = root) {
  const manifest = readJson(join(rootDir, "assets/runtime/animations/manifest.json"));
  const riskText = readText(join(rootDir, "docs/action-transition-risk-report.md"));
  const contractText = readText(join(rootDir, "docs/animation-asset-contract.md"));
  const evidence = inspectEvidence(rootDir);
  const risk = parseRiskSummary(riskText);
  const shortRuntime = parseShortRuntimeCount(contractText);
  const actionCount = Object.keys(manifest.actions || {}).length;

  return renderReport({ actionCount, risk, shortRuntime, evidence });
}
```

- [ ] **Step 2: Implement evidence inspection**

Use existing screenshot naming conventions:

```js
function inspectEvidence(rootDir) {
  const absoluteDir = join(rootDir, evidenceDir);
  if (!existsSync(absoluteDir)) {
    return { exists: false, count: 0, changedFrames: 0, width: 0, height: 0, failures: [`缺少观察截图目录：${evidenceDir}`] };
  }
  const files = readdirSync(absoluteDir).filter((name) => name.endsWith(".png")).sort();
  if (files.length === 0) {
    return { exists: true, count: 0, changedFrames: 0, width: 0, height: 0, failures: [`${evidenceDir} 中没有 PNG 截图`] };
  }
  const result = inspectCaptureSequence({
    sequencePath: join(rootDir, evidenceSequencePath),
    count: files.length,
    minChangedFrames: Math.min(6, Math.max(1, files.length - 1)),
    minWidth: 200,
    minHeight: 200
  });
  const first = result.frames[0] || {};
  return {
    exists: true,
    count: files.length,
    changedFrames: result.changedFrames,
    width: first.width || 0,
    height: first.height || 0,
    failures: result.failures || []
  };
}
```

- [ ] **Step 3: Implement report rendering**

The Markdown must include the non-destructive boundary:

```js
export function renderReport(report) {
  const evidenceStatus = report.evidence.failures.length === 0 ? "通过" : "需要复查";
  return [
    "# 桌宠动作自然度长时间观察报告",
    "",
    "用途：把桌宠动作自然度、衔接风险和桌面截图证据汇总到一个可复查入口。本报告不批准生成新视频、不覆盖 runtime、不修改 manifest。",
    "",
    "## 当前摘要",
    "",
    `- runtime action 数：${report.actionCount}`,
    `- 衔接风险：high ${report.risk.high} / medium ${report.risk.medium} / low ${report.risk.low}`,
    `- runtime 时长不足动作数：${report.shortRuntime}`,
    `- 桌面观察截图：${report.evidence.count} 张，${report.evidence.width}x${report.evidence.height}，变化帧 ${report.evidence.changedFrames}`,
    `- 观察证据状态：${evidenceStatus}`,
    "",
    "## 观察边界",
    "",
    "- 本轮只观察和生成报告。",
    "- 不调用可灵生成视频。",
    "- 不新增或覆盖 `assets/runtime/animations/*/frames`。",
    "- 不修改 `assets/runtime/animations/manifest.json`。",
    "",
    "## 后续优先级",
    "",
    "1. 如果用户继续反馈动作衔接生硬，优先处理 high 风险回切：`sleep -> sleeping`、`waking -> idle_primary`、`poke_annoyed -> idle_primary`、`paw_raise -> idle_primary`。",
    "2. 如果鼠标跟随仍不明显，优先复查 `assets/reviews/runtime/mouse-follow-16/` 和本报告截图，确认进入延迟是否来自测试时序还是动作本身。",
    "3. 如果长时间待机重复感明显，优先生成更长 daily 动作或分段合并素材，但必须先列清单确认。",
    "",
    "## 复查命令",
    "",
    "```bash",
    "npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md",
    "npm run validate:runtime-naturalness-observation",
    "npm run validate:all",
    "```",
    ""
  ].join("\\n");
}
```

- [ ] **Step 4: Add CLI write mode**

Support:

```bash
npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md
```

Expected: writes the report and prints `{ "ok": true, "output": "docs/runtime-naturalness-observation.md" }`.

### Task 2: Add Validator And npm Scripts

**Files:**
- Create: `scripts/validate-runtime-naturalness-observation.mjs`
- Modify: `package.json`
- Modify: `scripts/validate-all.mjs`

- [ ] **Step 1: Implement validator**

Create validator that imports `buildRuntimeNaturalnessObservation`, compares generated text with `docs/runtime-naturalness-observation.md`, and checks the report includes boundary text:

```js
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildRuntimeNaturalnessObservation } from "./runtime-naturalness-observation.mjs";

const root = process.cwd();
const reportPath = join(root, "docs/runtime-naturalness-observation.md");
const failures = [];

if (!existsSync(reportPath)) {
  failures.push("missing docs/runtime-naturalness-observation.md; run npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md");
} else {
  const actual = readFileSync(reportPath, "utf8");
  const expected = buildRuntimeNaturalnessObservation(root);
  if (actual !== expected) {
    failures.push("docs/runtime-naturalness-observation.md is not current; run npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md");
  }
  for (const required of ["不调用可灵生成视频", "不修改 `assets/runtime/animations/manifest.json`", "high 风险回切"]) {
    if (!actual.includes(required)) failures.push(`report missing boundary or priority text: ${required}`);
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
```

- [ ] **Step 2: Add npm scripts**

Add:

```json
"observe:naturalness": "node scripts/runtime-naturalness-observation.mjs",
"validate:runtime-naturalness-observation": "node scripts/validate-runtime-naturalness-observation.mjs"
```

- [ ] **Step 3: Add to validate-all**

Add `validate:runtime-naturalness-observation` near project status and capture checks.

- [ ] **Step 4: Verify the validator fails before report exists**

Run:

```bash
npm run validate:runtime-naturalness-observation
```

Expected: FAIL if report is not yet generated or screenshots are missing.

### Task 3: Capture Desktop Evidence And Generate Report

**Files:**
- Create: `assets/reviews/runtime/naturalness-observation/yuzai-window-naturalness-001.png` through `012.png`
- Create: `docs/runtime-naturalness-observation.md`
- Modify: `docs/animation-production-log.md`

- [ ] **Step 1: Capture desktop sequence**

Run:

```bash
YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-naturalness.png YUZAI_CAPTURE_SEQUENCE_COUNT=12 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=300 YUZAI_CAPTURE_DELAY_MS=900 npm run dev
```

Expected: 12 captures are written to `/private/tmp/yuzai-window-naturalness-001.png` through `012.png`.

- [ ] **Step 2: Inspect desktop sequence**

Run:

```bash
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-naturalness.png --count 12 --min-changed-frames 6 --min-width 200 --min-height 200
```

Expected: ok true, width and height at least 200, changedFrames >= 6.

- [ ] **Step 3: Copy evidence into repo**

Create `assets/reviews/runtime/naturalness-observation/` and copy all 12 PNG files into it.

- [ ] **Step 4: Generate report**

Run:

```bash
npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md
```

Expected: report includes evidence count 12 and no-destructive boundary.

- [ ] **Step 5: Append production log**

Add a Chinese entry to `docs/animation-production-log.md` describing the observation tool, screenshot evidence, commands, known limitations, and decision.

### Task 4: Verify, Commit, Push

**Files:**
- All files from Tasks 1-3.

- [ ] **Step 1: Run focused verification**

Run:

```bash
npm run validate:runtime-naturalness-observation
npm run validate:project-status-current
git diff --check
```

Expected: all pass.

- [ ] **Step 2: Run broad verification**

Run:

```bash
npm run validate:all
```

Expected: `[validate:all] ok`.

- [ ] **Step 3: Scan for secrets**

Run:

```bash
rg "KLING_ACCESS_KEY=.*[A-Za-z0-9]{8}|KLING_SECRET_KEY=.*[A-Za-z0-9]{8}" -n --glob '!node_modules/**' --glob '!release/**' --glob '!.env.local'
```

Expected: only placeholder docs hit, no real key values.

- [ ] **Step 4: Commit and push**

Run:

```bash
git add docs/superpowers/specs/2026-06-19-runtime-naturalness-observation-design.md docs/superpowers/plans/2026-06-19-runtime-naturalness-observation.md scripts/runtime-naturalness-observation.mjs scripts/validate-runtime-naturalness-observation.mjs package.json scripts/validate-all.mjs docs/runtime-naturalness-observation.md docs/animation-production-log.md assets/reviews/runtime/naturalness-observation
git commit -m "feat: add runtime naturalness observation report"
git push
```

Expected: commit is pushed to `main`.

---

## Self-Review

- Spec coverage: The plan covers design doc, report generator, validator, screenshot evidence, production log, validation, commit, and push.
- Placeholder scan: No TBD/TODO placeholders remain.
- Scope check: The plan is limited to non-destructive observation and does not generate videos or modify runtime animation assets.
- Type consistency: The same script names, npm scripts, report path, and evidence directory are used throughout.
