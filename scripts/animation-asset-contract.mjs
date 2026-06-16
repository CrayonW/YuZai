import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_ACTION_FIELDS = [
  "action",
  "category",
  "loop",
  "durationSeconds",
  "minCooldownSeconds",
  "antiFatigueRole",
  "prompt",
  "output"
];

const REQUIRED_CATEGORIES = new Set(["daily", "interactive", "transition"]);

export function buildAssetContractReport({
  planPath,
  manifestPath,
  runtimeRoot = dirname(dirname(fileURLToPath(import.meta.url)))
}) {
  const plan = readJson(resolvePath(runtimeRoot, planPath));
  const manifest = readJson(resolvePath(runtimeRoot, manifestPath));
  const fps = Number(plan.video?.fps ?? 24);
  const planActions = Array.isArray(plan.actions) ? plan.actions : [];
  const runtimeActions = manifest.actions && typeof manifest.actions === "object" ? manifest.actions : {};
  const playableRuntimeActions = Object.entries(runtimeActions)
    .filter(([, config]) => isPlayable(config))
    .map(([action, config]) => ({ action, config }));

  const invalidPlanActions = planActions.flatMap((action) => validatePlanAction(action));
  const missingActions = planActions
    .filter((action) => !isPlayable(runtimeActions[action.action]))
    .map((action) => ({
      action: action.action,
      category: action.category,
      durationSeconds: action.durationSeconds,
      role: action.antiFatigueRole,
      expectedOutput: action.output
    }));

  const shortRuntimeActions = planActions
    .filter((action) => isPlayable(runtimeActions[action.action]))
    .map((action) => {
      const config = runtimeActions[action.action];
      const expectedFrames = Math.ceil(Number(action.durationSeconds) * fps);
      const actualFrames = Number(config.frameCount ?? 0);
      return {
        action: action.action,
        category: action.category,
        expectedFrames,
        actualFrames,
        expectedDurationSeconds: Number(action.durationSeconds),
        actualDurationSeconds: actualFrames / Number(config.fps ?? fps)
      };
    })
    .filter((action) => action.actualFrames < action.expectedFrames);

  const metadataMismatches = planActions
    .filter((action) => isPlayable(runtimeActions[action.action]))
    .flatMap((action) => compareRuntimeMetadata(action, runtimeActions[action.action]));

  const categoryCoverage = buildCategoryCoverage(planActions, playableRuntimeActions);

  return {
    ok: invalidPlanActions.length === 0,
    summary: {
      plannedActions: planActions.length,
      playableActions: playableRuntimeActions.length,
      missingActions: missingActions.length,
      shortRuntimeActions: shortRuntimeActions.length,
      metadataMismatches: metadataMismatches.length,
      playableCoveragePercent: planActions.length > 0
        ? Math.round((playableRuntimeActions.filter(({ action }) => planActions.some((item) => item.action === action)).length / planActions.length) * 100)
        : 0
    },
    contract: {
      fps,
      minimumFields: REQUIRED_ACTION_FIELDS,
      requiredCategories: Array.from(REQUIRED_CATEGORIES),
      watermarkRule: "prompt 必须明确排除文字、水印和 logo；源视频进 runtime 前必须完成水印检查和去除。"
    },
    categoryCoverage,
    invalidPlanActions,
    missingActions,
    shortRuntimeActions,
    metadataMismatches
  };
}

