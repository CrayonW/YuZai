import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function buildRuntimeIntakeExecutionPlan({ plan, waveId, manifest, bridges }) {
  const wave = plan.waves?.find((item) => item.id === waveId);
  if (!wave) {
    throw new Error(`Unknown runtime intake wave: ${waveId}`);
  }

  const actions = wave.actions.map((action) => {
    const manifestOperation = manifest.actions?.[action.action] ? "update" : "add";
    const frameOperation = manifest.actions?.[action.action]?.frameCount > 0 ? "replace" : "create";
    return {
      action: action.action,
      category: action.category,
      confirmation: action.confirmation,
      sourceVideo: action.sourceVideo,
      runtimeFrameRoot: action.runtimeFrameRoot,
      bridge: action.bridge,
      interruptPolicy: action.interruptPolicy,
      returnTo: action.returnTo,
      transitionPlan: action.transitionPlan,
      watermarkGate: action.watermarkGate,
      reviewEvidence: action.reviewEvidence || [],
      manifestOperation,
      frameOperation,
      bridgeOperation: bridgeOperationForAction(bridges, action),
      frameCommand: [
        "ffmpeg",
        "-i",
        action.sourceVideo,
        "-t",
        "3",
        "-vf",
        "fps=24,chromakey=0x00ff00:0.28:0.10,format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba",
        `${action.runtimeFrameRoot}/frame_%06d.png`
      ].join(" ")
    };
  });

  return {
    wave: {
      id: wave.id,
      name: wave.name,
      intent: wave.intent
    },
    approvalPath: `docs/runtime-intake-approvals/${wave.id}.approved.json`,
    summary: {
      totalActions: actions.length,
      actionsToAdd: actions.filter((action) => action.manifestOperation === "add").length,
      actionsToUpdate: actions.filter((action) => action.manifestOperation === "update").length,
      framesToCreate: actions.filter((action) => action.frameOperation === "create").length,
      framesToReplace: actions.filter((action) => action.frameOperation === "replace").length,
      bridgeAlreadyReferenced: actions.filter((action) => action.bridgeOperation === "already-referenced").length,
      bridgeManual: actions.filter((action) => action.bridgeOperation === "manual").length
    },
    actions
  };
}

export function assertRuntimeIntakeApproval({ dryRun, approvalExists, waveId }) {
  if (dryRun) return;
  if (!approvalExists) {
    throw new Error(`缺少 runtime 接入批准文件：docs/runtime-intake-approvals/${waveId}.approved.json`);
  }
}

export function renderRuntimeIntakeExecutionPlan(executionPlan) {
  const lines = [
    `# runtime 接入执行 dry-run：${executionPlan.wave.name}`,
    "",
    "本报告不执行抽帧、不去水印、不修改 manifest、不写 runtime 目录。它只列出用户批准后将要执行的写入计划。",
    "",
    `波次 ID：${executionPlan.wave.id}`,
    `目的：${executionPlan.wave.intent}`,
    `需要用户批准文件：${executionPlan.approvalPath}`,
    "",
    "## 汇总",
    "",
    `- 动作数量：${executionPlan.summary.totalActions}`,
    `- manifest 新增：${executionPlan.summary.actionsToAdd}`,
    `- manifest 更新：${executionPlan.summary.actionsToUpdate}`,
    `- 新建帧目录：${executionPlan.summary.framesToCreate}`,
    `- 覆盖帧目录：${executionPlan.summary.framesToReplace}`,
    `- 桥接已引用：${executionPlan.summary.bridgeAlreadyReferenced}`,
    `- 桥接需人工设计：${executionPlan.summary.bridgeManual}`,
    "",
    "## 动作执行计划",
    ""
  ];

  for (const action of executionPlan.actions) {
    lines.push(
      `### ${action.action}`,
      "",
      `- sourceVideo=${action.sourceVideo}`,
      `- runtimeFrameRoot=${action.runtimeFrameRoot}`,
      `- manifest=${action.manifestOperation}`,
      `- frames=${action.frameOperation}`,
      `- bridge=${action.bridgeOperation}`,
      `- bridgeKey=${action.bridge}`,
      `- interruptPolicy=${action.interruptPolicy}`,
      `- returnTo=${action.returnTo}`,
      `- transitionPlan=${action.transitionPlan}`,
      `- watermarkGate=${action.watermarkGate}`,
      `- reviewEvidence=${action.reviewEvidence.join("、")}`,
      `- frameCommand=${action.frameCommand}`,
      ""
    );
  }

  lines.push(
    "## 批准门禁",
    "",
    "非 dry-run 执行必须同时满足：",
    "",
    `1. 用户明确确认对应执行清单。`,
    `2. 存在批准文件：${executionPlan.approvalPath}`,
    "3. 逐视频人工播放检查已完成。",
    "4. 本报告重新生成后仍无意外覆盖风险。",
    "",
    "确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest、禁止覆盖 runtime 动作目录。",
    "",
    "## 验证命令",
    "",
    "```bash",
    "npm run validate:runtime-intake-executor",
    "npm run validate:runtime-intake-waves",
    "npm run validate:release",
    "```",
    ""
  );

  return lines.join("\n");
}

function bridgeOperationForAction(bridges, action) {
  const pathParts = action.bridge.split(".");
  let node = bridges;
  for (const part of pathParts) {
    node = node?.[part];
  }
  if (Array.isArray(node) && node.includes(action.action)) {
    return "already-referenced";
  }
  return "manual";
}

function parseArgs(argv) {
  const options = {
    waveId: "wave1",
    dryRun: true,
    writePath: null,
    planPath: "docs/runtime-intake-waves.json",
    manifestPath: "assets/runtime/animations/manifest.json",
    bridgesPath: "assets/config/action-bridges.json"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--wave") {
      options.waveId = argv[++index];
    } else if (arg === "--write") {
      options.writePath = argv[++index];
    } else if (arg === "--plan") {
      options.planPath = argv[++index];
    } else if (arg === "--manifest") {
      options.manifestPath = argv[++index];
    } else if (arg === "--bridges") {
      options.bridgesPath = argv[++index];
    } else if (arg === "--execute") {
      options.dryRun = false;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(process.cwd(), relativePath), "utf8"));
}

function runCli() {
  const options = parseArgs(process.argv.slice(2));
  const executionPlan = buildRuntimeIntakeExecutionPlan({
    plan: readJson(options.planPath),
    waveId: options.waveId,
    manifest: readJson(options.manifestPath),
    bridges: readJson(options.bridgesPath)
  });

  assertRuntimeIntakeApproval({
    dryRun: options.dryRun,
    approvalExists: existsSync(join(process.cwd(), executionPlan.approvalPath)),
    waveId: options.waveId
  });

  if (!options.dryRun) {
    throw new Error("runtime intake execute mode is intentionally not implemented yet; use dry-run reports until user approval and implementation checkpoint.");
  }

  const text = renderRuntimeIntakeExecutionPlan(executionPlan);
  if (options.writePath) {
    const target = join(process.cwd(), options.writePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  } else {
    process.stdout.write(text);
  }
}

const currentFile = fileURLToPath(import.meta.url);
const entryFile = process.argv[1] ? join(process.cwd(), process.argv[1]) : "";
if (currentFile === entryFile || currentFile === process.argv[1]) {
  runCli();
}
