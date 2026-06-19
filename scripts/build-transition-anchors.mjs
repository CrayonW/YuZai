import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");
const outputPath = join(root, "assets", "runtime", "animations", "transition-anchors.json");
const directionActions = [
  "look_e",
  "look_ene",
  "look_ne",
  "look_nne",
  "look_n",
  "look_nnw",
  "look_nw",
  "look_wnw",
  "look_w",
  "look_wsw",
  "look_sw",
  "look_ssw",
  "look_s",
  "look_sse",
  "look_se",
  "look_ese"
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const transitions = buildTransitions();
const anchors = {};

for (const transition of transitions) {
  anchors[anchorKey(transition.from, transition.to)] = bestAnchor(transition.from, transition.to);
}

const output = {
  version: 1,
  generatedAt: new Date().toISOString(),
  source: "assets/runtime/animations/manifest.json",
  strategy: "sampled-rmse",
  sampleWindowFrames: 24,
  sampleStrideFrames: 4,
  anchors
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, anchorCount: Object.keys(anchors).length, output: "assets/runtime/animations/transition-anchors.json" }, null, 2));

function buildTransitions() {
  const transitions = [];
  for (const action of directionActions) {
    transitions.push({ from: "idle_primary", to: action });
    transitions.push({ from: action, to: "idle_primary" });
  }
  for (let index = 0; index < directionActions.length; index += 1) {
    const current = directionActions[index];
    const next = directionActions[(index + 1) % directionActions.length];
    transitions.push({ from: current, to: next });
    transitions.push({ from: next, to: current });
  }
  return transitions;
}

function bestAnchor(fromAction, toAction) {
  const fromConfig = manifest.actions[fromAction];
  const toConfig = manifest.actions[toAction];
  if (!fromConfig || !toConfig) throw new Error(`Unknown transition ${fromAction} -> ${toAction}`);

  let best = null;
  for (const fromFrame of sampledFrames(fromConfig, "exit")) {
    for (const toFrame of sampledFrames(toConfig, "entry")) {
      const metric = compareFrameMetric(framePath(fromConfig, fromFrame), framePath(toConfig, toFrame));
      if (!best || metric < best.metric) {
        best = { fromFrame, toFrame, metric };
      }
    }
  }

  if (!best) throw new Error(`No anchor candidates for ${fromAction} -> ${toAction}`);
  return {
    fromAction,
    toAction,
    fromFrame: best.fromFrame,
    toFrame: best.toFrame,
    metric: Number(best.metric.toFixed(6))
  };
}

function sampledFrames(config, side) {
  const frameCount = Math.max(1, config.frameCount);
  const frames = [];
  if (side === "entry") {
    for (let frame = 1; frame <= Math.min(24, frameCount); frame += 4) frames.push(frame);
  } else {
    const start = Math.max(1, frameCount - 23);
    for (let frame = start; frame <= frameCount; frame += 4) frames.push(frame);
    if (!frames.includes(frameCount)) frames.push(frameCount);
  }
  return frames;
}

function compareFrameMetric(left, right) {
  if (!existsSync(left) || !existsSync(right)) return 1;
  try {
    const output = execFileSync("magick", ["compare", "-metric", "RMSE", left, right, "null:"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    return parseRmse(output);
  } catch (error) {
    const text = `${error.stdout || ""}\n${error.stderr || ""}`;
    return parseRmse(text);
  }
}

function parseRmse(text) {
  const match = String(text).match(/\((0(?:\.\d+)?|1(?:\.0+)?)\)/);
  return match ? Number(match[1]) : 1;
}

function framePath(config, oneBasedFrame) {
  const frameNumber = String(config.firstFrame + oneBasedFrame - 1).padStart(6, "0");
  const repoFrameRoot = config.frameRoot.replace(/^\.\.\//, "");
  return join(root, repoFrameRoot, config.filePattern.replace("{index}", frameNumber));
}

function anchorKey(fromAction, toAction) {
  return `${fromAction}->${toAction}`;
}
