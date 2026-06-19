import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildActionTransitionRiskReport,
  renderActionTransitionRiskReport
} from "./action-transition-risk-report.mjs";

const root = process.cwd();
const reportPath = join(root, "docs", "action-transition-risk-report.md");
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");
const failures = [];

for (const path of [reportPath, manifestPath]) {
  if (!existsSync(path)) failures.push(`missing ${relative(path)}`);
}

if (failures.length === 0) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const expected = renderActionTransitionRiskReport(buildActionTransitionRiskReport(manifest));
  const actual = readFileSync(reportPath, "utf8");

  if (actual !== expected) {
    failures.push("docs/action-transition-risk-report.md is not current; run npm run animations:transition-risk -- --write docs/action-transition-risk-report.md");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));

function relative(path) {
  return path.startsWith(`${root}/`) ? path.slice(root.length + 1) : path;
}
