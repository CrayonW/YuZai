import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const approvalsDir = join(root, "docs", "runtime-intake-approvals");
const plan = readJson("docs/runtime-intake-waves.json");
const failures = [];
const waveById = new Map((plan.waves ?? []).map((wave) => [wave.id, wave]));

const approvalFiles = existsSync(approvalsDir)
  ? readdirSync(approvalsDir).filter((file) => file.endsWith(".approved.json")).sort()
  : [];

for (const file of approvalFiles) {
  const relativePath = `docs/runtime-intake-approvals/${file}`;
  let approval;
  try {
    approval = readJson(relativePath);
  } catch (error) {
    failures.push(`${relativePath}: invalid JSON (${error.message})`);
    continue;
  }

  if (!approval || typeof approval !== "object") {
    failures.push(`${relativePath}: approval must be an object`);
    continue;
  }

  const waveId = approval.waveId;
  if (typeof waveId !== "string" || waveId.length === 0) {
    failures.push(`${relativePath}: waveId is required`);
    continue;
  }

  const expectedFilename = `${waveId}.approved.json`;
  if (file !== expectedFilename) {
    failures.push(`${relativePath}: filename must match waveId (${expectedFilename})`);
  }

  const wave = waveById.get(waveId);
  if (!wave) {
    failures.push(`${relativePath}: unknown waveId ${waveId}`);
    continue;
  }

  const approvedActions = Array.isArray(approval.approvedActions)
    ? approval.approvedActions
    : Array.isArray(approval.allowedActions)
      ? approval.allowedActions
      : [];

  if (approvedActions.length === 0) {
    failures.push(`${relativePath}: approvedActions or allowedActions is required`);
    continue;
  }

  const expectedActions = wave.actions.map((action) => action.action).sort();
  const actualActions = [...approvedActions].sort();
  if (actualActions.join("\n") !== expectedActions.join("\n")) {
    failures.push(`${relativePath}: action set mismatch; expected ${expectedActions.join(", ")}, got ${actualActions.join(", ")}`);
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  approvalCount: approvalFiles.length,
  approvedWaves: approvalFiles.map((file) => file.replace(/\.approved\.json$/, ""))
}, null, 2));

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}
