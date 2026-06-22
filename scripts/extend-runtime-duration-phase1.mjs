import { copyFileSync, existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");
const phase1Actions = ["idle_primary", "idle_secondary", "tail_wag"];
const sourceFrameCount = 72;
const targetFrameCount = 192;
const entryFrames = [1, 48, 96, 144];
const exitFrames = [48, 96, 144, 192];

export function extendRuntimeDurationPhase1({ manifestFile = manifestPath } = {}) {
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  const results = [];

  for (const action of phase1Actions) {
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
      const source = sourceFiles[index % sourceFrameCount];
      const frame = config.firstFrame + index;
      const fileName = config.filePattern.replace("{index}", String(frame).padStart(6, "0"));
      const destination = join(frameRoot, fileName);
      if (source !== destination) copyFileSync(source, destination);
    }

    removeExtraFrames(frameRoot, config, targetFrameCount);

    config.frameCount = targetFrameCount;
    config.entryFrames = [...entryFrames];
    config.exitFrames = [...exitFrames];
    config.loop = true;
    config.category = "daily";
    config.interruptPolicy = "at-safe-frame";
    config.returnTo = "idle_primary";

    results.push({ action, frameCount: targetFrameCount, strategy: "repeat-existing-72-frame-sequence" });
  }

  writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  return results;
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
