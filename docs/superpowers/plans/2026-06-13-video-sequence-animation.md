# Video Sequence Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old generated-action animation path with a manifest-driven transparent sequence-frame path sourced from `assets/origin` reference videos.

**Architecture:** Keep the current Electron, Canvas, FSM, and interaction structure. Add a data-driven animation manifest that maps current app states to Phase 1 actions (`idle_primary`, `idle_secondary`, `tail_wag`, `walk`, `walk_left`) while unsupported states fall back to approved Phase 1 actions. Runtime code loads frames from the manifest, validation scripts check enabled actions, and production docs record every source-video pass.

**Tech Stack:** Electron 28, TypeScript, esbuild, Canvas 2D, Node.js scripts, ImageMagick CLI for frame validation.

---

## File Structure

- Modify `package.json`: add manifest validation scripts and remove or stop relying on old generated GIF scripts during the new workflow.
- Create `assets/runtime/animations/manifest.json`: runtime action manifest for Phase 1.
- Create `assets/runtime/animations/.gitkeep`: keeps the runtime animation root available before generated frames exist.
- Create `src/core/render/animation-manifest.ts`: typed manifest loader and state-to-action mapping helpers.
- Modify `src/core/render/sprite-assets.ts`: load frames from manifest instead of hardcoded `assets/generated/cat-actions` paths.
- Modify `src/core/behavior/autonomous-behavior.ts`: Phase 1 autonomous choices only use supported behaviors and fallback safely.
- Create `scripts/validate-runtime-animations.mjs`: validate manifest and enabled runtime frame folders.
- Create `scripts/list-animation-cleanup-candidates.mjs`: print cleanup candidates without deleting them.
- Modify `docs/animation-production-log.md`: update entries as each source video is processed.
- Modify `docs/animation-upgrade-plan.md`: keep command names current after scripts are added.

## Task 1: Add Runtime Manifest Contract

**Files:**
- Create: `assets/runtime/animations/.gitkeep`
- Create: `assets/runtime/animations/manifest.json`
- Create: `src/core/render/animation-manifest.ts`
- Test: `npm run typecheck`

- [ ] **Step 1: Create the runtime animation root**

Create `assets/runtime/animations/.gitkeep` as an empty file.

- [ ] **Step 2: Create the Phase 1 manifest**

Create `assets/runtime/animations/manifest.json`:

```json
{
  "version": 1,
  "frameSize": 512,
  "defaultAction": "idle_primary",
  "actions": {
    "idle_primary": {
      "source": "assets/origin/鱼仔待机动作1.mp4",
      "frameRoot": "../assets/runtime/animations/idle_primary/frames",
      "filePattern": "frame_{index}.png",
      "firstFrame": 1,
      "frameCount": 0,
      "fps": 30,
      "loop": true,
      "interruptible": true,
      "fallback": "idle_primary",
      "enabled": false
    },
    "idle_secondary": {
      "source": "assets/origin/鱼仔待机动作2.mp4",
      "frameRoot": "../assets/runtime/animations/idle_secondary/frames",
      "filePattern": "frame_{index}.png",
      "firstFrame": 1,
      "frameCount": 0,
      "fps": 30,
      "loop": true,
      "interruptible": true,
      "fallback": "idle_primary",
      "enabled": false
    },
    "tail_wag": {
      "source": "assets/origin/鱼仔晃动尾巴视频.mp4",
      "frameRoot": "../assets/runtime/animations/tail_wag/frames",
      "filePattern": "frame_{index}.png",
      "firstFrame": 1,
      "frameCount": 0,
      "fps": 30,
      "loop": false,
      "interruptible": true,
      "fallback": "idle_primary",
      "enabled": false
    },
    "walk": {
      "source": "assets/origin/鱼仔走路视频.mp4",
      "frameRoot": "../assets/runtime/animations/walk/frames",
      "filePattern": "frame_{index}.png",
      "firstFrame": 1,
      "frameCount": 0,
      "fps": 30,
      "loop": true,
      "interruptible": true,
      "fallback": "idle_primary",
      "enabled": false
    },
    "walk_left": {
      "source": "assets/origin/鱼仔走路视频.mp4",
      "frameRoot": "../assets/runtime/animations/walk_left/frames",
      "filePattern": "frame_{index}.png",
      "firstFrame": 1,
      "frameCount": 0,
      "fps": 30,
      "loop": true,
      "interruptible": true,
      "fallback": "walk",
      "enabled": false,
      "derivedFrom": "walk",
      "derivation": "mirror-x"
    }
  },
  "stateMap": {
    "idle": "idle_primary",
    "walk": "walk",
    "walk_left": "walk_left",
    "walking": {
      "left": "walk_left",
      "right": "walk",
      "neutral": "walk"
    },
    "sleep": "idle_primary",
    "sleepy": "idle_primary",
    "sleeping": "idle_primary",
    "waking": "idle_primary",
    "surprised": "idle_primary",
    "shy": "idle_primary",
    "dragging": "idle_primary",
    "waving": "idle_secondary",
    "teaser": "tail_wag"
  }
}
```

