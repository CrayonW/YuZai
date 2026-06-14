import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const originRoot = join(root, "assets", "origin");
const runtimeRoot = join(root, "assets", "runtime", "animations");
const frameCount = 24;
const fps = 12;
const frameSize = 512;
const watermarkRegion = "122x67+390+445";

const actions = [
  {
    name: "idle_primary",
    source: "鱼仔待机动作1.mp4",
  },
  {
    name: "idle_secondary",
    source: "鱼仔待机动作2.mp4",
  },
  {
    name: "tail_wag",
    source: "鱼仔晃动尾巴视频.mp4",
  },
  {
    name: "walk",
    source: "鱼仔走路视频.mp4",
  },
  {
    name: "paw_raise",
    source: "鱼仔前肢抬起视频.mp4",
  },
];

for (const action of actions) {
  const sourcePath = join(originRoot, action.source);
  const frameRoot = join(runtimeRoot, action.name, "frames");

  if (!existsSync(sourcePath)) {
    throw new Error(`${action.name}: 缺少源视频 ${sourcePath}`);
  }

  rmSync(frameRoot, { recursive: true, force: true });
  mkdirSync(frameRoot, { recursive: true });

  extractFrames(sourcePath, frameRoot);
  removeWatermark(frameRoot);
  console.log(`${action.name}: 已生成 ${frameCount} 帧`);
}

mirrorFrames(join(runtimeRoot, "walk", "frames"), join(runtimeRoot, "walk_left", "frames"));
console.log(`walk_left: 已从 walk 镜像生成 ${frameCount} 帧`);

function extractFrames(sourcePath, outputRoot) {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-v",
      "error",
      "-i",
      sourcePath,
      "-t",
      String(frameCount / fps),
      "-vf",
      [
        `fps=${fps}`,
        "chromakey=0x00ff00:0.28:0.10",
        "format=rgba",
        `scale=${frameSize}:${frameSize}:force_original_aspect_ratio=decrease`,
        `pad=${frameSize}:${frameSize}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
        "format=rgba",
      ].join(","),
      join(outputRoot, "frame_%06d.png"),
    ],
    { cwd: root, stdio: "inherit" },
  );
}

function removeWatermark(frameRoot) {
  for (const file of pngFrames(frameRoot)) {
    const framePath = join(frameRoot, file);
    execFileSync(
      "magick",
      [
        framePath,
        "-alpha",
        "set",
        "-region",
        watermarkRegion,
        "-channel",
        "A",
        "-evaluate",
        "set",
        "0",
        "+channel",
        framePath,
      ],
      { cwd: root, stdio: "inherit" },
    );
  }
}

function mirrorFrames(sourceRoot, outputRoot) {
  if (!existsSync(sourceRoot)) {
    throw new Error(`walk_left: 缺少 walk 源帧 ${sourceRoot}`);
  }

  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(outputRoot, { recursive: true });

  for (const file of pngFrames(sourceRoot)) {
    execFileSync("magick", [join(sourceRoot, file), "-flop", join(outputRoot, file)], {
      cwd: root,
      stdio: "inherit",
    });
  }
}

function pngFrames(frameRoot) {
  return readdirSync(frameRoot)
    .filter((file) => /^frame_\d{6}\.png$/.test(file))
    .sort();
}
