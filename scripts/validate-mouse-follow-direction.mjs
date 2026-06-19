import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "mouse-follow-direction-validation");
const outfile = join(outdir, "mouse-follow-direction.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "behavior", "mouse-follow-direction.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const {
  MOUSE_FOLLOW_DIRECTION_ACTIONS,
  angleFromCenterToCursor,
  buildMouseFollowPayload,
  resolveMouseFollowAction
} = await import(pathToFileURL(outfile).href);

const center = { x: 100, y: 100 };
const checks = [
  ["contains 16 actions", MOUSE_FOLLOW_DIRECTION_ACTIONS.length, 16],
  ["0 degrees maps east", resolveMouseFollowAction(0), "look_e"],
  ["22.5 degrees maps ene", resolveMouseFollowAction(22.5), "look_ene"],
  ["45 degrees maps ne", resolveMouseFollowAction(45), "look_ne"],
  ["90 degrees maps north", resolveMouseFollowAction(90), "look_n"],
  ["180 degrees maps west", resolveMouseFollowAction(180), "look_w"],
  ["270 degrees maps south", resolveMouseFollowAction(270), "look_s"],
  ["337.5 degrees maps ese", resolveMouseFollowAction(337.5), "look_ese"],
  ["right cursor angle", Math.round(angleFromCenterToCursor(center, { x: 140, y: 100 })), 0],
  ["up cursor angle", Math.round(angleFromCenterToCursor(center, { x: 100, y: 60 })), 90],
  ["left cursor angle", Math.round(angleFromCenterToCursor(center, { x: 60, y: 100 })), 180],
  ["down cursor angle", Math.round(angleFromCenterToCursor(center, { x: 100, y: 140 })), 270],
  ["hysteresis keeps previous action near boundary", resolveMouseFollowAction(16, "look_e"), "look_e"],
  [
    "near payload resolves action",
    buildMouseFollowPayload({ near: true, center, cursor: { x: 140, y: 60 } }).action,
    "look_ne"
  ],
  [
    "far payload clears action",
    buildMouseFollowPayload({ near: false, center, cursor: { x: 140, y: 60 }, previousAction: "look_ne" }).action,
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
