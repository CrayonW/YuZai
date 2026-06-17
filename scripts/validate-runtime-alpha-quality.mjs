import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, "assets/runtime/animations/manifest.json"), "utf8"));
const maxGreenSpillRatio = 0.001;
const failures = [];

for (const [action, config] of Object.entries(manifest.actions)) {
  if (!config.enabled || config.frameCount <= 0) continue;

  for (const frameNumber of sampledFrameNumbers(config)) {
    const framePath = join(root, config.frameRoot.replace(/^\.\.\//, ""), config.filePattern.replace("{index}", String(frameNumber).padStart(6, "0")));
    if (!existsSync(framePath)) {
      failures.push({ action, frameNumber, reason: "missing-frame", framePath });
      continue;
    }

    const greenSpillRatio = measureGreenSpillRatio(framePath);
    if (greenSpillRatio > maxGreenSpillRatio) {
      failures.push({
        action,
        frameNumber,
        reason: "green-spill",
        greenSpillRatio: Number(greenSpillRatio.toFixed(6)),
        maxGreenSpillRatio,
        framePath
      });
    }
  }
}

console.log(JSON.stringify({ ok: failures.length === 0, maxGreenSpillRatio, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;

function sampledFrameNumbers(config) {
  const first = config.firstFrame;
  const last = config.firstFrame + config.frameCount - 1;
  return Array.from(new Set([
    first,
    Math.round(first + (last - first) / 3),
    Math.round(first + (last - first) * 2 / 3),
    last
  ])).sort((a, b) => a - b);
}

function measureGreenSpillRatio(framePath) {
  const output = execFileSync(
    "magick",
    [
      framePath,
      "-alpha",
      "on",
      "-fx",
      "a > 0.005 && g > 0.06 && g > r*1.08 && g > b*1.08 ? 1 : 0",
      "-format",
      "%[fx:mean]\\n",
      "info:"
    ],
    { cwd: root, encoding: "utf8" }
  );
  return Number(output.trim());
}
