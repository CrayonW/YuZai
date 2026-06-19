# 16 Direction Mouse Follow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build real video-driven 16 direction mouse-follow behavior for YuZai, with long direction videos, frame-similarity transition anchors, and runtime desktop verification.

**Architecture:** The work is split into gated preparation, video generation, runtime ingestion, transition-anchor generation, and mouse-follow playback. Source videos stay in `assets/origin/generated/kling`, runtime frames stay in `assets/runtime/animations/<action>/frames`, and runtime code consumes a generated anchor file instead of hardcoding frame pairs.

**Tech Stack:** Electron main/preload IPC, browser Canvas renderer, TypeScript runtime modules, Node validation scripts, ImageMagick frame comparison, existing runtime-intake scripts.

---

## File Structure

- Modify: `docs/kling-action-generation-plan.json` to add 16 planned `look_*` actions after user confirms generation scope.
- Modify: `scripts/kling-generation-batches.mjs` to add `mouse-follow-16-direction` as a planned batch.
- Generate: `docs/kling-generation-batches.json` and `docs/kling-generation-batches.md` after batch definitions change.
- Create: `docs/runtime-intake-mouse-follow-16-checklist.md` after videos exist and pass initial review.
- Modify: `electron/main.ts` to emit mouse direction events with angle and mapped action.
- Modify: `electron/preload.ts` and `src/renderer/global.d.ts` to expose `onMouseFollowDirectionChange`.
- Create: `src/core/behavior/mouse-follow-direction.ts` for 16-sector angle mapping and hysteresis.
- Create: `src/core/render/transition-anchors.ts` for loading generated action-to-action frame anchors.
- Modify: `src/core/render/animation-director.ts` to accept optional target entry frame from anchors.
- Create: `scripts/build-transition-anchors.mjs` to compare frame windows and emit `assets/runtime/animations/transition-anchors.json`.
- Create: `scripts/validate-mouse-follow-16-plan.mjs` to validate the planned action list and checklist.
- Create: `scripts/validate-transition-anchors.mjs` to validate generated anchors.
- Modify: `package.json` and `scripts/validate-all.mjs` to include new validators.
- Modify: `docs/animation-production-log.md` after each gated milestone.

## Task 1: Plan And Checklist Gate

**Files:**
- Modify: `docs/kling-action-generation-plan.json`
- Modify: `scripts/kling-generation-batches.mjs`
- Modify: `docs/kling-generation-batches.json`
- Modify: `docs/kling-generation-batches.md`
- Create: `scripts/validate-mouse-follow-16-plan.mjs`
- Modify: `package.json`
- Modify: `scripts/validate-all.mjs`

- [ ] **Step 1: Add the 16 planned actions**

Add `look_e`, `look_ene`, `look_ne`, `look_nne`, `look_n`, `look_nnw`, `look_nw`, `look_wnw`, `look_w`, `look_wsw`, `look_sw`, `look_ssw`, `look_s`, `look_sse`, `look_se`, and `look_ese` to `docs/kling-action-generation-plan.json`. Each action uses:

```json
{
  "category": "interactive",
  "loop": true,
  "durationSeconds": 8,
  "minCooldownSeconds": 0,
  "generationDurationSeconds": 5
}
```

Use the prompt template from `docs/mouse-follow-16-action-checklist.md` and set each `output` to `assets/origin/generated/kling/<action>.mp4`.

- [ ] **Step 2: Add a batch definition**

In `scripts/kling-generation-batches.mjs`, append:

```js
{
  id: "mouse-follow-16-direction",
  name: "第五批：16 方向鼠标跟随",
  reason: "生成 16 个长循环方向动作，让猫咪头部和眼睛按鼠标相对方向跟随。",
  actions: [
    "look_e", "look_ene", "look_ne", "look_nne",
    "look_n", "look_nnw", "look_nw", "look_wnw",
    "look_w", "look_wsw", "look_sw", "look_ssw",
    "look_s", "look_sse", "look_se", "look_ese"
  ]
}
```

- [ ] **Step 3: Regenerate batch docs**

Run:

```bash
npm run kling:generation-batches -- --write-json docs/kling-generation-batches.json --write-md docs/kling-generation-batches.md
```

