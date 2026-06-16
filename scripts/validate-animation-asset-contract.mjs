import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const fixtureDir = join(root, ".tmp", "animation-asset-contract-validation");
mkdirSync(fixtureDir, { recursive: true });

const planPath = join(fixtureDir, "plan.json");
const manifestPath = join(fixtureDir, "manifest.json");
const reportPath = join(fixtureDir, "asset-contract.md");

writeFileSync(planPath, JSON.stringify({
  video: { fps: 24 },
  actions: [
    {
      action: "idle_primary",
      category: "daily",
      loop: true,
      durationSeconds: 8,
      minCooldownSeconds: 0,
      antiFatigueRole: "主待机",
      prompt: "动作自然，没有文字、水印、logo。",
      output: "assets/origin/generated/kling/idle_primary.mp4"
    },
    {
      action: "cursor_watch",
      category: "interactive",
      loop: false,
      durationSeconds: 4,
      minCooldownSeconds: 6,
      antiFatigueRole: "鼠标靠近回应",
      prompt: "观察鼠标，没有文字、水印、logo。",
      output: "assets/origin/generated/kling/cursor_watch.mp4"
    },
    {
      action: "groom_face_wash",
      category: "daily",
      loop: false,
      durationSeconds: 8,
      minCooldownSeconds: 900,
      antiFatigueRole: "真实小猫生活动作",
      prompt: "洗脸理毛，没有文字、水印、logo。",
      output: "assets/origin/generated/kling/groom_face_wash.mp4"
    },
    {
      action: "idle_to_cursor_watch",
      category: "transition",
      loop: false,
      durationSeconds: 2,
      minCooldownSeconds: 0,
      antiFatigueRole: "衔接",
      prompt: "从待机转向鼠标，没有文字、水印、logo。",
      output: "assets/origin/generated/kling/idle_to_cursor_watch.mp4"
    }
  ]
}, null, 2));

writeFileSync(manifestPath, JSON.stringify({
  actions: {
    idle_primary: {
      enabled: true,
      frameCount: 72,
      fps: 24,
      loop: true,
      category: "daily",
      source: "assets/origin/idle.mp4"
    }
  },
  stateMap: {
    idle: "idle_primary",
    teaser: "idle_primary"
  }
}, null, 2));

const { buildAssetContractReport, renderAssetContractMarkdown } = await import(pathToFileURL(join(root, "scripts", "animation-asset-contract.mjs")).href);

const report = buildAssetContractReport({
  planPath,
  manifestPath,
  runtimeRoot: root
});
const markdown = renderAssetContractMarkdown(report);
writeFileSync(reportPath, markdown);

const checks = [
  ["counts planned actions", report.summary.plannedActions, 4],
  ["counts playable actions", report.summary.playableActions, 1],
  ["reports missing action", report.missingActions.map((item) => item.action).join(","), "cursor_watch,groom_face_wash,idle_to_cursor_watch"],
  ["reports short runtime action", report.shortRuntimeActions.map((item) => item.action).join(","), "idle_primary"],
  ["first priority batch starts with lifestyle daily action", report.priorityBatches[0].actions[0].action, "groom_face_wash"],
  ["first priority batch includes key mouse interaction", report.priorityBatches[0].actions.some((item) => item.action === "cursor_watch"), true],
  ["second priority batch includes transition", report.priorityBatches[1].actions.map((item) => item.action).join(","), "idle_to_cursor_watch"],
  ["renders Chinese title", markdown.includes("# 小猫动作资产契约与缺口报告"), true],
  ["renders priority section", markdown.includes("## 优先补齐批次"), true],
  ["renders missing action section", markdown.includes("## 缺失动作"), true],
  ["writes validation report", readFileSync(reportPath, "utf8").includes("cursor_watch"), true]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
