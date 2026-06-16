import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "click-action-bridge-validation");
const outfile = join(outdir, "click-action-bridge.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "behavior", "click-action-bridge.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { resolveClickAnimationAction } = await import(pathToFileURL(outfile).href);

const available = (actions) => (action) => actions.includes(action);

const checks = [
  [
    "single click prefers click_surprised",
    resolveClickAnimationAction({ kind: "single" }, available(["click_surprised", "paw_raise"])),
    "click_surprised"
  ],
  [
    "single click falls back to paw_raise",
    resolveClickAnimationAction({ kind: "single" }, available(["paw_raise"])),
    "paw_raise"
  ],
  [
    "repeated click prefers poke_annoyed",
    resolveClickAnimationAction({ kind: "repeated" }, available(["poke_annoyed", "shy"])),
    "poke_annoyed"
  ],
  [
    "repeated click falls back to shy",
    resolveClickAnimationAction({ kind: "repeated" }, available(["shy"])),
    "shy"
  ],
  [
    "wake click prefers waking",
    resolveClickAnimationAction({ kind: "wake" }, available(["waking", "click_surprised"])),
    "waking"
  ],
  [
    "missing candidates return null",
    resolveClickAnimationAction({ kind: "single" }, available(["idle_primary"])),
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
