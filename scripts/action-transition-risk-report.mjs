import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const defaultOutputPath = join(root, "docs", "action-transition-risk-report.md");

const RISK_THRESHOLDS = {
  high: 0.18,
  medium: 0.1
};
const featureCache = new Map();
const featureSize = 32;

export function buildActionTransitionRiskReport(manifest) {
  const actions = manifest.actions || {};
  const transitions = [];

  for (const [action, config] of Object.entries(actions)) {
    if (!config?.enabled || config.category === "daily") continue;

    transitions.push(buildTransitionRisk({
      manifest,
      fromAction: manifest.defaultAction,
      toAction: action,
      direction: "进入",
      reason: transitionReasonFor(action, config)
    }));

    const returnTo = config.returnTo || manifest.defaultAction;
    transitions.push(buildTransitionRisk({
      manifest,
      fromAction: action,
      toAction: returnTo,
      direction: "回切",
      reason: `${action} 播放结束后回到 ${returnTo}`
    }));
  }

  const validTransitions = transitions.filter(Boolean).sort((a, b) => b.metric - a.metric);
  return {
    generatedFrom: "assets/runtime/animations/manifest.json",
    actionCount: Object.keys(actions).length,
    transitionCount: validTransitions.length,
    summary: {
      high: validTransitions.filter((item) => item.risk === "high").length,
      medium: validTransitions.filter((item) => item.risk === "medium").length,
      low: validTransitions.filter((item) => item.risk === "low").length
    },
    transitions: validTransitions
  };
}

export function renderActionTransitionRiskReport(report) {
  const lines = [
    "# 动作衔接风险报告",
    "",
    `生成来源：${report.generatedFrom}`,
    `运行时 action 数：${report.actionCount}`,
    `检查切换数：${report.transitionCount}`,
    `风险摘要：high ${report.summary.high} / medium ${report.summary.medium} / low ${report.summary.low}`,
    "",
    "本文档由 `npm run animations:transition-risk -- --write docs/action-transition-risk-report.md` 生成，用于把“动作衔接太生硬”的主观反馈转成可复查的帧差异清单。指标使用 32x32 RGBA 缩略特征计算 RMSE，数值越高，说明切换前后帧差异越大，越需要补安全帧、重生成起止姿态或增加 `transitionIn` / `transitionOut` 专用动作。",
    "",
    "## 当前结论",
    "",
    report.summary.high > 0
      ? `当前存在 ${report.summary.high} 个高风险切换。全局 Canvas 淡入淡出只能缓解闪切，不能替代专用过渡素材。`
      : "当前未发现高风险切换，后续仍需通过桌面录屏观察动作美感。",
    "",
    "## 建议处理顺序",
    "",
    "1. 先处理 high 风险里的鼠标靠近、点击、拖拽和睡眠链路，因为这些最容易被用户主动触发。",
    "2. 对同一个动作同时存在进入和回切高风险时，优先生成一组 `transitionIn` / `transitionOut`。",
    "3. 新视频进入 runtime 前，先刷新本报告，再结合桌面多帧截图或录屏判断是否覆盖 manifest。",
    "",
    "## 切换明细",
    "",
    "| risk | direction | from | to | best frame pair | metric | best source frame | tail diagnosis | current bridge | recommendation | reason |",
    "| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |"
  ];

  for (const item of report.transitions) {
    lines.push(
      `| ${item.risk} | ${item.direction} | ${item.fromAction} | ${item.toAction} | ${item.fromFrame} -> ${item.toFrame} | ${item.metric.toFixed(4)} | ${item.bestSourceFrame} (${item.bestSourceMetric.toFixed(4)}) | ${item.tailDiagnosis} | ${item.currentBridge} | ${item.recommendation} | ${item.reason} |`
    );
  }

  lines.push("");
  return lines.join("\n");
}

export function writeActionTransitionRiskReport(report, outputPath = defaultOutputPath) {
  const text = renderActionTransitionRiskReport(report);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, text);
  return text;
}

function buildTransitionRisk({ manifest, fromAction, toAction, direction, reason }) {
  const fromConfig = manifest.actions?.[fromAction];
  const toConfig = manifest.actions?.[toAction];
  if (!fromConfig || !toConfig) return null;

  const fromFrames = safeFrames(fromConfig.exitFrames, fromConfig.frameCount);
  const toFrames = safeFrames(toConfig.entryFrames, toConfig.frameCount);
  let best = null;
  let bestAnySourceFrame = null;

  for (const fromFrame of fromFrames) {
    for (const toFrame of toFrames) {
      const metric = compareFrameMetric(framePath(fromConfig, fromFrame), framePath(toConfig, toFrame));
      if (!best || metric < best.metric) {
        best = { fromFrame, toFrame, metric };
      }
    }
  }

  for (let fromFrame = 1; fromFrame <= fromConfig.frameCount; fromFrame += 1) {
    for (const toFrame of toFrames) {
      const metric = compareFrameMetric(framePath(fromConfig, fromFrame), framePath(toConfig, toFrame));
      if (!bestAnySourceFrame || metric < bestAnySourceFrame.metric) {
        bestAnySourceFrame = { fromFrame, toFrame, metric };
      }
    }
  }

  if (!best) return null;

  const currentBridge = direction === "进入"
    ? manifest.actions[toAction]?.transitionIn || "Canvas crossfade"
    : manifest.actions[fromAction]?.transitionOut || "Canvas crossfade";
  const tailDiagnosis = diagnoseTailRecoverability({
    direction,
    fromConfig,
    bestAnySourceFrame,
    currentMetric: best.metric
  });

  return {
    direction,
    fromAction,
    toAction,
    fromFrame: best.fromFrame,
    toFrame: best.toFrame,
    metric: best.metric,
    bestSourceFrame: bestAnySourceFrame?.fromFrame ?? best.fromFrame,
    bestSourceMetric: bestAnySourceFrame?.metric ?? best.metric,
    tailDiagnosis,
    risk: riskForMetric(best.metric),
    currentBridge,
    recommendation: recommendationFor({ direction, fromAction, toAction, metric: best.metric, currentBridge, tailDiagnosis }),
    reason
  };
}