Expected: markdown includes `第五批：16 方向鼠标跟随`, summary total actions increases by 16.

- [ ] **Step 4: Add a plan validator**

Create `scripts/validate-mouse-follow-16-plan.mjs` that reads `docs/kling-action-generation-plan.json`, `docs/kling-generation-batches.json`, and `docs/mouse-follow-16-action-checklist.md`. It must fail unless all 16 actions exist, are `interactive`, `loop: true`, `durationSeconds: 8`, and are present in the `mouse-follow-16-direction` batch.

- [ ] **Step 5: Wire validation**

Add `validate:mouse-follow-16-plan` to `package.json`, then add it to `scripts/validate-all.mjs` near the other animation planning validators.

- [ ] **Step 6: Verify and commit**

Run:

```bash
npm run validate:mouse-follow-16-plan
npm run validate:kling-generation-batches
npm run validate:all
git diff --check
```

Expected: all commands pass. Commit:

```bash
git add docs/kling-action-generation-plan.json docs/kling-generation-batches.json docs/kling-generation-batches.md docs/mouse-follow-16-action-checklist.md package.json scripts/kling-generation-batches.mjs scripts/validate-all.mjs scripts/validate-mouse-follow-16-plan.mjs
git commit -m "docs: plan 16-direction mouse follow batch"
```

## Task 2: Generate And Review Videos

**Files:**
- Create after generation: `assets/origin/generated/kling/look_*.mp4`
- Create after audit: `assets/reviews/kling-generated/look_*_sweep.png`
- Create: `docs/kling-generated-video-audit-mouse-follow-16.md`

- [ ] **Step 1: Dry-run generation**

Run:

```bash
npm run kling:generate-batch -- --batch mouse-follow-16-direction --dry-run
```

Expected: command lists 16 planned actions and no files are created.

- [ ] **Step 2: Generate after user confirmation**

Run only after explicit confirmation:

```bash
npm run kling:generate-batch -- --batch mouse-follow-16-direction
```

Expected: 16 mp4 files exist under `assets/origin/generated/kling`.

- [ ] **Step 3: Audit videos**

Run the generated-video audit command for this batch and write a dedicated review document.

Expected: every item has a sweep image, duration, dimensions, and review status.

- [ ] **Step 4: Human review gate**

Show the 16 action list and sweep paths to the user. Do not run runtime-intake until the user approves the reviewed videos.

## Task 3: Runtime Intake

**Files:**
- Create: `docs/runtime-intake-mouse-follow-16-checklist.md`
- Create: `docs/runtime-intake-mouse-follow-16-preflight.md`
- Create: `docs/runtime-intake-mouse-follow-16-dry-run.md`
- Create after approval: `docs/runtime-intake-approvals/mouse-follow-16-direction.approved.json`
- Modify after approval: `assets/runtime/animations/manifest.json`
- Create after approval: `assets/runtime/animations/look_*/frames/frame_*.png`

- [ ] **Step 1: Create intake checklist**

Use existing `runtime:intake-checklist` patterns to list all 16 actions, frame roots, sources, review evidence, and manifest intent.

- [ ] **Step 2: Preflight**

Run the runtime intake preflight for `mouse-follow-16-direction`.

Expected: all source videos and review evidence exist.

- [ ] **Step 3: Dry-run**

Run the runtime intake executor in dry-run mode.

Expected: report shows 16 new frame directories and 16 manifest action entries, with no writes.

- [ ] **Step 4: Approval gate**

Create `docs/runtime-intake-approvals/mouse-follow-16-direction.approved.json` only after user approval.

- [ ] **Step 5: Execute intake**

Run runtime intake executor for the approved wave.

Expected: 16 frame directories exist and manifest contains 16 enabled looped interactive actions.

## Task 4: Mouse Direction Runtime

**Files:**
- Create: `src/core/behavior/mouse-follow-direction.ts`
- Modify: `electron/main.ts`
- Modify: `electron/preload.ts`
- Modify: `src/renderer/global.d.ts`
- Modify: `src/renderer/main.ts`
- Create: `scripts/validate-mouse-follow-direction.mjs`

- [ ] **Step 1: Write direction mapping validator**

Validate that 0°, 22.5°, 45°, 90°, 180°, and 337.5° map to the expected `look_*` actions, with hysteresis preserving the previous direction for tiny jitter.