export function renderAssetContractMarkdown(report) {
  const lines = [
    "# 小猫动作资产契约与缺口报告",
    "",
    "用途：把可灵视频生成计划、运行时 manifest 和后续源视频接入流程对齐。该报告不会替代用户确认；任何新视频在抽帧或覆盖 runtime 之前，仍需要先生成处理清单给用户确认。",
    "",
    "## 契约规则",
    "",
    `- 计划动作必须包含字段：${report.contract.minimumFields.map((field) => `\`${field}\``).join("、")}。`,
    `- 分类只允许：${report.contract.requiredCategories.map((category) => `\`${category}\``).join("、")}。`,
    `- 目标 FPS：${report.contract.fps}。runtime 帧数应至少达到 \`durationSeconds * fps\`，否则会被列为“时长不足”。`,
    `- 水印规则：${report.contract.watermarkRule}`,
    "- 日常动作应优先补齐 6-8 秒生活化动作；交互动作应有明确回切；transition 动作用于降低序列帧切换跳变。",
    "",
    "## 当前摘要",
    "",
    `- 计划动作数：${report.summary.plannedActions}`,
    `- runtime 可播放动作数：${report.summary.playableActions}`,
    `- 可播放覆盖率：${report.summary.playableCoveragePercent}%`,
    `- 缺失动作数：${report.summary.missingActions}`,
    `- runtime 时长不足动作数：${report.summary.shortRuntimeActions}`,
    `- manifest 元数据不一致数：${report.summary.metadataMismatches}`,
    "",
    "## 分类覆盖",
    "",
    "| 分类 | 计划动作 | 可播放动作 | 缺失动作 |",
    "| --- | ---: | ---: | ---: |"
  ];

  for (const item of report.categoryCoverage) {
    lines.push(`| ${item.category} | ${item.planned} | ${item.playable} | ${item.missing} |`);
  }

  lines.push("", "## 缺失动作", "");
  if (report.missingActions.length === 0) {
    lines.push("当前没有计划内缺失动作。");
  } else {
    for (const item of report.missingActions) {
      lines.push(`- \`${item.action}\`（${item.category}，${item.durationSeconds}s）：${item.role}；预期源视频：${item.expectedOutput}`);
    }
  }

  lines.push("", "## runtime 时长不足", "");
  if (report.shortRuntimeActions.length === 0) {
    lines.push("当前没有时长不足的可播放动作。");
  } else {
    for (const item of report.shortRuntimeActions) {
      lines.push(`- \`${item.action}\`：当前 ${item.actualFrames} 帧（约 ${formatSeconds(item.actualDurationSeconds)}s），契约需要 ${item.expectedFrames} 帧（${item.expectedDurationSeconds}s）。`);
    }
  }

  lines.push("", "## manifest 元数据不一致", "");
  if (report.metadataMismatches.length === 0) {
    lines.push("当前没有发现计划与 runtime manifest 的分类或循环字段不一致。");
  } else {
    for (const item of report.metadataMismatches) {
      lines.push(`- \`${item.action}\`：${item.field} 计划为 \`${item.expected}\`，runtime 为 \`${item.actual}\`。`);
    }
  }

  lines.push("", "## 计划字段问题", "");
  if (report.invalidPlanActions.length === 0) {
    lines.push("当前计划动作字段满足契约。");
  } else {
    for (const item of report.invalidPlanActions) {
      lines.push(`- \`${item.action || "未知动作"}\`：${item.failure}`);
    }
  }

  lines.push(
    "",
    "## 后续接入顺序",
    "",
    "1. 每次新增或替换源视频前，先运行 `npm run animations:intake-checklist` 并给用户确认。",
    "2. 确认后再做源视频预检、去水印、抽帧和 manifest 更新。",
    "3. 接入后运行 `npm run animations:asset-contract -- --write docs/animation-asset-contract.md` 刷新缺口报告。",
    "4. 运行 `npm run validate:release` 和桌面多帧截图验收，确认桌面宠物可见、动作连续、交互能回到日常动作。"
  );

  return `${lines.join("\n")}\n`;
}

export function writeAssetContractReport(report, outputPath) {
  const text = renderAssetContractMarkdown(report);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, text);
  return text;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const args = process.argv.slice(2);
  const report = buildAssetContractReport({
    planPath: argValue(args, "--plan") ?? "docs/kling-action-generation-plan.json",
    manifestPath: argValue(args, "--manifest") ?? "assets/runtime/animations/manifest.json",
    runtimeRoot: root
  });
  const writePath = argValue(args, "--write");
  const text = writePath
    ? writeAssetContractReport(report, resolvePath(root, writePath))
    : renderAssetContractMarkdown(report);
  process.stdout.write(text);
  if (!report.ok) process.exitCode = 1;
}

function validatePlanAction(action) {
  const failures = [];
  for (const field of REQUIRED_ACTION_FIELDS) {
    if (!(field in action)) {
      failures.push({ action: action.action, failure: `缺少字段 ${field}` });
    }
  }

  if (action.category && !REQUIRED_CATEGORIES.has(action.category)) {
    failures.push({ action: action.action, failure: `分类 ${action.category} 不在允许范围内` });
  }

  if (typeof action.durationSeconds === "number" && action.durationSeconds <= 0) {
    failures.push({ action: action.action, failure: "durationSeconds 必须大于 0" });
  }

  if (typeof action.minCooldownSeconds === "number" && action.minCooldownSeconds < 0) {
    failures.push({ action: action.action, failure: "minCooldownSeconds 不能小于 0" });
  }

  const prompt = String(action.prompt ?? "");
  for (const word of ["文字", "水印", "logo"]) {
    if (!prompt.includes(word)) {
      failures.push({ action: action.action, failure: `prompt 必须明确排除${word}` });
    }
  }

  return failures;
}

function compareRuntimeMetadata(action, config) {
  const mismatches = [];
  if (config.category !== action.category) {
    mismatches.push({ action: action.action, field: "category", expected: action.category, actual: config.category });
  }
  if (config.loop !== action.loop) {
    mismatches.push({ action: action.action, field: "loop", expected: action.loop, actual: config.loop });
  }
  return mismatches;
}

function buildCategoryCoverage(planActions, playableRuntimeActions) {
  const categories = Array.from(REQUIRED_CATEGORIES);
  return categories.map((category) => {
    const plannedActions = planActions.filter((action) => action.category === category);
    const playable = playableRuntimeActions.filter(({ action }) => plannedActions.some((item) => item.action === action)).length;
    return {
      category,
      planned: plannedActions.length,
      playable,
      missing: plannedActions.length - playable
    };
  });
}

function isPlayable(config) {
  return !!config && config.enabled === true && Number(config.frameCount ?? 0) > 0;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function resolvePath(root, path) {
  return isAbsolute(path) ? path : join(root, path);
}

function argValue(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  const value = args[index + 1];
  if (!value) throw new Error(`Missing value after ${name}`);
  return value;
}

function formatSeconds(value) {
  return Number(value).toFixed(2).replace(/\.?0+$/, "");
}
