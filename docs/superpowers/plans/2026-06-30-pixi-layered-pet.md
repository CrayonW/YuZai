# Pixi Layered Pet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current sequence-frame renderer with a PixiJS layered-pet renderer that displays a seated YuZai cat driven by continuous pose parameters.

**Architecture:** Electron remains responsible for the transparent always-on-top desktop window, tray, menu, drag, size, and settings. The renderer moves from `CanvasRenderer + AnimationDirector + PNG frame sequences` to `LayeredPetRenderer + rig.json + pose parameters`, with PixiJS drawing transparent PNG layers in a scene tree. The first implementation uses generated temporary PNG layers to prove the runtime before formal PSD-derived art arrives.

**Tech Stack:** Electron, TypeScript, PixiJS, esbuild, Node validation scripts, ImageMagick `magick` for temporary PNG generation during development.

---

## Scope Check

This plan covers one product slice: the first PixiJS layered seated YuZai MVP. It does not implement the final hand-painted PSD asset, walking, sleep posture chains, Spine/Live2D, or a long-term dual renderer mode. Old sequence assets stay in the repo until the Pixi renderer is verified on desktop; cleanup is a final task.

## File Structure

- Create `assets/layered-pets/yuzai/identity.json`: identity lock for YuZai visual traits.
- Create `assets/layered-pets/yuzai/rig.json`: runtime layer tree, pivots, transforms, and parameter bindings.
- Create `assets/layered-pets/yuzai/layers/*.png`: temporary generated transparent PNG layers for MVP validation.
- Create `assets/layered-pets/yuzai/source/README.md`: documents PSD/source-file requirement while the real PSD is pending.
- Create `src/core/layered-pet/types.ts`: shared TypeScript types for rig, identity, layer config, and pose parameters.
- Create `src/core/layered-pet/rig.ts`: rig parsing, sorting, and validation helpers used by runtime and tests.
- Create `src/core/layered-pet/pose-parameters.ts`: default pose values, clamping, easing, and intent merging.
- Create `src/core/render/layered-pet-renderer.ts`: PixiJS renderer that loads the asset pack and applies pose transforms.
- Create `src/core/render/layered-pet-controller.ts`: frame-level controller for breathing, blinking, mouse look, ear alert, tail mood, drag squash, and paw lift.
- Modify `src/renderer/main.ts`: remove sequence-frame render loop from the main path and wire in layered renderer/controller.
- Modify `src/renderer/index.html`: keep `#pet-canvas` as Pixi host canvas or replace it with a `#pet-root` container if needed.
- Modify `src/renderer/global.d.ts`: expose any additional mouse position payloads needed by layered pose control.
- Modify `electron/main.ts` and `electron/preload.ts`: add absolute mouse position or window-relative cursor data if the renderer cannot derive it from existing IPC.
- Create `scripts/generate-layered-pet-temporary.mjs`: generates temporary YuZai-like PNG layers using ImageMagick.
- Create `scripts/validate-layered-pet-assets.mjs`: validates `identity.json`, `rig.json`, layer file existence, PNG alpha, and required parameters.
- Create `scripts/validate-layered-pet-pose.mjs`: tests pose parameter clamping and expected transform output.
- Create `scripts/validate-layered-pet-renderer.mjs`: bundles and smoke-tests Pixi renderer imports without launching Electron.
- Modify `package.json`: add `pixi.js`, add validation scripts, and update runtime validation entry points.
- Modify `README.md`: replace sequence-frame-first wording with Pixi layered runtime wording.

---

### Task 1: Add PixiJS Dependency and Smoke Validation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `scripts/validate-pixi-import.mjs`

- [ ] **Step 1: Install PixiJS**

Run:

```bash
npm install pixi.js
```

Expected:

```text
added ... packages
```

If network access is blocked, rerun the same command with escalated permissions and explain that PixiJS is required for the approved renderer architecture.

- [ ] **Step 2: Create a Pixi import validator**

Create `scripts/validate-pixi-import.mjs`:

```js
const pixi = await import("pixi.js");

const required = ["Application", "Container", "Sprite", "Texture"];
const missing = required.filter((name) => !pixi[name]);

console.log(JSON.stringify({ ok: missing.length === 0, missing }, null, 2));
if (missing.length > 0) process.exitCode = 1;
```

- [ ] **Step 3: Add package script**

In `package.json`, add this script near the other validation scripts:

```json
"validate:pixi-import": "node scripts/validate-pixi-import.mjs"
```

- [ ] **Step 4: Run validation**

Run:

```bash
npm run validate:pixi-import
npm run typecheck
npm run build
```

Expected:

```text
{"ok":true,"missing":[]}
```

`typecheck` and `build` should exit with code 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json scripts/validate-pixi-import.mjs
git commit -m "chore: add pixi renderer dependency"
```

---

### Task 2: Define Layered Pet Asset Pack Contract

**Files:**
- Create: `src/core/layered-pet/types.ts`
- Create: `assets/layered-pets/yuzai/identity.json`
- Create: `assets/layered-pets/yuzai/rig.json`
- Create: `assets/layered-pets/yuzai/source/README.md`
- Create: `scripts/validate-layered-pet-assets.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add TypeScript contract**

Create `src/core/layered-pet/types.ts`:

```ts
export type LayeredPetParameter =
  | "lookX"
  | "lookY"
  | "breath"
  | "blink"
  | "earAlert"
  | "tailMood"
  | "dragSquash"
  | "pawLift";

export interface LayeredPetPoint {
  x: number;
  y: number;
}

export interface LayeredPetRange {
  min: number;
  max: number;
}

export interface LayeredPetLayerBinding {
  parameter: LayeredPetParameter;
  translate?: LayeredPetPoint;
  rotate?: number;
  scale?: LayeredPetPoint;
  alpha?: number;
}

export interface LayeredPetLayer {
  id: string;
  texture: string;
  parent: string | null;
  zIndex: number;
  position: LayeredPetPoint;
  pivot: LayeredPetPoint;
  rotation: number;
  scale: LayeredPetPoint;
  rotationRange?: LayeredPetRange;
  scaleRange?: {
    x: LayeredPetRange;
    y: LayeredPetRange;
  };
  bindings: LayeredPetLayerBinding[];
}

export interface LayeredPetRig {
  version: 1;
  canvasSize: number;
  defaultScale: number;
  layers: LayeredPetLayer[];
}

export interface LayeredPetIdentity {
  version: 1;
  name: string;
  reference: string;
  requiredTraits: string[];
  forbiddenTraits: string[];
}

export type LayeredPetPoseParameters = Record<LayeredPetParameter, number>;
```