function compareFrameMetric(left, right) {
  if (!existsSync(left) || !existsSync(right)) return 1;

  const leftFeature = frameFeature(left);
  const rightFeature = frameFeature(right);
  if (!leftFeature || !rightFeature || leftFeature.length !== rightFeature.length) return 1;

  let sum = 0;
  for (let index = 0; index < leftFeature.length; index += 1) {
    const diff = leftFeature[index] - rightFeature[index];
    sum += diff * diff;
  }

  return Math.sqrt(sum / leftFeature.length) / 255;
}

function frameFeature(path) {
  if (featureCache.has(path)) return featureCache.get(path);

  try {
    const output = execFileSync("magick", [path, "-alpha", "on", "-resize", `${featureSize}x${featureSize}!`, "-depth", "8", "rgba:-"], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    featureCache.set(path, output);
    return output;
  } catch (error) {
    featureCache.set(path, null);
    return null;
  }
}

function framePath(config, oneBasedFrame) {
  const frameNumber = String(config.firstFrame + oneBasedFrame - 1).padStart(6, "0");
  const repoFrameRoot = config.frameRoot.replace(/^\.\.\//, "");
  return join(root, repoFrameRoot, config.filePattern.replace("{index}", frameNumber));
}

function safeFrames(frames, frameCount) {
  const valid = (frames || []).filter((frame) => Number.isInteger(frame) && frame >= 1 && frame <= frameCount);
  return valid.length > 0 ? valid : [1];
}

function riskForMetric(metric) {
  if (metric >= RISK_THRESHOLDS.high) return "high";
  if (metric >= RISK_THRESHOLDS.medium) return "medium";
  return "low";
}

function recommendationFor({ direction, fromAction, toAction, metric, currentBridge, tailDiagnosis }) {
  if (currentBridge !== "Canvas crossfade") return `已配置 ${currentBridge}，需桌面录屏确认`;
  if (metric >= RISK_THRESHOLDS.high) {
    if (tailDiagnosis === "tail-not-recovered") {
      return direction === "回切"
        ? `优先补 ${fromAction}_to_${toAction} transitionOut，或重生成 ${fromAction} 尾段回到 ${toAction}`
        : `优先补 ${fromAction}_to_${toAction} transitionIn，或重生成 ${toAction} 开头更贴近 ${fromAction}`;
    }
    return direction === "进入"
      ? `优先生成 ${fromAction}_to_${toAction} 或给 ${toAction} 标注更自然 entryFrames`
      : `优先生成 ${fromAction}_to_${toAction} 或给 ${fromAction} 标注更自然 exitFrames`;
  }
  if (metric >= RISK_THRESHOLDS.medium) return "保留 Canvas crossfade，并用多帧截图复查";
  return "当前可接受，低频复查即可";
}

function diagnoseTailRecoverability({ direction, fromConfig, bestAnySourceFrame, currentMetric }) {
  if (direction !== "回切") return "not-applicable";
  if (!bestAnySourceFrame) return "unknown";
  if (currentMetric < RISK_THRESHOLDS.high) return "acceptable";

  const progress = bestAnySourceFrame.fromFrame / Math.max(1, fromConfig.frameCount);
  if (progress <= 0.25 && bestAnySourceFrame.metric < currentMetric * 0.6) {
    return "tail-not-recovered";
  }

  return "safe-frame-candidate";
}

function transitionReasonFor(action, config) {
  if (config.category === "interactive") return `${action} 是可被用户触发的交互动作`;
  if (config.category === "transition") return `${action} 是姿势链路过渡动作`;
  return `${action} 是非日常动作`;
}

function parseOutputPath(argv) {
  const writeIndex = argv.indexOf("--write");
  if (writeIndex === -1) return "";
  return argv[writeIndex + 1] || defaultOutputPath;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifest = JSON.parse(readFileSync(join(root, "assets", "runtime", "animations", "manifest.json"), "utf8"));
  const report = buildActionTransitionRiskReport(manifest);
  const outputPath = parseOutputPath(process.argv.slice(2));
  const text = outputPath
    ? writeActionTransitionRiskReport(report, outputPath.startsWith("/") ? outputPath : join(root, outputPath))
    : renderActionTransitionRiskReport(report);

  process.stdout.write(text);
}
