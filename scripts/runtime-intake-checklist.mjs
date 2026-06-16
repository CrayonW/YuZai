import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function buildRuntimeIntakeChecklist({ plan, waveId }) {
  const wave = plan.waves?.find((item) => item.id === waveId);
  if (!wave) {
    throw new Error(`Unknown runtime intake wave: ${waveId}`);
  }

  const actions = wave.actions.map((action) => ({ ...action }));
  const summary = {
    totalActions: actions.length,
    recommendedCount: actions.filter((action) => action.status === "recommended").length,
    deferredCount: actions.filter((action) => action.status === "deferred").length,
    needsConfirmationCount: actions.filter((action) => action.confirmation === "needs-user-confirmation").length
  };

  return {
    version: plan.version,
    confirmationRule: plan.confirmationRule,
    wave: {
      id: wave.id,
      name: wave.name,
      intent: wave.intent
    },
    summary,
    actions
  };
}

export function renderRuntimeIntakeChecklist(checklist) {
  const lines = [
    `# runtime 接入前用户确认清单：${checklist.wave.name}`,
    "",
    `波次 ID：${checklist.wave.id}`,
    `目的：${checklist.wave.intent}`,
    "",
    "## 确认规则",
    "",
    checklist.confirmationRule,
    "",
    "只允许在用户明确确认本清单后执行去水印/抠绿、序列帧抽取、runtime manifest 修改和桌面验收。",
    "",
    "## 摘要",
    "",
    `- 动作数量：${checklist.summary.totalActions}`,
    `- 推荐接入：${checklist.summary.recommendedCount}`,
    `- 暂缓候选：${checklist.summary.deferredCount}`,
    `- 仍需用户确认：${checklist.summary.needsConfirmationCount}`,
    "",
    "## 动作清单",
    ""
  ];

  for (const action of checklist.actions) {
    lines.push(
      `### ${action.action}`,
      "",
      `- 目标 action：${action.action}`,
      `- 分类：${action.category}`,
      `- 当前状态：${action.status}`,
      `- 确认状态：${action.confirmation}`,
      `- 来源视频：${action.sourceVideo}`,
      `- 审查证据：${action.reviewEvidence.join("、")}`,
      `- 运行帧输出：${action.runtimeFrameRoot}`,
      `- 桥接入口：${action.bridge}`,
      `- 中断策略：${action.interruptPolicy}`,
      `- 结束返回：${action.returnTo}`,
      `- 衔接策略：${action.transitionPlan}`,
      `- 水印门禁：${action.watermarkGate}`,
      ""
    );
  }

  lines.push(
    "## 批准后允许执行",
    "",
    "1. 逐个播放来源视频，确认无文字、水印、logo、额外物体和明显变形。",
    "2. 对确认通过的视频执行去水印、抠绿、序列帧生成。",
    "3. 更新 `assets/runtime/animations/manifest.json` 和对应行为桥接。",
    "4. 执行桌面可视化验收：桌面可见、始终置顶、鼠标靠近/点击/提醒触发正确、姿势回切自然。",
    "",
    "## 确认前禁止",
    "",
    "- 禁止抽帧。",
    "- 禁止去水印/抠绿。",
    "- 禁止修改 runtime manifest。",
    "- 禁止覆盖已有 runtime 动作目录。",
    "- 禁止把 mp4 强制加入 Git。",
    "- 禁止声称本波动作已经进入桌宠。",
    "",
    "## 验证命令",
    "",
    "```bash",
    "npm run validate:runtime-intake-waves",
    "npm run validate:runtime-intake-checklist",
    "npm run validate:release",
    "```",
    ""
  );

  return `${lines.join("\n")}`;
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
  const planAbsolutePath = join(process.cwd(), options.planPath);
  if (!existsSync(planAbsolutePath)) {
    throw new Error(`Missing plan: ${options.planPath}`);
  }

  const plan = JSON.parse(readFileSync(planAbsolutePath, "utf8"));
  const checklist = buildRuntimeIntakeChecklist({ plan, waveId: options.waveId });
  const text = renderRuntimeIntakeChecklist(checklist);

  if (options.writePath) {
    writeFileSync(join(process.cwd(), options.writePath), text);
  } else {
    process.stdout.write(text);
  }
}

const currentFile = fileURLToPath(import.meta.url);
const entryFile = process.argv[1] ? join(process.cwd(), process.argv[1]) : "";
if (currentFile === entryFile || currentFile === process.argv[1]) {
  runCli();
}
