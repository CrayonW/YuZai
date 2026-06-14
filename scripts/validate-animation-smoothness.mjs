import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(join(root, "assets", "runtime", "animations", "manifest.json"), "utf8"));
const minFps = 24;
const minFrameCount = 48;
const failures = [];

for (const [action, config] of Object.entries(manifest.actions)) {
  if (!config.enabled) continue;

  if (config.fps < minFps) {
    failures.push(`${action}: fps ${config.fps} is below smoothness minimum ${minFps}`);
  }

  if (config.frameCount < minFrameCount) {
    failures.push(`${action}: frameCount ${config.frameCount} is below smoothness minimum ${minFrameCount}`);
  }
}

console.log(JSON.stringify({ ok: failures.length === 0, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
