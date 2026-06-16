import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function buildRuntimeIntakePreflight({
  plan,
  waveId,
  fileInfoForAction = defaultFileInfoForAction(process.cwd()),
  metadataForAction = defaultMetadataForAction(process.cwd()),
  evidenceExists = defaultEvidenceExists(process.cwd())
}) {
  const wave = plan.waves?.find((item) => item.id === waveId);
  if (!wave) {
    throw new Error(`Unknown runtime intake wave: ${waveId}`);
  }

  const actions = wave.actions.map((action) => {
    const fileInfo = fileInfoForAction(action);
    const evidenceFailures = (action.reviewEvidence || [])
      .filter((evidencePath) => !evidenceExists(evidencePath))
      .map((evidencePath) => `缺少审查证据：${evidencePath}`);

    if (!fileInfo.exists) {
      return {
        ...baseAction(action),
        status: "missing",
        sizeBytes: 0,
        width: 0,
        height: 0,
        durationSeconds: 0,
        hasVideo: false,
        failures: [`缺少来源视频：${action.sourceVideo}`, ...evidenceFailures]
      };
    }

    const metadata = metadataForAction(action);
    const failures = [
      ...validateMetadata(action, metadata),
      ...evidenceFailures
    ];

    return {
      ...baseAction(action),
      status: failures.length === 0 ? "ready_for_manual_review" : "needs_attention",
      sizeBytes: fileInfo.sizeBytes,
      width: metadata.width,
      height: metadata.height,
      durationSeconds: metadata.durationSeconds,
      hasVideo: metadata.hasVideo,
      failures
    };
  });

  return {
    wave: {
      id: wave.id,
      name: wave.name,
      intent: wave.intent
    },
    confirmationRule: plan.confirmationRule,
    summary: {
      total: actions.length,
      readyForManualReview: actions.filter((action) => action.status === "ready_for_manual_review").length,
      needsAttention: actions.filter((action) => action.status === "needs_attention").length,
      missing: actions.filter((action) => action.status === "missing").length,
      needsConfirmation: actions.filter((action) => action.confirmation === "needs-user-confirmation").length
    },
    actions
  };
}

export function renderRuntimeIntakePreflight(preflight) {
  const lines = [
    `# runtime 接入预检报告：${preflight.wave.name}`,
    "",
    "用途：本报告用于正式抽帧前检查来源视频、审查证据和接入门禁是否齐全。",
    "",
    "硬性门禁：本报告不能直接批准 runtime 接入。即使全部通过，也必须先给用户确认对应执行清单，并逐视频人工播放检查无文字、水印、logo、额外物体和明显变形。",
    "",
    `波次 ID：${preflight.wave.id}`,
    `目的：${preflight.wave.intent}`,
    `确认规则：${preflight.confirmationRule}`,
    "",
    "## 汇总",
    "",
    `- 动作数量：${preflight.summary.total}`,
    `- 可进入人工播放检查：${preflight.summary.readyForManualReview}`,
    `- 需要处理：${preflight.summary.needsAttention}`,
    `- 缺失：${preflight.summary.missing}`,
    `- 仍需用户确认：${preflight.summary.needsConfirmation}`,
    "",
    "## 视频与门禁",
    "",
    "| action | 分类 | 状态 | 确认状态 | 尺寸 | 时长 | 大小 | 桥接入口 | 来源视频 | 审查证据 |",
    "| --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- |"
  ];

  for (const action of preflight.actions) {
    lines.push(
      `| ${action.action} | ${action.category} | ${action.status} | ${action.confirmation} | ${action.width}x${action.height} | ${formatSeconds(action.durationSeconds)}s | ${action.sizeBytes} | ${action.bridge} | ${action.sourceVideo} | ${action.reviewEvidence.join("<br>")} |`
    );
  }

  lines.push("", "## 逐动作检查", "");
  for (const action of preflight.actions) {
    lines.push(
      `### ${action.action}`,
      "",
      `来源视频：${action.sourceVideo}`,
      `审查证据：${action.reviewEvidence.join("、")}`,
      `运行帧输出：${action.runtimeFrameRoot}`,
      `桥接入口：${action.bridge}`,
      `中断策略：${action.interruptPolicy}`,
      `结束返回：${action.returnTo}`,
      `衔接策略：${action.transitionPlan}`,
      `水印门禁：${action.watermarkGate}`,
      ""
    );
    if (action.failures.length > 0) {
      lines.push("基础问题：", "");
      for (const failure of action.failures) {
        lines.push(`- ${failure}`);
      }
      lines.push("");
    } else {
      lines.push("基础问题：无。仍需人工播放检查水印、文字、logo、额外物体、变形和裁切。", "");
    }
  }

  lines.push(
    "## 确认前禁止",
    "",
    "- 禁止抽帧。",
    "- 禁止去水印/抠绿。",
    "- 禁止修改 runtime manifest。",
    "- 禁止覆盖 runtime 动作目录。",
    "- 禁止把 mp4 强制加入 Git。",
    "- 禁止声称本波动作已经进入桌宠。",
    "",
    "## 验证命令",
    "",
    "```bash",
    "npm run validate:runtime-intake-preflight",
    "npm run validate:runtime-intake-waves",
    "npm run validate:release",
    "```",
    ""
  );

  return lines.join("\n");
}

