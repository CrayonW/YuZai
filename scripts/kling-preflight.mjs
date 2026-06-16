import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createKlingJwt } from "./kling/jwt.mjs";
import { loadDotEnv } from "./kling/env.mjs";
import { selectBatchActions } from "./kling/batch-plan.mjs";

export function buildKlingPreflightReport({ root, plan, batches, batch, env, auth }) {
  const actions = selectBatchActions(plan, batches, { batch });
  const outputItems = actions.map((action) => {
    const path = action.output;
    const absolutePath = join(root, path);
    const exists = existsSync(absolutePath);
    return {
      action: action.action,
      category: action.category,
      path,
      exists,
      size: exists ? statSync(absolutePath).size : 0
    };
  });

  const referencePath = plan.referenceImage || "";
  const referenceAbsolutePath = join(root, referencePath);
  const credentials = {
    accessKey: describeSecret(env.KLING_ACCESS_KEY),
    secretKey: describeSecret(env.KLING_SECRET_KEY)
  };
  const missingCredentials = !credentials.accessKey.present || !credentials.secretKey.present;
  const referenceMissing = !referencePath || !existsSync(referenceAbsolutePath);
  const missingCount = outputItems.filter((item) => !item.exists || item.size <= 0).length;
  const readyCount = outputItems.length - missingCount;
  const ok = !missingCredentials && !referenceMissing && auth.ok;

  return {
    ok,
    generatedAt: new Date().toISOString(),
    batch,
    credentials,
    auth,
    referenceImage: {
      path: referencePath,
      exists: !referenceMissing
    },
    batch: {
      selector: batch,
      actionCount: actions.length
    },
    outputs: {
      readyCount,
      missingCount,
      items: outputItems
    },
    nextSteps: buildNextSteps({ missingCredentials, referenceMissing, auth, batch, missingCount })
  };
}

export function renderKlingPreflightReport(report) {
  const lines = [
    "## 可灵生成前置检查报告",
    "",
    "安全原则：本报告只记录密钥是否存在和长度，不输出真实密钥。",
    "",
    `总体状态：${report.ok ? "可以开始生成" : "暂不能生成"}`,
    `批次：${report.batch.selector}`,
    `动作数量：${report.batch.actionCount}`,
    "",
    "### 密钥与鉴权",
    "",
    `- Access Key：${renderSecret(report.credentials.accessKey)}`,
    `- Secret Key：${renderSecret(report.credentials.secretKey)}`,
    `- 鉴权：${report.auth.ok ? "通过" : "鉴权未通过"}`,
    `- 鉴权状态：${report.auth.status ?? "-"} ${report.auth.kind ?? ""}`.trim(),
    `- 鉴权信息：${report.auth.message || "-"}`,
    "",
    "### 参考图",
    "",
    `- 路径：${report.referenceImage.path || "-"}`,
    `- 状态：${report.referenceImage.exists ? "存在" : "缺失"}`,
    "",
    "### 批次产物",
    "",
    `- 已有视频：${report.outputs.readyCount}`,
    `- 缺失视频：${report.outputs.missingCount}`,
    ""
  ];

  for (const item of report.outputs.items) {
    lines.push(`- ${item.action}：${item.exists && item.size > 0 ? "ready" : "missing"}，${item.path}，${item.size} bytes`);
  }

  lines.push("", "### 下一步", "");
  for (const step of report.nextSteps) {
    lines.push(`- ${step}`);
  }

  return `${lines.join("\n")}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  loadDotEnv(root);
  const options = parseArgs(process.argv.slice(2));
  const plan = JSON.parse(readFileSync(join(root, options.plan), "utf8"));
  const batches = JSON.parse(readFileSync(join(root, options.batches), "utf8"));
  const auth = options.skipAuth ? { ok: true, kind: "skipped", message: "Skipped by --skip-auth" } : await checkAuth(root, options);
  const report = buildKlingPreflightReport({
    root,
    plan,
    batches,
    batch: options.batch,
    env: process.env,
    auth
  });
  const markdown = renderKlingPreflightReport(report);
  if (options.write) {
    writeFileSync(join(root, options.write), markdown);
  }
  process.stdout.write(markdown);
  if (!report.ok && options.strict) {
    process.exitCode = 1;
  }
}

function parseArgs(args) {
  const options = {
    batch: "1",
    batches: "docs/kling-generation-batches.json",
    plan: "docs/kling-action-generation-plan.json",
    write: "",
    strict: false,
    skipAuth: false,
    baseUrl: (process.env.KLING_API_BASE_URL || "https://api.klingai.com").replace(/\/$/, ""),
    queryPath: process.env.KLING_IMAGE_TO_VIDEO_QUERY_PATH || "/v1/videos/image2video/{task_id}"
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--batch") {
      options.batch = args[++index];
    } else if (arg === "--batches") {
      options.batches = args[++index];
    } else if (arg === "--plan") {
      options.plan = args[++index];
    } else if (arg === "--write") {
      options.write = args[++index];
    } else if (arg === "--strict") {
      options.strict = true;
    } else if (arg === "--skip-auth") {
      options.skipAuth = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

async function checkAuth(root, options) {
  const accessKey = process.env.KLING_ACCESS_KEY || "";
  const secretKey = process.env.KLING_SECRET_KEY || "";
  if (!accessKey || !secretKey) {
    return {
      ok: false,
      kind: "missing_credentials",
      message: "Missing KLING_ACCESS_KEY or KLING_SECRET_KEY"
    };
  }

  try {
    const token = createKlingJwt(accessKey, secretKey);
    const probePath = options.queryPath.replace("{task_id}", "nonexistent-auth-probe");
    const response = await fetch(`${options.baseUrl}${probePath}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const text = await response.text();
    const parsed = parseJson(text);
    return {
      ok: response.status !== 401,
      status: response.status,
      kind: response.status === 401 ? "auth_failed" : "auth_accepted",
      message: parsed?.message || parsed?.raw || "",
      serverDate: response.headers.get("date")
    };
  } catch (error) {
    return {
      ok: false,
      kind: "network_error",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

function describeSecret(value) {
  return {
    present: !!value,
    length: value ? String(value).length : 0
  };
}

function renderSecret(secret) {
  return secret.present ? `已配置，长度 ${secret.length}` : "缺失";
}

function buildNextSteps({ missingCredentials, referenceMissing, auth, batch, missingCount }) {
  if (missingCredentials) {
    return ["在本机 `.env.local` 配置 `KLING_ACCESS_KEY` 和 `KLING_SECRET_KEY`，不要提交真实密钥。"];
  }
  if (referenceMissing) {
    return ["补回 `assets/origin/鱼仔参考图.png`，它是所有动作视频的统一猫咪身份参考。"];
  }
  if (!auth.ok) {
    return ["先运行 `npm run kling:auth-check` 并处理可灵开放 API 鉴权问题。"];
  }
  if (missingCount > 0) {
    return [
      `运行 \`npm run kling:generate-batch -- --batch ${batch}\` 生成缺失视频。`,
      `生成后运行 \`npm run kling:batch-intake-checklist -- --batch ${batch} --write docs/kling-batch-intake-first.md\`，先给用户确认清单。`
    ];
  }
  return ["进入人工验收、去水印、抽帧和 runtime manifest 接入流程。"];
}

function parseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
