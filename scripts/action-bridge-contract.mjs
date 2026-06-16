import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();

export function buildActionBridgeContractReport({
  bridges = readJson("assets/config/action-bridges.json"),
  plan = readJson("docs/kling-action-generation-plan.json"),
  manifest = readJson("assets/runtime/animations/manifest.json")
} = {}) {
  const candidates = collectBridgeCandidates(bridges);
  const planActions = new Set((plan.actions ?? []).map((action) => action.action).filter(Boolean));
  const manifestActions = new Set(Object.keys(manifest.actions ?? {}));
  const failures = candidates
    .filter((candidate) => !planActions.has(candidate.action) && !manifestActions.has(candidate.action))
    .map((candidate) => ({
      trigger: candidate.trigger,
      action: candidate.action,
      reason: "not_found_in_kling_plan_or_runtime_manifest"
    }));

  return {
    ok: failures.length === 0,
    candidateCount: new Set(candidates.map((candidate) => candidate.action)).size,
    candidates,
    failures
  };
}

function collectBridgeCandidates(bridges) {
  return [
    ...collectGroup("dailyRotation.lowFatigue", bridges.dailyRotation?.lowFatigue),
    ...collectGroup("reminder.water", bridges.reminder?.water),
    ...collectGroup("reminder.rest", bridges.reminder?.rest),
    ...collectGroup("proximity.mouse_near", bridges.proximity?.mouse_near),
    ...collectGroup("click.single", bridges.click?.single),
    ...collectGroup("click.repeated", bridges.click?.repeated),
    ...collectGroup("click.wake", bridges.click?.wake),
    ...collectGroup("drag.start", bridges.drag?.start)
  ];
}

function collectGroup(trigger, actions = []) {
  return actions.map((action, index) => ({
    trigger,
    action,
    priority: index + 1
  }));
}

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = buildActionBridgeContractReport();
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exit(1);
}
