import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const batchDefinitions = [
  {
    id: "fatigue-and-key-interaction",
    name: "第一批：降低疲劳与关键交互",
    reason: "优先补最像真实小猫生活的长日常动作，并让鼠标/点击拥有专属反馈。",
    actions: ["groom_face_wash", "loaf_breathing", "cursor_watch", "click_surprised"]
  },
  {
    id: "sleep-routine",
    name: "第二批：睡眠作息链路",
    reason: "补齐变困、入睡、睡着、唤醒，让桌宠有更真实的日常作息。",
    actions: ["sleepy", "sleep", "sleeping", "waking"]
  },
  {
    id: "remaining-state-and-variety",
    name: "第三批：剩余状态与生活化变化",
    reason: "补齐剩余 fallback 状态，并增加好奇、伸懒腰、拖拽等变化。",
    actions: ["desk_sniff", "stretch_yawn", "poke_annoyed", "shy", "dragging", "call_response"]
  }
];

export function buildKlingGenerationBatches({ plan, backlog = { items: [] } }) {
  const actionsByName = new Map((plan.actions ?? []).map((action) => [action.action, action]));
  const backlogByAction = new Map((backlog.items ?? []).map((item) => [item.suggestedAction, item.state]));
  const seen = new Set();
  const batches = batchDefinitions.map((definition) => {
    const actions = definition.actions
      .filter((actionName) => actionsByName.has(actionName))
      .filter((actionName) => {
        if (seen.has(actionName)) return false;
        seen.add(actionName);
        return true;
      })
      .map((actionName) => toBatchAction(actionsByName.get(actionName), backlogByAction.get(actionName)));

    return {
      id: definition.id,
      name: definition.name,
      reason: definition.reason,
      actions
    };
  }).filter((batch) => batch.actions.length > 0);

  return {
    version: 1,
    sourcePlan: "docs/kling-action-generation-plan.json",
    sourceBacklog: "docs/state-backlog.md",
    prerequisite: "先运行 auth-check，确认可灵 API 鉴权通过，再按批次生成。",
    summary: {
      totalBatches: batches.length,
      totalActions: batches.reduce((sum, batch) => sum + batch.actions.length, 0)
    },
    batches
  };
}

export function renderKlingGenerationBatches(report) {
  const lines = [
    "# 可灵视频生成优先批次",
    "",
    "本文档用于在可灵 API 鉴权通过后，按优先级生成真实小猫桌宠动作视频。",
    "",
    `前置要求：${report.prerequisite}`,
    "",
    "生成前仍需遵守项目规则：新增、删除或覆盖素材前，先列清单给用户确认；生成后先人工检查无水印、无文字、无 logo、全身入镜，再进入抽帧和 manifest 接入。",
    ""
  ];

  for (const batch of report.batches) {
    lines.push(`## ${batch.name}`, "", batch.reason, "", "| action | 分类 | 时长 | 输出 | 覆盖状态 | 生成命令 |", "| --- | --- | ---: | --- | --- | --- |");
    for (const action of batch.actions) {
      lines.push(`| ${action.action} | ${action.category} | ${action.durationSeconds}s | ${action.output} | ${action.backlogState ?? "-"} | \`npm run kling:generate -- --action ${action.action}\` |`);
    }
    lines.push("");
  }

  lines.push(
    "## 批次后处理",
    "",
    "1. 每个视频生成后先人工检查：猫咪身份一致、无水印、无 logo、无文字、全身入镜、绿幕稳定。",
    "2. 通过后运行 `npm run animations:intake-checklist`，列出本批次要接入的源视频、action、分类和目标路径。",
    "3. 得到确认后再执行去水印/抠绿、序列帧生成、manifest 更新和桌面多帧截图验收。",
    "4. 每完成一个 MVP 可见能力，提交并推送到 GitHub。"
  );

  return `${lines.join("\n")}\n`;
}

export function writeKlingGenerationBatches(report, jsonPath, markdownPath) {
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const markdown = renderKlingGenerationBatches(report);
  if (markdownPath) {
    mkdirSync(dirname(markdownPath), { recursive: true });
    writeFileSync(markdownPath, markdown);
  }
  return markdown;
}

function toBatchAction(action, backlogState) {
  return {
    action: action.action,
    category: action.category,
    durationSeconds: action.durationSeconds,
    output: action.output,
    antiFatigueRole: action.antiFatigueRole,
    backlogState: backlogState ?? null
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv.slice(2));
  const plan = JSON.parse(readFileSync(options.plan, "utf8"));
  const backlog = readBacklogMarkdown(options.backlog);
  const report = buildKlingGenerationBatches({ plan, backlog });
  const markdown = options.writeJson || options.writeMarkdown
    ? writeKlingGenerationBatches(report, options.writeJson || "docs/kling-generation-batches.json", options.writeMarkdown)
    : renderKlingGenerationBatches(report);
  console.log(markdown);
}

function parseArgs(args) {
  const options = {
    plan: "docs/kling-action-generation-plan.json",
    backlog: "docs/state-backlog.md",
    writeJson: "",
    writeMarkdown: ""
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--plan") {
      options.plan = args[++index];
    } else if (arg === "--backlog") {
      options.backlog = args[++index];
    } else if (arg === "--write-json") {
      options.writeJson = args[++index];
    } else if (arg === "--write-md") {
      options.writeMarkdown = args[++index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function readBacklogMarkdown(path) {
  const text = readFileSync(path, "utf8");
  const items = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("| ")) continue;
    if (line.includes("suggested action") || line.includes("---")) continue;
    const cells = line.split("|").map((cell) => cell.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    items.push({ state: cells[0], suggestedAction: cells[1] });
  }
  return { items };
}
