import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const checklistPath = join(root, "docs", "transition-out-action-checklist.md");
const riskReportPath = join(root, "docs", "action-transition-risk-report.md");
const planPath = join(root, "docs", "kling-action-generation-plan.json");

const expectedMappings = [
  {
    risk: "sleep -> sleeping",
    action: "sleep_to_sleeping",
    source: "assets/origin/generated/kling/sleep_to_sleeping.mp4",
    manifestLink: "sleep.transitionOut = \"sleep_to_sleeping\""
  },
  {
    risk: "waking -> idle_primary",
    action: "waking_to_idle",
    source: "assets/origin/generated/kling/waking_to_idle.mp4",
    manifestLink: "waking.transitionOut = \"waking_to_idle\""
  },
  {
    risk: "poke_annoyed -> idle_primary",
    action: "poke_annoyed_to_idle",
    source: "assets/origin/generated/kling/poke_annoyed_to_idle.mp4",
    manifestLink: "poke_annoyed.transitionOut = \"poke_annoyed_to_idle\""
  },
  {
    risk: "paw_raise -> idle_primary",
    action: "paw_raise_to_idle",
    source: "assets/origin/generated/kling/paw_raise_to_idle.mp4",
    manifestLink: "paw_raise.transitionOut = \"paw_raise_to_idle\""
  }
];

const failures = [];
for (const path of [checklistPath, riskReportPath, planPath]) {
  if (!existsSync(path)) failures.push(`missing ${relative(path)}`);
}

if (failures.length === 0) {
  const checklist = readFileSync(checklistPath, "utf8");
  const riskReport = readFileSync(riskReportPath, "utf8");
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  const planActions = new Map((plan.actions || []).map((action) => [action.action, action]));

  for (const mapping of expectedMappings) {
    if (!riskReport.includes(`| high | 回切 | ${mapping.risk.replace(" -> ", " | ")}`)) {
      failures.push(`risk report no longer marks ${mapping.risk} as high return transition; update checklist mapping`);
    }
    for (const text of [mapping.risk, mapping.action, mapping.source, mapping.manifestLink]) {
      if (!checklist.includes(text)) failures.push(`checklist missing ${text}`);
    }

    const action = planActions.get(mapping.action);
    if (!action) {
      failures.push(`plan missing transition action ${mapping.action}`);
      continue;
    }
    if (action.category !== "transition") failures.push(`${mapping.action}: category must be transition`);
    if (action.loop !== false) failures.push(`${mapping.action}: loop must be false`);
    if (action.output !== mapping.source) failures.push(`${mapping.action}: output must be ${mapping.source}`);
    if (!String(action.prompt || "").includes("水印") || !String(action.prompt || "").includes("logo")) {
      failures.push(`${mapping.action}: prompt must exclude watermark/logo`);
    }
  }

  if (!checklist.includes("尚未生成视频") || !checklist.includes("尚未新增 runtime 帧")) {
    failures.push("checklist must explicitly state no video/runtime frames have been generated");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));

function relative(path) {
  return path.startsWith(`${root}/`) ? path.slice(root.length + 1) : path;
}
