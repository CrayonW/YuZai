import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const playbookPath = join(root, "docs/release-playbook.md");
const auditPath = join(root, "docs/project-completion-audit.md");
const tagRecordPath = join(root, "docs/release-tag-record.md");
const signedSafetyPath = join(root, "docs/signed-release-safety.md");
const macosSigningStatusPath = join(root, "docs/macos-signing-notarization-status.md");
const windowsSmokePath = join(root, "docs/windows-release-smoke.md");
const windowsWorkflowPath = join(root, ".github/workflows/windows-package.yml");
const releaseBlockersPath = join(root, "docs/release-blockers.json");
const releaseBlockersReportPath = join(root, "docs/release-blockers.md");
const windowsActionsStatusPath = join(root, "docs/windows-actions-status.md");
const failures = [];

if (!existsSync(playbookPath)) {
  failures.push("missing docs/release-playbook.md");
} else {
  const text = readFileSync(playbookPath, "utf8");
  const requiredSnippets = [
    "# 鱼仔桌宠试用分发手册",
    "npm run validate:release",
    "release/mac-arm64/鱼仔桌面宠物.app",
    "首次打开",
    "安装步骤",
    "回滚步骤",
    "卸载步骤",
    "版本标签与回滚 commit",
    "已知限制",
    "不包含 `assets/origin`",
    "签名与公证",
    "git tag -a",
    "docs/release-tag-record.md",
    "docs/signed-release-safety.md",
    "docs/macos-signing-notarization-status.md",
    "docs/windows-release-smoke.md",
    "docs/release-blockers.json",
    "docs/release-blockers.md",
    "docs/windows-actions-status.md",
    ".github/workflows/windows-package.yml",
    "actions:windows-status",
    "项目不得标记为完全完成",
    "transitionOut",
    "不调用可灵生成视频"
  ];

  for (const snippet of requiredSnippets) {
    if (!text.includes(snippet)) {
      failures.push(`docs/release-playbook.md missing required text: ${snippet}`);
    }
  }
}

if (!existsSync(auditPath)) {
  failures.push("missing docs/project-completion-audit.md");
} else {
  const audit = readFileSync(auditPath, "utf8");
  for (const snippet of [
    "docs/release-playbook.md",
    "docs/release-tag-record.md",
    "docs/signed-release-safety.md",
    "docs/macos-signing-notarization-status.md",
    "面向最终用户的安装/回滚说明",
    "卸载说明",
    "版本标签",
    "正式签名",
    "macOS 公证",
    "docs/windows-release-smoke.md",
    "Windows 实机验收",
    ".github/workflows/windows-package.yml",
    "docs/release-blockers.json",
    "docs/release-blockers.md",
    "docs/windows-actions-status.md",
    "项目不得标记为完全完成"
  ]) {
    if (!audit.includes(snippet)) {
      failures.push(`docs/project-completion-audit.md missing release readiness text: ${snippet}`);
    }
  }
}

if (!existsSync(signedSafetyPath)) {
  failures.push("missing docs/signed-release-safety.md");
} else {
  const signedSafety = readFileSync(signedSafetyPath, "utf8");
  for (const snippet of [
    "# 鱼仔桌宠签名包安全提示",
    "未签名试用包",
    "正式签名与公证",
    "Gatekeeper",
    "不要绕过未知来源安全提示",
    "release/mac-arm64/鱼仔桌面宠物.app",
    "docs/macos-signing-notarization-status.md",
    "yuzai-v0.1.0-test.1",
    "不调用可灵生成视频"
  ]) {
    if (!signedSafety.includes(snippet)) {
      failures.push(`docs/signed-release-safety.md missing safety text: ${snippet}`);
    }
  }
}

if (!existsSync(macosSigningStatusPath)) {
  failures.push("missing docs/macos-signing-notarization-status.md");
} else {
  const macosSigningStatus = readFileSync(macosSigningStatusPath, "utf8");
  for (const snippet of [
    "# macOS 签名与公证状态报告",
    "签名 identity：null",
    "macos_sign_notarize：open",
    "signed_user_safety_recheck：open",
    "不执行签名、不调用 notarytool、不上传 Apple 公证"
  ]) {
    if (!macosSigningStatus.includes(snippet)) {
      failures.push(`docs/macos-signing-notarization-status.md missing signing status text: ${snippet}`);
    }
  }
}

