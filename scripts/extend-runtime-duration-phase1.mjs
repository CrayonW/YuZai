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
    returnTo: "idle_primary",
    strategy: "repeat-existing-72-frame-sequence"
  },
  {
    action: "idle_secondary",
    phase: "phase1-a",
    sourceFrameCount: 72,
    targetFrameCount: 192,
    loop: true,
    returnTo: "idle_primary",
    strategy: "repeat-existing-72-frame-sequence"
  },
  {
    action: "tail_wag",
    phase: "phase1-a",
    sourceFrameCount: 72,
    targetFrameCount: 192,
    loop: true,
    returnTo: "idle_primary",
    strategy: "repeat-existing-72-frame-sequence"
  },
  {
    action: "groom_face_wash",
    phase: "phase1-b",
    sourceFrameCount: 120,
    targetFrameCount: 192,
    loop: false,
    returnTo: "idle_primary",
    strategy: "forward-then-reverse-to-safe-frame"
  },
  {
    action: "loaf_breathing",
    phase: "phase1-b",
    sourceFrameCount: 120,
    targetFrameCount: 192,
    loop: true,
    returnTo: "idle_primary",
    strategy: "repeat-existing-120-frame-sequence"
  },
  {
    action: "sleeping",
    phase: "phase1-b",
    sourceFrameCount: 120,
    targetFrameCount: 192,
    loop: true,
    returnTo: "waking",
    strategy: "repeat-existing-120-frame-sequence"
  }
];
const targetFrameCount = 192;
const entryFrames = [1, 48, 96, 144];
const exitFrames = [48, 96, 144, 192];

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
    config.entryFrames = [...entryFrames];
    config.exitFrames = [...exitFrames];
    config.loop = actionPlan.loop;
    config.category = "daily";
    config.interruptPolicy = "at-safe-frame";
    config.returnTo = actionPlan.returnTo;

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

  return index % sourceFrameCount;
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
