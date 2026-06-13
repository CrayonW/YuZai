import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const spriteRoot = join(root, "assets", "sprites");
const backupRoot = join(root, "assets", "references", "cat-sprite-backups", "before-derived-states");
const frameCount = 16;
const frameSize = 512;
const tmpRoot = join(root, ".tmp");

const plans = {
  walking: Array.from({ length: frameCount }, (_, index) => ({
    sourceAction: "walk",
    sourceIndex: index + 1,
    scale: 100,
    rotate: 0,
    x: 0,
    y: 0
  })),
  sleepy: Array.from({ length: frameCount }, (_, index) => {
    const t = index / (frameCount - 1);
    const sourceAction = index < 9 ? "idle" : "sleep";
    return {
      sourceAction,
      sourceIndex: index < 9 ? index + 1 : index - 8,
      scale: Math.round(100 - t * 5),
      rotate: -1 + Math.sin(t * Math.PI) * 1.5,
      x: Math.round(-t * 10),
      y: Math.round(t * 20)
    };
  }),
  sleeping: Array.from({ length: frameCount }, (_, index) => ({
    sourceAction: "sleep",
    sourceIndex: index + 1,
    scale: 99 + Math.round(Math.sin((index / frameCount) * Math.PI * 2) * 1),
    rotate: Math.sin((index / frameCount) * Math.PI * 2) * 0.35,
    x: 0,
    y: Math.round(Math.sin((index / frameCount) * Math.PI * 2) * 2)
  })),
  waking: Array.from({ length: frameCount }, (_, index) => {
    const t = index / (frameCount - 1);
    const sourceAction = index < 7 ? "sleep" : "idle";
    return {
      sourceAction,
      sourceIndex: index < 7 ? Math.min(16, 16 - index) : Math.min(16, index - 6),
      scale: Math.round(96 + t * 4),
      rotate: Math.sin(t * Math.PI) * 1.6,
      x: Math.round((1 - t) * -8),
      y: Math.round((1 - t) * 12)
    };
  }),
  surprised: Array.from({ length: frameCount }, (_, index) => {
    const bump = [0, -10, -18, -12, -6, 0, 4, 0, -4, -2, 0, 1, 0, -1, 0, 0][index];
    const scale = [100, 104, 108, 106, 103, 101, 99, 100, 102, 101, 100, 99, 100, 100, 100, 100][index];
    return {
      sourceAction: "idle",
      sourceIndex: (index % frameCount) + 1,
      scale,
      rotate: [0, -1.5, 1.5, -1, 0.8, 0, 0.5, 0, -0.4, 0.3, 0, 0, 0, 0, 0, 0][index],
      x: 0,
      y: bump
    };
  }),
  shy: Array.from({ length: frameCount }, (_, index) => {
    const t = Math.sin((index / (frameCount - 1)) * Math.PI);
    return {
      sourceAction: "idle",
      sourceIndex: index + 1,
      scale: Math.round(99 - t * 3),
      rotate: -1.2 - t * 1.4,
      x: Math.round(-8 * t),
      y: Math.round(8 + 8 * t)
    };
  }),
  dragging: Array.from({ length: frameCount }, (_, index) => ({
    sourceAction: "idle",
    sourceIndex: index + 1,
    scale: 98,
    rotate: Math.sin((index / frameCount) * Math.PI * 4) * 2.8,
    x: Math.round(Math.sin((index / frameCount) * Math.PI * 2) * 7),
    y: Math.round(-10 + Math.cos((index / frameCount) * Math.PI * 4) * 5)
  })),
  waving: Array.from({ length: frameCount }, (_, index) => ({
    sourceAction: index < 12 ? "teaser" : "idle",
    sourceIndex: index < 12 ? index + 1 : index - 11,
    scale: 100,
    rotate: Math.sin((index / frameCount) * Math.PI * 2) * 0.8,
    x: 0,
    y: Math.round(Math.sin((index / frameCount) * Math.PI * 2) * -3)
  }))
};

mkdirSync(backupRoot, { recursive: true });
mkdirSync(tmpRoot, { recursive: true });

for (const action of Object.keys(plans)) {
  backupAction(action);
  deriveAction(action, plans[action]);
}

console.log(JSON.stringify({
  ok: true,
  generatedActions: Object.keys(plans),
  backupRoot
}, null, 2));

function backupAction(action) {
  const sourceDir = join(spriteRoot, action);
  const targetDir = join(backupRoot, action);
  if (!existsSync(sourceDir)) return;
  mkdirSync(targetDir, { recursive: true });
  for (const file of readdirSync(sourceDir)) {
    if (file.endsWith(".png")) copyFileSync(join(sourceDir, file), join(targetDir, file));
  }
}

function deriveAction(action, plan) {
  const outDir = join(spriteRoot, action);
  mkdirSync(outDir, { recursive: true });
  for (const file of readdirSync(outDir)) {
    if (file.endsWith(".png")) rmSync(join(outDir, file));
  }

  for (let index = 0; index < frameCount; index += 1) {
    const step = plan[index];
    const sourceSuffix = String(step.sourceIndex).padStart(4, "0");
    const targetSuffix = String(index + 1).padStart(4, "0");
    const input = join(spriteRoot, step.sourceAction, `${step.sourceAction}_${sourceSuffix}.png`);
    const output = join(outDir, `${action}_${targetSuffix}.png`);
    if (!existsSync(input)) throw new Error(`Missing source frame: ${input}`);

    const scaled = Math.round(frameSize * (step.scale / 100));
    const extentX = Math.round(step.x);
    const extentY = Math.round(step.y);

    runMagick([
      input,
      "-background",
      "none",
      "-gravity",
      "center",
      "-resize",
      `${scaled}x${scaled}`,
      "-rotate",
      String(step.rotate),
      "-background",
      "none",
      "-gravity",
      "center",
      "-extent",
      `${frameSize}x${frameSize}${formatOffset(extentX, extentY)}`,
      "-alpha",
      "on",
      output
    ]);
  }
}

function formatOffset(x, y) {
  const sx = x >= 0 ? `+${x}` : `${x}`;
  const sy = y >= 0 ? `+${y}` : `${y}`;
  return `${sx}${sy}`;
}

function runMagick(args) {
  return execFileSync("magick", args, {
    env: {
      ...process.env,
      XDG_CACHE_HOME: tmpRoot
    }
  });
}
