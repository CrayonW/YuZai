import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const toolPath = join(root, "scripts/github-actions-status.mjs");
const docsPath = join(root, "docs/windows-actions-status.md");
const packagePath = join(root, "package.json");
const failures = [];

if (!existsSync(toolPath)) {
  failures.push("missing scripts/github-actions-status.mjs");
} else {
  const tool = readFileSync(toolPath, "utf8");
  for (const snippet of [
    "api.github.com",
    "GITHUB_TOKEN",
    "actions/workflows",
    "actions/runs",
    "artifacts",
    "windows-package.yml",
    "yuzai-windows-package",
    "archiveDownloadUrl",
    "authenticated: Boolean(token)"
  ]) {
    if (!tool.includes(snippet)) {
      failures.push(`scripts/github-actions-status.mjs missing required text: ${snippet}`);
    }
  }
  for (const forbidden of [
    "console.log(token)",
    "console.error(token)",
    "KLING_ACCESS_KEY",
    "KLING_SECRET_KEY"
  ]) {
    if (tool.includes(forbidden)) {
      failures.push(`scripts/github-actions-status.mjs must not include: ${forbidden}`);
    }
  }
}

if (!existsSync(docsPath)) {
  failures.push("missing docs/windows-actions-status.md");
} else {
  const docs = readFileSync(docsPath, "utf8");
  for (const snippet of [
    "# Windows Package Actions 状态查询",
    "npm run actions:windows-status",
    "GITHUB_TOKEN",
    "windows-package.yml",
    "yuzai-windows-package",
    "GitHub API rate limit",
    "不调用可灵生成视频",
    "不替代 Windows 实机验收"
  ]) {
    if (!docs.includes(snippet)) {
      failures.push(`docs/windows-actions-status.md missing required text: ${snippet}`);
    }
  }
}

if (!existsSync(packagePath)) {
  failures.push("missing package.json");
} else {
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  if (pkg.scripts?.["actions:windows-status"] !== "node scripts/github-actions-status.mjs --workflow windows-package.yml --artifact yuzai-windows-package") {
    failures.push("package.json missing actions:windows-status script");
  }
  if (pkg.scripts?.["validate:github-actions-status-tool"] !== "node scripts/validate-github-actions-status-tool.mjs") {
    failures.push("package.json missing validate:github-actions-status-tool script");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
