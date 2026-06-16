import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "drag-action-bridge-validation");
const outfile = join(outdir, "drag-action-bridge.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "behavior", "drag-action-bridge.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { resolveDragAnimationAction } = await import(pathToFileURL(outfile).href);

const available = (actions) => (action) => actions.includes(action);

const checks = [
  [
    "drag start prefers dragging",
    resolveDragAnimationAction({ phase: "start" }, available(["dragging", "paw_raise"])),
    "dragging"
  ],
  [
    "drag start falls back to paw_raise",
    resolveDragAnimationAction({ phase: "start" }, available(["paw_raise"])),
    "paw_raise"
  ],
  [
    "drag start returns null when candidates missing",
    resolveDragAnimationAction({ phase: "start" }, available(["idle_primary"])),
    null
  ],
  [
    "drag end never triggers a new action",
    resolveDragAnimationAction({ phase: "end" }, available(["dragging", "paw_raise"])),
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
