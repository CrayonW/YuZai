import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const blockersPath = join(root, "docs/release-blockers.json");
const blockersReportPath = join(root, "docs/release-blockers.md");
const auditPath = join(root, "docs/project-completion-audit.md");
const packagePath = join(root, "package.json");
const failures = [];

const transitionRecoveryEvidencePaths = [
  "docs/kling-preflight-transition-out-recovery.md",
  "docs/kling-batch-status-transition-out-recovery.md",
  "docs/kling-batch-intake-transition-out-recovery.md",
  "docs/kling-generated-video-audit.md",
  "docs/runtime-intake-transition-out-recovery-dry-run.md",
  "docs/runtime-intake-transition-out-recovery-proposal.md"
];

const transitionRecoveryActions = [
  "sleep_to_sleeping",
  "waking_to_idle",
  "poke_annoyed_to_idle",
  "paw_raise_to_idle"
];

const macosSigningStatusPath = "docs/macos-signing-notarization-status.md";

const requiredBlockerIds = [
  "transition_out_high_risk",
  "runtime_duration_short",
  "windows_real_machine_smoke",
  "macos_sign_notarize",
  "signed_user_safety_recheck"
];

const allowedClosedBlockers = new Set(["transition_out_high_risk", "runtime_duration_short"]);

if (!existsSync(blockersPath)) {
  failures.push("missing docs/release-blockers.json");
} else {
  const data = JSON.parse(readFileSync(blockersPath, "utf8"));
  if (data.completionPolicy?.projectCanBeMarkedComplete !== false) {
    failures.push("docs/release-blockers.json must keep projectCanBeMarkedComplete false while blockers are open");
  }
  if (data.completionPolicy?.requiresAllBlockersClosed !== true) {
    failures.push("docs/release-blockers.json must require all blockers closed");
  }
  if (data.completionPolicy?.requiresValidateAll !== true) {
    failures.push("docs/release-blockers.json must require validate:all");
  }
  if (data.completionPolicy?.requiresReleaseValidation !== true) {
    failures.push("docs/release-blockers.json must require release validation");
  }
  if (!Array.isArray(data.blockers)) {
    failures.push("docs/release-blockers.json blockers must be an array");
  } else {
    const byId = new Map(data.blockers.map((blocker) => [blocker.id, blocker]));
    for (const id of requiredBlockerIds) {
      if (!byId.has(id)) {
        failures.push(`docs/release-blockers.json missing blocker: ${id}`);
      }
    }
    for (const blocker of data.blockers) {
      if (!blocker.id || !requiredBlockerIds.includes(blocker.id)) {
        failures.push(`docs/release-blockers.json has unknown blocker id: ${blocker.id ?? "<missing>"}`);
      }
      if (blocker.status !== "open" && blocker.status !== "closed") {
        failures.push(`docs/release-blockers.json blocker has invalid status: ${blocker.id}`);
      }
      if (blocker.status === "closed" && !allowedClosedBlockers.has(blocker.id)) {
        failures.push(`docs/release-blockers.json blocker must stay open until its closure flow is implemented: ${blocker.id}`);
      }
      for (const key of ["title", "category", "source"]) {
        if (!blocker[key]) {
          failures.push(`docs/release-blockers.json ${blocker.id} missing ${key}`);
        }
      }
      if (!Array.isArray(blocker.evidence) || blocker.evidence.length === 0) {
        failures.push(`docs/release-blockers.json ${blocker.id} must list evidence`);
      }
      if (!Array.isArray(blocker.requiredActions) || blocker.requiredActions.length === 0) {
        failures.push(`docs/release-blockers.json ${blocker.id} must list requiredActions`);
      }
      if (!Array.isArray(blocker.closureEvidence)) {
        failures.push(`docs/release-blockers.json ${blocker.id} closureEvidence must be an array`);
      }
      if (blocker.status === "closed" && blocker.closureEvidence.length === 0) {
        failures.push(`docs/release-blockers.json ${blocker.id} closed blocker must list closureEvidence`);
      }
      if (blocker.status === "open" && blocker.closureEvidence.length > 0) {
        failures.push(`docs/release-blockers.json ${blocker.id} open blocker must not list closureEvidence`);
      }
    }
    const transitionBlocker = byId.get("transition_out_high_risk");
    if (transitionBlocker) {
      for (const evidencePath of transitionRecoveryEvidencePaths) {
        if (!transitionBlocker.evidence?.includes(evidencePath)) {
          failures.push(`transition_out_high_risk evidence must include ${evidencePath}`);
        }
      }
    }
    for (const id of ["macos_sign_notarize", "signed_user_safety_recheck"]) {
      const blocker = byId.get(id);
      if (blocker && !blocker.evidence?.includes(macosSigningStatusPath)) {
        failures.push(`${id} evidence must include ${macosSigningStatusPath}`);
      }
    }
  }
}

