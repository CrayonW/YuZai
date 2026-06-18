import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { extractPetStateNames } from "./manifest-contract.mjs";
import { buildStateBacklog, renderStateBacklog } from "./state-backlog.mjs";
import { buildStateCoverageReport } from "./state-coverage-report.mjs";

const root = process.cwd();
const backlogPath = join(root, "docs", "state-backlog.md");
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");
const stateTypesPath = join(root, "src", "core", "fsm", "state-types.ts");
const planPath = join(root, "docs", "kling-action-generation-plan.json");
const failures = [];

for (const path of [backlogPath, manifestPath, stateTypesPath, planPath]) {
  if (!existsSync(path)) {
    failures.push(`missing ${relative(path)}`);
  }
}

if (failures.length === 0) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const stateSource = readFileSync(stateTypesPath, "utf8");
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  const coverage = buildStateCoverageReport({
    manifest,
    stateNames: extractPetStateNames(stateSource),
    promptActions: (plan.actions || []).map((action) => action.action)
  });
  const expected = renderStateBacklog(buildStateBacklog({ coverage, plan, root }));
  const actual = readFileSync(backlogPath, "utf8");

  if (actual !== expected) {
    failures.push("docs/state-backlog.md is not current; run npm run animations:state-backlog -- --write docs/state-backlog.md");
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
