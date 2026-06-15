import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractPetStateNames } from "./manifest-contract.mjs";

export function buildStateCoverageReport({ manifest, stateNames, promptActions = [] }) {
  const states = stateNames.map((state) => stateCoverage(state, manifest, promptActions));
  const summary = {
    independent: states.filter((state) => state.status === "independent").length,
    mixed: states.filter((state) => state.status === "mixed").length,
    fallback: states.filter((state) => state.status === "fallback").length,
    missing: states.filter((state) => state.status === "missing").length
  };

  return {
    totalStates: stateNames.length,
    actionCount: Object.keys(manifest.actions || {}).length,
    summary,
    states
  };
}

export function renderStateCoverageReport(report) {
  const lines = [
    "## 桌宠状态动作覆盖报告",
    "",
    `状态总数：${report.totalStates}`,
    `运行时 action 数：${report.actionCount}`,
    `覆盖摘要：independent ${report.summary.independent} / mixed ${report.summary.mixed} / fallback ${report.summary.fallback} / missing ${report.summary.missing}`,
    "",
    "| state | status | runtime actions | source | prompt hint |",
    "| --- | --- | --- | --- | --- |"
  ];

  for (const state of report.states) {
    lines.push(
      `| ${state.state} | ${state.status} | ${state.actions.join("、") || "无"} | ${state.sources.join("、") || "无"} | ${state.promptAction ? `prompt: ${state.promptAction}` : "无"} |`
    );
  }

  return `${lines.join("\n")}\n`;
}

export function writeStateCoverageReport(report, outputPath) {
  const text = renderStateCoverageReport(report);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, text);
  return text;
}

function stateCoverage(state, manifest, promptActions) {
  const mapped = manifest.stateMap?.[state];
  if (!mapped) {
    return {
      state,
      status: "missing",
      actions: [],
      sources: [],
      promptAction: promptActions.includes(state) ? state : null
    };
  }

  const actions = Array.from(new Set(actionNamesFromMapping(mapped)));
  const defaultAction = manifest.defaultAction;
  const nonDefaultActions = actions.filter((action) => action !== defaultAction);
  const status =
    nonDefaultActions.length === 0
      ? state === "idle" ? "independent" : "fallback"
      : actions.includes(defaultAction) ? "mixed" : "independent";
  return {
    state,
    status,
    actions,
    sources: Array.from(new Set(actions.map((action) => manifest.actions?.[action]?.source).filter(Boolean))),
    promptAction: bestPromptHint(state, promptActions)
  };
}

function actionNamesFromMapping(mapped) {
  if (typeof mapped === "string") return [mapped];
  if (!mapped || typeof mapped !== "object") return [];
  return ["left", "right", "neutral"].map((direction) => mapped[direction]).filter(Boolean);
}

function bestPromptHint(state, promptActions) {
  if (promptActions.includes(state)) return state;
  const aliases = {
    surprised: "click_surprised",
    waking: "waking",
    dragging: "dragging",
    shy: "shy",
    waving: "paw_raise",
    teaser: "paw_raise",
    walking: "walk",
    walk: "walk",
    walk_left: "walk"
  };
  return promptActions.includes(aliases[state]) ? aliases[state] : null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const manifest = JSON.parse(readFileSync(join(root, "assets", "runtime", "animations", "manifest.json"), "utf8"));
  const stateSource = readFileSync(join(root, "src", "core", "fsm", "state-types.ts"), "utf8");
  const plan = JSON.parse(readFileSync(join(root, "docs", "kling-action-generation-plan.json"), "utf8"));
  const report = buildStateCoverageReport({
    manifest,
    stateNames: extractPetStateNames(stateSource),
    promptActions: (plan.actions || []).map((action) => action.action)
  });
  const outputPath = parseWritePath(process.argv.slice(2));
  const text = outputPath ? writeStateCoverageReport(report, join(root, outputPath)) : renderStateCoverageReport(report);
  process.stdout.write(text);
}

function parseWritePath(args) {
  const index = args.indexOf("--write");
  if (index < 0) return null;
  const outputPath = args[index + 1];
  if (!outputPath) throw new Error("Missing path after --write");
  return outputPath;
}
