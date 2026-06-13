import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const spriteRoot = join(root, "assets", "sprites");
const previewRoot = join(root, "assets", "references", "cat-sprite-preview");
const tempRoot = join(root, "assets", "references", "cat-sprite-work");
const chromaHelper = join(process.env.HOME || "/Users/wangjun", ".codex", "skills", ".system", "imagegen", "scripts", "remove_chroma_key.py");
const bundledPython = join(process.env.HOME || "/Users/wangjun", ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "bin", "python3");
const python = process.env.PYTHON || (existsSync(bundledPython) ? bundledPython : "python3");
const frameSize = 512;
const contentSize = 440;
const frameCount = 16;
const grid = 4;

const sheets = [
  { action: "idle", source: "/Users/wangjun/Downloads/Generated image 1.png" },
  { action: "walk", source: "/Users/wangjun/Downloads/Generated image 2.png" },
  { action: "sleep", source: "/Users/wangjun/Downloads/Generated image 3.png" },
  { action: "teaser", source: "/Users/wangjun/Downloads/Generated image 4.png" }
];

for (const sheet of sheets) {
  if (!existsSync(sheet.source)) {
    throw new Error(`Missing reference sheet: ${sheet.source}`);
  }
}

mkdirSync(spriteRoot, { recursive: true });
mkdirSync(previewRoot, { recursive: true });
mkdirSync(tempRoot, { recursive: true });

for (const sheet of sheets) {
  const outDir = join(spriteRoot, sheet.action);
  mkdirSync(outDir, { recursive: true });
  clearPngs(outDir);
  sliceSheet(sheet.source, sheet.action, outDir);
}

const walkLeftDir = join(spriteRoot, "walk_left");
mkdirSync(walkLeftDir, { recursive: true });
clearPngs(walkLeftDir);
for (let index = 1; index <= frameCount; index += 1) {
  const suffix = String(index).padStart(4, "0");
  execFileSync("magick", [
    join(spriteRoot, "walk", `walk_${suffix}.png`),
    "-flop",
    join(walkLeftDir, `walk_left_${suffix}.png`)
  ]);
}

buildPreview();

function sliceSheet(source, action, outDir) {
  const { width, height } = identifySize(source);
  const cellWidth = width / grid;
  const cellHeight = height / grid;
  const inset = 3;

  for (let row = 0; row < grid; row += 1) {
    for (let col = 0; col < grid; col += 1) {
      const frameIndex = row * grid + col + 1;
      const x0 = Math.round(col * cellWidth) + inset;
      const y0 = Math.round(row * cellHeight) + inset;
      const x1 = Math.round((col + 1) * cellWidth) - inset;
      const y1 = Math.round((row + 1) * cellHeight) - inset;
      const cropWidth = x1 - x0;
      const cropHeight = y1 - y0;
      const suffix = String(frameIndex).padStart(4, "0");
      const output = join(outDir, `${action}_${suffix}.png`);
      const keyed = join(tempRoot, `${action}_${suffix}_keyed.png`);

      execFileSync("magick", [
        source,
        "-crop",
        `${cropWidth}x${cropHeight}+${x0}+${y0}`,
        "+repage",
        "-filter",
        "Lanczos",
        "-resize",
        `${contentSize}x${contentSize}`,
        "-gravity",
        "center",
        "-background",
        "#00ff00",
        "-extent",
        `${frameSize}x${frameSize}`,
        keyed
      ]);

      execFileSync(python, [
        chromaHelper,
        "--input",
        keyed,
        "--out",
        output,
        "--auto-key",
        "border",
        "--soft-matte",
        "--transparent-threshold",
        "18",
        "--opaque-threshold",
        "180",
        "--edge-contract",
        "1",
        "--despill",
        "--force"
      ]);
    }
  }
}

function buildPreview() {
  for (const action of ["idle", "walk", "walk_left", "sleep", "teaser"]) {
    const dir = join(spriteRoot, action);
    const frames = Array.from({ length: frameCount }, (_, index) =>
      join(dir, `${action}_${String(index + 1).padStart(4, "0")}.png`)
    );
    execFileSync("magick", [
      "montage",
      ...frames,
      "-background",
      "#20d66b",
      "-alpha",
      "remove",
      "-alpha",
      "off",
      "-tile",
      "4x4",
      "-geometry",
      `${frameSize}x${frameSize}+0+0`,
      join(previewRoot, `${action}-preview.png`)
    ]);
  }
}

function identifySize(filePath) {
  const raw = execFileSync("magick", ["identify", "-format", "%w %h", filePath], { encoding: "utf8" });
  const [width, height] = raw.trim().split(/\s+/).map(Number);
  return { width, height };
}

function clearPngs(dir) {
  for (const file of readdirSync(dir)) {
    if (file.endsWith(".png")) rmSync(join(dir, file));
  }
}
