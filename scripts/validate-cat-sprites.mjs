import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const spriteRoot = join(root, "assets", "sprites");
const frameSize = 512;
const frameCount = 16;
const defaultRequiredActions = [
  "idle",
  "walk",
  "walk_left",
  "walking",
  "sleep",
  "sleepy",
  "sleeping",
  "waking",
  "surprised",
  "shy",
  "dragging",
  "waving",
  "teaser"
];
const requestedActions = process.argv.slice(2);
const requiredActions = requestedActions.length > 0 ? requestedActions : defaultRequiredActions;

const failures = [];
const warnings = [];
const report = {
  spriteRoot,
  frameSize,
  frameCount,
  requiredActions,
  actions: []
};

for (const action of requiredActions) {
  const dir = join(spriteRoot, action);
  const actionReport = { action, dir, frames: [] };
  report.actions.push(actionReport);

  if (!existsSync(dir)) {
    failures.push(`${action}: missing folder ${dir}`);
    continue;
  }

  const files = readdirSync(dir).filter((file) => file.endsWith(".png")).sort();
  if (files.length !== frameCount) {
    failures.push(`${action}: expected ${frameCount} PNG frames, found ${files.length}`);
  }

  for (let index = 0; index < frameCount; index += 1) {
    const expected = `${action}_${String(index + 1).padStart(4, "0")}.png`;
    if (!files.includes(expected)) {
      failures.push(`${action}: missing ${expected}`);
      continue;
    }
    const filePath = join(dir, expected);
    const metrics = imageMetrics(filePath);
    actionReport.frames.push({ file: expected, ...metrics });

    if (metrics.width !== frameSize || metrics.height !== frameSize) {
      failures.push(`${action}/${expected}: expected ${frameSize}x${frameSize}, got ${metrics.width}x${metrics.height}`);
    }
    if (!metrics.channels.includes("a")) {
      failures.push(`${action}/${expected}: missing alpha channel`);
    }
    if (metrics.alphaBounds.width <= 0 || metrics.alphaBounds.height <= 0) {
      failures.push(`${action}/${expected}: no visible non-transparent subject`);
    }
    if (metrics.alphaBounds.x < 16 || metrics.alphaBounds.y < 16) {
      failures.push(`${action}/${expected}: subject is too close to top/left edge`);
    }
    if (metrics.alphaBounds.x + metrics.alphaBounds.width > frameSize - 16) {
      failures.push(`${action}/${expected}: subject is too close to right edge`);
    }
    if (metrics.alphaBounds.y + metrics.alphaBounds.height > frameSize - 16) {
      failures.push(`${action}/${expected}: subject is too close to bottom edge`);
    }
  }
}

validateWalkLeftMirror();
validateTeaserScale();
validateSleepBreathing();

report.ok = failures.length === 0;
report.failures = failures;
report.warnings = warnings;
console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}

function imageMetrics(filePath) {
  const identify = execFileSync("magick", [
    "identify",
    "-format",
    "%w %h %[channels]",
    filePath
  ], { encoding: "utf8" }).trim();
  const [width, height, channels] = identify.split(/\s+/);
  const alphaStats = execFileSync("magick", [
    filePath,
    "-alpha",
    "extract",
    "-format",
    "%[fx:minima] %[fx:maxima]",
    "info:"
  ], { encoding: "utf8" }).trim();
  const [minAlpha, maxAlpha] = alphaStats.split(/\s+/).map(Number);
  const bounds = execFileSync("magick", [
    filePath,
    "-alpha",
    "extract",
    "-threshold",
    "0",
    "-format",
    "%@",
    "info:"
  ], { encoding: "utf8" }).trim();
  return {
    width: Number(width),
    height: Number(height),
    channels,
    minAlpha,
    maxAlpha,
    alphaBounds: parseBounds(bounds)
  };
}

function parseBounds(bounds) {
  const match = /^(\d+)x(\d+)\+(\d+)\+(\d+)$/.exec(bounds);
  if (!match) return { width: 0, height: 0, x: 0, y: 0 };
  return {
    width: Number(match[1]),
    height: Number(match[2]),
    x: Number(match[3]),
    y: Number(match[4])
  };
}

function validateWalkLeftMirror() {
  const walkDir = join(spriteRoot, "walk");
  const leftDir = join(spriteRoot, "walk_left");
  if (!existsSync(walkDir) || !existsSync(leftDir)) return;

  for (let index = 1; index <= frameCount; index += 1) {
    const suffix = String(index).padStart(4, "0");
    const walkFrame = join(walkDir, `walk_${suffix}.png`);
    const leftFrame = join(leftDir, `walk_left_${suffix}.png`);
    if (!existsSync(walkFrame) || !existsSync(leftFrame)) continue;

    const mirrored = join("/private/tmp", `yuzai-walk-mirror-${suffix}.png`);
    execFileSync("magick", [walkFrame, "-flop", mirrored]);
    try {
      execFileSync("magick", ["compare", "-metric", "AE", mirrored, leftFrame, "null:"], { stdio: "pipe" });
    } catch (error) {
      const diff = String(error.stderr || "").trim();
      if (diff !== "0") {
        failures.push(`walk_left_${suffix}.png: must be exact horizontal mirror of walk_${suffix}.png; AE diff ${diff || "unknown"}`);
      }
    }
  }
}

function validateTeaserScale() {
  const teaser = report.actions.find((entry) => entry.action === "teaser");
  if (!teaser || teaser.frames.length === 0) return;
  const widths = teaser.frames.map((frame) => frame.alphaBounds.width).filter(Boolean);
  const heights = teaser.frames.map((frame) => frame.alphaBounds.height).filter(Boolean);
  if (widths.length < frameCount || heights.length < frameCount) return;

  const widthVariance = Math.max(...widths) - Math.min(...widths);
  const heightVariance = Math.max(...heights) - Math.min(...heights);
  if (widthVariance > 42 || heightVariance > 42) {
    warnings.push(`teaser: total visible bounds vary by ${widthVariance}px width and ${heightVariance}px height because the teaser toy moves; visually confirm cat body scale separately`);
  }
}

function validateSleepBreathing() {
  const sleep = report.actions.find((entry) => entry.action === "sleep");
  if (!sleep || sleep.frames.length === 0) return;
  const ys = sleep.frames.map((frame) => frame.alphaBounds.y).filter((value) => Number.isFinite(value));
  const heights = sleep.frames.map((frame) => frame.alphaBounds.height).filter(Boolean);
  if (ys.length < frameCount || heights.length < frameCount) return;

  const yVariance = Math.max(...ys) - Math.min(...ys);
  const heightVariance = Math.max(...heights) - Math.min(...heights);
  if (yVariance + heightVariance < 2) {
    failures.push("sleep: frames look static; expected subtle breathing motion");
  }
  if (yVariance > 16 || heightVariance > 20) {
    failures.push(`sleep: breathing motion is too large (${yVariance}px y, ${heightVariance}px height)`);
  }
}
