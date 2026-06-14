import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "daily-animation-rotator-validation");
const outfile = join(outdir, "daily-animation-rotator.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "render", "daily-animation-rotator.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { DailyAnimationRotator } = await import(pathToFileURL(outfile).href);

const rotator = new DailyAnimationRotator(
  {
    defaultAction: "idle_primary",
    variations: ["tail_wag", "idle_secondary"],
    firstDelayMs: 1500,
    variationDurationMs: 3000,
    gapMs: 7000
  },
  0
);

const checks = [
  ["before first delay stays idle", rotator.resolve("idle_primary", true, 1499), "idle_primary"],
  ["first variation starts with tail_wag", rotator.resolve("idle_primary", true, 1500), "tail_wag"],
  ["active variation remains stable", rotator.resolve("idle_primary", true, 3400), "tail_wag"],
  ["variation returns to idle after duration", rotator.resolve("idle_primary", true, 4600), "idle_primary"],
  ["non-idle base action passes through", rotator.resolve("walk", false, 8000), "walk"],
  ["idle stays idle after interruption reset", rotator.resolve("idle_primary", true, 14999), "idle_primary"],
  ["second variation advances to idle_secondary", rotator.resolve("idle_primary", true, 15000), "idle_secondary"]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
