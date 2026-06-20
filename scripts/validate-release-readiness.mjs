import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const playbookPath = join(root, "docs/release-playbook.md");
const auditPath = join(root, "docs/project-completion-audit.md");
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
    "面向最终用户的安装/回滚说明",
    "卸载说明",
    "版本标签",
    "正式签名",
    "macOS 公证"
  ]) {
    if (!audit.includes(snippet)) {
      failures.push(`docs/project-completion-audit.md missing release readiness text: ${snippet}`);
    }
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