- [ ] **Step 3: Add typed manifest helpers**

Create `src/core/render/animation-manifest.ts`:

```ts
import manifestJson from "../../../assets/runtime/animations/manifest.json";
import type { PetStateName } from "../fsm/state-types";

export type RuntimeAnimationAction = keyof typeof manifestJson.actions;

export interface RuntimeAnimationConfig {
  source: string;
  frameRoot: string;
  filePattern: string;
  firstFrame: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  interruptible: boolean;
  fallback: RuntimeAnimationAction;
  enabled: boolean;
  derivedFrom?: RuntimeAnimationAction;
  derivation?: "mirror-x";
}

export interface DirectionalActionMap {
  left: RuntimeAnimationAction;
  right: RuntimeAnimationAction;
  neutral: RuntimeAnimationAction;
}

export interface RuntimeAnimationManifest {
  version: number;
  frameSize: number;
  defaultAction: RuntimeAnimationAction;
  actions: Record<RuntimeAnimationAction, RuntimeAnimationConfig>;
  stateMap: Record<PetStateName, RuntimeAnimationAction | DirectionalActionMap>;
}

export const runtimeAnimationManifest = manifestJson as unknown as RuntimeAnimationManifest;

export function actionForPose(state: PetStateName, direction: -1 | 0 | 1): RuntimeAnimationAction {
  const mapped = runtimeAnimationManifest.stateMap[state] ?? runtimeAnimationManifest.defaultAction;
  if (typeof mapped === "string") return enabledOrFallback(mapped);
  if (direction < 0) return enabledOrFallback(mapped.left);
  if (direction > 0) return enabledOrFallback(mapped.right);
  return enabledOrFallback(mapped.neutral);
}

export function enabledOrFallback(action: RuntimeAnimationAction): RuntimeAnimationAction {
  const config = runtimeAnimationManifest.actions[action];
  if (config?.enabled && config.frameCount > 0) return action;
  if (config?.fallback && config.fallback !== action) return enabledOrFallback(config.fallback);
  return runtimeAnimationManifest.defaultAction;
}

export function frameUrl(action: RuntimeAnimationAction, zeroBasedIndex: number): string {
  const config = runtimeAnimationManifest.actions[action];
  const frameNumber = String(config.firstFrame + zeroBasedIndex).padStart(6, "0");
  return `${config.frameRoot}/${config.filePattern.replace("{index}", frameNumber)}`;
}
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: TypeScript reports no errors from `animation-manifest.ts`.

- [ ] **Step 5: Commit**

```bash
git add assets/runtime/animations/.gitkeep assets/runtime/animations/manifest.json src/core/render/animation-manifest.ts
git commit -m "feat: add runtime animation manifest"
```

## Task 2: Update Runtime Frame Loader

**Files:**
- Modify: `src/core/render/sprite-assets.ts`
- Test: `npm run typecheck`

- [ ] **Step 1: Replace hardcoded generated-action loading**

Replace the contents of `src/core/render/sprite-assets.ts` with:

```ts
import { actionForPose, frameUrl, runtimeAnimationManifest, type RuntimeAnimationAction } from "./animation-manifest";
import type { PetStateName } from "../fsm/state-types";

export type SpriteAction = RuntimeAnimationAction;

export interface SpriteSequence {
  action: SpriteAction;
  fps: number;
  loop: boolean;
  frames: HTMLImageElement[];
}

const cache = new Map<SpriteAction, SpriteSequence>();
const preloadCache = new Map<SpriteAction, Promise<void>>();

export function sequenceForState(state: PetStateName, direction: -1 | 0 | 1): SpriteSequence {
  return sequenceForAction(actionForPose(state, direction));
}

