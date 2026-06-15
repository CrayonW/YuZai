import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { selectBatchActionNames } from "./batch-plan.mjs";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

export function buildKlingBatchStatus(rootDir, batches, options) {
  const actionNames = selectBatchActionNames(batches, options);
  const batch = findBatch(batches, options.batch);
  const byName = new Map(batch.actions.map((action) => [action.action, action]));
  const actions = actionNames.map((actionName) => {
    const action = byName.get(actionName);
    const outputPath = join(rootDir, action.output);
    const exists = existsSync(outputPath);
    const sizeBytes = exists ? statSync(outputPath).size : 0;
    return {
      action: action.action,
      output: action.output,
      status: exists ? (sizeBytes > 0 ? "ready" : "empty") : "missing",
      sizeBytes
    };
  });

  return {
    batch: {
      id: batch.id,
      name: batch.name
    },
    summary: {
      total: actions.length,
      ready: actions.filter((action) => action.status === "ready").length,
      empty: actions.filter((action) => action.status === "empty").length,
      missing: actions.filter((action) => action.status === "missing").length
    },
    actions
  };
}

export function renderKlingBatchStatus(status, options = {}) {
  const batchSelector = options.batch ?? status.batch.id;
  const lines = [
    "# 可灵批次产物状态",
    "",
    `批次：${status.batch.name} (${status.batch.id})`,
    `汇总：ready ${status.summary.ready} / empty ${status.summary.empty} / missing ${status.summary.missing} / total ${status.summary.total}`,
    "",
    "| action | status | size | output |",
    "| --- | --- | ---: | --- |"
  ];

  for (const action of status.actions) {
    lines.push(`| ${action.action} | ${action.status} | ${action.sizeBytes} | ${action.output} |`);
  }

  lines.push(
    "",
    "## 下一步",
    "",
    `- 生成缺失视频：\`npm run kling:generate-batch -- --batch ${batchSelector}\``,
    "- 生成后先人工检查无水印、无文字、无 logo、全身入镜和绿幕稳定。",
    "- 通过人工检查后，再运行素材接入清单并进入抽帧/manifest 流程。"
  );

  return `${lines.join("\n")}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv.slice(2));
  const batches = JSON.parse(readFileSync(join(root, options.batches), "utf8"));
  const status = buildKlingBatchStatus(root, batches, options);
  const markdown = renderKlingBatchStatus(status, options);
  if (options.write) {
    writeFileSync(join(root, options.write), markdown);
  }
  console.log(markdown);
}

function parseArgs(args) {
  const options = {
    batch: "",
    batches: "docs/kling-generation-batches.json",
    write: ""
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--batch") {
      options.batch = args[++index];
    } else if (arg === "--batches") {
      options.batches = args[++index];
    } else if (arg === "--write") {
      options.write = args[++index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.batch) throw new Error("Pass --batch <number-or-id>");
  return options;
}

function findBatch(batches, batchSelector) {
  const numericIndex = Number(batchSelector);
  if (Number.isInteger(numericIndex) && numericIndex >= 1) {
    const batch = batches.batches[numericIndex - 1];
    if (batch) return batch;
  }
  const batch = batches.batches.find((candidate) => candidate.id === batchSelector || candidate.name === batchSelector);
  if (batch) return batch;
  throw new Error(`Batch not found: ${batchSelector}`);
}