for (const evidencePath of transitionRecoveryEvidencePaths) {
  const absolutePath = join(root, evidencePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${evidencePath}`);
    continue;
  }
  const text = readFileSync(absolutePath, "utf8");
  if (!text.includes("transition-out-recovery")) {
    failures.push(`${evidencePath} must reference transition-out-recovery`);
  }
  for (const action of transitionRecoveryActions) {
    if (!text.includes(action)) {
      failures.push(`${evidencePath} missing transition action ${action}`);
    }
  }
}

if (existsSync(join(root, "docs/kling-batch-status-transition-out-recovery.md"))) {
  const status = readFileSync(join(root, "docs/kling-batch-status-transition-out-recovery.md"), "utf8");
  if (!status.includes("ready 4") || !status.includes("missing 0")) {
    failures.push("docs/kling-batch-status-transition-out-recovery.md must record 4 ready transition videos");
  }
}

if (existsSync(join(root, "docs/action-transition-risk-report.md"))) {
  const riskReport = readFileSync(join(root, "docs/action-transition-risk-report.md"), "utf8");
  for (const bridge of transitionRecoveryActions) {
    if (!riskReport.includes(`| high | 回切 |`) || !riskReport.includes(`| ${bridge} | 已配置 ${bridge}`)) {
      failures.push(`docs/action-transition-risk-report.md must show current bridge ${bridge}`);
    }
  }
}

if (!existsSync(join(root, macosSigningStatusPath))) {
  failures.push(`missing ${macosSigningStatusPath}`);
} else {
  const signingStatus = readFileSync(join(root, macosSigningStatusPath), "utf8");
  for (const snippet of [
    "签名 identity：null",
    "macos_sign_notarize：open",
    "signed_user_safety_recheck：open",
    "不执行签名、不调用 notarytool、不上传 Apple 公证"
  ]) {
    if (!signingStatus.includes(snippet)) {
      failures.push(`${macosSigningStatusPath} missing signing blocker text: ${snippet}`);
    }
  }
}

if (!existsSync(blockersReportPath)) {
  failures.push("missing docs/release-blockers.md");
} else {
  const report = readFileSync(blockersReportPath, "utf8");
  for (const snippet of [
    "# 鱼仔桌宠剩余硬缺口报告",
    "项目可标记完成：否",
    "transition_out_high_risk",
    "runtime_duration_short",
    "windows_real_machine_smoke",
    "macos_sign_notarize",
    "signed_user_safety_recheck",
    "docs/macos-signing-notarization-status.md",
    "`docs/release-blockers.json` 和本文档必须保持同步"
  ]) {
    if (!report.includes(snippet)) {
      failures.push(`docs/release-blockers.md missing release blocker report text: ${snippet}`);
    }
  }
}

if (!existsSync(auditPath)) {
  failures.push("missing docs/project-completion-audit.md");
} else {
  const audit = readFileSync(auditPath, "utf8");
  for (const snippet of [
    "docs/release-blockers.json",
    "项目不得标记为完全完成",
    "transition_out_high_risk",
    "runtime_duration_short",
    "windows_real_machine_smoke",
    "macos_sign_notarize",
    "signed_user_safety_recheck"
  ]) {
    if (!audit.includes(snippet)) {
      failures.push(`docs/project-completion-audit.md missing release blocker text: ${snippet}`);
    }
  }
}

if (!existsSync(packagePath)) {
  failures.push("missing package.json");
} else {
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  if (pkg.scripts?.["validate:release-blockers"] !== "node scripts/validate-release-blockers.mjs") {
    failures.push("package.json missing validate:release-blockers script");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
