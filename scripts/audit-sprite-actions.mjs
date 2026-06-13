import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const spriteRoot = join(root, "assets", "sprites");
const previewRoot = join(root, "assets", "references", "cat-sprite-preview");
const cacheRoot = join(root, ".tmp", "fontconfig-cache");
const reportPath = join(previewRoot, "runtime-action-audit.json");
const allPreviewPath = join(previewRoot, "runtime-all-actions.png");
const frameCount = 16;

const actions = [
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

mkdirSync(previewRoot, { recursive: true });
mkdirSync(cacheRoot, { recursive: true });
process.env.XDG_CACHE_HOME = join(root, ".tmp");

const report = {
  spriteRoot,
  previewRoot,
  actions: actions.map((action) => auditAction(action)),
  duplicateSets: [],
  notes: [
    "exactDuplicateOf detects folders with identical pixels across all 16 frames, regardless of file names.",
    "motionAe is ImageMagick absolute-error pixel difference between consecutive frames; low values mean the action may look static."
  ]
};

for (let a = 0; a < report.actions.length; a += 1) {
  for (let b = a + 1; b < report.actions.length; b += 1) {
    const left = report.actions[a];
    const right = report.actions[b];
    if (!left.ok || !right.ok) continue;
    if (foldersArePixelIdentical(left.action, right.action)) {
      report.duplicateSets.push([left.action, right.action]);
    }
  }
}

for (const action of report.actions) {
  action.exactDuplicateOf = report.duplicateSets
    .filter((set) => set.includes(action.action))
    .flat()
    .filter((name) => name !== action.action);
}

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
buildAllActionsPreview();

console.log(JSON.stringify({
  ok: report.actions.every((action) => action.ok),
  reportPath,
  allPreviewPath,
  duplicateSets: report.duplicateSets,
  lowMotionActions: report.actions
    .filter((action) => action.ok && action.motionAe.average < 25000)
    .map((action) => ({ action: action.action, averageMotionAe: action.motionAe.average }))
}, null, 2));

function auditAction(action) {
  const dir = join(spriteRoot, action);
  const files = expectedFiles(action);
  const missing = files.filter((file) => !existsSync(join(dir, file)));
  const ok = existsSync(dir) && missing.length === 0;
  const framePaths = files.map((file) => join(dir, file));
  const previewPath = join(previewRoot, `${action}-runtime-preview.png`);

  if (ok) {
    runMagick([
      "montage",
      ...framePaths,
      "-background",
      "none",
      "-tile",
      "8x2",
      "-geometry",
      "128x128+4+4",
      previewPath
    ]);
  }

  return {
    action,
    dir,
    ok,
    missing,
    frameCount: ok ? files.length : Math.max(0, readdirSafe(dir).filter((file) => file.endsWith(".png")).length),
    previewPath,
    motionAe: ok ? measureMotion(action) : { min: 0, max: 0, average: 0, values: [] }
  };
}

function expectedFiles(action) {
  return Array.from({ length: frameCount }, (_, index) => `${action}_${String(index + 1).padStart(4, "0")}.png`);
}

function readdirSafe(dir) {
  return existsSync(dir) ? readdirSync(dir) : [];
}

function measureMotion(action) {
  const values = [];
  for (let index = 1; index < frameCount; index += 1) {
    const left = join(spriteRoot, action, `${action}_${String(index).padStart(4, "0")}.png`);
    const right = join(spriteRoot, action, `${action}_${String(index + 1).padStart(4, "0")}.png`);
    values.push(compareAe(left, right));
  }
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
    values
  };
}

function foldersArePixelIdentical(leftAction, rightAction) {
  for (let index = 1; index <= frameCount; index += 1) {
    const suffix = String(index).padStart(4, "0");
    const left = join(spriteRoot, leftAction, `${leftAction}_${suffix}.png`);
    const right = join(spriteRoot, rightAction, `${rightAction}_${suffix}.png`);
    if (compareAe(left, right) !== 0) return false;
  }
  return true;
}

function compareAe(left, right) {
  try {
    runMagick(["compare", "-metric", "AE", left, right, "null:"], { stdio: "pipe" });
    return 0;
  } catch (error) {
    const match = String(error.stderr || "").match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/i);
    const value = match ? Number(match[0]) : Number.NaN;
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
  }
}

function buildAllActionsPreview() {
  const actionPreviews = report.actions.filter((action) => action.ok).map((action) => action.previewPath);
  runMagick([
    "montage",
    ...actionPreviews,
    "-background",
    "none",
    "-tile",
    "1x",
    "-geometry",
    "+0+12",
    allPreviewPath
  ]);
}

function runMagick(args, options = {}) {
  return execFileSync("magick", args, {
    ...options,
    env: {
      ...process.env,
      XDG_CACHE_HOME: join(root, ".tmp")
    }
  });
}