export function preloadSpriteSequences(): Promise<void> {
  const actions = Object.entries(runtimeAnimationManifest.actions)
    .filter(([, config]) => config.enabled && config.frameCount > 0)
    .map(([action]) => preloadAction(action as SpriteAction));
  return Promise.all(actions).then(() => undefined);
}

function sequenceForAction(action: SpriteAction): SpriteSequence {
  let sequence = cache.get(action);
  if (!sequence) {
    const config = runtimeAnimationManifest.actions[action];
    sequence = {
      action,
      fps: config.fps,
      loop: config.loop,
      frames: loadFrames(action)
    };
    cache.set(action, sequence);
  }
  return sequence;
}

function loadFrames(action: SpriteAction): HTMLImageElement[] {
  const config = runtimeAnimationManifest.actions[action];
  if (!config.enabled || config.frameCount <= 0) return [];
  return Array.from({ length: config.frameCount }, (_, index) => {
    const frame = new Image();
    frame.decoding = "async";
    frame.src = frameUrl(action, index);
    return frame;
  });
}

function preloadAction(action: SpriteAction): Promise<void> {
  let preload = preloadCache.get(action);
  if (!preload) {
    const sequence = sequenceForAction(action);
    preload = Promise.all(sequence.frames.map((frame) => decodeFrame(frame))).then(() => undefined);
    preloadCache.set(action, preload);
  }
  return preload;
}

function decodeFrame(frame: HTMLImageElement): Promise<void> {
  if (frame.complete && frame.naturalWidth > 0) return Promise.resolve();
  if (typeof frame.decode === "function") {
    return frame.decode().catch(() => waitForImage(frame));
  }
  return waitForImage(frame);
}

function waitForImage(frame: HTMLImageElement): Promise<void> {
  return new Promise((resolve, reject) => {
    frame.addEventListener("load", () => resolve(), { once: true });
    frame.addEventListener("error", () => reject(new Error(`Failed to load ${frame.src}`)), { once: true });
  });
}
```

- [ ] **Step 2: Ensure renderer handles empty frame arrays**

In `src/core/render/canvas-renderer.ts`, before calculating `frameIndex`, add:

```ts
if (sequence.frames.length === 0) {
  this.ctx.clearRect(0, 0, width, height);
  drawPlaceholderYuzai(this.ctx, snapshot, {
    width,
    height,
    now,
    dragOffset
  });
  return;
}
```

- [ ] **Step 3: Respect non-looping actions**

In `src/core/render/canvas-renderer.ts`, replace the frame index calculation with:

```ts
const elapsedFrames = Math.max(0, (now - this.actionStartedAt) / 1000) * sequence.fps;
const rawFrameIndex = Math.floor(elapsedFrames);
const frameIndex = sequence.loop
  ? rawFrameIndex % sequence.frames.length
  : Math.min(rawFrameIndex, sequence.frames.length - 1);
const nextFrameIndex = sequence.loop
  ? (frameIndex + 1) % sequence.frames.length
  : Math.min(frameIndex + 1, sequence.frames.length - 1);
const blend = elapsedFrames - Math.floor(elapsedFrames);
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/core/render/sprite-assets.ts src/core/render/canvas-renderer.ts
git commit -m "feat: load animation frames from manifest"
```

## Task 3: Add Manifest Validation Script

**Files:**
- Create: `scripts/validate-runtime-animations.mjs`
- Modify: `package.json`
- Test: `npm run validate:runtime-animations`

- [ ] **Step 1: Add validation script**

Create `scripts/validate-runtime-animations.mjs`:

```js
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const failures = [];
const warnings = [];

if (manifest.version !== 1) failures.push("manifest.version must be 1");
if (!manifest.defaultAction) failures.push("manifest.defaultAction is required");
if (!manifest.actions?.[manifest.defaultAction]) failures.push("manifest.defaultAction must exist in actions");

