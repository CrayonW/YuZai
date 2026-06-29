# Motion Chain Scheduler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runtime motion intent scheduler so daily, interaction, transition, preview, drag, and mouse-follow actions enter `AnimationDirector` through one stable queue instead of competing every frame.

**Architecture:** Add a focused `MotionIntentScheduler` between renderer event sources and the existing `AnimationDirector`. Interaction events submit one-shot intents, mouse-follow submits stabilized continuous intents, and the render loop resolves one action per frame before calling `AnimationDirector.request`.

**Tech Stack:** TypeScript, Electron renderer, esbuild-based validator scripts, existing `AnimationDirector`, `DailyAnimationRotator`, runtime manifest actions.

---

## File Structure

- Create: `src/core/render/motion-intent-scheduler.ts`
  - Owns intent types, priority rules, duplicate merging, chain lock state, mouse-follow stabilization, and per-frame resolution.
- Create: `scripts/validate-motion-intent-scheduler.mjs`
  - Bundles a small TypeScript test harness with esbuild and asserts scheduler behavior without launching Electron.
- Modify: `package.json`
  - Adds `validate:motion-intent-scheduler`.
- Modify: `scripts/validate-all.mjs`
  - Runs the new scheduler validator near `validate:animation-director`.
- Modify: `src/renderer/main.ts`
  - Routes interaction callbacks, preview actions, mouse-follow updates, daily/base actions, and drag actions through `MotionIntentScheduler`.
- Modify: `docs/runtime-naturalness-observation.md`
  - Records Phase A chain scheduler validation and desktop capture evidence.
- Optional generated review asset: `assets/reviews/runtime/motion-chain-scheduler/paw-chain-contact-sheet.png`
  - Saved only if desktop capture verification produces a useful contact sheet.

## Task 1: Add Scheduler Contract And Failing Validator

**Files:**
- Create: `scripts/validate-motion-intent-scheduler.mjs`
- Modify: `package.json`
- Modify: `scripts/validate-all.mjs`

- [ ] **Step 1: Write the failing validator**

Create `scripts/validate-motion-intent-scheduler.mjs` with this complete content:

```js
import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-motion-intent-scheduler-"));
const bundlePath = join(tempRoot, "validate-motion-intent-scheduler.mjs");
const schedulerPath = join(process.cwd(), "src", "core", "render", "motion-intent-scheduler.ts");

const testSource = `
  import { MotionIntentScheduler } from ${JSON.stringify(schedulerPath)};

  const scheduler = new MotionIntentScheduler({
    defaultAction: "idle_primary",
    mouseFollowStableMs: 160,
    mouseFollowMinHoldMs: 300
  });

  assertEqual(scheduler.resolve(0), "idle_primary", "starts from default action");

  scheduler.submit({ type: "base", action: "idle_primary", now: 0 });
  scheduler.submit({ type: "daily", action: "idle_secondary", now: 10, holdMs: 1000 });
  assertEqual(scheduler.resolve(10), "idle_secondary", "daily can replace base while idle");

  scheduler.submit({ type: "proximity", action: "paw_raise", now: 20, lockMs: 1800 });
  assertEqual(scheduler.resolve(20), "paw_raise", "interaction takes priority over daily");

  scheduler.submit({ type: "daily", action: "tail_wag", now: 30, holdMs: 1000 });
  assertEqual(scheduler.resolve(30), "paw_raise", "daily cannot interrupt locked interaction chain");

  scheduler.submit({ type: "proximity", action: "paw_raise", now: 40, lockMs: 1800 });
  assertEqual(scheduler.pendingCount(), 1, "duplicate one-shot interaction is merged");

  scheduler.completeCurrent("paw_raise", 1900);
  assertEqual(scheduler.resolve(1900), "tail_wag", "latest daily resumes after interaction completes");

  scheduler.submit({ type: "mouse-follow", action: "look_e", now: 2000, near: true });
  assertEqual(scheduler.resolve(2100), "tail_wag", "mouse-follow waits for stable direction window");
  assertEqual(scheduler.resolve(2160), "look_e", "mouse-follow activates after stable direction window");

  scheduler.submit({ type: "mouse-follow", action: "look_ne", now: 2200, near: true });
  assertEqual(scheduler.resolve(2250), "look_e", "mouse-follow respects minimum hold before switching direction");
  assertEqual(scheduler.resolve(2520), "look_ne", "mouse-follow can switch after hold and stable window");

  scheduler.submit({ type: "mouse-follow", action: "look_ne", now: 2600, near: false });
  assertEqual(scheduler.resolve(2600), "tail_wag", "mouse-follow leaves through base/daily target instead of sticking");

  scheduler.submit({ type: "preview", action: "click_surprised", now: 2700, until: 3300 });
  assertEqual(scheduler.resolve(2800), "click_surprised", "preview overrides all normal intents");
  assertEqual(scheduler.resolve(3400), "tail_wag", "preview releases back to latest non-preview target");

  scheduler.submit({ type: "drag", action: "dragging", now: 3500, lockMs: 500 });
  assertEqual(scheduler.resolve(3500), "dragging", "drag takes priority immediately");
  scheduler.completeCurrent("dragging", 4100);
  assertEqual(scheduler.resolve(4100), "tail_wag", "drag completion releases back to daily target");

  function assertEqual(actual, expected, label) {
    if (actual !== expected) {
      throw new Error(label + ": expected " + expected + ", got " + actual);
    }
  }