- [ ] **Step 2: Implement mapping module**

Create a pure TypeScript module that exports the 16 action names and a `resolveMouseFollowAction(angleDegrees, previousAction)` function.

- [ ] **Step 3: Emit mouse direction IPC**

Extend the existing mouse proximity watcher in `electron/main.ts` to send `{ near, angleDegrees, action }` at a throttled cadence while the cursor is in range.

- [ ] **Step 4: Consume direction events**

Expose `onMouseFollowDirectionChange` in preload/global types and request the mapped action through `AnimationDirector` when renderable.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm run validate:mouse-follow-direction
npm run typecheck
npm run build
```

Expected: all pass. Commit:

```bash
git add electron/main.ts electron/preload.ts src/core/behavior/mouse-follow-direction.ts src/renderer/global.d.ts src/renderer/main.ts package.json scripts/validate-mouse-follow-direction.mjs
git commit -m "feat: add 16-direction mouse follow runtime"
```

## Task 5: Transition Anchors

**Files:**
- Create: `scripts/build-transition-anchors.mjs`
- Create after running: `assets/runtime/animations/transition-anchors.json`
- Create: `scripts/validate-transition-anchors.mjs`
- Modify: `src/core/render/animation-director.ts`
- Create: `src/core/render/transition-anchors.ts`

- [ ] **Step 1: Build anchor generator**

Compare the first and last 24 frames for `idle_primary` and all 16 `look_*` actions. For each allowed transition, write the best `fromFrame`, `toFrame`, and `metric`.

- [ ] **Step 2: Validate anchors**

Require anchors for `idle_primary -> look_*`, `look_* -> idle_primary`, and adjacent 16-direction pairs.

- [ ] **Step 3: Load anchors in runtime**

Add a small loader that reads the generated JSON and exposes `entryFrameForTransition(fromAction, toAction)`.

- [ ] **Step 4: Use anchors in AnimationDirector**

When switching actions, prefer the anchor entry frame over manifest `entryFrames` when an anchor exists.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm run validate:transition-anchors
npm run validate:animation-director
npm run validate:all
```

Expected: all pass. Commit:

```bash
git add assets/runtime/animations/transition-anchors.json scripts/build-transition-anchors.mjs scripts/validate-transition-anchors.mjs src/core/render/animation-director.ts src/core/render/transition-anchors.ts package.json scripts/validate-all.mjs
git commit -m "feat: add transition anchors for mouse follow"
```

## Task 6: Desktop Verification

**Files:**
- Create: `assets/reviews/runtime/mouse-follow-16/*.png`
- Modify: `docs/animation-production-log.md`

- [ ] **Step 1: Add capture hook**

Add a test hook that simulates 16 mouse directions without requiring manual cursor movement.

- [ ] **Step 2: Capture sequence**

Run:

```bash
YUZAI_TEST_MOUSE_FOLLOW_16=1 YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-mouse-follow-16.png YUZAI_CAPTURE_SEQUENCE_COUNT=16 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 npm run dev
```

Expected: 16 PNG captures are written.

- [ ] **Step 3: Inspect captures**

Run:

```bash
npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-mouse-follow-16.png --count 16 --min-changed-frames 10 --min-width 200 --min-height 200
```

Expected: enough changed frames and no blank captures.

- [ ] **Step 4: Copy approved evidence**

Copy the 16 captures into `assets/reviews/runtime/mouse-follow-16/` after inspection.

- [ ] **Step 5: Final gates and commit**

Run:

```bash
npm run validate:all
npm run validate:release
```

Expected: both pass. Commit:

```bash
git add assets/reviews/runtime/mouse-follow-16 docs/animation-production-log.md
git commit -m "test: verify 16-direction mouse follow desktop"
```

## Self-Review

- Spec coverage: the plan covers 16 video actions, long video duration, frame-similarity anchors, mouse direction runtime, runtime-intake gates, and desktop verification.
- Placeholder scan: no placeholders are intentionally left; all actions, paths, and commands are named.
- Type consistency: planned action names match `docs/mouse-follow-16-action-checklist.md` and `docs/superpowers/specs/2026-06-19-16-direction-mouse-follow-design.md`.
