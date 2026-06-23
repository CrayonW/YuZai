import { copyFileSync, existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");
const phase1Actions = [
  {
    action: "idle_primary",
    phase: "phase1-a",
    sourceFrameCount: 72,
    targetFrameCount: 192,
    loop: true,
    category: "daily",
    interruptPolicy: "at-safe-frame",
    returnTo: "idle_primary",
    strategy: "repeat-existing-72-frame-sequence"
  },
  {
    action: "idle_secondary",
    phase: "phase1-a",
    sourceFrameCount: 72,
    targetFrameCount: 192,
    loop: true,
    category: "daily",
    interruptPolicy: "at-safe-frame",
    returnTo: "idle_primary",
    strategy: "repeat-existing-72-frame-sequence"
  },
  {
    action: "tail_wag",
    phase: "phase1-a",
    sourceFrameCount: 72,
    targetFrameCount: 192,
    loop: true,
    category: "daily",
    interruptPolicy: "at-safe-frame",
    returnTo: "idle_primary",
    strategy: "repeat-existing-72-frame-sequence"
  },
  {
    action: "groom_face_wash",
    phase: "phase1-b",
    sourceFrameCount: 120,
    targetFrameCount: 192,
    loop: false,
    category: "daily",
    interruptPolicy: "at-safe-frame",
    returnTo: "idle_primary",
    strategy: "forward-then-reverse-to-safe-frame"
  },
  {
    action: "loaf_breathing",
    phase: "phase1-b",
    sourceFrameCount: 120,
    targetFrameCount: 192,
    loop: true,
    category: "daily",
    interruptPolicy: "at-safe-frame",
    returnTo: "idle_primary",
    strategy: "repeat-existing-120-frame-sequence"
  },
  {
    action: "sleeping",
    phase: "phase1-b",
    sourceFrameCount: 120,
    targetFrameCount: 192,
    loop: true,
    category: "daily",
    interruptPolicy: "at-safe-frame",
    returnTo: "waking",
    strategy: "repeat-existing-120-frame-sequence"
  },
  {
    action: "slow_blink",
    phase: "phase1-c",
    sourceFrameCount: 120,
    targetFrameCount: 144,
    loop: false,
    returnTo: "idle_primary",
    strategy: "hold-tail-frame"
  },
  {
    action: "look_around",
    phase: "phase1-c",
    sourceFrameCount: 120,
    targetFrameCount: 144,
    loop: false,
    returnTo: "idle_primary",
    strategy: "forward-then-reverse-to-safe-frame"
  },
  {
    action: "desk_sniff",
    phase: "phase1-c",
    sourceFrameCount: 120,
    targetFrameCount: 144,
    loop: false,
    returnTo: "idle_primary",
    strategy: "hold-tail-frame"
  },
  {
    action: "stretch_yawn",
    phase: "phase1-c",
    sourceFrameCount: 120,
    targetFrameCount: 144,
    loop: false,
    returnTo: "idle_primary",
    strategy: "hold-tail-frame"
  },
  {
    action: "sleepy",
    phase: "phase1-c",
    sourceFrameCount: 120,
    targetFrameCount: 144,
    loop: false,
    returnTo: "sleep",
    strategy: "hold-tail-frame"
  },
  {
    action: "sleep",
    phase: "phase1-c",
    sourceFrameCount: 120,
    targetFrameCount: 144,
    loop: false,
    returnTo: "sleeping",
    strategy: "hold-tail-frame"
  },
  {
    action: "paw_raise",
    phase: "phase1-c",
    sourceFrameCount: 72,
    targetFrameCount: 96,
    loop: false,
    returnTo: "idle_primary",
    strategy: "hold-tail-frame"
  },
  {
    action: "walk",
    phase: "phase1-d",
    sourceFrameCount: 72,
    targetFrameCount: 144,
    loop: true,
    category: "daily",
    interruptPolicy: "at-safe-frame",
    returnTo: "idle_primary",
    strategy: "repeat-existing-72-frame-sequence"
  },
  ...[
    "look_e",
    "look_ene",
    "look_ne",
    "look_nne",
    "look_n",
    "look_nnw",
    "look_nw",
    "look_wnw",
    "look_w",
    "look_wsw",
    "look_sw",
    "look_ssw",
    "look_s",
    "look_sse",
    "look_se",
    "look_ese"
  ].map((action) => ({
    action,
    phase: "phase1-d",
    sourceFrameCount: 120,
    targetFrameCount: 192,
    loop: true,
    category: "interactive",
    interruptPolicy: "at-safe-frame",
    returnTo: "idle_primary",
    strategy: "repeat-existing-120-frame-sequence"
  }))
];

export function extendRuntimeDurationPhase1({ manifestFile = manifestPath } = {}) {
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  const results = [];

  for (const actionPlan of phase1Actions) {
    const { action, sourceFrameCount, targetFrameCount, strategy } = actionPlan;
    const config = manifest.actions?.[action];
    if (!config) throw new Error(`${action}: missing manifest action`);
    if (config.enabled !== true) throw new Error(`${action}: action must be enabled`);
    if (config.frameCount < sourceFrameCount) {
      throw new Error(`${action}: expected at least ${sourceFrameCount} source frames, got ${config.frameCount}`);
    }

    const frameRoot = runtimePathToDisk(config.frameRoot);
    const sourceFiles = Array.from({ length: sourceFrameCount }, (_, index) => {
      const frame = config.firstFrame + index;
      const fileName = config.filePattern.replace("{index}", String(frame).padStart(6, "0"));
      const filePath = join(frameRoot, fileName);
      if (!existsSync(filePath)) throw new Error(`${action}: missing source frame ${fileName}`);
      return filePath;
    });

    for (let index = 0; index < targetFrameCount; index += 1) {
      const source = sourceFiles[sourceIndexFor({ index, sourceFrameCount, strategy })];
      const frame = config.firstFrame + index;
      const fileName = config.filePattern.replace("{index}", String(frame).padStart(6, "0"));
      const destination = join(frameRoot, fileName);
      if (source !== destination) copyFileSync(source, destination);
    }

    removeExtraFrames(frameRoot, config, targetFrameCount);

    config.frameCount = targetFrameCount;
    config.entryFrames = entryFramesFor(targetFrameCount);
    config.exitFrames = exitFramesFor(targetFrameCount);
    if ("loop" in actionPlan) config.loop = actionPlan.loop;
    if ("category" in actionPlan) config.category = actionPlan.category;
    if ("interruptPolicy" in actionPlan) config.interruptPolicy = actionPlan.interruptPolicy;
    if ("returnTo" in actionPlan) config.returnTo = actionPlan.returnTo;

    results.push({ action, phase: actionPlan.phase, frameCount: targetFrameCount, strategy });
  }

  writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  return results;
}

function sourceIndexFor({ index, sourceFrameCount, strategy }) {
  if (strategy === "forward-then-reverse-to-safe-frame") {
    if (index < sourceFrameCount) return index;
    const reverseIndex = sourceFrameCount - 2 - ((index - sourceFrameCount) % (sourceFrameCount - 1));
    return Math.max(0, reverseIndex);
  }

  if (strategy === "hold-tail-frame") {
    return Math.min(index, sourceFrameCount - 1);
  }

  return index % sourceFrameCount;
}

function entryFramesFor(frameCount) {
  if (frameCount === 96) return [1, 48];
  if (frameCount === 144) return [1, 48, 96];
  if (frameCount === 192) return [1, 48, 96, 144];
  throw new Error(`unsupported target frameCount ${frameCount}`);
}

function exitFramesFor(frameCount) {
  if (frameCount === 96) return [48, 96];
  if (frameCount === 144) return [48, 96, 144];
  if (frameCount === 192) return [48, 96, 144, 192];
  throw new Error(`unsupported target frameCount ${frameCount}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const results = extendRuntimeDurationPhase1();
  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

function runtimePathToDisk(frameRoot) {
  const normalized = normalize(frameRoot.replace(/^(\.\.\/)?assets\//, "assets/"));
  return join(root, normalized);
}

function removeExtraFrames(frameRoot, config, targetCount) {
  const frameNames = new Set(
    Array.from({ length: targetCount }, (_, index) => {
      const frame = config.firstFrame + index;
      return config.filePattern.replace("{index}", String(frame).padStart(6, "0"));
    })
  );

  for (const file of readdirSync(frameRoot)) {
    if (file.endsWith(".png") && !frameNames.has(file)) unlinkSync(join(frameRoot, file));
  }
}
