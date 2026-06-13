import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const videoPath = process.argv[2] || join(root, "assets", "references", "video-reference", "source.mp4");
const shouldApply = process.argv.includes("--apply");
const spriteRoot = join(root, "assets", "sprites");
const idleDir = shouldApply ? join(spriteRoot, "idle") : join(root, "assets", "references", "video-reference", "idle-candidate");
const workDir = join(root, "assets", "references", "video-reference", "idle-build");
const tmpRoot = join(root, ".tmp");
const chromaHelper = join(process.env.HOME || "/Users/wangjun", ".codex", "skills", ".system", "imagegen", "scripts", "remove_chroma_key.py");
const bundledPython = join(process.env.HOME || "/Users/wangjun", ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "bin", "python3");
const python = existsSync(bundledPython) ? bundledPython : "python3";
const frameCount = 16;
const frameSize = 512;

if (!existsSync(videoPath)) {
  console.error(`Video not found: ${videoPath}`);
  process.exit(1);
}

mkdirSync(idleDir, { recursive: true });
mkdirSync(workDir, { recursive: true });
mkdirSync(tmpRoot, { recursive: true });

for (const file of readdirSync(workDir)) {
  if (file.endsWith(".png")) rmSync(join(workDir, file));
}

const metadata = getVideoMetadata(videoPath);
const fpsExpression = `${frameCount}/${metadata.durationSeconds}`;
const rawPattern = join(workDir, "raw_%04d.png");

run("ffmpeg", [
  "-y",
  "-i",
  videoPath,
  "-vf",
  `fps=${fpsExpression},scale=960:960`,
  rawPattern
]);

for (let index = 1; index <= frameCount; index += 1) {
  const suffix = String(index).padStart(4, "0");
  const raw = join(workDir, `raw_${suffix}.png`);
  const cleaned = join(workDir, `idle_${suffix}_cleaned.png`);
  const keyed = join(workDir, `idle_${suffix}_keyed.png`);
  const output = join(idleDir, `idle_${suffix}.png`);

  run("magick", [
    raw,
    // Remove common lower-right AI watermark area before keying the black background.
    "-fill",
    "black",
    "-draw",
    "rectangle 600,575 900,760",
    cleaned
  ]);

  run(python, [
    chromaHelper,
    "--input",
    cleaned,
    "--out",
    keyed,
    "--key-color",
    "#000000",
    "--soft-matte",
    "--transparent-threshold",
    "24",
    "--opaque-threshold",
    "145",
    "--edge-contract",
    "1",
    "--edge-feather",
    "0.25",
    "--despill",
    "--force"
  ]);

  run("magick", [
    keyed,
    "-trim",
    "+repage",
    "-resize",
    "392x392>",
    "-background",
    "none",
    "-gravity",
    "center",
    "-extent",
    `${frameSize}x${frameSize}`,
    keyed
  ]);

  run("magick", [
    keyed,
    "-alpha",
    "on",
    output
  ]);
}

console.log(JSON.stringify({
  ok: true,
  source: videoPath,
  appliedToRuntime: shouldApply,
  outputDir: idleDir,
  frameCount,
  frameSize,
  workDir
}, null, 2));

function getVideoMetadata(filePath) {
  const raw = run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    filePath
  ], "utf8");
  const parsed = JSON.parse(raw);
  return {
    durationSeconds: Number(parsed.format?.duration)
  };
}

function run(command, args, encoding) {
  return execFileSync(command, args, {
    encoding,
    env: {
      ...process.env,
      XDG_CACHE_HOME: tmpRoot
    }
  });
}
