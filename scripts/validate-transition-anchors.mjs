import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const anchorsPath = join(root, "assets", "runtime", "animations", "transition-anchors.json");
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");
const directionActions = [
  "look_e",
  "look_ene",
  "look_ne",
  "look_nne",
  "look_n",
  "look_nnw",
  "look_nw",
  "look_wnw",
  "look_w",
  "look_wsw",
  "look_sw",
  "look_ssw",
  "look_s",
  "look_sse",
  "look_se",
  "look_ese"
];

const failures = [];
if (!existsSync(anchorsPath)) failures.push("missing assets/runtime/animations/transition-anchors.json");
if (!existsSync(manifestPath)) failures.push("missing assets/runtime/animations/manifest.json");

if (failures.length === 0) {
  const anchors = JSON.parse(readFileSync(anchorsPath, "utf8"));
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (anchors.version !== 1) failures.push("transition anchors version must be 1");
  if (anchors.strategy !== "sampled-rmse") failures.push("transition anchors strategy must be sampled-rmse");

  for (const action of directionActions) {
    requireAnchor(anchors, manifest, "idle_primary", action);
    requireAnchor(anchors, manifest, action, "idle_primary");
  }
  for (let index = 0; index < directionActions.length; index += 1) {
    const current = directionActions[index];
    const next = directionActions[(index + 1) % directionActions.length];
    requireAnchor(anchors, manifest, current, next);
    requireAnchor(anchors, manifest, next, current);
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));

function requireAnchor(anchors, manifest, fromAction, toAction) {
  const key = `${fromAction}->${toAction}`;
  const anchor = anchors.anchors?.[key];
  if (!anchor) {
    failures.push(`missing anchor ${key}`);
    return;
  }
  const fromConfig = manifest.actions?.[fromAction];
  const toConfig = manifest.actions?.[toAction];
  if (!fromConfig || !toConfig) {
    failures.push(`${key}: missing manifest action`);
    return;
  }
  if (!Number.isInteger(anchor.fromFrame) || anchor.fromFrame < 1 || anchor.fromFrame > fromConfig.frameCount) {
    failures.push(`${key}: invalid fromFrame ${anchor.fromFrame}`);
  }
  if (!Number.isInteger(anchor.toFrame) || anchor.toFrame < 1 || anchor.toFrame > toConfig.frameCount) {
    failures.push(`${key}: invalid toFrame ${anchor.toFrame}`);
  }
  if (typeof anchor.metric !== "number" || anchor.metric < 0 || anchor.metric > 1) {
    failures.push(`${key}: invalid metric ${anchor.metric}`);
  }
}
