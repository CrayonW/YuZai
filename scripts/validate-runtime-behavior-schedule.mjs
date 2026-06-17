import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "runtime-behavior-schedule-validation");
const outfile = join(outdir, "runtime-behavior-schedule.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "render", "runtime-behavior-schedule.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { buildRuntimeDailyRotatorOptions } = await import(pathToFileURL(outfile).href);

const schedule = {
  rules: {
    minDailyGapSeconds: 45,
    maxDailyGapSeconds: 150
  },
  dailyPool: [
    { action: "idle_primary", durationSeconds: 8, loop: true, minCooldownSeconds: 0 },
    { action: "tail_wag", durationSeconds: 8, loop: true, minCooldownSeconds: 360 },
    { action: "idle_secondary", durationSeconds: 8, loop: true, minCooldownSeconds: 240 },
    { action: "groom_face_wash", durationSeconds: 8, loop: false, minCooldownSeconds: 900 },
    { action: "walk", durationSeconds: 6, loop: true, minCooldownSeconds: 300 }
  ]
};

const manifest = {
  defaultAction: "idle_primary",
  actions: {
    idle_primary: { enabled: true, frameCount: 72, loop: true, category: "daily" },
    tail_wag: { enabled: true, frameCount: 72, loop: true, category: "daily" },
    idle_secondary: { enabled: true, frameCount: 72, loop: true, category: "daily" },
    groom_face_wash: { enabled: true, frameCount: 192, loop: false, category: "daily", returnTo: "idle_primary" },
    walk: { enabled: true, frameCount: 72, loop: true, category: "daily" },
    paw_raise: { enabled: true, frameCount: 72, loop: false, category: "interactive" }
  }
};

const options = buildRuntimeDailyRotatorOptions(schedule, manifest);
const currentOptions = buildRuntimeDailyRotatorOptions();

const checks = [
  ["uses manifest default action", options.defaultAction, "idle_primary"],
  ["keeps idle-compatible enabled loop and one-shot variations", options.variations.join(","), "tail_wag,idle_secondary,groom_face_wash"],
  ["uses schedule daily gap for anti-fatigue", options.gapMs, 45000],
  ["uses schedule max daily gap for natural timing", options.maxGapMs, 150000],
  ["uses longest available daily duration", options.variationDurationMs, 8000],
  ["uses action duration for tail_wag", options.variationDurationByActionMs.tail_wag, 8000],
  ["uses action duration for groom_face_wash", options.variationDurationByActionMs.groom_face_wash, 8000],
  ["keeps first variation delayed enough to avoid instant loop", options.firstDelayMs, 4500],
  ["uses action cooldown for tail_wag", options.variationCooldownMs.tail_wag, 360000],
  ["uses action cooldown for groom_face_wash", options.variationCooldownMs.groom_face_wash, 900000],
  [
    "current project filters to enabled behavior variations",
    currentOptions.variations.join(","),
    "tail_wag,idle_secondary,slow_blink,look_around,stretch_yawn"
  ]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
