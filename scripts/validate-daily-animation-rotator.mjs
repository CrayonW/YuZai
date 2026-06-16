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

const cooldownRotator = new DailyAnimationRotator(
  {
    defaultAction: "idle_primary",
    variations: ["tail_wag", "idle_secondary"],
    firstDelayMs: 0,
    variationDurationMs: 1000,
    gapMs: 1000,
    variationCooldownMs: {
      tail_wag: 60000,
      idle_secondary: 0
    }
  },
  0
);

checks.push(
  ["cooldown first variation starts with tail_wag", cooldownRotator.resolve("idle_primary", true, 0), "tail_wag"],
  ["cooldown first variation ends", cooldownRotator.resolve("idle_primary", true, 1000), "idle_primary"],
  ["cooldown second variation advances to idle_secondary", cooldownRotator.resolve("idle_primary", true, 2000), "idle_secondary"],
  ["cooldown second variation ends", cooldownRotator.resolve("idle_primary", true, 3000), "idle_primary"],
  ["cooldown skips recently used tail_wag", cooldownRotator.resolve("idle_primary", true, 4000), "idle_secondary"]
);

const durationRotator = new DailyAnimationRotator(
  {
    defaultAction: "idle_primary",
    variations: ["tail_wag", "idle_secondary"],
    firstDelayMs: 0,
    variationDurationMs: 3000,
    variationDurationByActionMs: {
      tail_wag: 1000,
      idle_secondary: 3000
    },
    gapMs: 1000
  },
  0
);

checks.push(
  ["per-action duration starts first variation", durationRotator.resolve("idle_primary", true, 0), "tail_wag"],
  ["per-action duration returns after action-specific duration", durationRotator.resolve("idle_primary", true, 1000), "idle_primary"],
  ["per-action duration waits through gap", durationRotator.resolve("idle_primary", true, 1999), "idle_primary"],
  ["per-action duration starts second variation after gap", durationRotator.resolve("idle_primary", true, 2000), "idle_secondary"],
  ["per-action duration keeps longer second variation active", durationRotator.resolve("idle_primary", true, 4000), "idle_secondary"]
);

const variableGapRotator = new DailyAnimationRotator(
  {
    defaultAction: "idle_primary",
    variations: ["tail_wag", "idle_secondary"],
    firstDelayMs: 0,
    variationDurationMs: 1000,
    gapMs: 1000,
    maxGapMs: 3000,
    random: () => 0.5
  },
  0
);

checks.push(
  ["variable gap starts first variation", variableGapRotator.resolve("idle_primary", true, 0), "tail_wag"],
  ["variable gap first variation ends", variableGapRotator.resolve("idle_primary", true, 1000), "idle_primary"],
  ["variable gap waits past minimum", variableGapRotator.resolve("idle_primary", true, 2999), "idle_primary"],
  ["variable gap starts after randomized gap", variableGapRotator.resolve("idle_primary", true, 3000), "idle_secondary"]
);

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
