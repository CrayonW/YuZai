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
    generationBlocker: classifyGenerationBlocker(options.lastError),
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

  if (status.generationBlocker) {
    lines.push(
      "",
      "## 最近一次生成阻塞",
      "",
      `- 类型：${status.generationBlocker.label}`,
      `- 信息：${status.generationBlocker.message}`,
      `- 处理：${status.generationBlocker.recovery}`
    );
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
    lastError: "",
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
    } else if (arg === "--last-error") {
      options.lastError = args[++index];
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

function classifyGenerationBlocker(errorText) {
  const text = String(errorText || "").trim();
  if (!text) return null;
  if (/Account balance not enough|balance not enough|code["']?:?1102|HTTP 429/i.test(text)) {
    return {
      kind: "balance_not_enough",
      label: "余额不足",
      message: "可灵账号余额不足，真实视频没有生成。",
      recovery: "账号余额补足后，重新运行批次生成命令。"
    };
  }
  if (/Auth failed|auth_failed|HTTP 401|code["']?:?1002/i.test(text)) {
    return {
      kind: "auth_failed",
      label: "鉴权失败",
      message: "可灵 API 没有接受当前 Access Key/Secret Key 或 JWT。",
      recovery: "先运行 `npm run kling:auth-check`，确认鉴权通过后再生成。"
    };
  }
  if (/duration value|invalid|HTTP 400|code["']?:?1201/i.test(text)) {
    return {
      kind: "invalid_request",
      label: "请求参数不符合可灵接口",
      message: "可灵 API 拒绝了当前请求参数。",
      recovery: "检查模型、mode、duration 和动作计划中的 generationDurationSeconds。"
    };
  }
  if (/fetch failed|network|ECONN|ENOTFOUND|ETIMEDOUT/i.test(text)) {
    return {
      kind: "network_error",
      label: "网络错误",
      message: "本机没有成功连接到可灵 API。",
      recovery: "确认网络和代理可用后重新运行生成命令。"
    };
  }
  return {
    kind: "unknown",
    label: "未知生成错误",
    message: text.slice(0, 240),
    recovery: "保留完整命令输出，优先更新错误分类和文档，再决定是否重试。"
  };
}
