import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderReleaseBlockersReport } from "./release-blockers-report.mjs";

const root = process.cwd();
const jsonPath = join(root, "docs", "release-blockers.json");
const reportPath = join(root, "docs", "release-blockers.md");
const failures = [];

for (const path of [jsonPath, reportPath]) {
  if (!existsSync(path)) {
    failures.push(`missing ${relative(path)}`);
  }
}

if (failures.length === 0) {
  const data = JSON.parse(readFileSync(jsonPath, "utf8"));
  const expected = renderReleaseBlockersReport(data);
  const actual = readFileSync(reportPath, "utf8");

  if (actual !== expected) {
    failures.push("docs/release-blockers.md is not current; run npm run release:blockers-report -- --write docs/release-blockers.md");
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