if (!existsSync(windowsSmokePath)) {
  failures.push("missing docs/windows-release-smoke.md");
} else {
  const windowsSmoke = readFileSync(windowsSmokePath, "utf8");
  for (const snippet of [
    "# 鱼仔桌宠 Windows 试用验收清单",
    "npm run package:win",
    "Windows 实机验收",
    ".github/workflows/windows-package.yml",
    "docs/windows-actions-status.md",
    "安装包",
    "卸载",
    "透明置顶",
    "鼠标靠近",
    "定时气泡",
    "不调用可灵生成视频",
    "transitionOut"
  ]) {
    if (!windowsSmoke.includes(snippet)) {
      failures.push(`docs/windows-release-smoke.md missing smoke text: ${snippet}`);
    }
  }
}

if (!existsSync(releaseBlockersPath)) {
  failures.push("missing docs/release-blockers.json");
} else {
  const releaseBlockers = JSON.parse(readFileSync(releaseBlockersPath, "utf8"));
  const blockers = releaseBlockers.blockers ?? [];
  for (const id of [
    "transition_out_high_risk",
    "runtime_duration_short",
    "windows_real_machine_smoke",
    "macos_sign_notarize",
    "signed_user_safety_recheck"
  ]) {
    if (!blockers.some((blocker) => blocker.id === id && blocker.status === "open")) {
      failures.push(`docs/release-blockers.json missing open blocker: ${id}`);
    }
  }
  if (releaseBlockers.completionPolicy?.projectCanBeMarkedComplete !== false) {
    failures.push("docs/release-blockers.json must keep projectCanBeMarkedComplete false");
  }
}

if (!existsSync(releaseBlockersReportPath)) {
  failures.push("missing docs/release-blockers.md");
} else {
  const releaseBlockersReport = readFileSync(releaseBlockersReportPath, "utf8");
  for (const snippet of [
    "# 鱼仔桌宠剩余硬缺口报告",
    "项目可标记完成：否",
    "Open Blockers",
    "transition_out_high_risk",
    "windows_real_machine_smoke"
  ]) {
    if (!releaseBlockersReport.includes(snippet)) {
      failures.push(`docs/release-blockers.md missing release readiness text: ${snippet}`);
    }
  }
}

if (!existsSync(windowsActionsStatusPath)) {
  failures.push("missing docs/windows-actions-status.md");
} else {
  const windowsActionsStatus = readFileSync(windowsActionsStatusPath, "utf8");
  for (const snippet of [
    "# Windows Package Actions 状态查询",
    "npm run actions:windows-status",
    "GITHUB_TOKEN",
    "windows-package.yml",
    "yuzai-windows-package",
    "不替代 Windows 实机验收"
  ]) {
    if (!windowsActionsStatus.includes(snippet)) {
      failures.push(`docs/windows-actions-status.md missing actions status text: ${snippet}`);
    }
  }
}

if (!existsSync(windowsWorkflowPath)) {
  failures.push("missing .github/workflows/windows-package.yml");
} else {
  const windowsWorkflow = readFileSync(windowsWorkflowPath, "utf8");
  for (const snippet of [
    "name: Windows Package",
    "runs-on: windows-latest",
    "npm ci",
    "npm run validate:release-readiness",
    "npm run package:win",
    "actions/upload-artifact",
    "yuzai-windows-package"
  ]) {
    if (!windowsWorkflow.includes(snippet)) {
      failures.push(`.github/workflows/windows-package.yml missing workflow text: ${snippet}`);
    }
  }
}

if (!existsSync(tagRecordPath)) {
  failures.push("missing docs/release-tag-record.md");
} else {
  const tagRecord = readFileSync(tagRecordPath, "utf8");
  for (const snippet of [
    "# 鱼仔桌宠试用标签记录",
    "yuzai-v0.1.0-test.1",
    "f3e8da05269f4e95195bc6ca39b12a8bf825372e",
    "refs/tags/yuzai-v0.1.0-test.1",
    "npm run validate:release",
    "不调用可灵生成视频"
  ]) {
    if (!tagRecord.includes(snippet)) {
      failures.push(`docs/release-tag-record.md missing release tag text: ${snippet}`);
    }
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
