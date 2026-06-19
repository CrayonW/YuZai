import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildProjectStatus } from "./project-status.mjs";

const root = process.cwd();
const statusPath = join(root, "docs", "project-status.md");
const failures = [];

if (!existsSync(statusPath)) {
  failures.push("missing docs/project-status.md; run npm run project:status -- --write docs/project-status.md");
} else {
  const actual = readFileSync(statusPath, "utf8");
  const expected = buildProjectStatus(root);
  if (actual !== expected) {
    failures.push("docs/project-status.md is not current; run npm run project:status -- --write docs/project-status.md");
  }

  const runtimeWaves = JSON.parse(readFileSync(join(root, "docs", "runtime-intake-waves.json"), "utf8"));
  const waveCount = (runtimeWaves.waves || []).length;
  const expectedBoundaryLine = `runtime 接入边界：当前 ${waveCount} 个波次均已有正式批准文件`;
  if (!actual.includes(expectedBoundaryLine)) {
    failures.push(`docs/project-status.md runtime-intake wave count is stale; expected ${waveCount}`);
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
