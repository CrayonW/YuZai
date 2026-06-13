import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputRoot = join(root, "assets", "generated", "cat-actions");
const frameSize = 512;
const renderFps = 30;
const sourceFrameCount = 16;
const actionFps = {
  idle: 8,
  walk: 12,
  walk_left: 12,
  walking: 12,
  sleep: 6,
  sleepy: 6,
  sleeping: 6,
  waking: 8,
  surprised: 10,
  shy: 8,
  dragging: 8,
  waving: 10,
  teaser: 10
};
const actions = [
  "idle",
  "walk",
  "walk_left",
  "walking",
  "sleep",
  "sleepy",
  "sleeping",
  "waking",
  "surprised",
  "shy",
  "dragging",
  "waving",
  "teaser"
];

const requestedActions = process.argv.slice(2);
const targetActions = requestedActions.length > 0 ? requestedActions : actions;
const failures = [];
const reports = targetActions.map((action) => validateAction(action));

const report = {
  outputRoot,
  frameSize,
  renderFps,
  sourceFrameCount,
  actions: reports,
  ok: failures.length === 0,
  failures
};

console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exitCode = 1;

function validateAction(action) {
  const actionDir = join(outputRoot, action);
  const framesDir = join(actionDir, "frames");
  const webmPath = join(actionDir, `${action}.webm`);
  const gifPath = join(actionDir, `${action}.gif`);

  if (!existsSync(actionDir)) failures.push(`${action}: missing output directory`);
  if (!existsSync(framesDir)) failures.push(`${action}: missing frames directory`);
  if (!existsSync(webmPath)) failures.push(`${action}: missing transparent webm`);
  if (!existsSync(gifPath)) failures.push(`${action}: missing transparent gif`);

  const frames = existsSync(framesDir)
    ? readdirSync(framesDir).filter((file) => file.endsWith(".png")).sort()
    : [];
  const frameCount = expectedRenderedFrameCount(action);
  if (frames.length !== frameCount) failures.push(`${action}: expected ${frameCount} rendered PNG frames, found ${frames.length}`);

  const sampledFrames = frames.filter((_, index) => index === 0 || index === Math.floor(frames.length / 2) || index === frames.length - 1);
  const frameReports = sampledFrames.map((file) => {
    const metrics = imageMetrics(join(framesDir, file));
    if (metrics.width !== frameSize || metrics.height !== frameSize) {
      failures.push(`${action}/${file}: expected ${frameSize}x${frameSize}, got ${metrics.width}x${metrics.height}`);
    }
    if (!metrics.channels.includes("a")) {
      failures.push(`${action}/${file}: missing alpha channel`);
    }
    if (metrics.alphaMax <= 0) {
      failures.push(`${action}/${file}: no visible cat pixels`);
    }
    if (metrics.alphaMin !== 0) {
      failures.push(`${action}/${file}: frame is not transparent around the subject`);
    }
    return { file, ...metrics };
  });

  const gifAlpha = existsSync(gifPath) ? alphaRange(`${gifPath}[0]`) : null;
  if (gifAlpha && gifAlpha.max <= 0) failures.push(`${action}.gif: no visible pixels`);
  if (gifAlpha && gifAlpha.min !== 0) failures.push(`${action}.gif: first frame has no transparent background`);

  const webm = existsSync(webmPath) ? webmMetadata(webmPath) : null;
  if (webm && webm.width !== frameSize) failures.push(`${action}.webm: expected width ${frameSize}, got ${webm.width}`);
  if (webm && webm.height !== frameSize) failures.push(`${action}.webm: expected height ${frameSize}, got ${webm.height}`);
  if (webm && webm.alphaMode !== "1") failures.push(`${action}.webm: expected alpha_mode=1, got ${webm.alphaMode ?? "missing"}`);

  return {
    action,
    sourceFps: actionFps[action],
    renderFps,
    durationSeconds: durationForAction(action),
    webmPath,
    gifPath,
    framesDir,
    pngFrameCount: frames.length,
    frameSamples: frameReports,
    gifAlpha,
    webm
  };
}

function durationForAction(action) {
  return Number((sourceFrameCount / actionFps[action]).toFixed(6));
}

function expectedRenderedFrameCount(action) {
  return Math.ceil(durationForAction(action) * renderFps);
}

function imageMetrics(filePath) {
  const identify = execFileSync("magick", [
    "identify",
    "-format",
    "%w %h %[channels]",
    filePath
  ], { encoding: "utf8" }).trim();
  const [width, height, channels] = identify.split(/\s+/);
  const alpha = alphaRange(filePath);
  return {
    width: Number(width),
    height: Number(height),
    channels,
    alphaMin: alpha.min,
    alphaMax: alpha.max
  };
}

function alphaRange(filePath) {
  const out = execFileSync("magick", [
    filePath,
    "-alpha",
    "extract",
    "-format",
    "%[fx:minima] %[fx:maxima]",
    "info:"
  ], { encoding: "utf8" }).trim();
  const [min, max] = out.split(/\s+/).map(Number);
  return { min, max };
}

function webmMetadata(filePath) {
  const out = execFileSync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=codec_name,pix_fmt,width,height:stream_tags=alpha_mode",
    "-of",
    "json",
    filePath
  ], { encoding: "utf8" });
  const stream = JSON.parse(out).streams?.[0] ?? {};
  return {
    codec: stream.codec_name,
    pixFmt: stream.pix_fmt,
    width: stream.width,
    height: stream.height,
    alphaMode: stream.tags?.alpha_mode
  };
}
