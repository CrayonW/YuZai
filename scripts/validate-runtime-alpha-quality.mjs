import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, "assets/runtime/animations/manifest.json"), "utf8"));
const maxGreenSpillRatio = 0.001;
const maxConsecutiveAlphaMeanDelta = 0.02;
const failures = [];

for (const [action, config] of Object.entries(manifest.actions)) {
  if (!config.enabled || config.frameCount <= 0) continue;
  const frameRoot = join(root, config.frameRoot.replace(/^\.\.\//, ""));
  const alphaMeans = measureAlphaMeans(frameRoot);

  for (const frameNumber of sampledFrameNumbers(config)) {
    const framePath = join(frameRoot, config.filePattern.replace("{index}", String(frameNumber).padStart(6, "0")));
    if (!existsSync(framePath)) {
      failures.push({ action, frameNumber, reason: "missing-frame", framePath });
      continue;
    }

    const greenSpillRatio = measureGreenSpillRatio(framePath);
    if (greenSpillRatio > maxGreenSpillRatio) {
      failures.push({
        action,
        frameNumber,
        reason: "green-spill",
        greenSpillRatio: Number(greenSpillRatio.toFixed(6)),
        maxGreenSpillRatio,
        framePath
      });
    }
  }

  for (let index = 1; index < alphaMeans.length; index += 1) {
    const previous = alphaMeans[index - 1];
    const current = alphaMeans[index];
    const delta = Math.abs(current.alphaMean - previous.alphaMean);
    if (delta > maxConsecutiveAlphaMeanDelta) {
      failures.push({
        action,
        frameNumber: current.frameNumber,
        previousFrameNumber: previous.frameNumber,
        reason: "alpha-mean-jump",
        alphaMeanDelta: Number(delta.toFixed(6)),
        previousAlphaMean: Number(previous.alphaMean.toFixed(6)),
        alphaMean: Number(current.alphaMean.toFixed(6)),
        maxConsecutiveAlphaMeanDelta,
        framePath: current.framePath
      });
    }
  }
}

console.log(JSON.stringify({ ok: failures.length === 0, maxGreenSpillRatio, maxConsecutiveAlphaMeanDelta, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;

function sampledFrameNumbers(config) {
  const first = config.firstFrame;
  const last = config.firstFrame + config.frameCount - 1;
  return Array.from(new Set([
    first,
    Math.round(first + (last - first) / 3),
    Math.round(first + (last - first) * 2 / 3),
    last
  ])).sort((a, b) => a - b);
}

function measureGreenSpillRatio(framePath) {
  const output = execFileSync(
    "magick",
    [
      framePath,
      "-alpha",
      "on",
      "-fx",
      "a > 0.005 && g > 0.06 && g > r*1.08 && g > b*1.08 ? 1 : 0",
      "-format",
      "%[fx:mean]\\n",
      "info:"
    ],
    { cwd: root, encoding: "utf8" }
  );
  return Number(output.trim());
}

function measureAlphaMeans(frameRoot) {
  if (!existsSync(frameRoot)) return [];
  const files = readdirSync(frameRoot)
    .filter((file) => /^frame_\d{6}\.png$/.test(file))
    .sort();
  if (files.length === 0) return [];

  return files.map((fileName) => {
    const frameMatch = fileName.match(/frame_(\d+)\.png$/);
    const framePath = join(frameRoot, fileName);
    return {
      frameNumber: frameMatch ? Number(frameMatch[1]) : 0,
      alphaMean: pngAlphaMean(framePath),
      framePath
    };
  });
}

function pngAlphaMean(framePath) {
  const png = readFileSync(framePath);
  const signature = png.subarray(0, 8);
  if (signature.toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${framePath}: not a PNG file`);
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const data = png.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || (colorType !== 4 && colorType !== 6)) {
    throw new Error(`${framePath}: expected 8-bit PNG with alpha, got bitDepth=${bitDepth} colorType=${colorType}`);
  }

  const channels = colorType === 6 ? 4 : 2;
  const alphaOffset = colorType === 6 ? 3 : 1;
  const rowBytes = width * channels;
  const inflated = inflateSync(Buffer.concat(idat));
  let inputOffset = 0;
  let previous = Buffer.alloc(rowBytes);
  let alphaSum = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    const raw = inflated.subarray(inputOffset, inputOffset + rowBytes);
    inputOffset += rowBytes;
    const row = unfilterRow(raw, previous, channels, filter);
    for (let x = alphaOffset; x < row.length; x += channels) {
      alphaSum += row[x];
    }
    previous = row;
  }

  return alphaSum / (width * height * 255);
}

function unfilterRow(raw, previous, bytesPerPixel, filter) {
  const row = Buffer.alloc(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    const left = index >= bytesPerPixel ? row[index - bytesPerPixel] : 0;
    const up = previous[index] ?? 0;
    const upLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] : 0;
    if (filter === 0) row[index] = raw[index];
    else if (filter === 1) row[index] = (raw[index] + left) & 255;
    else if (filter === 2) row[index] = (raw[index] + up) & 255;
    else if (filter === 3) row[index] = (raw[index] + Math.floor((left + up) / 2)) & 255;
    else if (filter === 4) row[index] = (raw[index] + paeth(left, up, upLeft)) & 255;
    else throw new Error(`unsupported PNG filter ${filter}`);
  }
  return row;
}

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);
  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}