for (const [action, config] of Object.entries(manifest.actions ?? {})) {
  if (!config.source) failures.push(`${action}: source is required`);
  if (!existsSync(join(root, config.source))) failures.push(`${action}: missing source ${config.source}`);
  if (!config.frameRoot) failures.push(`${action}: frameRoot is required`);
  if (!config.filePattern?.includes("{index}")) failures.push(`${action}: filePattern must include {index}`);
  if (!Number.isInteger(config.firstFrame) || config.firstFrame < 1) failures.push(`${action}: firstFrame must be a positive integer`);
  if (!Number.isInteger(config.frameCount) || config.frameCount < 0) failures.push(`${action}: frameCount must be a non-negative integer`);
  if (typeof config.fps !== "number" || config.fps <= 0) failures.push(`${action}: fps must be positive`);
  if (!manifest.actions[config.fallback]) failures.push(`${action}: fallback ${config.fallback} does not exist`);
  if (!config.enabled) continue;
  if (config.frameCount <= 0) failures.push(`${action}: enabled actions must have frameCount > 0`);
  validateFrames(action, config);
}

for (const [state, mapped] of Object.entries(manifest.stateMap ?? {})) {
  if (typeof mapped === "string") {
    if (!manifest.actions[mapped]) failures.push(`stateMap.${state}: action ${mapped} does not exist`);
  } else {
    for (const direction of ["left", "right", "neutral"]) {
      if (!manifest.actions[mapped[direction]]) failures.push(`stateMap.${state}.${direction}: action ${mapped[direction]} does not exist`);
    }
  }
}

console.log(JSON.stringify({ ok: failures.length === 0, failures, warnings }, null, 2));
if (failures.length > 0) process.exitCode = 1;

function validateFrames(action, config) {
  const frameRoot = runtimePathToDisk(config.frameRoot);
  if (!existsSync(frameRoot)) {
    failures.push(`${action}: missing frame folder ${frameRoot}`);
    return;
  }
  const files = readdirSync(frameRoot).filter((file) => file.endsWith(".png")).sort();
  if (files.length !== config.frameCount) {
    failures.push(`${action}: expected ${config.frameCount} PNG frames, found ${files.length}`);
  }
  for (let index = 0; index < config.frameCount; index += 1) {
    const number = String(config.firstFrame + index).padStart(6, "0");
    const expected = config.filePattern.replace("{index}", number);
    const filePath = join(frameRoot, expected);
    if (!existsSync(filePath)) {
      failures.push(`${action}: missing ${expected}`);
      continue;
    }
    const metrics = imageMetrics(filePath);
    if (metrics.width !== manifest.frameSize || metrics.height !== manifest.frameSize) {
      failures.push(`${action}/${expected}: expected ${manifest.frameSize}x${manifest.frameSize}, got ${metrics.width}x${metrics.height}`);
    }
    if (!metrics.channels.includes("a")) failures.push(`${action}/${expected}: missing alpha channel`);
    if (metrics.maxAlpha <= 0) failures.push(`${action}/${expected}: no visible pixels`);
  }
}

