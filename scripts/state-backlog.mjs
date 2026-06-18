import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractPetStateNames } from "./manifest-contract.mjs";
import { buildStateCoverageReport } from "./state-coverage-report.mjs";

export function buildStateBacklog({ coverage, plan, root = process.cwd() }) {
  const actionsByName = new Map((plan.actions || []).map((action) => [action.action, action]));
  const items = coverage.states
    .filter((state) => state.status === "fallback" || state.status === "missing")
    .map((state) => {
      const planned = state.promptAction ? actionsByName.get(state.promptAction) : null;
      return {
        state: state.state,
        currentStatus: state.status,
        currentAction: state.actions.join("、") || "无",
        suggestedAction: state.promptAction || "待补提示词",
        category: planned?.category || "待确认",
        output: planned?.output || "待确认",
        nextStep: planned ? nextStepForPlannedAction(planned, root) : "先补动作提示词和目标 action"
      };
    });

  return {
    total: items.length,
    items
  };
}

function nextStepForPlannedAction(planned, root) {
  if (planned.output && existsSync(join(root, planned.output))) {
    return "源视频已存在，等待用户确认清单后接入 manifest";
  }
  return "生成/补充源视频，再等待用户确认清单后接入 manifest";
}

export function renderStateBacklog(backlog) {
  const lines = [
    "## 13 状态动作补齐待办",
    "",
    `待补状态数：${backlog.total}`,
    "",
    "源视频缺失时先生成/补充源视频；源视频已存在时先等待用户确认清单。确认前禁止抽帧、覆盖 runtime 路径或修改 manifest。",
    "",
    "| state | suggested action | category | planned output | current action | next step |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  for (const item of backlog.items) {
    lines.push(
      `| ${item.state} | ${item.suggestedAction} | ${item.category} | ${item.output} | ${item.currentAction} | ${item.nextStep} |`
    );
  }

  return `${lines.join("\n")}\n`;
}

export function writeStateBacklog(backlog, outputPath) {
  const text = renderStateBacklog(backlog);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, text);
  return text;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const manifest = JSON.parse(readFileSync(join(root, "assets", "runtime", "animations", "manifest.json"), "utf8"));
  const stateSource = readFileSync(join(root, "src", "core", "fsm", "state-types.ts"), "utf8");
  const plan = JSON.parse(readFileSync(join(root, "docs", "kling-action-generation-plan.json"), "utf8"));
  const coverage = buildStateCoverageReport({
    manifest,
    stateNames: extractPetStateNames(stateSource),
    promptActions: (plan.actions || []).map((action) => action.action)
  });
  const backlog = buildStateBacklog({ coverage, plan });
  const outputPath = parseWritePath(process.argv.slice(2));
  const text = outputPath ? writeStateBacklog(backlog, join(root, outputPath)) : renderStateBacklog(backlog);
  process.stdout.write(text);
}

function parseWritePath(args) {
  const index = args.indexOf("--write");
  if (index < 0) return null;
  const outputPath = args[index + 1];
  if (!outputPath) throw new Error("Missing path after --write");
  return outputPath;
}
