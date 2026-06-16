import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "proximity-action-bridge-validation");
const outfile = join(outdir, "proximity-action-bridge.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "behavior", "proximity-action-bridge.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { resolveProximityAnimationAction } = await import(pathToFileURL(outfile).href);

const available = (actions) => (action) => actions.includes(action);

const checks = [
  [
    "near mouse prefers cursor_watch when available",
    resolveProximityAnimationAction({ near: true }, available(["cursor_watch", "paw_raise"])),
    "cursor_watch"
  ],
  [
    "near mouse falls back to paw_raise",
    resolveProximityAnimationAction({ near: true }, available(["paw_raise"])),
    "paw_raise"
  ],
  [
    "near mouse returns null when candidates missing",
    resolveProximityAnimationAction({ near: true }, available(["idle_primary"])),
    null
  ],
  [
    "far mouse never triggers an action",
    resolveProximityAnimationAction({ near: false }, available(["cursor_watch"])),
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
