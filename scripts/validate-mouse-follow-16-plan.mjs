import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const plan = JSON.parse(readFileSync(join(root, "docs", "kling-action-generation-plan.json"), "utf8"));
const batches = JSON.parse(readFileSync(join(root, "docs", "kling-generation-batches.json"), "utf8"));
const checklist = readFileSync(join(root, "docs", "mouse-follow-16-action-checklist.md"), "utf8");

const expectedActions = [
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
const actionsByName = new Map((plan.actions || []).map((action) => [action.action, action]));
const mouseFollowBatch = (batches.batches || []).find((batch) => batch.id === "mouse-follow-16-direction");
const batchActions = new Set((mouseFollowBatch?.actions || []).map((action) => action.action));

if (!mouseFollowBatch) {
  failures.push("docs/kling-generation-batches.json must include mouse-follow-16-direction batch");
}

for (const actionName of expectedActions) {
  const action = actionsByName.get(actionName);
  if (!action) {
    failures.push(`missing action in kling plan: ${actionName}`);
    continue;
  }
  if (action.category !== "interactive") failures.push(`${actionName}: category must be interactive`);
  if (action.loop !== true) failures.push(`${actionName}: loop must be true`);
  if (action.durationSeconds !== 8) failures.push(`${actionName}: durationSeconds must be 8`);
  if (action.generationDurationSeconds !== 5) failures.push(`${actionName}: generationDurationSeconds must be 5`);
  if (action.output !== `assets/origin/generated/kling/${actionName}.mp4`) {
    failures.push(`${actionName}: output path mismatch`);
  }
  if (!String(action.prompt || "").includes("画面不要出现文字、水印或 logo")) {
    failures.push(`${actionName}: prompt must forbid text, watermark, and logo`);
  }
  if (!batchActions.has(actionName)) failures.push(`${actionName}: missing from mouse-follow-16-direction batch`);
  if (!checklist.includes(`\`${actionName}\``)) failures.push(`${actionName}: missing from checklist`);
}

if (mouseFollowBatch && mouseFollowBatch.actions.length !== expectedActions.length) {
  failures.push(`mouse-follow-16-direction batch must contain exactly ${expectedActions.length} actions`);
}

if (!checklist.includes("禁止在用户确认前生成视频")) {
  failures.push("checklist must keep user-confirmation generation gate");
}

if (!checklist.includes("尚未生成视频")) {
  failures.push("checklist must state videos have not been generated yet");
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, actionCount: expectedActions.length }, null, 2));
