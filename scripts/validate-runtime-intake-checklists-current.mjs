import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const planPath = join(process.cwd(), "docs", "runtime-intake-waves.json");
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const failures = [];

for (const wave of plan.waves ?? []) {
  const checklistPath = checklistPathForWave(wave.id);
  const absoluteChecklistPath = join(process.cwd(), checklistPath);
  if (!existsSync(absoluteChecklistPath)) {
    failures.push(`missing checklist for ${wave.id}: ${checklistPath}`);
    continue;
  }

  const text = readFileSync(absoluteChecklistPath, "utf8");
  requireIncludes(text, `波次 ID：${wave.id}`, `${checklistPath} wave id`);
  requireIncludes(text, `目的：${wave.intent}`, `${checklistPath} intent`);
  requireIncludes(text, `- 动作数量：${wave.actions.length}`, `${checklistPath} action count`);

  for (const action of wave.actions) {
    requireIncludes(text, `目标 action：${action.action}`, `${checklistPath} action ${action.action}`);
    requireIncludes(text, `来源视频：${action.sourceVideo}`, `${checklistPath} source ${action.action}`);
    requireIncludes(text, `运行帧输出：${action.runtimeFrameRoot}`, `${checklistPath} runtime ${action.action}`);
    requireIncludes(text, `桥接入口：${action.bridge}`, `${checklistPath} bridge ${action.action}`);
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checklistCount: plan.waves.length }, null, 2));

function checklistPathForWave(waveId) {
  return `docs/runtime-intake-${waveId}-execution-checklist.md`;
}

function requireIncludes(text, expected, label) {
  if (!text.includes(expected)) {
    failures.push(`${label}: expected ${expected}`);
  }
}
