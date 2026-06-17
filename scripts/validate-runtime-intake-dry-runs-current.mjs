import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  buildRuntimeIntakeExecutionPlan,
  renderRuntimeIntakeExecutionPlan
} from "./runtime-intake-executor.mjs";

const root = process.cwd();
const plan = readJson("docs/runtime-intake-waves.json");
const manifest = readJson("assets/runtime/animations/manifest.json");
const bridges = readJson("assets/config/action-bridges.json");
const failures = [];

for (const wave of plan.waves ?? []) {
  const reportPath = dryRunPathForWave(wave.id);
  const absoluteReportPath = join(root, reportPath);
  if (!existsSync(absoluteReportPath)) {
    failures.push(`missing dry-run report for ${wave.id}: ${reportPath}`);
    continue;
  }

  const executionPlan = buildRuntimeIntakeExecutionPlan({
    plan,
    waveId: wave.id,
    manifest,
    bridges
  });
  const expected = normalize(renderRuntimeIntakeExecutionPlan(executionPlan));
  const actual = normalize(readFileSync(absoluteReportPath, "utf8"));

  if (actual !== expected) {
    failures.push(`${reportPath}: dry-run report is stale; regenerate with npm run runtime:intake-executor -- --wave ${wave.id} --dry-run --write ${reportPath}`);
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, dryRunCount: plan.waves.length }, null, 2));

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

function dryRunPathForWave(waveId) {
  return `docs/runtime-intake-${waveId}-dry-run.md`;
}

function normalize(text) {
  return text.replace(/\r\n/g, "\n").trim();
}