function runtimePathToDisk(frameRoot) {
  const normalized = normalize(frameRoot.replace(/^(\.\.\/)?assets\//, "assets/"));
  return join(root, normalized);
}

function imageMetrics(filePath) {
  const identify = execFileSync("magick", ["identify", "-format", "%w %h %[channels]", filePath], { encoding: "utf8" }).trim();
  const [width, height, channels] = identify.split(/\s+/);
  const alphaStats = execFileSync("magick", [filePath, "-alpha", "extract", "-format", "%[fx:maxima]", "info:"], { encoding: "utf8" }).trim();
  return { width: Number(width), height: Number(height), channels, maxAlpha: Number(alphaStats) };
}
```

- [ ] **Step 2: Add npm script**

In `package.json`, add:

```json
"validate:runtime-animations": "node scripts/validate-runtime-animations.mjs"
```

Keep the existing scripts for now. Do not delete old scripts until cleanup is reviewed.

- [ ] **Step 3: Run validation**

Run:

```bash
npm run validate:runtime-animations
```

Expected: `ok: true` because Phase 1 actions are present in the manifest but disabled until clean rebuilt frames exist.

- [ ] **Step 4: Commit**

```bash
git add package.json scripts/validate-runtime-animations.mjs
git commit -m "test: validate runtime animation manifest"
```

## Task 4: Make Autonomous Behavior Phase-1 Safe

**Files:**
- Modify: `src/core/behavior/autonomous-behavior.ts`
- Test: `npm run typecheck`

- [ ] **Step 1: Limit idle autonomous choices**

In `src/core/behavior/autonomous-behavior.ts`, replace `requestIdleAction` with:

```ts
private requestIdleAction(now: number): void {
  const roll = Math.random();

  if (roll < 0.55) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    this.fsm.request({ state: "walking", direction, mood: "neutral" }, now);
    return;
  }

  if (roll < 0.8) {
    this.fsm.request({ state: "teaser", mood: "happy", view: "front", direction: 0 }, now);
    this.fsm.lockFor(this.config.timing.interactionMs, now);
    return;
  }

  this.fsm.request({ state: "waving", mood: "happy", view: "front", direction: 0 }, now);
  this.fsm.lockFor(this.config.timing.interactionMs, now);
}
```

`teaser` maps to `tail_wag` and `waving` maps to `idle_secondary` through the manifest. If those actions are still disabled, the loader falls back to `idle_primary`.

- [ ] **Step 2: Keep sleep fallback harmless**

Do not remove sleep states yet. They continue to map to `idle_primary` through the manifest until sleep reference videos exist.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/core/behavior/autonomous-behavior.ts
git commit -m "feat: constrain autonomous actions to phase one animations"
```

## Task 5: Add Cleanup Candidate Listing

**Files:**
- Create: `scripts/list-animation-cleanup-candidates.mjs`
- Modify: `package.json`
- Test: `npm run list:animation-cleanup`

- [ ] **Step 1: Add dry-run cleanup lister**

Create `scripts/list-animation-cleanup-candidates.mjs`:

```js
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const candidates = [
  "assets/hyperframes",
  "assets/references/action-sheets",
  "assets/references/cat-sprite-backups",
  "assets/references/cat-sprite-preview",
  "assets/references/cat-sprite-work",
  "assets/references/video-reference",
  "assets/sprites/dragging",
  "assets/sprites/idle",
  "assets/sprites/shy",
  "assets/sprites/sleep",
  "assets/sprites/sleeping",
  "assets/sprites/sleepy",
  "assets/sprites/surprised",
  "assets/sprites/teaser",
  "assets/sprites/waking",
  "assets/sprites/walk",
  "assets/sprites/walk_left",
  "assets/sprites/walking",
  "assets/sprites/waving"
];

const existing = candidates
  .map((relativePath) => {
    const absolutePath = join(root, relativePath);
    if (!existsSync(absolutePath)) return null;
    const stats = statSync(absolutePath);
    return { relativePath, type: stats.isDirectory() ? "directory" : "file" };
  })
  .filter(Boolean);

console.log(JSON.stringify({
  dryRun: true,
  keep: ["assets/origin", "assets/runtime/animations", "docs", "src", "electron", "scripts"],
  candidates: existing
}, null, 2));
```

- [ ] **Step 2: Add npm script**

In `package.json`, add:

```json
"list:animation-cleanup": "node scripts/list-animation-cleanup-candidates.mjs"
```

- [ ] **Step 3: Run dry-run list**

Run:

```bash
npm run list:animation-cleanup
```

Expected: JSON output with `dryRun: true`, no files deleted, and no `assets/origin` entry under `candidates`.

- [ ] **Step 4: Commit**

```bash
git add package.json scripts/list-animation-cleanup-candidates.mjs
git commit -m "chore: list legacy animation cleanup candidates"
```

## Task 6: Update Docs For New Commands

**Files:**
- Modify: `docs/animation-upgrade-plan.md`
- Modify: `docs/animation-production-log.md`
- Test: `rg -n "validate:runtime-animations|list:animation-cleanup|assets/origin" docs`

- [ ] **Step 1: Add command references**

In `docs/animation-upgrade-plan.md`, under `Validation`, add this text:

````md
Run:

```bash
npm run validate:runtime-animations
npm run typecheck
npm run build
```
````

Under `Cleanup Queue`, add this text:

````md
Preview cleanup candidates with:

```bash
npm run list:animation-cleanup
```

This command is dry-run only. Actual deletion requires a separate reviewed cleanup step.
````

- [ ] **Step 2: Add production-log first-pass entries**

In `docs/animation-production-log.md`, append:

```md
## 2026-06-13 Phase 1 Setup

Date: 2026-06-13
Source: `assets/origin`
Target action: `idle_primary`, `idle_secondary`, `tail_wag`, `walk`
Reference segment: Full source videos will be reviewed during extraction.
Frame count: Manifest starts disabled with `frameCount: 0`; each action is enabled only after clean rebuilt frames exist.
FPS: Initial target is 30 fps.
Loop mode: `idle_primary`, `idle_secondary`, and `walk` loop. `tail_wag` plays as a short idle variation.
Watermark handling: Source videos are references only. Runtime frames must be rebuilt cleanly and contain no watermark pixels.
Rebuild method: Clean transparent sequence frame reconstruction from source-video motion and `鱼仔参考图.png` identity.
Runtime output: `assets/runtime/animations/<action>/frames/frame_000001.png`.
Validation commands: `npm run validate:runtime-animations`, `npm run typecheck`, `npm run build`.
Desktop validation: Required after runtime frames are generated.
Known issues: Runtime actions are disabled until rebuilt frame folders exist.
Decision: Proceed with manifest-driven Phase 1 implementation before generating final frames.
```

- [ ] **Step 3: Verify docs mention new commands**

Run:

```bash
rg -n "validate:runtime-animations|list:animation-cleanup|assets/origin" docs
```

Expected: matches in `docs/animation-upgrade-plan.md`, `docs/animation-production-log.md`, and the design spec.

- [ ] **Step 4: Commit**

```bash
git add docs/animation-upgrade-plan.md docs/animation-production-log.md
git commit -m "docs: document runtime animation workflow commands"
```

## Task 7: Build And Desktop Smoke Test

**Files:**
- No source file changes unless verification exposes a bug.
- Test: `npm run validate:runtime-animations`, `npm run typecheck`, `npm run build`, `npm run dev`

- [ ] **Step 1: Run validation**

Run:

```bash
npm run validate:runtime-animations
```

Expected: `ok: true`.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: `dist/electron/main.js`, `dist/electron/preload.js`, `dist/renderer/main.js`, and `dist/assets/runtime/animations/manifest.json` exist.

- [ ] **Step 4: Launch desktop app**

Run:

```bash
npm run dev
```

Expected: Electron opens a transparent always-on-top YuZai window. Before rebuilt runtime frames exist, the renderer may use the placeholder fallback, but it must not attempt to load old generated GIF output or crash.

- [ ] **Step 5: Record result**

Append the desktop smoke result to `docs/animation-production-log.md`:

```md
Desktop validation: Electron launched successfully with manifest-driven loader. Placeholder fallback is acceptable until rebuilt Phase 1 frames exist.
```

- [ ] **Step 6: Commit validation log**

```bash
git add docs/animation-production-log.md
git commit -m "docs: record desktop animation smoke test"
```

## Task 8: Review Legacy Asset Cleanup Before Deletion

**Files:**
- No deletion in this task unless the user approves the printed list.
- Test: `npm run list:animation-cleanup`

- [ ] **Step 1: Print cleanup candidates**

Run:

```bash
npm run list:animation-cleanup
```

Expected: dry-run JSON lists legacy generated animation directories and does not include `assets/origin`.

- [ ] **Step 2: Ask for approval before deletion**

Use the dry-run JSON to ask the user which candidates to delete. Do not delete anything in this task without explicit approval.

- [ ] **Step 3: If approved, delete only approved candidates**

Use explicit paths from the approved list. Do not use broad globs. Keep `assets/origin`, `assets/runtime/animations`, docs, source code, and scripts.

- [ ] **Step 4: Run validation after cleanup**

Run:

```bash
npm run validate:runtime-animations
npm run typecheck
npm run build
```

Expected: all commands pass.

- [ ] **Step 5: Commit approved cleanup**

```bash
git add <approved-cleanup-path-1> <approved-cleanup-path-2>
git commit -m "chore: remove legacy generated animation assets"
```

Replace `<approved-cleanup-path-1>` and `<approved-cleanup-path-2>` with the explicit paths the user approved from the dry-run output. Do not stage broad directories in the current dirty worktree.

## Self-Review

- Spec coverage: The plan covers source-video reference use, no runtime watermark pixels, Phase 1 four-video scope, manifest-driven loading, fallback behavior for missing states, dry-run cleanup, production logging, and desktop Electron validation.
- Placeholder scan: The plan intentionally uses disabled manifest entries with `frameCount: 0` before rebuilt frames exist; this is not an unspecified placeholder, it is the concrete initial manifest state.
- Type consistency: `RuntimeAnimationAction`, `RuntimeAnimationConfig`, `RuntimeAnimationManifest`, `actionForPose`, and `frameUrl` are introduced before use. Runtime state names remain the existing `PetStateName` values, while Phase 1 action names live in the manifest layer.
