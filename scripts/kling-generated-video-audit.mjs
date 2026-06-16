import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

export function buildKlingGeneratedVideoAudit({
  root,
  plan,
  options,
  fileInfoForAction = defaultFileInfoForAction(root),
  metadataForAction = defaultMetadataForAction(root)
}) {
  const actions = selectedActions(plan, options.batch).map((action) => {
    const file = fileInfoForAction(action);
    if (!file.exists) {
      return buildMissingAction(action);
    }

    const metadata = metadataForAction(action);
    const failures = validateMetadata(action, metadata, options);
    return {
      action: action.action,
      category: action.category,
      loop: Boolean(action.loop),
      expectedDurationSeconds: action.durationSeconds,
      output: action.output,
      status: failures.length === 0 ? "ready_for_manual_review" : "needs_regeneration_or_repair",
      sizeBytes: file.sizeBytes,
      width: metadata?.width ?? 0,
      height: metadata?.height ?? 0,
      durationSeconds: metadata?.durationSeconds ?? 0,
      hasVideo: Boolean(metadata?.hasVideo),
      previewPath: previewPathForAction(action),
      manualChecks: manualChecksForAction(action),
      failures,
      recommendation: failures.length === 0
        ? "可进入人工画面检查；通过无水印/无文字/无 logo、猫咪身份一致、绿幕稳定后，再进入抽帧接入。"
        : "先重生成或修复视频，再进入人工画面检查。"
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    batch: options.batch || "all",
    evidenceRoot: "assets/reviews/kling-generated",
    summary: {
      total: actions.length,
      ready: actions.filter((action) => action.status === "ready_for_manual_review").length,
      needsRepair: actions.filter((action) => action.status === "needs_regeneration_or_repair").length,
      missing: actions.filter((action) => action.status === "missing").length,
      daily: actions.filter((action) => action.category === "daily").length,
      interactive: actions.filter((action) => action.category === "interactive").length,
      transition: actions.filter((action) => action.category === "transition").length
    },
    minWidth: options.minWidth,
    minHeight: options.minHeight,
    minDurationSeconds: options.minDurationSeconds,
    actions
  };
}

export function renderKlingGeneratedVideoAudit(audit) {
  const lines = [
    "# 可灵生成视频素材审查报告",
    "",
    "用途：本报告只用于审查可灵生成的原始视频素材，帮助决定后续是否去水印、抽帧并接入桌宠 runtime。",
    "",
    "硬性门禁：即使基础元数据通过，也必须人工确认无水印/无文字/无 logo、猫咪身份一致、全身入镜、绿幕稳定后，才能进入抽帧或 manifest 修改。当前报告不能直接接入 runtime。",
    "",
    `批次：${audit.batch}`,
    `证据目录：${audit.evidenceRoot}`,
    `总览图：${audit.evidenceRoot}/overview.png`,
    `汇总：ready ${audit.summary.ready} / needsRepair ${audit.summary.needsRepair} / missing ${audit.summary.missing} / total ${audit.summary.total}`,
    `分类：daily ${audit.summary.daily} / interactive ${audit.summary.interactive} / transition ${audit.summary.transition}`,
    `基础要求：宽度 >= ${audit.minWidth}px，高度 >= ${audit.minHeight}px，时长 >= ${audit.minDurationSeconds}s`,
    "",
    "| action | 分类 | 状态 | 尺寸 | 时长 | 大小 | 抽样图 | 建议 |",
    "| --- | --- | --- | --- | ---: | ---: | --- | --- |"
  ];

  for (const action of audit.actions) {
    lines.push(
      `| ${action.action} | ${action.category} | ${action.status} | ${action.width}x${action.height} | ${formatSeconds(action.durationSeconds)} | ${action.sizeBytes} | ${action.previewPath} | ${action.recommendation} |`
    );
  }

  lines.push("", "## 人工画面检查项", "");
  for (const action of audit.actions) {
    lines.push(`### ${action.action}`, "", `源视频：${action.output}`, "");
    if (action.failures.length > 0) {
      lines.push("基础问题：", "");
      for (const failure of action.failures) {
        lines.push(`- ${failure}`);
      }
      lines.push("");
    }
    for (const item of action.manualChecks) {
      lines.push(`- [ ] ${item}`);
    }
    lines.push("");
  }

  lines.push(
    "## 下一步",
    "",
    "1. 逐个打开抽样图和源视频，人工标记是否存在水印、文字、logo、猫咪变形、身体裁切、绿幕不稳定。",
    "2. 对通过动作，回到对应 `docs/kling-batch-intake-*.md` 清单确认接入范围。",
    "3. 只有确认后，才允许执行去水印/抠绿、序列帧生成、manifest 更新和桌面截图验收。"
  );

  return `${lines.join("\n")}\n`;
}

export function writeKlingGeneratedVideoAudit(audit, writePath) {
  const markdown = renderKlingGeneratedVideoAudit(audit);
  if (writePath) {
    mkdirSync(dirname(writePath), { recursive: true });
    writeFileSync(writePath, markdown);
  }
  return markdown;
}

export function extractPreviewFrames({ root, audit, seconds = [0.8, 2.4, 4.0] }) {
  const evidenceRoot = join(root, audit.evidenceRoot);
  mkdirSync(evidenceRoot, { recursive: true });
  for (const action of audit.actions) {
    if (action.status === "missing") continue;
    const outputPath = join(root, action.output);
    const previewPath = join(root, action.previewPath);
    mkdirSync(dirname(previewPath), { recursive: true });
    const tileFilter = `select='not(mod(n\\,24))',scale=180:-1,tile=3x1`;
    try {
      execFileSync("ffmpeg", ["-y", "-i", outputPath, "-vf", tileFilter, "-frames:v", "1", previewPath], { stdio: "ignore" });
    } catch {
      const fallbackSecond = Math.min(seconds[0], Math.max(0, action.durationSeconds - 0.1));
      execFileSync("ffmpeg", ["-y", "-ss", String(fallbackSecond), "-i", outputPath, "-frames:v", "1", previewPath], { stdio: "ignore" });
    }
  }
  createOverviewImage({ root, audit });
}

function createOverviewImage({ root, audit }) {
  const previewPaths = audit.actions
    .filter((action) => action.status !== "missing")
    .map((action) => join(root, action.previewPath))
    .filter((path) => existsSync(path));
  if (previewPaths.length === 0) return;

  const overviewPath = join(root, audit.evidenceRoot, "overview.png");
  try {
    execFileSync(
      "montage",
      [...previewPaths, "-label", "%t", "-tile", "2x", "-geometry", "+12+28", overviewPath],
      { stdio: "ignore" }
    );
  } catch {
    // Individual preview frames are the authoritative evidence; overview is a convenience.
  }
}

function selectedActions(plan, batchSelector) {
  const batches = Array.isArray(plan?.batches) ? plan.batches : [];
  const selectedBatches = !batchSelector || batchSelector === "all"
    ? batches
    : batches.filter((batch, index) => batch.id === batchSelector || batch.name === batchSelector || String(index + 1) === String(batchSelector));
  if (selectedBatches.length === 0) throw new Error(`Batch not found: ${batchSelector}`);
  return selectedBatches.flatMap((batch) => batch.actions || []);
}

function buildMissingAction(action) {
  return {
    action: action.action,
    category: action.category,
    loop: Boolean(action.loop),
    expectedDurationSeconds: action.durationSeconds,
    output: action.output,
    status: "missing",
    sizeBytes: 0,
    width: 0,
    height: 0,
    durationSeconds: 0,
    hasVideo: false,
    previewPath: previewPathForAction(action),
    manualChecks: manualChecksForAction(action),
    failures: [`${action.output}: file is missing`],
    recommendation: "先补生成视频，再进入人工画面检查。"
  };
}

function validateMetadata(action, metadata, options) {
  const failures = [];
  if (!metadata?.hasVideo) failures.push(`${action.output}: 没有可读视频流`);
  if ((metadata?.width ?? 0) < options.minWidth || (metadata?.height ?? 0) < options.minHeight) {
    failures.push(`${action.output}: 分辨率 ${metadata?.width ?? 0}x${metadata?.height ?? 0} 低于 ${options.minWidth}x${options.minHeight}`);
  }
  if ((metadata?.durationSeconds ?? 0) < options.minDurationSeconds) {
    failures.push(`${action.output}: 时长 ${formatSeconds(metadata?.durationSeconds ?? 0)}s 低于 ${options.minDurationSeconds}s`);
  }
  return failures;
}

function manualChecksForAction(action) {
  const categoryCheck = action.category === "daily"
    ? "日常动作节奏自然，不会像短促循环一样快速重复。"
    : "交互动作起止姿势能回到或接近日常姿势，方便插入后切回日常序列帧。";
  return [
    "无水印、无文字、无 logo、无边框或 UI 元素。",
    "猫咪身份一致：毛色、脸型、眼睛、斑纹和体型接近 `assets/origin/鱼仔参考图.png`。",
    "全身入镜：耳朵、尾巴、四肢和身体边缘没有被裁切。",
    "绿幕稳定：背景为纯绿色或便于抠像，没有家具、人手、玩具等额外物体。",
    "动作完整：没有多猫、畸形肢体、穿模、跳帧或镜头突然移动。",
    categoryCheck
  ];
}

function previewPathForAction(action) {
  return `assets/reviews/kling-generated/${action.action}.png`;
}

function defaultFileInfoForAction(rootDir) {
  return (action) => {
    const absolutePath = join(rootDir, action.output);
    const exists = existsSync(absolutePath);
    return {
      exists,
      sizeBytes: exists ? statSync(absolutePath).size : 0
    };
  };
}

function defaultMetadataForAction(rootDir) {
  return (action) => readVideoMetadata(action.output, join(rootDir, action.output));
}

function readVideoMetadata(source, absolutePath) {
  const raw = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,duration",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      absolutePath
    ],
    { encoding: "utf8" }
  );
  const parsed = JSON.parse(raw);
  const stream = parsed.streams?.[0] || null;
  const durationSeconds = Number(stream?.duration || parsed.format?.duration || 0);
  return {
    source,
    width: Number(stream?.width || 0),
    height: Number(stream?.height || 0),
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    hasVideo: Boolean(stream)
  };
}

