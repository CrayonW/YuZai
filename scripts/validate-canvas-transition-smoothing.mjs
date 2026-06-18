import { build } from "esbuild";
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "canvas-transition-smoothing-validation");
const outfile = join(outdir, "canvas-renderer.mjs");
const rendererSource = readFileSync(join(root, "src", "core", "render", "canvas-renderer.ts"), "utf8");

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

const { ACTION_CROSSFADE_MS, actionCrossfadeAlphaForElapsed } = await import(pathToFileURL(outfile).href);

const checks = [
  ["crossfade duration is long enough to hide hard cuts", ACTION_CROSSFADE_MS >= 140, true],
  ["crossfade duration is short enough to avoid ghosting", ACTION_CROSSFADE_MS <= 260, true],
  ["crossfade starts with previous frame visible", actionCrossfadeAlphaForElapsed(0).previousAlpha, 1],
  ["crossfade starts with current frame partially visible", actionCrossfadeAlphaForElapsed(0).currentAlpha >= 0.18, true],
  ["crossfade midpoint blends both frames", actionCrossfadeAlphaForElapsed(ACTION_CROSSFADE_MS / 2).previousAlpha > 0.35, true],
  ["crossfade midpoint current frame dominates enough", actionCrossfadeAlphaForElapsed(ACTION_CROSSFADE_MS / 2).currentAlpha > 0.6, true],
  ["crossfade ends with previous frame hidden", actionCrossfadeAlphaForElapsed(ACTION_CROSSFADE_MS).previousAlpha, 0],
  ["crossfade ends with current frame fully visible", actionCrossfadeAlphaForElapsed(ACTION_CROSSFADE_MS).currentAlpha, 1],
  ["renderer remembers previous action for crossfade", rendererSource.includes("lastRenderedAction"), true],
  ["renderer remembers previous frame for crossfade", rendererSource.includes("lastRenderedFrame"), true],
  ["renderer starts transition on action changes", rendererSource.includes("selection.action !== this.lastRenderedAction"), true]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
