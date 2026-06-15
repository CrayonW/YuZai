import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "runtime-interaction-schedule-validation");
const outfile = join(outdir, "runtime-interaction-schedule.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "render", "runtime-interaction-schedule.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { buildRuntimeInteractionSchedule } = await import(pathToFileURL(outfile).href);

const schedule = {
  interactionTriggers: {
    mouse_near: { primaryAction: "cursor_watch", fallbackAction: "paw_raise", returnTo: "idle_primary" },
    click: { primaryAction: "click_surprised", fallbackAction: "paw_raise", returnTo: "idle_primary" },
    repeated_click: { primaryAction: "poke_annoyed", fallbackAction: "shy", returnTo: "idle_primary" },
    drag: { primaryAction: "dragging", fallbackAction: "paw_raise", returnTo: "idle_primary" },
    wake: { primaryAction: "waking", fallbackAction: "idle_primary", returnTo: "idle_primary" }
  }
};

const manifest = {
  defaultAction: "idle_primary",
  actions: {
    idle_primary: { enabled: true, frameCount: 72, category: "daily" },
    paw_raise: { enabled: true, frameCount: 72, category: "interactive" },
    click_surprised: { enabled: false, frameCount: 0, category: "interactive" },
    shy: { enabled: false, frameCount: 0, category: "interactive" },
    dragging: { enabled: false, frameCount: 0, category: "interactive" }
  },
  stateMap: {
    idle: "idle_primary",
    teaser: "paw_raise",
    waving: "paw_raise",
    surprised: "click_surprised",
    shy: "shy",
    dragging: "dragging",
    waking: "idle_primary"
  }
};

const interactions = buildRuntimeInteractionSchedule(schedule, manifest);
const currentInteractions = buildRuntimeInteractionSchedule();

const checks = [
  ["mouse near keeps teaser state for paw raise fallback", interactions.mouseNearState, "teaser"],
  ["click falls back to visible waving state", interactions.clickState, "waving"],
  ["repeated click falls back to visible waving state", interactions.repeatedClickState, "waving"],
  ["drag falls back to visible waving state until dragging frames exist", interactions.dragState, "waving"],
  ["wake keeps waking state semantics until waking frames exist", interactions.wakeState, "waking"],
  ["current project click is visible", currentInteractions.clickState, "waving"],
  ["current project repeated click is visible", currentInteractions.repeatedClickState, "waving"]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
