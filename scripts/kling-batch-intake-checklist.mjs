import { readFileSync, writeFileSync } from "node:fs";
import { join, normalize } from "node:path";
import { selectBatchActions } from "./kling/batch-plan.mjs";

export function buildKlingBatchIntakeChecklist({ plan, batches, manifest, batch }) {
  const actions = selectBatchActions(plan, batches, { batch });
  const batchInfo = findBatchInfo(batches, batch);
  const stateHints = buildStateHints(manifest);
  return {
    batch,
    batchName: batchInfo.name ?? batchInfo.id ?? batch,
    batchReason: batchInfo.reason ?? "待确认",
    generatedAt: new Date().toISOString(),
    items: actions.map((action) => {
      const manifestAction = manifest.actions?.[action.action];
      return {
        sourceVideo: action.output,
        targetAction: action.action,
        category: action.category,
        loop: action.loop,
        durationSeconds: action.durationSeconds,
        generationCommand: `npm run kling:generate -- --action ${action.action}`,
        manifestStatus: manifestAction ? "已存在" : "待新增",
        overwritePath: manifestAction?.frameRoot ? runtimePathToDisplay(manifestAction.frameRoot) : `assets/runtime/animations/${action.action}/frames`,
        stateHint: stateHints.get(action.action) || "待确认",
        expectedFrameRate: 24,
        requiredDecision: manifestAction ? "确认是否覆盖现有帧" : "确认新增 manifest action 和状态映射"
      };
    }),
    validations: [
      "npm run kling:batch-status -- --batch <batch>",
      "npm run animations:audit-origin",
      "npm run animations:build-from-origin",
      "npm run validate:runtime-animations",
      "npm run validate:manifest-contract:current",
      "npm run animations:asset-contract -- --write docs/animation-asset-contract.md",
      "npm run validate:release"
    ],
    desktopAcceptance: [
      "YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png YUZAI_CAPTURE_SEQUENCE_COUNT=6 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 YUZAI_CAPTURE_DELAY_MS=900 npm run dev",
      "npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-animation.png --count 6 --min-changed-frames 2 --min-width 200 --min-height 200"
    ]
  };
}

export function renderKlingBatchIntakeChecklist(checklist) {
  const lines = [
    "## 可灵批次素材接入前确认清单",
    "",
    "执行原则：生成视频后、抽帧或覆盖 manifest 前，必须先给用户确认这份清单；确认后才允许处理帧、去水印、覆盖 runtime 路径或修改 manifest。",
    "",
    `批次：${checklist.batch}`,
    `批次名称：${checklist.batchName}`,
    `优先原因：${checklist.batchReason}`,
    "",
    "### 本批次动作",
    ""
  ];

  for (const item of checklist.items) {
    lines.push(`- 源视频：${item.sourceVideo}`);
    lines.push(`  - 目标 action：${item.targetAction}`);
    lines.push(`  - 分类：${item.category}`);
    lines.push(`  - 循环：${item.loop ? "是" : "否"}`);
    lines.push(`  - 时长：${item.durationSeconds}s`);
    lines.push(`  - 生成命令：${item.generationCommand}`);
    lines.push(`  - manifest 状态：${item.manifestStatus}`);
    lines.push(`  - 会覆盖路径：${item.overwritePath}`);
    lines.push(`  - 状态映射建议：${item.stateHint}`);
    lines.push(`  - 预期帧率：${item.expectedFrameRate} fps`);
    lines.push(`  - 需要确认：${item.requiredDecision}`);
  }

  lines.push("", "### 必跑验证命令", "");
  for (const command of checklist.validations) {
    lines.push(`- \`${command.replace("<batch>", checklist.batch)}\``);
  }

  lines.push("", "### 桌面验收方式", "");
  for (const command of checklist.desktopAcceptance) {
    lines.push(`- \`${command}\``);
  }

  return `${lines.join("\n")}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  const plan = JSON.parse(readFileSync(join(root, options.plan), "utf8"));
  const batches = JSON.parse(readFileSync(join(root, options.batches), "utf8"));
  const manifest = JSON.parse(readFileSync(join(root, options.manifest), "utf8"));
  const checklist = buildKlingBatchIntakeChecklist({ plan, batches, manifest, batch: options.batch });
  const markdown = renderKlingBatchIntakeChecklist(checklist);
  if (options.write) {
    writeFileSync(join(root, options.write), markdown);
  }
  process.stdout.write(markdown);
}

function parseArgs(args) {
  const options = {
    batch: "",
    batches: "docs/kling-generation-batches.json",
    manifest: "assets/runtime/animations/manifest.json",
    plan: "docs/kling-action-generation-plan.json",
    write: ""
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--batch") {
      options.batch = args[++index];
    } else if (arg === "--batches") {
      options.batches = args[++index];
    } else if (arg === "--manifest") {
      options.manifest = args[++index];
    } else if (arg === "--plan") {
      options.plan = args[++index];
    } else if (arg === "--write") {
      options.write = args[++index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.batch) throw new Error("Pass --batch <number-or-id>");
  return options;
}

function buildStateHints(manifest) {
  const hints = new Map();
  for (const [state, mapped] of Object.entries(manifest.stateMap || {})) {
    if (typeof mapped === "string") {
      appendHint(hints, mapped, state);
    } else {
      for (const action of Object.values(mapped)) appendHint(hints, action, state);
    }
  }
  return hints;
}

function findBatchInfo(batches, batchSelector) {
  if (!Array.isArray(batches?.batches)) return {};
  const numericIndex = Number(batchSelector);
  if (Number.isInteger(numericIndex) && numericIndex >= 1 && batches.batches[numericIndex - 1]) {
    return batches.batches[numericIndex - 1];
  }
  return batches.batches.find((candidate) => candidate.id === batchSelector || candidate.name === batchSelector) || {};
}

function appendHint(hints, action, state) {
  const existing = hints.get(action);
  hints.set(action, existing ? `${existing}、${state}` : state);
}

function runtimePathToDisplay(frameRoot) {
  return normalize(frameRoot.replace(/^(\.\.\/)?assets\//, "assets/"));
}
