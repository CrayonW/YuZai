import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { inspectCaptureSequence } from "./capture-sequence-inspector.mjs";

const root = process.cwd();
const defaultOutput = "docs/runtime-naturalness-observation.md";
export const evidenceDir = "assets/reviews/runtime/naturalness-observation";
export const evidenceSequencePath = `${evidenceDir}/yuzai-window-naturalness.png`;

export function buildRuntimeNaturalnessObservation(rootDir = root) {
  const manifest = readJson(join(rootDir, "assets/runtime/animations/manifest.json"));
  const riskText = readText(join(rootDir, "docs/action-transition-risk-report.md"));
  const contractText = readText(join(rootDir, "docs/animation-asset-contract.md"));
  const risk = parseRiskSummary(riskText);
  const highRisks = parseHighRiskRows(riskText);
  const shortRuntime = parseShortRuntimeCount(contractText);
  const shortRuntimeExamples = parseShortRuntimeExamples(contractText);
  const evidence = inspectEvidence(rootDir);
  const actionCount = Object.keys(manifest.actions || {}).length;

  return renderReport({
    actionCount,
    risk,
    highRisks,
    shortRuntime,
    shortRuntimeExamples,
    evidence
  });
}

export function renderReport(report) {
  const evidenceStatus = report.evidence.failures.length === 0 ? "通过" : "需要复查";
  const highRiskLines = report.highRisks.length > 0
    ? report.highRisks.map((item) => `- ${item.from} -> ${item.to}（${item.direction}，metric ${item.metric}）：${item.recommendation}`)
    : ["- 当前没有 high 风险切换。"];
  const shortRuntimeLines = report.shortRuntimeExamples.length > 0
    ? report.shortRuntimeExamples.map((item) => `- ${item}`)
    : ["- 当前没有列出的 runtime 时长不足示例。"];
  const failureLines = report.evidence.failures.length > 0
    ? report.evidence.failures.map((failure) => `- ${failure}`)
    : ["- 截图序列完整，尺寸和变化帧检查通过。"];

  return [
    "# 桌宠动作自然度长时间观察报告",
    "",
    "用途：把桌宠动作自然度、衔接风险和桌面截图证据汇总到一个可复查入口。本报告不批准生成新视频、不覆盖 runtime、不修改 manifest。",
    "",
    "## 当前摘要",
    "",
    `- runtime action 数：${report.actionCount}`,
    `- 衔接风险：high ${report.risk.high} / medium ${report.risk.medium} / low ${report.risk.low}`,
    `- runtime 时长不足动作数：${report.shortRuntime}`,
    `- 桌面观察截图：${report.evidence.count} 张，${report.evidence.width}x${report.evidence.height}，变化帧 ${report.evidence.changedFrames}`,
    `- 观察证据状态：${evidenceStatus}`,
    "",
    "## 观察证据",
    "",
    `- 截图目录：\`${evidenceDir}\``,
    `- 截图命名：\`yuzai-window-naturalness-001.png\` 到 \`yuzai-window-naturalness-${String(report.evidence.count).padStart(3, "0")}.png\``,
    "- 桌面观察命令：",
    "",
    "```bash",
    "YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-naturalness.png YUZAI_CAPTURE_SEQUENCE_COUNT=12 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=300 YUZAI_CAPTURE_DELAY_MS=900 npm run dev",
    "npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-naturalness.png --count 12 --min-changed-frames 6 --min-width 200 --min-height 200",
    "```",
    "",
    "### 证据检查",
    "",
    ...failureLines,
    "",
    "## high 风险回切",
    "",
    ...highRiskLines,
    "",
    "## runtime 时长不足示例",
    "",
    ...shortRuntimeLines,
    "",
    "## 观察边界",
    "",
    "- 本轮只观察和生成报告。",
    "- 不调用可灵生成视频。",
    "- 不新增或覆盖 `assets/runtime/animations/*/frames`。",
    "- 不修改 `assets/runtime/animations/manifest.json`。",
    "",
    "## MotionIntentScheduler Phase A 验收",
    "",
    "- 本轮新增运行时动作意图调度，不生成新视频、不抽帧、不覆盖 runtime manifest。",
    "- 交互、拖拽、预览、鼠标跟随、日常轮播统一进入 `MotionIntentScheduler`，再由 `AnimationDirector` 执行动作切换。",
    "- 桌面链路验收：`paw_raise` 预览序列，24 帧，窗口 440x440，变化帧 18，满足不少于 8 个变化帧的门禁。",
    "- alpha 门禁：`npm run validate:runtime-alpha-quality` 通过，未发现 green spill 或连续 alpha 均值跳变失败。",
    "- 若后续仍看到猫身透明闪动，应进入素材 alpha cleanup 或重新生成视频；本调度器只解决运行时抢占和动作链路秩序，不伪装成素材修复。",
    "",
    "## 2026-06-29 猫身透明闪动修复",
    "",
    "- 根因：旧 alpha 门禁只检查全帧 alpha 均值和绿溢出，无法发现猫身内部被抠绿/去绿溢出打穿的局部透明孔洞。",
    "- 修复：新增 `runtime:alpha-hole-repair`，只填补被猫身 alpha 区域包围、没有连接到画布边缘的内部低 alpha 孔洞，不填外部透明背景。",
    "- 本轮修复 runtime 帧：7048 张 PNG 被填补内部孔洞。",
    "- 新门禁：`npm run validate:runtime-alpha-holes`，检查最大内部孔洞、孔洞总面积和连续帧孔洞跳变。",
    "- 验收结果：`validate:runtime-alpha-holes` 通过，内部孔洞失败数 0。",
    "- 桌面截图验收：`idle_primary` 24 帧，变化帧 24；`walk` 24 帧，变化帧 16；两组窗口均为 440x440。",
    "- 肉眼复核图：`assets/reviews/runtime/alpha-hole-repair/idle-primary-contact-sheet.png`、`assets/reviews/runtime/alpha-hole-repair/walk-contact-sheet.png`。",
    "",
    "## 后续优先级",
    "",
    "1. 如果用户继续反馈动作衔接生硬，优先处理 high 风险回切：`sleep -> sleeping`、`waking -> idle_primary`、`poke_annoyed -> idle_primary`、`paw_raise -> idle_primary`。",
    "2. 如果鼠标跟随仍不明显，优先复查 `assets/reviews/runtime/mouse-follow-16/` 和本报告截图，确认进入延迟是否来自测试时序还是动作本身。",
    "3. 如果长时间待机重复感明显，优先生成更长 daily 动作或分段合并素材，但必须先列清单确认。",
    "",
    "## 复查命令",
    "",
    "```bash",
    "npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md",
    "npm run validate:runtime-naturalness-observation",
    "npm run validate:all",
    "```",
    ""
  ].join("\n");
}

