import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const proposalPath = join(root, "docs", "runtime-intake-transition-out-recovery-proposal.md");
const wavesPath = join(root, "docs", "runtime-intake-waves.json");
const approvalPath = join(root, "docs", "runtime-intake-approvals", "transition-out-recovery.approved.json");
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");

const expectedActions = [
  {
    action: "sleep_to_sleeping",
    sourceAction: "sleep",
    sourceVideo: "assets/origin/generated/kling/sleep_to_sleeping.mp4",
    reviewEvidence: "assets/reviews/kling-generated/sleep_to_sleeping.png",
    runtimeFrameRoot: "assets/runtime/animations/sleep_to_sleeping/frames",
    returnTo: "sleeping"
  },
  {
    action: "waking_to_idle",
    sourceAction: "waking",
    sourceVideo: "assets/origin/generated/kling/waking_to_idle.mp4",
    reviewEvidence: "assets/reviews/kling-generated/waking_to_idle.png",
    runtimeFrameRoot: "assets/runtime/animations/waking_to_idle/frames",
    returnTo: "idle_primary"
  },
  {
    action: "poke_annoyed_to_idle",
    sourceAction: "poke_annoyed",
    allowedRuntimeTransitionOut: ["poke_annoyed_to_idle", "poke_annoyed_to_idle_primary"],
    sourceVideo: "assets/origin/generated/kling/poke_annoyed_to_idle.mp4",
    reviewEvidence: "assets/reviews/kling-generated/poke_annoyed_to_idle.png",
    runtimeFrameRoot: "assets/runtime/animations/poke_annoyed_to_idle/frames",
    returnTo: "idle_primary"
  },
  {
    action: "paw_raise_to_idle",
    sourceAction: "paw_raise",
    allowedRuntimeTransitionOut: ["paw_raise_to_idle", "paw_raise_to_idle_primary"],
    sourceVideo: "assets/origin/generated/kling/paw_raise_to_idle.mp4",
    reviewEvidence: "assets/reviews/kling-generated/paw_raise_to_idle.png",
    runtimeFrameRoot: "assets/runtime/animations/paw_raise_to_idle/frames",
    returnTo: "idle_primary"
  }
];

const failures = [];

for (const path of [proposalPath, wavesPath, manifestPath]) {
  if (!existsSync(path)) failures.push(`missing ${relative(path)}`);
}

if (failures.length === 0) {
  const proposal = readFileSync(proposalPath, "utf8");
  const waves = JSON.parse(readFileSync(wavesPath, "utf8"));
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const approval = existsSync(approvalPath) ? JSON.parse(readFileSync(approvalPath, "utf8")) : null;

  const wave = waves.waves?.find((item) => item.id === "transition-out-recovery");
  if (!wave) {
    failures.push("transition-out-recovery must be a formal runtime-intake wave after videos and review evidence exist");
  }

  if (!approval) {
    failures.push("transition-out-recovery approved file must exist after user confirmation and source video review");
  } else {
    const expectedActionNames = expectedActions.map((item) => item.action).sort();
    const approvedActionNames = Array.isArray(approval.approvedActions) ? [...approval.approvedActions].sort() : [];
    if (approval.waveId !== "transition-out-recovery") {
      failures.push("transition-out-recovery approval waveId must match");
    }
    if (approvedActionNames.join("\n") !== expectedActionNames.join("\n")) {
      failures.push(`transition-out-recovery approval action set mismatch: ${approvedActionNames.join(", ") || "missing"}`);
    }
  }

  for (const expected of expectedActions) {
    if (!proposal.includes(expected.action)) failures.push(`proposal missing ${expected.action}`);
    if (!existsSync(join(root, expected.sourceVideo))) failures.push(`missing generated video: ${expected.sourceVideo}`);
    if (!existsSync(join(root, expected.reviewEvidence))) failures.push(`missing review evidence: ${expected.reviewEvidence}`);

    const waveAction = wave?.actions?.find((item) => item.action === expected.action);
    if (!waveAction) {
      failures.push(`transition-out-recovery wave missing ${expected.action}`);
    } else {
      if (waveAction.category !== "transition") failures.push(`${expected.action}: category must be transition`);
      if (waveAction.sourceVideo !== expected.sourceVideo) failures.push(`${expected.action}: sourceVideo mismatch`);
      if (!waveAction.reviewEvidence?.includes(expected.reviewEvidence)) failures.push(`${expected.action}: reviewEvidence mismatch`);
      if (waveAction.runtimeFrameRoot !== expected.runtimeFrameRoot) failures.push(`${expected.action}: runtimeFrameRoot mismatch`);
      if (waveAction.loop === true) failures.push(`${expected.action}: transition action must not loop`);
      if (waveAction.returnTo !== expected.returnTo) failures.push(`${expected.action}: returnTo must be ${expected.returnTo}`);
    }

    if (manifest.actions?.[expected.action] && manifest.actions[expected.action].category !== "transition") {
      failures.push(`${expected.action} runtime manifest category must be transition`);
    }
    const allowedRuntimeTransitionOut = expected.allowedRuntimeTransitionOut ?? [expected.action];
    if (manifest.actions?.[expected.action] && !allowedRuntimeTransitionOut.includes(manifest.actions?.[expected.sourceAction]?.transitionOut)) {
      failures.push(`${expected.sourceAction}.transitionOut must be one of ${allowedRuntimeTransitionOut.join(", ")}`);
    }
  }

  for (const required of [
    "视频已生成",
    "正式 runtime-intake 波次",
    "docs/runtime-intake-approvals/transition-out-recovery.approved.json",
    "下一步允许抽帧、去水印/抠绿、写入 runtime manifest"
  ]) {
    if (!proposal.includes(required)) failures.push(`proposal missing upgraded status: ${required}`);
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
