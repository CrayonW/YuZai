import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanupGreenSpillInFrameRoot } from "./runtime-alpha-cleanup.mjs";

const runtimeFrameSeconds = 5;
const runtimeFps = 24;
const runtimeFrameSize = 512;
const watermarkRegion = "122x67+390+445";

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
      loop: action.loop === true,
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
        String(runtimeFrameSeconds),
        "-vf",
        `fps=${runtimeFps},chromakey=0x00ff00:0.28:0.10,format=rgba,scale=${runtimeFrameSize}:${runtimeFrameSize}:force_original_aspect_ratio=decrease,pad=${runtimeFrameSize}:${runtimeFrameSize}:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba`,
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

export function buildRuntimeIntakeManifestPatch({ manifest, executionPlan, frameCounts }) {
  const nextManifest = structuredClone(manifest);
  nextManifest.actions = { ...nextManifest.actions };

  for (const action of executionPlan.actions) {
    const frameCount = frameCounts[action.action];
    if (!Number.isInteger(frameCount) || frameCount <= 0) {
      throw new Error(`${action.action}: 缺少有效抽帧数量`);
    }

    nextManifest.actions[action.action] = {
      source: action.sourceVideo,
      frameRoot: `../${dirname(action.runtimeFrameRoot)}/frames`,
      filePattern: "frame_{index}.png",
      firstFrame: 1,
      frameCount,
      fps: runtimeFps,
      loop: action.loop === true,
      interruptible: action.interruptPolicy !== "locked",
      fallback: action.returnTo,
      enabled: true,
      category: action.category === "interactive" ? "interactive" : "daily",
      entryFrames: [1],
      exitFrames: [frameCount],
      interruptPolicy: action.interruptPolicy,
      returnTo: action.returnTo
    };
  }

  return nextManifest;
}

export function assertRuntimeIntakeApproval({ dryRun, approvalExists, waveId }) {
  if (dryRun) return;
  if (!approvalExists) {
    throw new Error(`缺少 runtime 接入批准文件：docs/runtime-intake-approvals/${waveId}.approved.json`);
  }
}

export function executeRuntimeIntakePlan({
  executionPlan,
  manifest,
  manifestPath,
  root = process.cwd(),
  stdio = "inherit"
}) {
  const frameCounts = {};
  assertCreateOnly(executionPlan);

  for (const action of executionPlan.actions) {
    const sourcePath = join(root, action.sourceVideo);
    const targetFrameRoot = join(root, action.runtimeFrameRoot);
    const tempFrameRoot = join(root, ".tmp", "runtime-intake", executionPlan.wave.id, action.action, "frames");

    if (!existsSync(sourcePath)) {
      throw new Error(`${action.action}: 缺少来源视频 ${action.sourceVideo}`);
    }
    if (pngFrames(targetFrameRoot).length > 0) {
      throw new Error(`${action.action}: 目标帧目录已有帧，当前执行器禁止覆盖 ${action.runtimeFrameRoot}`);
    }

    rmSync(tempFrameRoot, { recursive: true, force: true });
    mkdirSync(tempFrameRoot, { recursive: true });
    extractRuntimeFrames({ sourcePath, outputRoot: tempFrameRoot, root, stdio });
    removeWatermarkAlpha({ frameRoot: tempFrameRoot, root, stdio });
    cleanupGreenSpillInFrameRoot(tempFrameRoot, { root, stdio });

    const frames = pngFrames(tempFrameRoot);
    if (frames.length <= 0) {
      throw new Error(`${action.action}: 抽帧后没有生成 PNG 帧`);
    }

    mkdirSync(dirname(targetFrameRoot), { recursive: true });
    cpSync(tempFrameRoot, targetFrameRoot, { recursive: true });
    frameCounts[action.action] = frames.length;
  }

  const nextManifest = buildRuntimeIntakeManifestPatch({ manifest, executionPlan, frameCounts });
  writeFileSync(join(root, manifestPath), `${JSON.stringify(nextManifest, null, 2)}\n`);

  return {
    wave: executionPlan.wave.id,
    actions: executionPlan.actions.map((action) => ({
      action: action.action,
      frames: frameCounts[action.action],
      runtimeFrameRoot: action.runtimeFrameRoot
    })),
    manifestPath
  };
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
      `- loop=${action.loop}`,
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
  let node = valueAtBridgePath(bridges, action.bridge);
  if (Array.isArray(node) && node.includes(action.action)) {
    return "already-referenced";
  }
  return "manual";
}

function valueAtBridgePath(bridges, bridgePath) {
  const aliases = {
    "daily-rotation.low-fatigue": "dailyRotation.lowFatigue",
    "daily-rotation.life": "dailyRotation.life",
    "daily-rotation.explore": "dailyRotation.explore",
    "proximity.mouse_near": "proximity.mouse_near",
    "reminder.water": "reminder.water",
    "reminder.rest": "reminder.rest",
    "click.single": "click.single",
    "click.repeated": "click.repeated",
    "click.wake": "click.wake",
    "drag.active": "drag.start"
  };
  const normalizedPath = aliases[bridgePath] ?? bridgePath;
  return normalizedPath.split(".").reduce((node, part) => node?.[part], bridges);
}

function assertCreateOnly(executionPlan) {
  const replacing = executionPlan.actions.filter((action) => action.frameOperation !== "create");
  if (replacing.length > 0) {
    throw new Error(`当前 runtime intake 执行器只允许新增帧目录，禁止覆盖：${replacing.map((action) => action.action).join(", ")}`);
  }
}

function extractRuntimeFrames({ sourcePath, outputRoot, root, stdio }) {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-v",
      "error",
      "-i",
      sourcePath,
      "-t",
      String(runtimeFrameSeconds),
      "-vf",
      [
        `fps=${runtimeFps}`,
        "chromakey=0x00ff00:0.28:0.10",
        "format=rgba",
        `scale=${runtimeFrameSize}:${runtimeFrameSize}:force_original_aspect_ratio=decrease`,
        `pad=${runtimeFrameSize}:${runtimeFrameSize}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
        "format=rgba"
      ].join(","),
      join(outputRoot, "frame_%06d.png")
    ],
    { cwd: root, stdio }
  );
}

function removeWatermarkAlpha({ frameRoot, root, stdio }) {
  for (const file of pngFrames(frameRoot)) {
    const framePath = join(frameRoot, file);
    execFileSync(
      "magick",
      [
        framePath,
        "-alpha",
        "set",
        "-region",
        watermarkRegion,
        "-channel",
        "A",
        "-evaluate",
        "set",
        "0",
        "+channel",
        framePath
      ],
      { cwd: root, stdio }
    );
  }
}

function pngFrames(frameRoot) {
  if (!existsSync(frameRoot)) return [];
  return readdirSync(frameRoot)
    .filter((file) => /^frame_\d{6}\.png$/.test(file))
    .sort();
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

  const text = renderRuntimeIntakeExecutionPlan(executionPlan);
  if (!options.dryRun) {
    const result = executeRuntimeIntakePlan({
      executionPlan,
      manifest: readJson(options.manifestPath),
      manifestPath: options.manifestPath
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

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
