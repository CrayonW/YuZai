import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "runtime-action-bridge-report-validation");
const outfile = join(outdir, "runtime-action-bridge-report.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "scripts", "runtime-action-bridge-report.mjs")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  external: ["node:fs", "node:path", "node:url"],
  logLevel: "silent"
});

const { buildRuntimeActionBridgeReport, renderRuntimeActionBridgeReportMarkdown } = await import(
  pathToFileURL(outfile).href
);

const report = buildRuntimeActionBridgeReport({
  manifest: {
    actions: {
      paw_raise: { enabled: true, frameCount: 72 },
      idle_primary: { enabled: true, frameCount: 72 },
      cursor_watch: { enabled: false, frameCount: 0 }
    }
  }
});
const markdown = renderRuntimeActionBridgeReportMarkdown(report);

const triggerIds = report.triggers.map((trigger) => trigger.id);
const lowFatigue = report.triggers.find((trigger) => trigger.id === "daily_low_fatigue");
const dailyLife = report.triggers.find((trigger) => trigger.id === "daily_life");
const dailyExplore = report.triggers.find((trigger) => trigger.id === "daily_explore");
const mouseNear = report.triggers.find((trigger) => trigger.id === "mouse_near");
const singleClick = report.triggers.find((trigger) => trigger.id === "click_single");
const gentleInteraction = report.triggers.find((trigger) => trigger.id === "interaction_gentle");
const dragStart = report.triggers.find((trigger) => trigger.id === "drag_start");

const checks = [
  ["has low fatigue daily trigger", triggerIds.includes("daily_low_fatigue"), true],
  ["has life daily trigger", triggerIds.includes("daily_life"), true],
  ["has explore daily trigger", triggerIds.includes("daily_explore"), true],
  ["has water reminder trigger", triggerIds.includes("reminder_water"), true],
  ["has rest reminder trigger", triggerIds.includes("reminder_rest"), true],
  ["has mouse near trigger", triggerIds.includes("mouse_near"), true],
  ["has single click trigger", triggerIds.includes("click_single"), true],
  ["has repeated click trigger", triggerIds.includes("click_repeated"), true],
  ["has gentle interaction trigger", triggerIds.includes("interaction_gentle"), true],
  ["has wake click trigger", triggerIds.includes("click_wake"), true],
  ["has drag start trigger", triggerIds.includes("drag_start"), true],
  ["low fatigue tracks slow_blink", lowFatigue?.candidates[0]?.action, "slow_blink"],
  ["low fatigue marks slow_blink missing", lowFatigue?.candidates[0]?.status, "missing"],
  ["life daily tracks groom action", dailyLife?.candidates[0]?.action, "groom_face_wash"],
  ["explore daily tracks sniff action", dailyExplore?.candidates[0]?.action, "desk_sniff"],
  ["mouse near marks cursor_watch missing", mouseNear?.candidates.find((item) => item.action === "cursor_watch")?.status, "missing"],
  ["mouse near marks paw_raise ready", mouseNear?.candidates.find((item) => item.action === "paw_raise")?.status, "ready"],
  ["single click tracks click_surprised", singleClick?.candidates[0]?.action, "click_surprised"],
  ["gentle interaction tracks shy", gentleInteraction?.candidates[0]?.action, "shy"],
  ["drag start tracks dragging", dragStart?.candidates[0]?.action, "dragging"],
  ["markdown is Chinese", markdown.includes("# 运行时动作桥接矩阵"), true],
  ["markdown renders ready status", markdown.includes("| paw_raise | ready |"), true],
  ["markdown renders missing status", markdown.includes("| cursor_watch | missing |"), true]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