- [ ] **Step 2: Create identity contract**

Create `assets/layered-pets/yuzai/identity.json`:

```json
{
  "version": 1,
  "name": "鱼仔",
  "reference": "assets/origin/鱼仔参考图.png",
  "requiredTraits": [
    "灰白英短感",
    "灰色头顶和脸颊",
    "白色鼻梁从额头延伸到鼻口",
    "金色圆眼和黑色瞳孔",
    "粉色鼻子",
    "白胸和白前腿",
    "灰背",
    "厚实圆润坐姿",
    "深灰尾巴贴近身体"
  ],
  "forbiddenTraits": [
    "长毛猫",
    "纯白猫",
    "蓝眼睛",
    "明显拟人服装",
    "文字",
    "logo",
    "水印"
  ]
}
```

- [ ] **Step 3: Create first rig contract**

Create `assets/layered-pets/yuzai/rig.json`:

```json
{
  "version": 1,
  "canvasSize": 1024,
  "defaultScale": 1,
  "layers": [
    {
      "id": "body_base",
      "texture": "layers/body_base.png",
      "parent": null,
      "zIndex": 10,
      "position": { "x": 512, "y": 620 },
      "pivot": { "x": 0, "y": 80 },
      "rotation": 0,
      "scale": { "x": 1, "y": 1 },
      "scaleRange": { "x": { "min": 0.96, "max": 1.04 }, "y": { "min": 0.96, "max": 1.04 } },
      "bindings": [{ "parameter": "breath", "scale": { "x": 0.015, "y": -0.018 } }]
    },
    {
      "id": "tail_01",
      "texture": "layers/tail_01.png",
      "parent": "body_base",
      "zIndex": 5,
      "position": { "x": -230, "y": 210 },
      "pivot": { "x": 115, "y": 20 },
      "rotation": -0.12,
      "scale": { "x": 1, "y": 1 },
      "rotationRange": { "min": -0.35, "max": 0.25 },
      "bindings": [{ "parameter": "tailMood", "rotate": 0.2 }, { "parameter": "dragSquash", "rotate": -0.12 }]
    },
    {
      "id": "front_leg_left",
      "texture": "layers/front_leg_left.png",
      "parent": "body_base",
      "zIndex": 20,
      "position": { "x": -85, "y": 190 },
      "pivot": { "x": 0, "y": -80 },
      "rotation": 0,
      "scale": { "x": 1, "y": 1 },
      "rotationRange": { "min": -0.15, "max": 0.2 },
      "bindings": [{ "parameter": "pawLift", "translate": { "x": -12, "y": -32 }, "rotate": -0.1 }]
    },
    {
      "id": "front_leg_right",
      "texture": "layers/front_leg_right.png",
      "parent": "body_base",
      "zIndex": 21,
      "position": { "x": 78, "y": 190 },
      "pivot": { "x": 0, "y": -80 },
      "rotation": 0,
      "scale": { "x": 1, "y": 1 },
      "rotationRange": { "min": -0.15, "max": 0.2 },
      "bindings": [{ "parameter": "dragSquash", "translate": { "x": 8, "y": 18 } }]
    },
    {
      "id": "head_base",
      "texture": "layers/head_base.png",
      "parent": "body_base",
      "zIndex": 30,
      "position": { "x": 0, "y": -250 },
      "pivot": { "x": 0, "y": 45 },
      "rotation": 0,
      "scale": { "x": 1, "y": 1 },
      "rotationRange": { "min": -0.18, "max": 0.18 },
      "bindings": [
        { "parameter": "lookX", "translate": { "x": 16, "y": 0 }, "rotate": 0.08 },
        { "parameter": "lookY", "translate": { "x": 0, "y": 10 }, "rotate": -0.04 },
        { "parameter": "dragSquash", "translate": { "x": -10, "y": 6 } }
      ]
    },
    {
      "id": "ear_left",
      "texture": "layers/ear_left.png",
      "parent": "head_base",
      "zIndex": 31,
      "position": { "x": -130, "y": -100 },
      "pivot": { "x": 32, "y": 75 },
      "rotation": -0.2,
      "scale": { "x": 1, "y": 1 },
      "rotationRange": { "min": -0.45, "max": 0.12 },
      "bindings": [{ "parameter": "earAlert", "rotate": -0.18 }]
    },
    {
      "id": "ear_right",
      "texture": "layers/ear_right.png",
      "parent": "head_base",
      "zIndex": 31,
      "position": { "x": 130, "y": -100 },
      "pivot": { "x": -32, "y": 75 },
      "rotation": 0.2,
      "scale": { "x": 1, "y": 1 },
      "rotationRange": { "min": -0.12, "max": 0.45 },
      "bindings": [{ "parameter": "earAlert", "rotate": 0.18 }]
    },
    {
      "id": "eye_left_iris",
      "texture": "layers/eye_left_iris.png",
      "parent": "head_base",
      "zIndex": 35,
      "position": { "x": -62, "y": -8 },
      "pivot": { "x": 0, "y": 0 },
      "rotation": 0,
      "scale": { "x": 1, "y": 1 },
      "bindings": [{ "parameter": "lookX", "translate": { "x": 18, "y": 0 } }, { "parameter": "lookY", "translate": { "x": 0, "y": 10 } }]
    },
    {
      "id": "eye_right_iris",
      "texture": "layers/eye_right_iris.png",
      "parent": "head_base",
      "zIndex": 35,
      "position": { "x": 62, "y": -8 },
      "pivot": { "x": 0, "y": 0 },
      "rotation": 0,
      "scale": { "x": 1, "y": 1 },
      "bindings": [{ "parameter": "lookX", "translate": { "x": 18, "y": 0 } }, { "parameter": "lookY", "translate": { "x": 0, "y": 10 } }]
    },
    {
      "id": "eye_lids",
      "texture": "layers/eye_lids.png",
      "parent": "head_base",
      "zIndex": 36,
      "position": { "x": 0, "y": -10 },
      "pivot": { "x": 0, "y": 0 },
      "rotation": 0,
      "scale": { "x": 1, "y": 1 },
      "bindings": [{ "parameter": "blink", "scale": { "x": 0, "y": 0.82 }, "translate": { "x": 0, "y": 18 } }]
    },
    {
      "id": "nose_mouth",
      "texture": "layers/nose_mouth.png",
      "parent": "head_base",
      "zIndex": 37,
      "position": { "x": 0, "y": 70 },
      "pivot": { "x": 0, "y": 0 },
      "rotation": 0,
      "scale": { "x": 1, "y": 1 },
      "bindings": []
    }
  ]
}
```

