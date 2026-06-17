import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const approvalsDir = join(root, "docs", "runtime-intake-approvals");
const plan = readJson("docs/runtime-intake-waves.json");
const waveById = new Map((plan.waves ?? []).map((wave) => [wave.id, wave]));
const failures = [];

const exampleFiles = existsSync(approvalsDir)
  ? readdirSync(approvalsDir).filter((file) => file.endsWith(".example.json")).sort()
  : [];

for (const file of exampleFiles) {
  const relativePath = `docs/runtime-intake-approvals/${file}`;
  let example;
  try {
    example = readJson(relativePath);
  } catch (error) {
    failures.push(`${relativePath}: invalid JSON (${error.message})`);
    continue;
  }

  if (!example || typeof example !== "object") {
    failures.push(`${relativePath}: example must be an object`);
    continue;
  }
  if (example.exampleOnly !== true) {
    failures.push(`${relativePath}: exampleOnly must be true`);
  }

  const waveId = example.waveId;
  if (typeof waveId !== "string" || waveId.length === 0) {
    failures.push(`${relativePath}: waveId is required`);
    continue;
  }

  const expectedFilename = `${waveId}.example.json`;
  if (file !== expectedFilename) {
    failures.push(`${relativePath}: filename must match waveId (${expectedFilename})`);
  }

  const approvedFilename = `${waveId}.approved.json`;
  if (file === approvedFilename) {
    failures.push(`${relativePath}: example file must not use .approved.json suffix`);
  }

  const wave = waveById.get(waveId);
  if (!wave) {
    failures.push(`${relativePath}: unknown waveId ${waveId}`);
    continue;
  }

  const approvedActions = Array.isArray(example.approvedActions) ? example.approvedActions : [];
  const expectedActions = wave.actions.map((action) => action.action).sort();
  const actualActions = [...approvedActions].sort();
  if (actualActions.join("\n") !== expectedActions.join("\n")) {
    failures.push(`${relativePath}: action set mismatch; expected ${expectedActions.join(", ")}, got ${actualActions.join(", ") || "missing"}`);
  }

  requireString(example.sourceChecklist, `${relativePath}: sourceChecklist`);
  requireString(example.sourcePreflight, `${relativePath}: sourcePreflight`);
  requireString(example.sourceDryRun, `${relativePath}: sourceDryRun`);
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  exampleCount: exampleFiles.length,
  exampleWaves: exampleFiles.map((file) => file.replace(/\.example\.json$/, ""))
}, null, 2));

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    failures.push(`${label} is required`);
  }
}