function formatSeconds(value) {
  return Number(value || 0).toFixed(3).replace(/\.?0+$/, "");
}

function parseArgs(args) {
  const options = {
    batch: "all",
    plan: "docs/kling-generation-batches.json",
    write: "",
    extractPreviews: false,
    minWidth: 512,
    minHeight: 512,
    minDurationSeconds: 3
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--batch") {
      options.batch = args[++index];
    } else if (arg === "--plan") {
      options.plan = args[++index];
    } else if (arg === "--write") {
      options.write = args[++index];
    } else if (arg === "--extract-previews") {
      options.extractPreviews = true;
    } else if (arg === "--min-width") {
      options.minWidth = Number(args[++index]);
    } else if (arg === "--min-height") {
      options.minHeight = Number(args[++index]);
    } else if (arg === "--min-duration") {
      options.minDurationSeconds = Number(args[++index]);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv.slice(2));
  const plan = JSON.parse(readFileSync(join(root, options.plan), "utf8"));
  const audit = buildKlingGeneratedVideoAudit({ root, plan, options });
  if (options.extractPreviews) {
    extractPreviewFrames({ root, audit });
  }
  const markdown = writeKlingGeneratedVideoAudit(audit, options.write ? join(root, options.write) : "");
  console.log(markdown);
  if (audit.summary.missing > 0 || audit.summary.needsRepair > 0) process.exitCode = 1;
}
