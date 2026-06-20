import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export function renderReleaseBlockersReport(data) {
  const lines = [
    "# 鱼仔桌宠剩余硬缺口报告",
    "",
    `更新日期：${data.updatedAt}`,
    "",
    data.purpose,
    "",
    "## 完成策略",
    "",
    `- 项目可标记完成：${data.completionPolicy.projectCanBeMarkedComplete ? "是" : "否"}`,
    `- 必须关闭全部 blocker：${data.completionPolicy.requiresAllBlockersClosed ? "是" : "否"}`,
    `- 必须通过 validate:all：${data.completionPolicy.requiresValidateAll ? "是" : "否"}`,
    `- 必须通过 release 验证：${data.completionPolicy.requiresReleaseValidation ? "是" : "否"}`,
    `- 必须有桌面验收证据：${data.completionPolicy.requiresDesktopEvidence ? "是" : "否"}`,
    "",
    "## Open Blockers",
    "",
    "| id | category | status | title | source | required actions | closure evidence |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  for (const blocker of data.blockers) {
    lines.push(
      `| ${blocker.id} | ${blocker.category} | ${blocker.status} | ${blocker.title} | ${blocker.source} | ${blocker.requiredActions.join("<br>")} | ${blocker.closureEvidence.length > 0 ? blocker.closureEvidence.join("<br>") : "未补充"} |`
    );
  }

  lines.push(
    "",
    "## 关闭规则",
    "",
    "- 不得只修改文字就关闭 blocker。",
    "- 每个 blocker 关闭前必须补充 closureEvidence。",
    "- 每个 blocker 关闭前必须重新运行 `npm run validate:all`。",
    "- 涉及发布的 blocker 关闭前必须重新运行 `npm run validate:release`。",
    "- 涉及桌面交互或动画自然度的 blocker 关闭前必须补充桌面多帧截图证据。",
    "- `docs/release-blockers.json` 和本文档必须保持同步。"
  );

  return `${lines.join("\n")}\n`;
}

export function writeReleaseBlockersReport(data, outputPath) {
  const text = renderReleaseBlockersReport(data);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, text);
  return text;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  const data = JSON.parse(readFileSync(join(root, "docs", "release-blockers.json"), "utf8"));
  const outputPath = parseWritePath(process.argv.slice(2));
  const text = outputPath ? writeReleaseBlockersReport(data, join(root, outputPath)) : renderReleaseBlockersReport(data);
  process.stdout.write(text);
}

function parseWritePath(args) {
  const index = args.indexOf("--write");
  if (index < 0) return null;
  const outputPath = args[index + 1];
  if (!outputPath) throw new Error("Missing path after --write");
  return outputPath;
}
