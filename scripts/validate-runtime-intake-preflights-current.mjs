import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const plan = JSON.parse(readFileSync(join(process.cwd(), "docs", "runtime-intake-waves.json"), "utf8"));
const failures = [];

for (const wave of plan.waves ?? []) {
  const reportPath = preflightPathForWave(wave.id);
  const absoluteReportPath = join(process.cwd(), reportPath);
  if (!existsSync(absoluteReportPath)) {
    failures.push(`missing preflight report for ${wave.id}: ${reportPath}`);
    continue;
  }

  const text = readFileSync(absoluteReportPath, "utf8");
  requireIncludes(text, `波次 ID：${wave.id}`, `${reportPath} wave id`);
  requireIncludes(text, `- 动作数量：${wave.actions.length}`, `${reportPath} action count`);
  requireIncludes(text, "本报告不能直接批准 runtime 接入", `${reportPath} hard gate`);

  for (const action of wave.actions) {
    requireIncludes(text, `### ${action.action}`, `${reportPath} section ${action.action}`);
    requireIncludes(text, `来源视频：${action.sourceVideo}`, `${reportPath} source ${action.action}`);
    requireIncludes(text, `桥接入口：${action.bridge}`, `${reportPath} bridge ${action.action}`);
    requireIncludes(text, `水印门禁：${action.watermarkGate}`, `${reportPath} watermark gate ${action.action}`);
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, preflightCount: plan.waves.length }, null, 2));

function preflightPathForWave(waveId) {
  return `docs/runtime-intake-${waveId}-preflight.md`;
}

function requireIncludes(text, expected, label) {
  if (!text.includes(expected)) {
    failures.push(`${label}: expected ${expected}`);
  }
}
