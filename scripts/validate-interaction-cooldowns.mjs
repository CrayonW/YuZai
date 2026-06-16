import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "interaction-cooldowns-validation");
const outfile = join(outdir, "interaction-cooldowns.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "behavior", "interaction-cooldowns.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { InteractionCooldowns } = await import(pathToFileURL(outfile).href);

const cooldowns = new InteractionCooldowns({
  click: 8000,
  repeated_click: 20000,
  mouse_near: 6000,
  drag: 0,
  wake: 60000
});

const checks = [
  ["first click is allowed", cooldowns.tryUse("click", 1000), true],
  ["click inside cooldown is blocked", cooldowns.tryUse("click", 4000), false],
  ["click after cooldown is allowed", cooldowns.tryUse("click", 9000), true],
  ["separate trigger has independent cooldown", cooldowns.tryUse("mouse_near", 4000), true],
  ["same separate trigger blocks inside own cooldown", cooldowns.tryUse("mouse_near", 7000), false],
  ["zero cooldown trigger always allows first drag", cooldowns.tryUse("drag", 100), true],
  ["zero cooldown trigger always allows next drag", cooldowns.tryUse("drag", 101), true]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
