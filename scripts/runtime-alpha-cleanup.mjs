import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const greenSpillExpression = "a > 0.005 && g > 0.06 && g > r*1.08 && g > b*1.08 ? 0 : a";

export function cleanupGreenSpillInFrameRoot(frameRoot, options = {}) {
  const cwd = options.root ?? root;
  const stdio = options.stdio ?? "inherit";
  for (const file of pngFrames(frameRoot)) {
    cleanupGreenSpillInFrame(join(frameRoot, file), { root: cwd, stdio });
  }
}

export function cleanupGreenSpillInFrame(framePath, options = {}) {
  execFileSync(
    "magick",
    [
      framePath,
      "-alpha",
      "on",
      "-channel",
      "A",
      "-fx",
      greenSpillExpression,
      "+channel",
      framePath
    ],
    { cwd: options.root ?? root, stdio: options.stdio ?? "inherit" }
  );
}

export function cleanupRuntimeManifestFrames(manifestPath = "assets/runtime/animations/manifest.json") {
  const manifest = JSON.parse(readFileSync(join(root, manifestPath), "utf8"));
  for (const config of Object.values(manifest.actions)) {
    if (!config.enabled || config.frameCount <= 0) continue;
    const frameRoot = join(root, config.frameRoot.replace(/^\.\.\//, ""));
    cleanupGreenSpillInFrameRoot(frameRoot);
  }
}

function pngFrames(frameRoot) {
  if (!existsSync(frameRoot)) return [];
  return readdirSync(frameRoot)
    .filter((file) => /^frame_\d{6}\.png$/.test(file))
    .sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupRuntimeManifestFrames(process.argv[2] || "assets/runtime/animations/manifest.json");
}
