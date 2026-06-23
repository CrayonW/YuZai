import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const toolPath = join(root, "scripts", "github-actions-dispatch.mjs");
const docsPath = join(root, "docs", "windows-actions-dispatch.md");
const packagePath = join(root, "package.json");
const validateAllPath = join(root, "scripts", "validate-all.mjs");
const failures = [];

if (!existsSync(toolPath)) {
  failures.push("missing scripts/github-actions-dispatch.mjs");
} else {
  const tool = readFileSync(toolPath, "utf8");
  for (const snippet of [
    "api.github.com",
    "GITHUB_TOKEN",
    "actions/workflows",
    "dispatches",
    "workflow_dispatch",
    "windows-package.yml",
    "refs/heads/main",
    "--confirm",
    "method: \"POST\"",
    "Authorization: `Bearer ${token}`"
  ]) {
    if (!tool.includes(snippet)) {
      failures.push(`scripts/github-actions-dispatch.mjs missing required text: ${snippet}`);
    }
  }
  for (const forbidden of [
    "console.log(token)",
    "console.error(token)",
    "KLING_ACCESS_KEY",
    "KLING_SECRET_KEY"
  ]) {
    if (tool.includes(forbidden)) {
      failures.push(`scripts/github-actions-dispatch.mjs must not include: ${forbidden}`);
    }
  }
}

if (!existsSync(docsPath)) {
  failures.push("missing docs/windows-actions-dispatch.md");
} else {
  const docs = readFileSync(docsPath, "utf8");
  for (const snippet of [
    "# Windows Package Actions 手动触发",
    "GITHUB_TOKEN=你的只读或 Actions workflow 权限令牌 npm run actions:windows-dispatch -- --confirm",
    "workflow：`windows-package.yml`",
    "ref：`main`",
    "不替代 Windows 实机验收",
    "不调用可灵生成视频",
    "触发后继续使用 `npm run actions:windows-status` 查询 run 和 artifact"
  ]) {
    if (!docs.includes(snippet)) {
      failures.push(`docs/windows-actions-dispatch.md missing required text: ${snippet}`);
    }
  }
}

if (!existsSync(packagePath)) {
  failures.push("missing package.json");
} else {
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  if (pkg.scripts?.["actions:windows-dispatch"] !== "node scripts/github-actions-dispatch.mjs --workflow windows-package.yml --ref main") {
    failures.push("package.json missing actions:windows-dispatch script");
  }
  if (pkg.scripts?.["validate:github-actions-dispatch-tool"] !== "node scripts/validate-github-actions-dispatch-tool.mjs") {
    failures.push("package.json missing validate:github-actions-dispatch-tool script");
  }
}

if (!existsSync(validateAllPath)) {
  failures.push("missing scripts/validate-all.mjs");
} else {
  const validateAll = readFileSync(validateAllPath, "utf8");
  if (!validateAll.includes("validate:github-actions-dispatch-tool")) {
    failures.push("scripts/validate-all.mjs must include validate:github-actions-dispatch-tool");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
