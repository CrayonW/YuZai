import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const checklistPath = join(root, "docs", "transition-out-action-checklist.md");
const riskReportPath = join(root, "docs", "action-transition-risk-report.md");
const planPath = join(root, "docs", "kling-action-generation-plan.json");
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");

const expectedMappings = [
  {
    risk: "sleep -> sleeping",
    action: "sleep_to_sleeping",
    sourceAction: "sleep",
    source: "assets/origin/generated/kling/sleep_to_sleeping.mp4",
    runtimeFrameRoot: "assets/runtime/animations/sleep_to_sleeping/frames",
    contactSheet: "assets/reviews/runtime/transition-out-recovery/sleep-contact-sheet.png",
    manifestLink: "sleep.transitionOut = \"sleep_to_sleeping\""
  },
  {
    risk: "waking -> idle_primary",
    action: "waking_to_idle",
    sourceAction: "waking",
    source: "assets/origin/generated/kling/waking_to_idle.mp4",
    runtimeFrameRoot: "assets/runtime/animations/waking_to_idle/frames",
    contactSheet: "assets/reviews/runtime/transition-out-recovery/waking-contact-sheet.png",
    manifestLink: "waking.transitionOut = \"waking_to_idle\""
  },
  {
    risk: "poke_annoyed -> idle_primary",
    action: "poke_annoyed_to_idle",
    sourceAction: "poke_annoyed",
    source: "assets/origin/generated/kling/poke_annoyed_to_idle.mp4",
    runtimeFrameRoot: "assets/runtime/animations/poke_annoyed_to_idle/frames",
    contactSheet: "assets/reviews/runtime/transition-out-recovery/poke-annoyed-contact-sheet.png",
    manifestLink: "poke_annoyed.transitionOut = \"poke_annoyed_to_idle\""
  },
  {
    risk: "paw_raise -> idle_primary",
    action: "paw_raise_to_idle",
    sourceAction: "paw_raise",
    source: "assets/origin/generated/kling/paw_raise_to_idle.mp4",
    runtimeFrameRoot: "assets/runtime/animations/paw_raise_to_idle/frames",
    contactSheet: "assets/reviews/runtime/transition-out-recovery/paw-raise-contact-sheet.png",
    manifestLink: "paw_raise.transitionOut = \"paw_raise_to_idle\""
  }
];

const failures = [];
for (const path of [checklistPath, riskReportPath, planPath, manifestPath]) {
  if (!existsSync(path)) failures.push(`missing ${relative(path)}`);
}

if (failures.length === 0) {
  const checklist = readFileSync(checklistPath, "utf8");
  const riskReport = readFileSync(riskReportPath, "utf8");
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
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

    if (!existsSync(join(root, mapping.source))) {
      failures.push(`${mapping.action}: generated source video is missing`);
    }
    if (!existsSync(join(root, mapping.contactSheet))) {
      failures.push(`${mapping.action}: desktop contact sheet is missing`);
    }
    if (!existsSync(join(root, mapping.runtimeFrameRoot, "frame_000001.png"))) {
      failures.push(`${mapping.action}: runtime frames are missing`);
    }

    const runtimeAction = manifest.actions?.[mapping.action];
    if (!runtimeAction) failures.push(`${mapping.action}: missing runtime manifest action`);
    if (runtimeAction?.category !== "transition") failures.push(`${mapping.action}: runtime category must be transition`);
    if (runtimeAction?.loop !== false) failures.push(`${mapping.action}: runtime loop must be false`);
    const lastExitFrame = Math.max(...(runtimeAction?.exitFrames ?? []));
    if (runtimeAction?.frameCount > 1 && lastExitFrame <= 1) {
      failures.push(`${mapping.action}: transitionOut runtime must not return at frame 1`);
    }
    if (manifest.actions?.[mapping.sourceAction]?.transitionOut !== mapping.action) {
      failures.push(`${mapping.sourceAction}.transitionOut must be ${mapping.action}`);
    }
  }

  for (const text of [
    "4 个 transitionOut 视频已生成并接入 runtime",
    "桌面多帧截图证据已保存到 `assets/reviews/runtime/transition-out-recovery/`"
  ]) {
    if (!checklist.includes(text)) failures.push(`checklist missing current status: ${text}`);
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