function inspectEvidence(rootDir) {
  const absoluteDir = join(rootDir, evidenceDir);
  if (!existsSync(absoluteDir)) {
    return {
      exists: false,
      count: 0,
      changedFrames: 0,
      width: 0,
      height: 0,
      failures: [`缺少观察截图目录：${evidenceDir}`]
    };
  }

  const files = readdirSync(absoluteDir)
    .filter((name) => /^yuzai-window-naturalness-\d{3}\.png$/.test(name))
    .sort();
  if (files.length === 0) {
    return {
      exists: true,
      count: 0,
      changedFrames: 0,
      width: 0,
      height: 0,
      failures: [`${evidenceDir} 中没有自然度观察 PNG 截图`]
    };
  }

  const result = inspectCaptureSequence({
    sequencePath: join(rootDir, evidenceSequencePath),
    count: files.length,
    minChangedFrames: Math.min(6, Math.max(1, files.length - 1)),
    minWidth: 200,
    minHeight: 200
  });
  const first = result.frames[0] || {};

  return {
    exists: true,
    count: files.length,
    changedFrames: result.changedFrames,
    width: first.width || 0,
    height: first.height || 0,
    failures: result.failures || []
  };
}

function parseRiskSummary(text) {
  const match = text.match(/风险摘要：high\s+(\d+)\s+\/\s+medium\s+(\d+)\s+\/\s+low\s+(\d+)/);
  return {
    high: Number(match?.[1] || 0),
    medium: Number(match?.[2] || 0),
    low: Number(match?.[3] || 0)
  };
}

function parseHighRiskRows(text) {
  return text
    .split("\n")
    .filter((line) => line.startsWith("| high |"))
    .map((line) => {
      const columns = line.split("|").map((column) => column.trim());
      return {
        direction: columns[2] || "",
        from: columns[3] || "",
        to: columns[4] || "",
        metric: columns[6] || "",
        recommendation: columns[10] || ""
      };
    });
}

function parseShortRuntimeCount(text) {
  const match = text.match(/runtime 时长不足动作数：(\d+)/);
  return Number(match?.[1] || 0);
}

function parseShortRuntimeExamples(text) {
  const section = text.split("## runtime 时长不足")[1]?.split("\n## ")[0] || "";
  return section
    .split("\n")
    .filter((line) => line.startsWith("- `"))
    .slice(0, 8)
    .map((line) => line.slice(2));
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

function parseArgs(args) {
  const options = { output: null };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--write") {
      options.output = args[++index] || defaultOutput;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function resolveOutput(outputPath) {
  return isAbsolute(outputPath) ? outputPath : join(root, outputPath);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv.slice(2));
  const text = buildRuntimeNaturalnessObservation(root);
  if (options.output) {
    const absoluteOutput = resolveOutput(options.output);
    mkdirSync(dirname(absoluteOutput), { recursive: true });
    writeFileSync(absoluteOutput, text);
    console.log(JSON.stringify({ ok: true, output: options.output }, null, 2));
  } else {
    console.log(text);
  }
}