function baseAction(action) {
  return {
    action: action.action,
    category: action.category,
    confirmation: action.confirmation,
    sourceVideo: action.sourceVideo,
    reviewEvidence: action.reviewEvidence || [],
    runtimeFrameRoot: action.runtimeFrameRoot,
    bridge: action.bridge,
    interruptPolicy: action.interruptPolicy,
    returnTo: action.returnTo,
    transitionPlan: action.transitionPlan,
    watermarkGate: action.watermarkGate
  };
}

function validateMetadata(action, metadata) {
  const failures = [];
  if (!metadata.hasVideo) failures.push("来源视频没有可读视频流。");
  if (metadata.width < 256 || metadata.height < 256) {
    failures.push(`分辨率 ${metadata.width}x${metadata.height} 低于 256x256。`);
  }
  if (metadata.durationSeconds < 3) {
    failures.push(`时长 ${formatSeconds(metadata.durationSeconds)}s 低于 3s，可能不适合流畅序列帧接入。`);
  }
  if (action.confirmation !== "needs-user-confirmation") {
    failures.push(`确认状态不是 needs-user-confirmation：${action.confirmation}`);
  }
  return failures;
}

function defaultFileInfoForAction(root) {
  return (action) => {
    const absolutePath = join(root, action.sourceVideo);
    const exists = existsSync(absolutePath);
    return {
      exists,
      sizeBytes: exists ? statSync(absolutePath).size : 0
    };
  };
}

function defaultMetadataForAction(root) {
  return (action) => readVideoMetadata(join(root, action.sourceVideo));
}

function defaultEvidenceExists(root) {
  return (evidencePath) => existsSync(join(root, evidencePath));
}

function readVideoMetadata(absolutePath) {
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
    width: Number(stream?.width || 0),
    height: Number(stream?.height || 0),
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    hasVideo: Boolean(stream)
  };
}

function formatSeconds(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, "");
}

function parseArgs(argv) {
  const options = {
    waveId: "wave1",
    planPath: "docs/runtime-intake-waves.json",
    writePath: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--wave") {
      options.waveId = argv[++index];
    } else if (arg === "--plan") {
      options.planPath = argv[++index];
    } else if (arg === "--write") {
      options.writePath = argv[++index];
    }
  }

  return options;
}

function runCli() {
  const options = parseArgs(process.argv.slice(2));
  const plan = JSON.parse(readFileSync(join(process.cwd(), options.planPath), "utf8"));
  const preflight = buildRuntimeIntakePreflight({ plan, waveId: options.waveId });
  const text = renderRuntimeIntakePreflight(preflight);
  if (options.writePath) {
    const target = join(process.cwd(), options.writePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  } else {
    process.stdout.write(text);
  }

  if (preflight.summary.needsAttention > 0 || preflight.summary.missing > 0) {
    process.exitCode = 1;
  }
}

const currentFile = fileURLToPath(import.meta.url);
const entryFile = process.argv[1] ? join(process.cwd(), process.argv[1]) : "";
if (currentFile === entryFile || currentFile === process.argv[1]) {
  runCli();
}