`;

writeFileSync(join(tempRoot, "entry.ts"), testSource);

await build({
  entryPoints: [join(tempRoot, "entry.ts")],
  outfile: bundlePath,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  absWorkingDir: process.cwd(),
  logLevel: "silent"
});

await import(pathToFileURL(bundlePath).href);
console.log(JSON.stringify({ ok: true }, null, 2));
```

- [ ] **Step 2: Add npm script**

Add this line to `package.json` after `validate:animation-director`:

```json
"validate:motion-intent-scheduler": "node scripts/validate-motion-intent-scheduler.mjs",
```

- [ ] **Step 3: Add validator to validate-all**

In `scripts/validate-all.mjs`, insert this step immediately after `validate:animation-director`:

```js
["validate:motion-intent-scheduler", ["npm", "run", "validate:motion-intent-scheduler"]],
```

- [ ] **Step 4: Run validator to verify it fails**

Run:

```bash
npm run validate:motion-intent-scheduler
```

Expected: FAIL because `src/core/render/motion-intent-scheduler.ts` does not exist.

- [ ] **Step 5: Commit failing validator**

```bash
git add package.json scripts/validate-all.mjs scripts/validate-motion-intent-scheduler.mjs
git commit -m "test: add motion intent scheduler validation"
```

## Task 2: Implement MotionIntentScheduler

**Files:**
- Create: `src/core/render/motion-intent-scheduler.ts`
- Test: `scripts/validate-motion-intent-scheduler.mjs`

- [ ] **Step 1: Create scheduler implementation**

Create `src/core/render/motion-intent-scheduler.ts` with this complete content:

