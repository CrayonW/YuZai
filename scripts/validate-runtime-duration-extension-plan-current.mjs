import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildDurationExtensionPlan, renderDurationExtensionPlan } from "./runtime-duration-extension-plan.mjs";

const root = process.cwd();
const planPath = join(root, "docs", "runtime-duration-extension-plan.md");
const blockersPath = join(root, "docs", "release-blockers.json");
const failures = [];

if (!existsSync(planPath)) {
  failures.push("missing docs/runtime-duration-extension-plan.md; run npm run animations:duration-extension-plan -- --write docs/runtime-duration-extension-plan.md");
} else {
  const expected = renderDurationExtensionPlan(buildDurationExtensionPlan({ runtimeRoot: root }));
  const actual = readFileSync(planPath, "utf8");
  if (actual !== expected) {
    failures.push("docs/runtime-duration-extension-plan.md is stale; run npm run animations:duration-extension-plan -- --write docs/runtime-duration-extension-plan.md");
  }

  for (const snippet of [
    "# runtime 动作时长补长清单",
    "runtime 时长不足动作数：27",
    "look_e",
    "look_ese",
    "不得只修改 manifest 帧数来关闭时长缺口",
    "不关闭 `runtime_duration_short` blocker"
  ]) {
    if (!actual.includes(snippet)) {
      failures.push(`docs/runtime-duration-extension-plan.md missing text: ${snippet}`);
    }
  }
}

if (!existsSync(blockersPath)) {
  failures.push("missing docs/release-blockers.json");
} else {
  const blockers = JSON.parse(readFileSync(blockersPath, "utf8"));
  const blocker = blockers.blockers?.find((item) => item.id === "runtime_duration_short");
  if (!blocker) {
    failures.push("docs/release-blockers.json missing runtime_duration_short blocker");
  } else if (!blocker.evidence?.includes("docs/runtime-duration-extension-plan.md")) {
    failures.push("runtime_duration_short evidence must include docs/runtime-duration-extension-plan.md");
  } else if (!blocker.evidence?.includes("docs/runtime-duration-extension-phase1-checklist.md")) {
    failures.push("runtime_duration_short evidence must include docs/runtime-duration-extension-phase1-checklist.md");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
