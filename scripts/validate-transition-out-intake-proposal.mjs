import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const proposalPath = join(root, "docs", "runtime-intake-transition-out-recovery-proposal.md");
const wavesPath = join(root, "docs", "runtime-intake-waves.json");
const approvalPath = join(root, "docs", "runtime-intake-approvals", "transition-out-recovery.approved.json");
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");

const expectedActions = [
  "sleep_to_sleeping",
  "waking_to_idle",
  "poke_annoyed_to_idle",
  "paw_raise_to_idle"
];

const failures = [];

for (const path of [proposalPath, wavesPath, manifestPath]) {
  if (!existsSync(path)) failures.push(`missing ${relative(path)}`);
}

if (failures.length === 0) {
  const proposal = readFileSync(proposalPath, "utf8");
  const waves = JSON.parse(readFileSync(wavesPath, "utf8"));
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (waves.waves?.some((wave) => wave.id === "transition-out-recovery")) {
    failures.push("transition-out-recovery must stay out of docs/runtime-intake-waves.json until videos and review evidence exist");
  }

  if (existsSync(approvalPath)) {
    failures.push("transition-out-recovery approved file must not exist before user confirmation and source video review");
  }

  for (const action of expectedActions) {
    if (!proposal.includes(action)) failures.push(`proposal missing ${action}`);
    if (manifest.actions?.[action]) failures.push(`${action} must not be present in runtime manifest before approval`);
  }

  for (const forbidden of [
    "禁止创建 `docs/runtime-intake-approvals/transition-out-recovery.approved.json`",
    "禁止把本提案加入 `docs/runtime-intake-waves.json`",
    "禁止抽帧",
    "禁止修改 `assets/runtime/animations/manifest.json` 的 `transitionOut` 字段"
  ]) {
    if (!proposal.includes(forbidden)) failures.push(`proposal missing boundary: ${forbidden}`);
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
