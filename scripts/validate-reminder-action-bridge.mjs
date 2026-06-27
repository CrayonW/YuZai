import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "reminder-action-bridge-validation");
const outfile = join(outdir, "reminder-action-bridge.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "behavior", "reminder-action-bridge.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { resolveReminderAnimationAction } = await import(pathToFileURL(outfile).href);

const available = (actions) => (action) => actions.includes(action);

const checks = [
  [
    "rest reminder prefers stretch_yawn when available",
    resolveReminderAnimationAction({ kind: "rest", message: "看你一眼", index: 1 }, available(["stretch_yawn", "sleepy"])),
    "stretch_yawn"
  ],
  [
    "rest reminder falls back to sleepy",
    resolveReminderAnimationAction({ kind: "rest", message: "看你一眼", index: 1 }, available(["sleepy"])),
    "sleepy"
  ],
  [
    "water reminder prefers call_response",
    resolveReminderAnimationAction({ kind: "water", message: "喵一下", index: 0 }, available(["call_response", "cursor_watch"])),
    "call_response"
  ],
  [
    "water reminder falls back to cursor_watch",
    resolveReminderAnimationAction({ kind: "water", message: "喵一下", index: 0 }, available(["cursor_watch"])),
    "cursor_watch"
  ],
  [
    "missing candidates return null",
    resolveReminderAnimationAction({ kind: "rest", message: "看你一眼", index: 1 }, available(["paw_raise"])),
    null
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