```ts
import type { RuntimeAnimationAction } from "./animation-manifest";

export type MotionIntentType = "preview" | "drag" | "click" | "proximity" | "mouse-follow" | "daily" | "base";

export interface MotionIntentSchedulerOptions {
  defaultAction: RuntimeAnimationAction;
  mouseFollowStableMs?: number;
  mouseFollowMinHoldMs?: number;
}

export type MotionIntent =
  | { type: "preview"; action: RuntimeAnimationAction; now: number; until: number }
  | { type: "drag" | "click" | "proximity"; action: RuntimeAnimationAction; now: number; lockMs?: number }
  | { type: "mouse-follow"; action: RuntimeAnimationAction; now: number; near: boolean }
  | { type: "daily"; action: RuntimeAnimationAction; now: number; holdMs?: number }
  | { type: "base"; action: RuntimeAnimationAction; now: number };

interface LockedIntent {
  type: MotionIntentType;
  action: RuntimeAnimationAction;
  until: number;
}

interface MouseFollowCandidate {
  action: RuntimeAnimationAction;
  since: number;
}

export class MotionIntentScheduler {
  private readonly defaultAction: RuntimeAnimationAction;
  private readonly mouseFollowStableMs: number;
  private readonly mouseFollowMinHoldMs: number;
  private baseAction: RuntimeAnimationAction;
  private dailyAction: RuntimeAnimationAction;
  private dailyUntil = 0;
  private currentLock: LockedIntent | null = null;
  private queuedOneShots = new Map<MotionIntentType, LockedIntent>();
  private preview: { action: RuntimeAnimationAction; until: number } | null = null;
  private mouseFollowCandidate: MouseFollowCandidate | null = null;
  private activeMouseFollow: { action: RuntimeAnimationAction; startedAt: number } | null = null;

  constructor(options: MotionIntentSchedulerOptions) {
    this.defaultAction = options.defaultAction;
    this.baseAction = options.defaultAction;
    this.dailyAction = options.defaultAction;
    this.mouseFollowStableMs = options.mouseFollowStableMs ?? 160;
    this.mouseFollowMinHoldMs = options.mouseFollowMinHoldMs ?? 300;
  }

  submit(intent: MotionIntent): void {
    if (intent.type === "preview") {
      this.preview = { action: intent.action, until: intent.until };
      return;
    }

    if (intent.type === "base") {
      this.baseAction = intent.action;
      if (this.dailyAction === this.defaultAction) this.dailyAction = intent.action;
      return;
    }

    if (intent.type === "daily") {
      this.dailyAction = intent.action;
      this.dailyUntil = intent.now + (intent.holdMs ?? 0);
      return;
    }

    if (intent.type === "mouse-follow") {
      this.submitMouseFollow(intent);
      return;
    }

    const lock = {
      type: intent.type,
      action: intent.action,
      until: intent.now + (intent.lockMs ?? 0)
    };

    if (!this.currentLock || priorityFor(intent.type) > priorityFor(this.currentLock.type)) {
      this.currentLock = lock;
      return;
    }

    this.queuedOneShots.set(intent.type, lock);
  }

  resolve(now: number): RuntimeAnimationAction {
    if (this.preview && now < this.preview.until) return this.preview.action;
    if (this.preview && now >= this.preview.until) this.preview = null;

    if (this.currentLock && now < this.currentLock.until) return this.currentLock.action;
    if (this.currentLock && now >= this.currentLock.until) this.releaseCurrentLock();

    const queued = this.nextQueuedOneShot();
    if (queued) {
      this.currentLock = queued;
      return queued.action;
    }

    const mouseFollowAction = this.resolveMouseFollow(now);
    if (mouseFollowAction) return mouseFollowAction;

    if (this.dailyUntil > 0 && now >= this.dailyUntil) {
      this.dailyAction = this.baseAction || this.defaultAction;
      this.dailyUntil = 0;
    }

    return this.dailyAction || this.baseAction || this.defaultAction;
  }

  completeCurrent(action: RuntimeAnimationAction, now: number): void {
    if (this.currentLock?.action === action) {
      this.currentLock = null;
      this.resolve(now);
    }
  }

  pendingCount(): number {
    return this.queuedOneShots.size + (this.currentLock ? 1 : 0);
  }

  private submitMouseFollow(intent: Extract<MotionIntent, { type: "mouse-follow" }>): void {
    if (!intent.near) {
      this.mouseFollowCandidate = null;
      this.activeMouseFollow = null;
      return;
    }

    if (this.mouseFollowCandidate?.action === intent.action) return;
    this.mouseFollowCandidate = { action: intent.action, since: intent.now };
  }

  private resolveMouseFollow(now: number): RuntimeAnimationAction | null {
    if (!this.mouseFollowCandidate) return this.activeMouseFollow?.action ?? null;

    const candidateStable = now - this.mouseFollowCandidate.since >= this.mouseFollowStableMs;
    const activeHeld =
      !this.activeMouseFollow || now - this.activeMouseFollow.startedAt >= this.mouseFollowMinHoldMs;

    if (candidateStable && activeHeld) {
      if (this.activeMouseFollow?.action !== this.mouseFollowCandidate.action) {
        this.activeMouseFollow = { action: this.mouseFollowCandidate.action, startedAt: now };
      }
    }

    return this.activeMouseFollow?.action ?? null;
  }

  private releaseCurrentLock(): void {
    this.currentLock = null;
  }

  private nextQueuedOneShot(): LockedIntent | null {
    const queued = [...this.queuedOneShots.values()].sort((left, right) => priorityFor(right.type) - priorityFor(left.type))[0];
    if (!queued) return null;
    this.queuedOneShots.delete(queued.type);
    return queued;
  }
}

function priorityFor(type: MotionIntentType): number {
  switch (type) {
    case "preview":
      return 100;
    case "drag":
      return 90;
    case "click":
      return 80;
    case "proximity":
      return 70;
    case "mouse-follow":
      return 60;
    case "daily":
      return 20;
    case "base":
      return 10;
  }
}
```

- [ ] **Step 2: Run scheduler validator**

Run:

```bash
npm run validate:motion-intent-scheduler
```

Expected: PASS with `{ "ok": true }`.

- [ ] **Step 3: Run related render validators**

Run:

```bash
npm run validate:animation-director
npm run validate:daily-animation-rotator
```

Expected: both PASS.

- [ ] **Step 4: Commit scheduler implementation**

```bash
git add src/core/render/motion-intent-scheduler.ts
git commit -m "feat: add motion intent scheduler"
```

