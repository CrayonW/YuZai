import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const blockersPath = join(root, "docs/release-blockers.json");
const auditPath = join(root, "docs/project-completion-audit.md");
const packagePath = join(root, "package.json");
const failures = [];

const requiredBlockerIds = [
  "transition_out_high_risk",
  "runtime_duration_short",
  "windows_real_machine_smoke",
  "macos_sign_notarize",
  "signed_user_safety_recheck"
];

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
      if (blocker.status !== "open") {
        failures.push(`docs/release-blockers.json blocker must stay open until closure evidence exists: ${blocker.id}`);
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
