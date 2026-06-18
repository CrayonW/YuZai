import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "drag-visual-feedback-validation");
const outfile = join(outdir, "canvas-renderer.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "render", "canvas-renderer.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

globalThis.window = { devicePixelRatio: 1 };

const { dragVisualFeedbackForOffset } = await import(pathToFileURL(outfile).href);

const idle = dragVisualFeedbackForOffset({ x: 0, y: 0 });
const draggedRight = dragVisualFeedbackForOffset({ x: 100, y: 70 });
const draggedLeft = dragVisualFeedbackForOffset({ x: -100, y: 70 });
const tiny = dragVisualFeedbackForOffset({ x: 4, y: 3 });

const checks = [
  ["idle has no lift", idle.liftY, 0],
  ["idle has neutral scale", idle.scale, 1],
  ["idle has no rotation", idle.rotation, 0],
  ["drag visibly lifts pet", draggedRight.liftY <= -14, true],
  ["drag visibly scales pet", draggedRight.scale >= 1.04, true],
  ["drag tilts with horizontal direction", draggedRight.rotation > 0.08, true],
  ["drag tilt mirrors left direction", draggedLeft.rotation < -0.08, true],
  ["tiny pointer noise stays visually neutral", tiny.scale, 1]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
