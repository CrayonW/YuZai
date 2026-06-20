import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const workflowPath = join(root, ".github/workflows/windows-package.yml");
const packagePath = join(root, "package.json");
const failures = [];

if (!existsSync(workflowPath)) {
  failures.push("missing .github/workflows/windows-package.yml");
} else {
  const workflow = readFileSync(workflowPath, "utf8");
  const requiredSnippets = [
    "name: Windows Package",
    "workflow_dispatch:",
    "push:",
    "branches:",
    "- main",
    "paths:",
    "\"package.json\"",
    "\"package-lock.json\"",
    "\"esbuild.config.mjs\"",
    "\"src/**\"",
    "\"assets/runtime/**\"",
    "\"build/icon.ico\"",
    "\".github/workflows/windows-package.yml\"",
    "runs-on: windows-latest",
    "actions/checkout@v4",
    "actions/setup-node@v4",
    "node-version: 20",
    "cache: npm",
    "npm ci",
    "npm run validate:release-readiness",
    "npm run package:win",
    "actions/upload-artifact@v4",
    "name: yuzai-windows-package",
    "release/*.exe",
    "release/win-unpacked/**",
    "if-no-files-found: error",
    "retention-days: 14"
  ];

  for (const snippet of requiredSnippets) {
    if (!workflow.includes(snippet)) {
      failures.push(`.github/workflows/windows-package.yml missing required text: ${snippet}`);
    }
  }

  for (const forbidden of [
    "npm run kling:",
    "KLING_ACCESS_KEY",
    "KLING_SECRET_KEY",
    "assets/origin/**",
    "release/**"
  ]) {
    if (workflow.includes(forbidden)) {
      failures.push(`.github/workflows/windows-package.yml must not include: ${forbidden}`);
    }
  }
}

if (!existsSync(packagePath)) {
  failures.push("missing package.json");
} else {
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  if (pkg.scripts?.["package:win"] !== "npm run build && electron-builder --win nsis") {
    failures.push("package.json package:win must build the Windows NSIS installer");
  }
  if (pkg.scripts?.["validate:windows-package-workflow"] !== "node scripts/validate-windows-package-workflow.mjs") {
    failures.push("package.json missing validate:windows-package-workflow script");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
