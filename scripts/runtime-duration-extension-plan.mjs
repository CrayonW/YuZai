import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAssetContractReport } from "./animation-asset-contract.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

export function buildDurationExtensionPlan({
  planPath = "docs/kling-action-generation-plan.json",
  manifestPath = "assets/runtime/animations/manifest.json",
  runtimeRoot = root
} = {}) {
  const report = buildAssetContractReport({ planPath, manifestPath, runtimeRoot });
  const planActions = new Map(readPlanActions(runtimeRoot, planPath).map((action) => [action.action, action]));
  const items = report.shortRuntimeActions.map((item) => {
    const planAction = planActions.get(item.action) ?? {};
    return {
      ...item,
      deficitFrames: item.expectedFrames - item.actualFrames,
      deficitSeconds: item.expectedDurationSeconds - item.actualDurationSeconds,
      output: planAction.output ?? "",
      loop: planAction.loop === true,
      role: planAction.antiFatigueRole ?? "",
      strategy: strategyFor(item, planAction)
    };
  });

  return {
    updatedAt: "2026-06-23",
    purpose: "把 runtime_duration_short blocker 拆成可执行的补长动作清单。本文档不批准生成视频、抽帧、去水印或修改 manifest。",
    summary: {
      shortRuntimeActions: items.length,
      daily: items.filter((item) => item.category === "daily").length,
      interactive: items.filter((item) => item.category === "interactive").length,
      transition: items.filter((item) => item.category === "transition").length
    },
    items
  };
}

export function renderDurationExtensionPlan(plan) {
  const lines = [
    "# runtime 动作时长补长清单",
    "",
    `更新日期：${plan.updatedAt}`,
    "",
    plan.purpose,
    "",
    "## 当前摘要",
    "",
    `- runtime 时长不足动作数：${plan.summary.shortRuntimeActions}`,
    `- daily：${plan.summary.daily}`,
    `- interactive：${plan.summary.interactive}`,
    `- transition：${plan.summary.transition}`,
    "",
    "## 补长动作清单",
    "",
    "| action | 分类 | 当前 | 契约目标 | 缺口 | 预期源视频 | 补长策略 |",
    "| --- | --- | ---: | ---: | ---: | --- | --- |"
  ];

  for (const item of plan.items) {
    lines.push(`| ${[
      item.action,
      item.category,
      `${item.actualFrames} 帧 / ${formatSeconds(item.actualDurationSeconds)}s`,
      `${item.expectedFrames} 帧 / ${formatSeconds(item.expectedDurationSeconds)}s`,
      `${item.deficitFrames} 帧 / ${formatSeconds(item.deficitSeconds)}s`,
      item.output || "-",
      item.strategy
    ].join(" | ")} |`);
  }

  const boundaryLines = plan.summary.shortRuntimeActions === 0
    ? [
      "- 本清单当前没有剩余补长范围。",
      "- 本清单可作为 `runtime_duration_short` blocker 的关闭证据之一。",
      "- 后续如替换更自然源视频，仍需重新生成处理清单并补桌面验收。"
    ]
    : [
      "- 本清单只描述补长范围，不生成视频。",
      "- 本清单不抽帧、不去水印、不修改 `assets/runtime/animations/manifest.json`。",
      "- 本清单不关闭 `runtime_duration_short` blocker。"
    ];

  lines.push(
    "",
    "## 处理规则",
    "",
    "- 不得只修改 manifest 帧数来关闭时长缺口。",
    "- 每个补长动作必须先补充更长源视频或分段素材，并完成人工水印检查。",
    "- 进入 runtime 前必须完成去水印、抠绿、抽帧和 manifest 更新。",
    "- 关闭 `runtime_duration_short` 前必须重新运行 `npm run animations:asset-contract -- --write docs/animation-asset-contract.md`、`npm run validate:all`、`npm run validate:release`。",
    "- 涉及桌面观感的补长动作关闭前必须补充桌面多帧截图或录屏证据。",
    "",
    "## 推荐执行顺序",
    "",
    "1. 先补 `idle_primary`、`idle_secondary`、`tail_wag`，降低最常见待机重复感。",
    "2. 再补 `groom_face_wash`、`loaf_breathing`、`sleeping` 等长时间陪伴动作。",
    "3. 然后补 16 方向 `look_*` 鼠标跟随动作，让鼠标停留时动作长度足够。",
    "4. 最后补短交互动作 `paw_raise`、`walk` 和睡眠链路中仍短的动作。",
    "",
    "## 当前边界",
    "",
    ...boundaryLines
  );

  return `${lines.join("\n")}\n`;
}

export function writeDurationExtensionPlan(plan, outputPath) {
  const text = renderDurationExtensionPlan(plan);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, text);
  return text;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const plan = buildDurationExtensionPlan({
    planPath: argValue(args, "--plan") ?? "docs/kling-action-generation-plan.json",
    manifestPath: argValue(args, "--manifest") ?? "assets/runtime/animations/manifest.json",
    runtimeRoot: root
  });
  const writePath = argValue(args, "--write");
  const text = writePath
    ? writeDurationExtensionPlan(plan, resolvePath(root, writePath))
    : renderDurationExtensionPlan(plan);
  process.stdout.write(text);
}

function readPlanActions(runtimeRoot, planPath) {
  const path = resolvePath(runtimeRoot, planPath);
  const plan = JSON.parse(readFileSync(path, "utf8"));
  return Array.isArray(plan.actions) ? plan.actions : [];
}

function strategyFor(item, planAction) {
  if (item.category === "interactive" && item.action.startsWith("look_")) return "重新生成更长 16 方向鼠标跟随循环，开始和结束姿势保持一致。";
  if (["idle_primary", "idle_secondary", "tail_wag"].includes(item.action)) return "优先补 8 秒日常循环源视频，保持首尾安全帧接近。";
  if (planAction.loop === true) return "补长为可循环源视频，首尾姿态保持一致。";
  if (item.category === "daily") return "补充更长生活化分段素材，接入前复查尾段回到安全姿态。";
  return "补充更长交互源视频，结束姿态需能自然回到待机或后续 transitionOut。";
}

function resolvePath(runtimeRoot, path) {
  return isAbsolute(path) ? path : join(runtimeRoot, path);
}

function argValue(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  const value = args[index + 1];
  if (!value) throw new Error(`Missing value after ${name}`);
  return value;
}

function formatSeconds(value) {
  return Number(value).toFixed(2).replace(/\.?0+$/, "");
}