## Task 3: Wire Scheduler Into Renderer

**Files:**
- Modify: `src/renderer/main.ts`
- Test: `scripts/validate-motion-intent-scheduler.mjs`

- [ ] **Step 1: Import scheduler**

Add this import near the other render imports in `src/renderer/main.ts`:

```ts
import { MotionIntentScheduler } from "../core/render/motion-intent-scheduler";
```

- [ ] **Step 2: Instantiate scheduler**

After `dailyRotator` is created, add:

```ts
const motionScheduler = new MotionIntentScheduler({
  defaultAction: runtimeAnimationManifest.defaultAction,
  mouseFollowStableMs: 160,
  mouseFollowMinHoldMs: 300
});
```

- [ ] **Step 3: Route interaction callbacks through scheduler**

Replace each direct `animationDirector.request(action, performance.now())` in `onMouseNearAccepted`, `onClickAccepted`, `onDragAccepted`, and reminder `onShow` with scheduler submissions:

```ts
const now = performance.now();
motionScheduler.submit({ type: "proximity", action, now, lockMs: 1800 });
```

For clicks:

```ts
const now = performance.now();
motionScheduler.submit({ type: "click", action, now, lockMs: 2200 });
```

For drag:

```ts
const now = performance.now();
motionScheduler.submit({ type: "drag", action, now, lockMs: 900 });
```

For reminders, use click-level priority because reminders are one-shot expressive actions:

```ts
const now = performance.now();
motionScheduler.submit({ type: "click", action, now, lockMs: 2200 });
```

- [ ] **Step 4: Route preview actions through scheduler**

Inside `window.yuzai.onTestPreviewAction`, replace direct request state with:

```ts
const now = performance.now();
previewAction = action;
previewActionUntil = now + 2400;
motionScheduler.submit({ type: "preview", action, now, until: previewActionUntil });
lastRequestedAnimationAction = null;
```

- [ ] **Step 5: Route mouse-follow updates through scheduler**

In `onMouseProximityChange`, when `near` is false add:

```ts
motionScheduler.submit({
  type: "mouse-follow",
  action: runtimeAnimationManifest.defaultAction,
  now: performance.now(),
  near: false
});
```

In `onMouseFollowDirectionChange`, replace direct assignment-only behavior with:

```ts
const now = performance.now();
if (!payload.near || !payload.action || !isRenderableRuntimeAnimationAction(payload.action)) {
  mouseFollowAction = null;
  motionScheduler.submit({
    type: "mouse-follow",
    action: runtimeAnimationManifest.defaultAction,
    now,
    near: false
  });
  return;
}
mouseFollowAction = payload.action;
motionScheduler.submit({ type: "mouse-follow", action: payload.action, now, near: true });
```

- [ ] **Step 6: Resolve one stable target per frame**

In `tick`, replace:

```ts
const nextAnimationAction = resolveAnimationAction(now);
if (nextAnimationAction !== lastRequestedAnimationAction) {
  animationDirector.request(nextAnimationAction, now);
  lastRequestedAnimationAction = nextAnimationAction;
}
```

with:

```ts
submitFrameIntents(now);
const nextAnimationAction = motionScheduler.resolve(now);
if (nextAnimationAction !== lastRequestedAnimationAction) {
  animationDirector.request(nextAnimationAction, now);
  lastRequestedAnimationAction = nextAnimationAction;
}
```

- [ ] **Step 7: Replace resolveAnimationAction with submitFrameIntents**

Replace the existing `resolveAnimationAction` function with:

```ts
function submitFrameIntents(now: number): void {
  if (previewAction && now >= previewActionUntil) {
    previewAction = null;
  }

  const baseAction = actionForPose(fsm.snapshot.pose.state, fsm.snapshot.pose.direction);
  motionScheduler.submit({ type: "base", action: baseAction, now });

  if (mouseFollowAction && (fsm.snapshot.pose.state === "idle" || fsm.snapshot.pose.state === "teaser")) {
    motionScheduler.submit({ type: "mouse-follow", action: mouseFollowAction, now, near: true });
    return;
  }

  const dailyAction = dailyRotator.resolve(baseAction, fsm.snapshot.pose.state === "idle", now);
  motionScheduler.submit({
    type: dailyAction === baseAction ? "base" : "daily",
    action: dailyAction,
    now,
    holdMs: dailyAction === baseAction ? undefined : 2400
  });
}
```

- [ ] **Step 8: Notify scheduler when one-shot action naturally completes**

After `const animationFrame = animationDirector.update(now);`, add:

