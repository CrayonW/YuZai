import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const projectDir = join(root, "assets", "hyperframes", "cat-actions");
const spriteRoot = join(root, "assets", "sprites");
const sourceFrameRoot = join(projectDir, "source-frames");
const outputRoot = join(root, "assets", "generated", "cat-actions");
const templatePath = join(projectDir, "action-template.tmpl");
const indexPath = join(projectDir, "index.html");
const manifestPath = join(outputRoot, "manifest.json");

const frameCount = 16;
const fps = 30;
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

mkdirSync(outputRoot, { recursive: true });
const template = readFileSync(templatePath, "utf8");
const renderedByAction = readExistingManifestEntries();

for (const action of targetActions) {
  if (!actions.includes(action)) {
    throw new Error(`Unknown action "${action}". Expected one of: ${actions.join(", ")}`);
  }
  validateFrames(action);
  copySourceFrames(action);
  writeActionIndex(action);
  renderAction(action);
  renderedByAction.set(action, buildManifestEntry(action));
}

const rendered = actions.map((action) => renderedByAction.get(action)).filter(Boolean);

writeFileSync(manifestPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  renderer: "HyperFrames",
  projectDir,
  sourceFrameCount: frameCount,
  renderFps: fps,
  actions: rendered
}, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  ok: true,
  outputRoot,
  manifestPath,
  actions: rendered.map((entry) => entry.action)
}, null, 2));

function validateFrames(action) {
  const dir = join(spriteRoot, action);
  if (!existsSync(dir)) throw new Error(`Missing sprite action folder: ${dir}`);

  for (let index = 1; index <= frameCount; index += 1) {
    const suffix = String(index).padStart(4, "0");
    const frame = join(dir, `${action}_${suffix}.png`);
    if (!existsSync(frame)) throw new Error(`Missing sprite frame: ${frame}`);
  }
}

function copySourceFrames(action) {
  const dir = join(sourceFrameRoot, action);
  mkdirSync(dir, { recursive: true });

  for (let index = 1; index <= frameCount; index += 1) {
    const suffix = String(index).padStart(4, "0");
    copyFileSync(
      join(spriteRoot, action, `${action}_${suffix}.png`),
      join(dir, `${action}_${suffix}.png`)
    );
  }
}

function writeActionIndex(action) {
  const durationSeconds = durationForAction(action);
  const secondsPerFrame = 1 / actionFps[action];
  const frames = Array.from({ length: frameCount }, (_, index) => {
    const suffix = String(index + 1).padStart(4, "0");
    const src = relativeForHtml(projectDir, join(sourceFrameRoot, action, `${action}_${suffix}.png`));
    return `      <img class="frame frame-${suffix}" src="${src}" alt="" />`;
  }).join("\n");

  const html = template
    .replaceAll("__DURATION__", String(durationSeconds))
    .replaceAll("__SECONDS_PER_FRAME__", secondsPerFrame.toFixed(6))
    .replace("__FRAMES__", frames);

  writeFileSync(indexPath, html, "utf8");
}

function renderAction(action) {
  const actionOut = join(outputRoot, action);
  rmSync(actionOut, { recursive: true, force: true });
  mkdirSync(actionOut, { recursive: true });

  runHyperframes(["lint", projectDir]);
  runHyperframes([
    "render",
    projectDir,
    "--format",
    "png-sequence",
    "--fps",
    String(fps),
    "--quality",
    "standard",
    "--workers",
    "1",
    "--output",
    join(actionOut, "frames")
  ]);
  encodeTransparentWebm(actionOut, action);
  encodeTransparentGif(actionOut, action);
}

function buildManifestEntry(action) {
  const actionOut = join(outputRoot, action);
  const pngFramesDir = join(actionOut, "frames");
  const pngFrames = existsSync(pngFramesDir)
    ? readdirSync(pngFramesDir).filter((file) => file.endsWith(".png")).sort()
    : [];

  return {
    action,
    sourceFps: actionFps[action],
    renderFps: fps,
    durationSeconds: durationForAction(action),
    webm: join(actionOut, `${action}.webm`),
    gif: join(actionOut, `${action}.gif`),
    pngFramesDir,
    pngFrameCount: pngFrames.length
  };
}

function runHyperframes(args) {
  execFileSync("npx", ["--yes", "hyperframes@0.6.93", ...args], {
    cwd: root,
    stdio: "inherit"
  });
}

function readExistingManifestEntries() {
  if (!existsSync(manifestPath)) return new Map();

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return new Map((manifest.actions ?? []).map((entry) => [entry.action, entry]));
}

function encodeTransparentWebm(actionOut, action) {
  execFileSync("ffmpeg", [
    "-y",
    "-framerate",
    String(fps),
    "-i",
    join(actionOut, "frames", "frame_%06d.png"),
    "-c:v",
    "libvpx-vp9",
    "-pix_fmt",
    "yuva420p",
    "-auto-alt-ref",
    "0",
    "-crf",
    "24",
    "-b:v",
    "0",
    join(actionOut, `${action}.webm`)
  ], { stdio: "inherit" });
}

function encodeTransparentGif(actionOut, action) {
  execFileSync("magick", [
    "-delay",
    "3",
    "-loop",
    "0",
    "-dispose",
    "Background",
    join(actionOut, "frames", "frame_*.png"),
    join(actionOut, `${action}.gif`)
  ], { stdio: "inherit" });
}

function relativeForHtml(fromDir, targetPath) {
  const rel = relative(fromDir, targetPath);
  return rel
    .split("/")
    .map((part, index) => index === 0 ? part : encodeURIComponent(part))
    .join("/");
}

function durationForAction(action) {
  return Number((frameCount / actionFps[action]).toFixed(6));
}
