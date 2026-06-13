import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputRoot = join(root, "assets", "references", "video-reference");
const tmpRoot = join(root, ".tmp");
const videoPath = process.argv[2];
const frameCount = Number(process.argv[3] || 16);

if (!videoPath) {
  console.error("Usage: node scripts/extract-video-reference.mjs <video-path> [frame-count]");
  process.exit(1);
}

if (!existsSync(videoPath)) {
  console.error(`Video not found: ${videoPath}`);
  process.exit(1);
}

mkdirSync(outputRoot, { recursive: true });
mkdirSync(tmpRoot, { recursive: true });

const metadata = getVideoMetadata(videoPath);
const fpsExpression = `${frameCount}/${metadata.durationSeconds}`;
const framePattern = join(outputRoot, "frame_%04d.png");
const contactSheetPath = join(outputRoot, "reference-video-contact-sheet.png");
const metadataPath = join(outputRoot, "reference-video-metadata.json");

run("ffmpeg", [
  "-y",
  "-i",
  videoPath,
  "-vf",
  `fps=${fpsExpression},scale=256:256`,
  framePattern
]);

run("magick", [
  "montage",
  join(outputRoot, "frame_*.png"),
  "-background",
  "black",
  "-tile",
  "8x",
  "-geometry",
  "160x160+4+4",
  contactSheetPath
]);

const output = {
  source: videoPath,
  sourceName: basename(videoPath),
  frameCount,
  ...metadata,
  framesPattern: framePattern,
  contactSheetPath
};

writeFileSync(metadataPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify(output, null, 2));

function getVideoMetadata(filePath) {
  const raw = run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,r_frame_rate",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    filePath
  ], "utf8");
  const parsed = JSON.parse(raw);
  const stream = parsed.streams?.[0] ?? {};
  return {
    width: Number(stream.width),
    height: Number(stream.height),
    frameRate: stream.r_frame_rate,
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
