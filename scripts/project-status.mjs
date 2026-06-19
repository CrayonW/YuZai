import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const defaultOutputPath = join(root, "docs", "project-status.md");

export function buildProjectStatus(rootDir = root) {
  const mvpEvidence = readJson(join(rootDir, "docs", "mvp-evidence.json"));
  const coverageText = readText(join(rootDir, "docs", "state-coverage.md"));
  const backlogText = readText(join(rootDir, "docs", "state-backlog.md"));
  const runtimeWaves = readJson(join(rootDir, "docs", "runtime-intake-waves.json"));
  const productionLog = readText(join(rootDir, "docs", "animation-production-log.md"));

  const mvpVerified = (mvpEvidence.items || []).filter((item) => item.status === "verified").length;
  const mvpTotal = (mvpEvidence.items || []).length;
  const coverageSummary = extractRequired(coverageText, /覆盖摘要：(.+)/, "state coverage summary");
  const backlogCount = extractRequired(backlogText, /待补状态数：(\d+)/, "state backlog count");
  const draggingRow = backlogCount === "0" ? "" : extractRequired(backlogText, /\| dragging \| ([^\n]+)/, "dragging backlog row");
  const startupEvidence = productionLog.includes("猫咪头顶区域无“喝口水吧”或其他气泡文字");
  const approvals = collectRuntimeApprovals(rootDir, runtimeWaves.waves || []);

  return renderProjectStatus({
    updatedAt: mvpEvidence.updatedAt,
    mvpVerified,
    mvpTotal,
    coverageSummary,
    backlogCount,
    draggingRow,
    startupEvidence,
    runtimeWaves,
    approvals
  });
}

export function renderProjectStatus(status) {
  const approvalLines = status.approvals.map((approval) => {
    const label = approval.approved ? "已批准" : "未批准";
    const approvalFile = approval.approved ? approval.approvalPath : approval.examplePath || "无";
    return `| ${approval.id} | ${approval.name} | ${label} | ${approvalFile} |`;
  });

  return [
    "# 鱼仔项目当前状态看板",
    "",
    `更新日期：${status.updatedAt}`,
    "",
    "本文档由 `npm run project:status -- --write docs/project-status.md` 生成，用来快速查看当前项目是否满足 MVP、13 状态覆盖和素材接入门禁。后续修改状态、提醒、素材接入或运行时门禁后，应重新生成并通过 `npm run validate:project-status-current`。",
    "",
    "## 当前结论",
    "",
    `- 启动头顶文字：${status.startupEvidence ? "已清理，并有 1200ms 桌面截图验收记录" : "缺少桌面截图验收记录"}`,
    `- MVP 证据：${status.mvpVerified} / ${status.mvpTotal} 项 verified`,
    `- 13 状态覆盖：${status.coverageSummary}`,
    `- 待补状态：${status.backlogCount} 个`,
    status.backlogCount === "0"
      ? `- runtime 接入边界：当前 ${status.approvals.length} 个波次均已有正式批准文件；后续新增动作仍必须先列清单确认。`
      : "- 当前不得越界：`dragging-special` 未正式批准前，禁止抽帧、去水印/抠绿、修改 runtime manifest 或声称拖拽动作已进入桌宠。",
    "",
    status.backlogCount === "0" ? "## 当前状态缺口" : "## 当前唯一状态缺口",
    "",
    status.backlogCount === "0"
      ? "当前 13 个状态均已拥有 independent runtime 动作，没有剩余 fallback 或 missing 状态。"
      : "| state | suggested action | category | planned output | current action | next step |",
    ...(status.backlogCount === "0" ? [] : [
      "| --- | --- | --- | --- | --- | --- |",
      `| dragging | ${status.draggingRow}`
    ]),
    "",
    "## runtime 接入批准状态",
    "",
    "| wave | name | approval | approval source |",
    "| --- | --- | --- | --- |",
    ...approvalLines,
    "",
    "## 下一步执行清单",
    "",
    ...(status.backlogCount === "0" ? [
      "1. 保持当前 MVP 和 13 状态覆盖稳定，后续新增动作视频先列清单确认。",
      "2. 如果继续优化动作自然度，优先做长时间桌面观察和候选视频质量筛选，而不是直接覆盖 runtime。",
      "3. 任一 MVP、状态覆盖或素材接入规则变化后，重新运行 `npm run project:status -- --write docs/project-status.md` 和 `npm run validate:all`。"
    ] : [
      "1. 如要继续接入拖拽动作，先让用户确认 `docs/runtime-intake-dragging-special-execution-checklist.md`。",
      "2. 确认后再创建正式批准文件 `docs/runtime-intake-approvals/dragging-special.approved.json`，不能把 example 文件当作批准。",
      "3. 批准后按清单执行逐视频检查、去水印/抠绿、序列帧生成、manifest 更新和拖拽专项桌面验收。",
      "4. 任一 MVP、状态覆盖或素材接入规则变化后，重新运行 `npm run project:status -- --write docs/project-status.md` 和 `npm run validate:all`。"
    ]),
    "",
    "## 复查命令",
    "",
    "```bash",
    "npm run validate:project-status-current",
    "npm run validate:mvp-evidence",
    "npm run validate:state-coverage-current",
    "npm run validate:state-backlog-current",
    "npm run validate:runtime-intake-approvals-current",
    "npm run validate:all",
    "```",
    ""
  ].join("\n");
}

function collectRuntimeApprovals(rootDir, waves) {
  return waves.map((wave) => {
    const approvalPath = `docs/runtime-intake-approvals/${wave.id}.approved.json`;
    const examplePath = `docs/runtime-intake-approvals/${wave.id}.example.json`;
    const approved = existsSync(join(rootDir, approvalPath));
    return {
      id: wave.id,
      name: wave.name,
      approved,
      approvalPath,
      examplePath: existsSync(join(rootDir, examplePath)) ? examplePath : ""
    };
  });
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function extractRequired(text, pattern, label) {
  const match = text.match(pattern);
  if (!match) {
    throw new Error(`Cannot extract ${label}`);
  }
  return match[1];
}

function parseOutputPath(argv) {
  const writeIndex = argv.indexOf("--write");
  if (writeIndex === -1) return "";
  return argv[writeIndex + 1] || defaultOutputPath;
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFilePath) {
  const outputPath = parseOutputPath(process.argv.slice(2));
  const text = buildProjectStatus(root);
  if (outputPath) {
    writeFileSync(joinIfRelative(outputPath), text);
    console.log(JSON.stringify({ ok: true, output: outputPath }, null, 2));
  } else {
    process.stdout.write(text);
  }
}

function joinIfRelative(path) {
  return path.startsWith("/") ? path : join(root, path);
}