```ts
const config = configForAction(animationFrame.action);
if (config?.category === "interactive" || config?.category === "transition") {
  const lastFrame = animationFrame.sequence.frames.length - 1;
  if (!animationFrame.sequence.loop && animationFrame.frameIndex >= lastFrame) {
    motionScheduler.completeCurrent(animationFrame.action, now);
  }
}
```

- [ ] **Step 9: Run focused validation**

Run:

```bash
npm run validate:motion-intent-scheduler
npm run validate:animation-director
npm run validate:runtime-interaction-schedule
npm run validate:mouse-follow-direction
npm run typecheck
```

Expected: all PASS.

- [ ] **Step 10: Commit renderer wiring**

```bash
git add src/renderer/main.ts
git commit -m "feat: route renderer actions through motion scheduler"
```

## Task 4: Desktop Validation And Documentation

**Files:**
- Modify: `docs/runtime-naturalness-observation.md`
- Optional create: `assets/reviews/runtime/motion-chain-scheduler/paw-chain-contact-sheet.png`

- [ ] **Step 1: Run runtime alpha and build checks**

Run:

```bash
npm run validate:runtime-alpha-quality
npm run build
```

Expected: both PASS.

- [ ] **Step 2: Capture paw interaction chain**

Run:

```bash
YUZAI_PREVIEW_ACTION=paw_raise \
YUZAI_PREVIEW_ACTION_MS=700 \
YUZAI_CAPTURE_DELAY_MS=1400 \
YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-motion-chain-paw.png \
YUZAI_CAPTURE_SEQUENCE_COUNT=18 \
YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=150 \
npm run dev
```

Expected: Electron exits after capture and writes `/private/tmp/yuzai-motion-chain-paw-0001.png` through sequence frames.

- [ ] **Step 3: Inspect capture sequence**

Run:

```bash
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-motion-chain-paw.png --count 18 --min-changed-frames 8 --min-width 200 --min-height 200
```

Expected: PASS with at least `changedFrames=8`.

- [ ] **Step 4: Update naturalness observation**

Append a Chinese section to `docs/runtime-naturalness-observation.md`:

```md
## 2026-06-29 MotionIntentScheduler Phase A 验收

- 本次只调整运行时动作意图调度，不生成新视频、不抽帧、不覆盖 runtime manifest。
- 交互、拖拽、预览、鼠标跟随、日常轮播统一进入 `MotionIntentScheduler`。
- 桌面链路验收：`paw_raise` 预览序列，18 帧，changedFrames 不低于 8，窗口尺寸不低于 200x200。
- alpha 门禁：`npm run validate:runtime-alpha-quality` 通过。若后续仍看到猫身透明闪动，应进入素材 alpha cleanup 或重新生成视频，不把调度器视为素材修复。
```

- [ ] **Step 5: Run documentation and broad checks**

Run:

```bash
npm run validate:runtime-naturalness-observation
npm run validate:motion-intent-scheduler
npm run validate:all
```

Expected: `validate:runtime-naturalness-observation` and `validate:motion-intent-scheduler` PASS. `validate:all` should PASS; if it fails on a stale generated doc, regenerate the documented source and rerun that validator before rerunning `validate:all`.

- [ ] **Step 6: Commit validation docs**

```bash
git add docs/runtime-naturalness-observation.md assets/reviews/runtime/motion-chain-scheduler
git commit -m "docs: record motion scheduler validation"
```

## Task 5: Final Release Check And Push

**Files:**
- No planned source edits unless validation reveals a concrete issue.

- [ ] **Step 1: Run final focused gates**

Run:

```bash
npm run validate:motion-intent-scheduler
npm run validate:animation-director
npm run validate:runtime-alpha-quality
npm run typecheck
npm run build
git diff --check
```

Expected: all PASS and no whitespace errors.

- [ ] **Step 2: Check uncommitted files**

Run:

```bash
git status --short
```

Expected: only user-owned untracked files may remain:

```text
?? assets/references/yuzai-personalized-concept-alpha.png
?? assets/references/yuzai-personalized-concept.png
?? docs/yuzai-personalized-pet-concept.md
```

- [ ] **Step 3: Push commits**

Run:

```bash
git push
```

Expected: current `main` pushed to `github.com:CrayonW/YuZai.git`.

- [ ] **Step 4: Final report**

Report in Chinese:

- MotionIntentScheduler implemented and wired.
- New validator added to `validate:all`.
- Desktop chain capture result and alpha-quality status.
- Any remaining risk, especially source-material alpha issues or high transition-risk rows.
- Commit hashes pushed.