- [ ] **Step 4: Document source-file requirement**

Create `assets/layered-pets/yuzai/source/README.md`:

```markdown
# 鱼仔分层源文件

正式资产交付时，本目录必须包含 `yuzai.psd` 或等价分层工程源文件。

当前 MVP 可先使用 `layers/*.png` 临时验证 Pixi 分层运行时，但不能把临时 PNG 视为最终美术资产。
```

- [ ] **Step 5: Add asset validator**

Create `scripts/validate-layered-pet-assets.mjs`:

```js
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const packRoot = join(root, "assets/layered-pets/yuzai");
const failures = [];

const requiredParameters = ["lookX", "lookY", "breath", "blink", "earAlert", "tailMood", "dragSquash", "pawLift"];

const identity = readJson("assets/layered-pets/yuzai/identity.json");
const rig = readJson("assets/layered-pets/yuzai/rig.json");

if (identity?.version !== 1) failures.push("identity.version must be 1");
if (identity?.name !== "鱼仔") failures.push("identity.name must be 鱼仔");
if (!identity?.requiredTraits?.includes("金色圆眼和黑色瞳孔")) failures.push("identity must lock golden eyes");

if (rig?.version !== 1) failures.push("rig.version must be 1");
if (!Number.isInteger(rig?.canvasSize) || rig.canvasSize !== 1024) failures.push("rig.canvasSize must be 1024");
if (!Array.isArray(rig?.layers) || rig.layers.length < 10) failures.push("rig.layers must contain first seated cat layers");

const layerIds = new Set();
const parameterHits = new Set();
for (const layer of rig?.layers || []) {
  if (!layer.id) failures.push("layer missing id");
  if (layerIds.has(layer.id)) failures.push(`duplicate layer id ${layer.id}`);
  layerIds.add(layer.id);

  const texturePath = join(packRoot, layer.texture || "");
  if (!existsSync(texturePath)) {
    failures.push(`${layer.id}: missing texture ${layer.texture}`);
  } else {
    assertPngHasAlpha(texturePath, layer.id);
  }

  if (layer.parent !== null && !rig.layers.some((candidate) => candidate.id === layer.parent)) {
    failures.push(`${layer.id}: parent ${layer.parent} does not exist`);
  }
  if (!Array.isArray(layer.bindings)) failures.push(`${layer.id}: bindings must be an array`);
  for (const binding of layer.bindings || []) {
    if (requiredParameters.includes(binding.parameter)) parameterHits.add(binding.parameter);
    else failures.push(`${layer.id}: unknown binding parameter ${binding.parameter}`);
  }
}

for (const parameter of requiredParameters) {
  if (!parameterHits.has(parameter)) failures.push(`missing binding for parameter ${parameter}`);
}

console.log(JSON.stringify({ ok: failures.length === 0, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;

function readJson(path) {
  try {
    return JSON.parse(readFileSync(join(root, path), "utf8"));
  } catch (error) {
    failures.push(`unable to read ${path}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function assertPngHasAlpha(path, label) {
  try {
    const output = execFileSync("magick", ["identify", "-format", "%m %w %h %[channels]", path], { encoding: "utf8" }).trim();
    const [format, width, height, channels] = output.split(/\s+/);
    if (format !== "PNG") failures.push(`${label}: texture must be PNG`);
    if (Number(width) <= 0 || Number(height) <= 0) failures.push(`${label}: texture dimensions must be positive`);
    if (!channels.includes("a")) failures.push(`${label}: texture must include alpha channel`);
  } catch (error) {
    failures.push(`${label}: unable to inspect texture with magick: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

- [ ] **Step 6: Add package script and run expected failing validation**

Add:

```json
"validate:layered-pet-assets": "node scripts/validate-layered-pet-assets.mjs"
```

Run:

```bash
npm run validate:layered-pet-assets
```

Expected: FAIL because `layers/*.png` does not exist yet. This confirms the validator is active.

- [ ] **Step 7: Commit**

```bash
git add src/core/layered-pet/types.ts assets/layered-pets/yuzai/identity.json assets/layered-pets/yuzai/rig.json assets/layered-pets/yuzai/source/README.md scripts/validate-layered-pet-assets.mjs package.json
git commit -m "feat: define layered pet asset contract"
```

---

### Task 3: Generate Temporary YuZai Layer PNGs

**Files:**
- Create: `scripts/generate-layered-pet-temporary.mjs`
- Create: `assets/layered-pets/yuzai/layers/*.png`
- Modify: `package.json`

- [ ] **Step 1: Add generator script**

Create `scripts/generate-layered-pet-temporary.mjs`:

```js
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const out = join(root, "assets/layered-pets/yuzai/layers");
mkdirSync(out, { recursive: true });

const layers = [
  ["body_base.png", "ellipse 512,620 265,330", "#f4eadc", "#5d5e63"],
  ["body_chest_white.png", "ellipse 560,600 150,260", "#fff4e3", "none"],
  ["tail_01.png", "roundrectangle 210,760 555,835 80,80", "#444448", "none"],
  ["front_leg_left.png", "roundrectangle 400,620 475,900 42,42", "#fff3df", "none"],
  ["front_leg_right.png", "roundrectangle 545,620 620,900 42,42", "#fff3df", "none"],
  ["head_base.png", "ellipse 512,360 215,185", "#686970", "none"],
  ["ear_left.png", "polygon 360,255 430,70 480,280", "#65666c", "none"],
  ["ear_right.png", "polygon 545,280 595,70 665,255", "#65666c", "none"],
  ["eye_left_iris.png", "circle 450,350 450,305", "#d99a24", "none"],
  ["eye_right_iris.png", "circle 575,350 575,305", "#d99a24", "none"],
  ["eye_lids.png", "roundrectangle 390,310 635,370 24,24", "rgba(104,105,112,0.72)", "none"],
  ["nose_mouth.png", "circle 512,430 512,400", "#f4a6a2", "none"]
];

for (const [file, shape, fill, stroke] of layers) {
  const args = [
    "-size", "1024x1024",
    "xc:none",
    "-fill", fill,
    "-stroke", stroke,
    "-strokewidth", stroke === "none" ? "0" : "18",
    "-draw", shape,
    join(out, file)
  ];
  execFileSync("magick", args, { stdio: "inherit" });
}

console.log(JSON.stringify({ ok: true, generated: layers.map(([file]) => file) }, null, 2));
```

- [ ] **Step 2: Add package script**

Add:

```json
"layered-pet:generate-temporary": "node scripts/generate-layered-pet-temporary.mjs"
```

- [ ] **Step 3: Generate layers**

Run:

```bash
npm run layered-pet:generate-temporary
```

Expected:

```text
{"ok":true,"generated":[...]}
```

- [ ] **Step 4: Validate generated asset pack**

Run:

```bash
npm run validate:layered-pet-assets
```

Expected:

```text
{"ok":true,"failures":[]}
```

- [ ] **Step 5: Commit**

```bash
git add assets/layered-pets/yuzai/layers scripts/generate-layered-pet-temporary.mjs package.json
git commit -m "feat: add temporary layered pet assets"
```

---

### Task 4: Implement Rig Parser and Pose Parameter Math

**Files:**
- Create: `src/core/layered-pet/rig.ts`
- Create: `src/core/layered-pet/pose-parameters.ts`
- Create: `scripts/validate-layered-pet-pose.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create rig parser**

Create `src/core/layered-pet/rig.ts`:

```ts
import type { LayeredPetLayer, LayeredPetRig } from "./types";

export interface ResolvedLayeredPetLayer extends LayeredPetLayer {
  children: string[];
}

export function resolveRigLayers(rig: LayeredPetRig): ResolvedLayeredPetLayer[] {
  const byId = new Map<string, ResolvedLayeredPetLayer>();
  for (const layer of rig.layers) {
    byId.set(layer.id, { ...layer, children: [] });
  }
  for (const layer of byId.values()) {
    if (layer.parent) {
      const parent = byId.get(layer.parent);
      if (!parent) throw new Error(`Layer ${layer.id} references missing parent ${layer.parent}`);
      parent.children.push(layer.id);
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.zIndex - b.zIndex);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
```

- [ ] **Step 2: Create pose parameter helpers**

Create `src/core/layered-pet/pose-parameters.ts`:

```ts
import type { LayeredPetLayer, LayeredPetPoseParameters } from "./types";
import { clamp } from "./rig";

export const DEFAULT_POSE_PARAMETERS: LayeredPetPoseParameters = {
  lookX: 0,
  lookY: 0,
  breath: 0,
  blink: 0,
  earAlert: 0,
  tailMood: 0,
  dragSquash: 0,
  pawLift: 0
};

export interface LayerTransform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  alpha: number;
}

export function normalizePoseParameters(input: Partial<LayeredPetPoseParameters>): LayeredPetPoseParameters {
  return {
    lookX: clamp(input.lookX ?? 0, -1, 1),
    lookY: clamp(input.lookY ?? 0, -1, 1),
    breath: clamp(input.breath ?? 0, 0, 1),
    blink: clamp(input.blink ?? 0, 0, 1),
    earAlert: clamp(input.earAlert ?? 0, 0, 1),
    tailMood: clamp(input.tailMood ?? 0, -1, 1),
    dragSquash: clamp(input.dragSquash ?? 0, -1, 1),
    pawLift: clamp(input.pawLift ?? 0, 0, 1)
  };
}

export function transformForLayer(layer: LayeredPetLayer, pose: LayeredPetPoseParameters): LayerTransform {
  let x = layer.position.x;
  let y = layer.position.y;
  let rotation = layer.rotation;
  let scaleX = layer.scale.x;
  let scaleY = layer.scale.y;
  let alpha = 1;

  for (const binding of layer.bindings) {
    const value = pose[binding.parameter];
    if (binding.translate) {
      x += binding.translate.x * value;
      y += binding.translate.y * value;
    }
    if (binding.rotate) rotation += binding.rotate * value;
    if (binding.scale) {
      scaleX += binding.scale.x * value;
      scaleY += binding.scale.y * value;
    }
    if (binding.alpha) alpha += binding.alpha * value;
  }

  if (layer.rotationRange) rotation = clamp(rotation, layer.rotationRange.min, layer.rotationRange.max);
  if (layer.scaleRange) {
    scaleX = clamp(scaleX, layer.scaleRange.x.min, layer.scaleRange.x.max);
    scaleY = clamp(scaleY, layer.scaleRange.y.min, layer.scaleRange.y.max);
  }

  return { x, y, rotation, scaleX, scaleY, alpha: clamp(alpha, 0, 1) };
}
```

- [ ] **Step 3: Add pose validator**

Create `scripts/validate-layered-pet-pose.mjs`:

```js
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = join(tmpdir(), `yuzai-layered-pose-${process.pid}`);
mkdirSync(tempRoot, { recursive: true });
const entry = join(tempRoot, "entry.mjs");
const bundle = join(tempRoot, "bundle.mjs");

writeFileSync(entry, `
  import { normalizePoseParameters, transformForLayer } from ${JSON.stringify(join(process.cwd(), "src/core/layered-pet/pose-parameters.ts"))};

  const pose = normalizePoseParameters({ lookX: 2, blink: -1, tailMood: -2, pawLift: 0.5 });
  assertEqual(pose.lookX, 1, "lookX clamps high");
  assertEqual(pose.blink, 0, "blink clamps low");
  assertEqual(pose.tailMood, -1, "tailMood clamps low");
  assertEqual(pose.pawLift, 0.5, "pawLift keeps middle");

  const layer = {
    id: "head",
    texture: "layers/head.png",
    parent: null,
    zIndex: 1,
    position: { x: 100, y: 200 },
    pivot: { x: 0, y: 0 },
    rotation: 0,
    scale: { x: 1, y: 1 },
    rotationRange: { min: -0.1, max: 0.1 },
    bindings: [{ parameter: "lookX", translate: { x: 20, y: 0 }, rotate: 0.5 }]
  };
  const transform = transformForLayer(layer, pose);
  assertEqual(transform.x, 120, "lookX translates layer");
  assertEqual(transform.rotation, 0.1, "rotation clamps");

  function assertEqual(actual, expected, label) {
    if (actual !== expected) throw new Error(label + ": expected " + expected + ", got " + actual);
  }
`);

await build({ entryPoints: [entry], outfile: bundle, bundle: true, platform: "node", target: "node20", format: "esm", logLevel: "silent" });
await import(pathToFileURL(bundle).href);
console.log(JSON.stringify({ ok: true }, null, 2));
```

- [ ] **Step 4: Add package script and run**

Add:

```json
"validate:layered-pet-pose": "node scripts/validate-layered-pet-pose.mjs"
```

Run:

```bash
npm run validate:layered-pet-pose
npm run typecheck
```

Expected:

```text
{"ok":true}
```

- [ ] **Step 5: Commit**

```bash
git add src/core/layered-pet/rig.ts src/core/layered-pet/pose-parameters.ts scripts/validate-layered-pet-pose.mjs package.json
git commit -m "feat: add layered pet rig math"
```

---

### Task 5: Build Pixi LayeredPetRenderer

**Files:**
- Create: `src/core/render/layered-pet-renderer.ts`
- Create: `scripts/validate-layered-pet-renderer.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create renderer**

Create `src/core/render/layered-pet-renderer.ts`:

```ts
import { Application, Container, Sprite, Texture } from "pixi.js";
import type { LayeredPetPoseParameters, LayeredPetRig } from "../layered-pet/types";
import { resolveRigLayers } from "../layered-pet/rig";
import { DEFAULT_POSE_PARAMETERS, transformForLayer } from "../layered-pet/pose-parameters";

interface RuntimeLayer {
  id: string;
  container: Container;
  sprite: Sprite;
  config: ReturnType<typeof resolveRigLayers>[number];
}

export class LayeredPetRenderer {
  private readonly host: HTMLElement;
  private readonly app: Application;
  private readonly root = new Container();
  private readonly layers = new Map<string, RuntimeLayer>();
  private size = 280;

  constructor(host: HTMLElement, size: number) {
    this.host = host;
    this.size = size;
    this.app = new Application();
  }

  async initialize(): Promise<void> {
    await this.app.init({
      width: this.size,
      height: this.size,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });
    this.host.replaceChildren(this.app.canvas);
    this.app.stage.addChild(this.root);
  }

  async load(rig: LayeredPetRig, assetRoot: string): Promise<void> {
    this.root.removeChildren();
    this.layers.clear();

    const resolved = resolveRigLayers(rig);
    for (const layer of resolved) {
      const texture = await Texture.fromURL(`${assetRoot}/${layer.texture}`);
      const container = new Container();
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      container.addChild(sprite);
      this.layers.set(layer.id, { id: layer.id, container, sprite, config: layer });
    }

    for (const layer of resolved) {
      const runtime = this.layers.get(layer.id);
      if (!runtime) continue;
      if (layer.parent) {
        this.layers.get(layer.parent)?.container.addChild(runtime.container);
      } else {
        this.root.addChild(runtime.container);
      }
    }

    this.root.scale.set(this.size / rig.canvasSize);
    this.root.position.set(0, 0);
    this.render(DEFAULT_POSE_PARAMETERS);
  }

  resize(size: number): void {
    this.size = size;
    this.app.renderer.resize(size, size);
    this.root.scale.set(size / 1024);
  }

  render(pose: LayeredPetPoseParameters): void {
    for (const runtime of this.layers.values()) {
      const transform = transformForLayer(runtime.config, pose);
      runtime.container.position.set(transform.x, transform.y);
      runtime.container.pivot.set(runtime.config.pivot.x, runtime.config.pivot.y);
      runtime.container.rotation = transform.rotation;
      runtime.container.scale.set(transform.scaleX, transform.scaleY);
      runtime.container.alpha = transform.alpha;
    }
  }

  destroy(): void {
    this.app.destroy(true);
  }
}
```

- [ ] **Step 2: Add renderer import validator**

Create `scripts/validate-layered-pet-renderer.mjs`:

```js
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = join(tmpdir(), `yuzai-layered-renderer-${process.pid}`);
mkdirSync(tempRoot, { recursive: true });
const entry = join(tempRoot, "entry.mjs");
const bundle = join(tempRoot, "bundle.mjs");

writeFileSync(entry, `
  import { LayeredPetRenderer } from ${JSON.stringify(join(process.cwd(), "src/core/render/layered-pet-renderer.ts"))};
  if (typeof LayeredPetRenderer !== "function") throw new Error("LayeredPetRenderer must be a class");
`);

await build({ entryPoints: [entry], outfile: bundle, bundle: true, platform: "browser", target: "es2020", format: "esm", logLevel: "silent" });
await import(pathToFileURL(bundle).href);
console.log(JSON.stringify({ ok: true }, null, 2));
```

- [ ] **Step 3: Add package script and run**

Add:

```json
"validate:layered-pet-renderer": "node scripts/validate-layered-pet-renderer.mjs"
```

Run:

```bash
npm run validate:layered-pet-renderer
npm run typecheck
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/core/render/layered-pet-renderer.ts scripts/validate-layered-pet-renderer.mjs package.json
git commit -m "feat: add pixi layered pet renderer"
```

---

### Task 6: Implement Pose Controller for Life, Mouse, Click, and Drag

**Files:**
- Create: `src/core/render/layered-pet-controller.ts`
- Create: `scripts/validate-layered-pet-controller.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create controller**

Create `src/core/render/layered-pet-controller.ts`:

```ts
import type { LayeredPetPoseParameters } from "../layered-pet/types";
import { DEFAULT_POSE_PARAMETERS, normalizePoseParameters } from "../layered-pet/pose-parameters";

export interface LayeredPetIntent {
  mouse?: { x: number; y: number; near: boolean };
  drag?: { x: number; y: number; active: boolean };
  clickPulse?: number;
}

export class LayeredPetController {
  private pose: LayeredPetPoseParameters = { ...DEFAULT_POSE_PARAMETERS };
  private blinkUntil = 0;
  private nextBlinkAt = 500;
  private clickPulseUntil = 0;

  update(now: number, intent: LayeredPetIntent): LayeredPetPoseParameters {
    const seconds = now / 1000;
    const breath = (Math.sin(seconds * Math.PI * 2 * 0.35) + 1) / 2;
    const tailWave = Math.sin(seconds * Math.PI * 2 * (intent.mouse?.near ? 0.9 : 0.35));

    if (now >= this.nextBlinkAt) {
      this.blinkUntil = now + 140;
      this.nextBlinkAt = now + 2600 + Math.random() * 2200;
    }
    if (intent.clickPulse && intent.clickPulse > 0) {
      this.clickPulseUntil = Math.max(this.clickPulseUntil, now + 220);
    }

    const mouse = intent.mouse ?? { x: 0, y: 0, near: false };
    const drag = intent.drag ?? { x: 0, y: 0, active: false };
    const blink = now < this.blinkUntil || now < this.clickPulseUntil ? 1 : 0;

    this.pose = normalizePoseParameters({
      lookX: smooth(this.pose.lookX, mouse.x, 0.18),
      lookY: smooth(this.pose.lookY, mouse.y, 0.18),
      breath,
      blink,
      earAlert: smooth(this.pose.earAlert, mouse.near ? 1 : 0, 0.12),
      tailMood: smooth(this.pose.tailMood, tailWave * (mouse.near ? 0.75 : 0.35), 0.1),
      dragSquash: smooth(this.pose.dragSquash, drag.active ? clamp(drag.x * 0.8, -1, 1) : 0, 0.16),
      pawLift: smooth(this.pose.pawLift, mouse.near || now < this.clickPulseUntil ? 0.55 : 0, 0.12)
    });

    return this.pose;
  }
}

function smooth(current: number, target: number, amount: number): number {
  return current + (target - current) * amount;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
```

- [ ] **Step 2: Add controller validator**

Create `scripts/validate-layered-pet-controller.mjs`:

```js
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = join(tmpdir(), `yuzai-layered-controller-${process.pid}`);
mkdirSync(tempRoot, { recursive: true });
const entry = join(tempRoot, "entry.mjs");
const bundle = join(tempRoot, "bundle.mjs");

writeFileSync(entry, `
  import { LayeredPetController } from ${JSON.stringify(join(process.cwd(), "src/core/render/layered-pet-controller.ts"))};
  const controller = new LayeredPetController();
  const idle = controller.update(1000, {});
  if (idle.breath < 0 || idle.breath > 1) throw new Error("breath must be normalized");
  const near = controller.update(1100, { mouse: { x: 1, y: -1, near: true } });
  if (near.lookX <= idle.lookX) throw new Error("lookX should move toward mouse");
  if (near.earAlert <= idle.earAlert) throw new Error("earAlert should rise when near");
  const dragged = controller.update(1200, { drag: { x: 1, y: 0, active: true } });
  if (dragged.dragSquash <= 0) throw new Error("dragSquash should rise during drag");
`);

await build({ entryPoints: [entry], outfile: bundle, bundle: true, platform: "node", target: "node20", format: "esm", logLevel: "silent" });
await import(pathToFileURL(bundle).href);
console.log(JSON.stringify({ ok: true }, null, 2));
```

- [ ] **Step 3: Add package script and run**

Add:

```json
"validate:layered-pet-controller": "node scripts/validate-layered-pet-controller.mjs"
```

Run:

```bash
npm run validate:layered-pet-controller
npm run typecheck
```

Expected: both commands pass.

- [ ] **Step 4: Commit**

```bash
git add src/core/render/layered-pet-controller.ts scripts/validate-layered-pet-controller.mjs package.json
git commit -m "feat: add layered pet pose controller"
```

---

### Task 7: Wire Pixi Renderer Into Renderer Main Flow

**Files:**
- Modify: `src/renderer/index.html`
- Modify: `src/renderer/main.ts`
- Modify: `src/renderer/styles.css`

- [ ] **Step 1: Update renderer host markup**

In `src/renderer/index.html`, keep the existing canvas for CSS compatibility but wrap it in a host element:

```html
<div id="pet-root">
  <canvas id="pet-canvas" width="280" height="280" aria-label="鱼仔桌宠"></canvas>
</div>
<div id="reminder-bubble" aria-live="polite"></div>
```

- [ ] **Step 2: Update CSS host sizing**

In `src/renderer/styles.css`, ensure these rules exist:

```css
#pet-root,
#pet-canvas {
  width: 100vw;
  height: 100vh;
}

#pet-root canvas {
  display: block;
}
```

- [ ] **Step 3: Replace sequence render imports in `src/renderer/main.ts`**

Remove these imports from the main runtime path:

```ts
import {
  actionForPose,
  configForAction,
  isRenderableRuntimeAnimationAction,
  runtimeAnimationManifest,
  type RuntimeAnimationAction
} from "../core/render/animation-manifest";
import { AnimationDirector } from "../core/render/animation-director";
import { CanvasRenderer } from "../core/render/canvas-renderer";
import { DailyAnimationRotator } from "../core/render/daily-animation-rotator";
import { MotionIntentScheduler } from "../core/render/motion-intent-scheduler";
import { buildRuntimeDailyRotatorOptions } from "../core/render/runtime-behavior-schedule";
import { preloadSpriteSequences, sequenceForAction } from "../core/render/sprite-assets";
import { entryFrameForTransition } from "../core/render/transition-anchors";
```

Add:

```ts
import yuzaiRig from "../../assets/layered-pets/yuzai/rig.json";
import { LayeredPetController } from "../core/render/layered-pet-controller";
import { LayeredPetRenderer } from "../core/render/layered-pet-renderer";
import type { LayeredPetRig } from "../core/layered-pet/types";
```

- [ ] **Step 4: Replace renderer construction**

Replace:

```ts
const renderer = new CanvasRenderer(canvas, DEFAULT_CONFIG.interaction.dragVisualFeedback);
```

with:

```ts
const petRoot = document.querySelector<HTMLElement>("#pet-root");
if (!petRoot) throw new Error("Missing #pet-root");

const renderer = new LayeredPetRenderer(petRoot, DEFAULT_CONFIG.window.defaultSize);
const layeredPetController = new LayeredPetController();
```

- [ ] **Step 5: Simplify tick render path**

In `tick`, remove `submitFrameIntents`, `motionScheduler`, `animationDirector`, and `renderer.render(...animationFrame)` calls. Render layered pose:

```ts
const drag = interaction.currentDragOffset;
const pose = layeredPetController.update(now, {
  mouse: {
    x: mouseFollowAction ? 1 : 0,
    y: 0,
    near: !!mouseFollowAction
  },
  drag: {
    x: drag.x / Math.max(1, petSize * 0.25),
    y: drag.y / Math.max(1, petSize * 0.25),
    active: Math.abs(drag.x) + Math.abs(drag.y) > 1
  }
});
renderer.render(pose);
```

Keep `fsm`, `autonomous`, `interaction`, reminders, bounds, size, and IPC listeners intact.

- [ ] **Step 6: Initialize Pixi before loop**

In `start`, add:

```ts
await renderer.initialize();
await renderer.load(yuzaiRig as LayeredPetRig, "assets/layered-pets/yuzai");
```

before `requestAnimationFrame`.

- [ ] **Step 7: Update size application**

Keep:

```ts
renderer.resize(size);
interaction.setPetSize(size);
```

Expected: no CanvasRenderer import remains in `src/renderer/main.ts`.

- [ ] **Step 8: Run build and typecheck**

Run:

```bash
npm run typecheck
npm run build
```

Expected: both commands pass.

- [ ] **Step 9: Commit**

```bash
git add src/renderer/index.html src/renderer/main.ts src/renderer/styles.css
git commit -m "feat: render desktop pet with pixi layers"
```

---

### Task 8: Add Real Mouse Vector Input for Head and Eye Tracking

**Files:**
- Modify: `electron/preload.ts`
- Modify: `electron/main.ts`
- Modify: `src/renderer/global.d.ts`
- Modify: `src/renderer/main.ts`
- Create: `scripts/validate-layered-pet-mouse-input.mjs`
- Modify: `package.json`

- [ ] **Step 1: Extend preload API type and bridge**

In `electron/preload.ts`, expose:

```ts
onMousePositionChange(callback: (payload: { x: number; y: number; near: boolean }) => void): void;
```

through the same `contextBridge.exposeInMainWorld("yuzai", ...)` style as existing mouse proximity listeners.

- [ ] **Step 2: Send normalized mouse vector from main**

In `electron/main.ts`, when global cursor polling already detects mouse proximity, calculate vector from pet window center:

```ts
const bounds = mainWindow.getBounds();
const centerX = bounds.x + bounds.width / 2;
const centerY = bounds.y + bounds.height / 2;
const dx = (point.x - centerX) / Math.max(1, bounds.width / 2);
const dy = (point.y - centerY) / Math.max(1, bounds.height / 2);
mainWindow.webContents.send("mouse:position", {
  x: Math.max(-1, Math.min(1, dx)),
  y: Math.max(-1, Math.min(1, dy)),
  near
});
```

Use the actual variable names in `electron/main.ts`; keep channel name `mouse:position`.

- [ ] **Step 3: Update renderer global declaration**

In `src/renderer/global.d.ts`, add:

```ts
onMousePositionChange(callback: (payload: { x: number; y: number; near: boolean }) => void): void;
```

- [ ] **Step 4: Feed mouse vector to controller**

In `src/renderer/main.ts`, maintain:

```ts
let mousePose = { x: 0, y: 0, near: false };
window.yuzai.onMousePositionChange((payload) => {
  mousePose = payload;
});
```

Then use `mouse: mousePose` in `layeredPetController.update(...)`.

- [ ] **Step 5: Add validator**

Create `scripts/validate-layered-pet-mouse-input.mjs`:

```js
import { readFileSync } from "node:fs";

const files = {
  main: readFileSync("electron/main.ts", "utf8"),
  preload: readFileSync("electron/preload.ts", "utf8"),
  globals: readFileSync("src/renderer/global.d.ts", "utf8"),
  renderer: readFileSync("src/renderer/main.ts", "utf8")
};

const failures = [];
if (!files.main.includes("mouse:position")) failures.push("electron/main.ts must send mouse:position");
if (!files.preload.includes("onMousePositionChange")) failures.push("electron/preload.ts must expose onMousePositionChange");
if (!files.globals.includes("onMousePositionChange")) failures.push("global.d.ts must declare onMousePositionChange");
if (!files.renderer.includes("onMousePositionChange")) failures.push("renderer main must consume onMousePositionChange");

console.log(JSON.stringify({ ok: failures.length === 0, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
```

- [ ] **Step 6: Add package script and run**

Add:

```json
"validate:layered-pet-mouse-input": "node scripts/validate-layered-pet-mouse-input.mjs"
```

Run:

```bash
npm run validate:layered-pet-mouse-input
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add electron/main.ts electron/preload.ts src/renderer/global.d.ts src/renderer/main.ts scripts/validate-layered-pet-mouse-input.mjs package.json
git commit -m "feat: feed mouse vector into layered pet"
```

---

### Task 9: Desktop Visual Verification

**Files:**
- Modify: `scripts/capture-sequence-inspector.mjs` only if it cannot inspect Pixi captures
- Test artifact: `/private/tmp/yuzai-layered-pet.png`
- Test artifact: `/private/tmp/yuzai-layered-pet-sequence-001.png` through `-006.png`

- [ ] **Step 1: Launch desktop pet screenshot**

Run:

```bash
YUZAI_CAPTURE_PATH=/private/tmp/yuzai-layered-pet.png npm run dev
```

Expected: Electron exits after writing capture path. Screenshot shows a simple layered seated YuZai-like cat, not a blank canvas.

- [ ] **Step 2: Launch multi-frame capture**

Run:

```bash
YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-layered-pet-sequence.png \
YUZAI_CAPTURE_SEQUENCE_COUNT=6 \
YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=180 \
YUZAI_CAPTURE_DELAY_MS=900 \
npm run dev
```

Expected: six PNG files exist.

- [ ] **Step 3: Inspect capture sequence**

Run:

```bash
npm run capture:inspect -- \
  --sequence-path /private/tmp/yuzai-layered-pet-sequence.png \
  --count 6 \
  --min-changed-frames 2 \
  --min-width 200 \
  --min-height 200
```

Expected: PASS. If it fails because the first temporary asset is too subtle, increase `breath` or `tailMood` visual amplitude in `assets/layered-pets/yuzai/rig.json`, rerun `npm run validate:layered-pet-assets`, and rerun capture inspection.

- [ ] **Step 4: Test mouse proximity**

Run:

```bash
YUZAI_TEST_MOUSE_PROXIMITY_MS=500 \
YUZAI_CAPTURE_DELAY_MS=1800 \
YUZAI_CAPTURE_PATH=/private/tmp/yuzai-layered-pet-proximity.png \
npm run dev
```

Expected: screenshot exists and cat is visible. Use visual inspection to confirm ears/eyes/head differ from idle capture.

- [ ] **Step 5: Commit if runtime adjustments were needed**

If Task 9 required code or rig changes:

```bash
git add assets/layered-pets/yuzai/rig.json src/core/render/layered-pet-controller.ts scripts/capture-sequence-inspector.mjs
git commit -m "fix: tune layered pet desktop motion"
```

If no changes were needed, do not create an empty commit.

---

### Task 10: Update Documentation and Runtime Validation Scripts

**Files:**
- Modify: `README.md`
- Modify: `scripts/validate-all.mjs`
- Modify: `scripts/validate-release.mjs`
- Create: `scripts/validate-layered-pet-runtime.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add combined layered runtime validator**

Create `scripts/validate-layered-pet-runtime.mjs`:

```js
import { execFileSync } from "node:child_process";

const commands = [
  ["npm", ["run", "validate:pixi-import"]],
  ["npm", ["run", "validate:layered-pet-assets"]],
  ["npm", ["run", "validate:layered-pet-pose"]],
  ["npm", ["run", "validate:layered-pet-controller"]],
  ["npm", ["run", "validate:layered-pet-renderer"]],
  ["npm", ["run", "validate:layered-pet-mouse-input"]]
];

for (const [cmd, args] of commands) {
  execFileSync(cmd, args, { stdio: "inherit" });
}

console.log(JSON.stringify({ ok: true }, null, 2));
```

- [ ] **Step 2: Add package script**

Add:

```json
"validate:layered-pet-runtime": "node scripts/validate-layered-pet-runtime.mjs"
```

- [ ] **Step 3: Update `scripts/validate-all.mjs`**

Ensure the active runtime validation list includes:

```js
"validate:layered-pet-runtime",
"typecheck",
"build"
```

Remove or skip validators that require deleted docs or old generated review files. Keep sequence-frame validators only if they still validate files required by the current app.

- [ ] **Step 4: Update README**

In `README.md`, change the MVP bullets to:

```markdown
- Electron 透明、无边框、置顶桌面宠物窗口。
- Renderer 使用 PixiJS 绘制 `assets/layered-pets/yuzai` 分层鱼仔资产包。
- 鱼仔通过连续参数实现呼吸、眨眼、头眼跟随、耳朵反应、尾巴摆动和拖拽回弹。
- `assets/runtime/animations` 是旧序列帧资源，后续清理前仅作为迁移参考。
```

Change validation commands to include:

```bash
npm run validate:layered-pet-runtime
npm run typecheck
npm run build
YUZAI_CAPTURE_PATH=/private/tmp/yuzai-layered-pet.png npm run dev
```

- [ ] **Step 5: Run validation**

Run:

```bash
npm run validate:layered-pet-runtime
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add README.md scripts/validate-all.mjs scripts/validate-release.mjs scripts/validate-layered-pet-runtime.mjs package.json
git commit -m "docs: update project for layered pet runtime"
```

---

### Task 11: Remove Old Sequence Runtime Main-Path Code

**Files:**
- Modify: `src/renderer/main.ts`
- Modify: `package.json`
- Delete only after verification: old scripts that are unused by `package.json` and not referenced by README or docs

- [ ] **Step 1: Confirm no main-path imports**

Run:

```bash
rg "CanvasRenderer|AnimationDirector|sequenceForAction|preloadSpriteSequences|runtimeAnimationManifest" src/renderer src/core/render
```

Expected: matches may remain in old files, but `src/renderer/main.ts` must not import or call them.

- [ ] **Step 2: List stale scripts**

Run:

```bash
node -e "const pkg=require('./package.json'); const scripts=Object.values(pkg.scripts).join('\n'); for (const f of require('fs').readdirSync('scripts')) if (f.endsWith('.mjs') && !scripts.includes(f)) console.log(f)"
```

Expected: prints candidate scripts only. Do not delete scripts still referenced by `package.json`.

- [ ] **Step 3: Remove old sequence-only package scripts**

In `package.json`, remove scripts that only support deleted docs, generated review assets, or sequence-frame production. Keep `build`, `dev`, `package:*`, `typecheck`, `capture:inspect`, and new layered-pet validators.

Concrete removal candidates after Pixi verification:

```json
"kling:generate": "...",
"kling:generate-batch": "...",
"kling:batch-status": "...",
"kling:batch-intake-checklist": "...",
"kling:generated-video-audit": "...",
"runtime:intake-checklist": "...",
"runtime:intake-preflight": "...",
"runtime:intake-executor": "...",
"animations:build-from-origin": "...",
"animations:intake-checklist": "..."
```

Before removing any script, run `rg "<script-name-without-prefix>|<script-file-name>" README.md docs src electron scripts package.json` and confirm it is not part of the Pixi plan.

- [ ] **Step 4: Run validation**

Run:

```bash
npm run validate:layered-pet-runtime
npm run typecheck
npm run build
YUZAI_CAPTURE_PATH=/private/tmp/yuzai-layered-pet-cleanup.png npm run dev
```

Expected: all pass and screenshot shows layered pet.

- [ ] **Step 5: Commit**

```bash
git add package.json src/renderer/main.ts
git commit -m "chore: remove sequence renderer from main path"
```

---

### Task 12: Final Cleanup of Old Runtime Assets

**Files:**
- Delete after Pixi desktop verification: `assets/runtime/animations`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `scripts/validate-package.mjs` if it still expects `dist/assets/runtime/animations/manifest.json`

- [ ] **Step 1: Confirm Pixi runtime package path**

Ensure `package.json` electron-builder files include layered assets:

```json
"files": [
  "dist/electron/**/*",
  "dist/renderer/**/*",
  "dist/assets/layered-pets/**/*",
  "package.json"
]
```

- [ ] **Step 2: Update build copy pipeline**

Inspect `esbuild.config.mjs`. If it currently copies `assets/runtime`, add copying for:

```text
assets/layered-pets -> dist/assets/layered-pets
```

and remove runtime animation copying only after packaged app validation passes.

- [ ] **Step 3: Delete old runtime sequence assets**

Run:

```bash
git rm -r assets/runtime/animations
```

- [ ] **Step 4: Update package validator**

In `scripts/validate-package.mjs`, replace checks for:

```text
dist/assets/runtime/animations/manifest.json
```

with:

```text
dist/assets/layered-pets/yuzai/rig.json
dist/assets/layered-pets/yuzai/identity.json
```

- [ ] **Step 5: Run full practical validation**

Run:

```bash
npm run validate:layered-pet-runtime
npm run typecheck
npm run build
npm run package:dir
npm run validate:package
YUZAI_CAPTURE_PATH=/private/tmp/yuzai-layered-pet-final.png npm run dev
```

Expected: all pass and screenshot shows layered YuZai.

- [ ] **Step 6: Commit**

```bash
git add package.json esbuild.config.mjs scripts/validate-package.mjs README.md
git add -u assets/runtime/animations
git commit -m "chore: remove legacy sequence assets"
```

---

## Final Verification Checklist

- [ ] `npm run validate:layered-pet-runtime` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `npm run package:dir` passes.
- [ ] `npm run validate:package` passes.
- [ ] Desktop capture shows layered YuZai.
- [ ] Multi-frame capture shows motion in at least two frames.
- [ ] Mouse proximity capture shows visible head/eye/ear reaction.
- [ ] Drag test shows body squash or delayed tail/head response.
- [ ] README no longer describes sequence-frame video generation as the primary runtime.
- [ ] No generated review files or `.superpowers` files are tracked.

