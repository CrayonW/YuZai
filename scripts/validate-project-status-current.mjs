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
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
