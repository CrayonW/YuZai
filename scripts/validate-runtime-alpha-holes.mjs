import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

const root = process.cwd();
const manifestPath = join(root, "assets/runtime/animations/manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const maxHolePixels = 120;
const maxTotalHolePixels = 420;
const maxConsecutiveHoleDelta = 380;
const alphaSolidThreshold = 96;
const alphaHoleThreshold = 32;
const failures = [];
const summaries = [];

for (const [action, config] of Object.entries(manifest.actions)) {
  if (!config.enabled || config.frameCount <= 0) continue;
  const frameRoot = join(root, config.frameRoot.replace(/^\.\.\//, ""));
  if (!existsSync(frameRoot)) {
    failures.push({ action, reason: "missing-frame-root", frameRoot });
    continue;
  }

  const frameFiles = readdirSync(frameRoot)
    .filter((file) => /^frame_\d{6}\.png$/.test(file))
    .sort();
  let previous = null;
  let worstFrame = null;

  for (const fileName of frameFiles) {
    const frameNumber = Number(fileName.match(/frame_(\d+)\.png$/)?.[1] || 0);
    const framePath = join(frameRoot, fileName);
    const metrics = measureAlphaHoles(framePath);
    const current = { action, frameNumber, framePath, ...metrics };

    if (!worstFrame || current.largestHolePixels > worstFrame.largestHolePixels) {
      worstFrame = current;
    }

    if (current.largestHolePixels > maxHolePixels || current.totalHolePixels > maxTotalHolePixels) {
      failures.push({
        action,
        frameNumber,
        reason: "internal-alpha-hole",
        largestHolePixels: current.largestHolePixels,
        totalHolePixels: current.totalHolePixels,
        holeCount: current.holeCount,
        maxHolePixels,
        maxTotalHolePixels,
        framePath
      });
    }

    if (previous) {
      const delta = Math.abs(current.totalHolePixels - previous.totalHolePixels);
      if (delta > maxConsecutiveHoleDelta) {
        failures.push({
          action,
          frameNumber,
          previousFrameNumber: previous.frameNumber,
          reason: "alpha-hole-jump",
          holePixelDelta: delta,
          previousTotalHolePixels: previous.totalHolePixels,
          totalHolePixels: current.totalHolePixels,
          maxConsecutiveHoleDelta,
          framePath
        });
      }
    }
    previous = current;
  }

  if (worstFrame) {
    summaries.push({
      action,
      worstFrameNumber: worstFrame.frameNumber,
      largestHolePixels: worstFrame.largestHolePixels,
      totalHolePixels: worstFrame.totalHolePixels,
      holeCount: worstFrame.holeCount
    });
  }
}

const worst = summaries
  .filter((item) => item.largestHolePixels > 0 || item.totalHolePixels > 0)
  .sort((left, right) => right.totalHolePixels - left.totalHolePixels)
  .slice(0, 12);

console.log(JSON.stringify({
  ok: failures.length === 0,
  alphaSolidThreshold,
  alphaHoleThreshold,
  maxHolePixels,
  maxTotalHolePixels,
  maxConsecutiveHoleDelta,
  worst,
  failureCount: failures.length,
  failures: failures.slice(0, 80)
}, null, 2));

if (failures.length > 0) process.exitCode = 1;

export function measureAlphaHoles(framePath) {
  const image = readPngRgba(framePath);
  const { width, height, rgba } = image;
  const size = width * height;
  const nonCatOrHole = new Uint8Array(size);
  const outside = new Uint8Array(size);
  const queue = [];

  for (let index = 0; index < size; index += 1) {
    const alpha = rgba[index * 4 + 3];
    if (alpha < alphaSolidThreshold) nonCatOrHole[index] = 1;
  }

  for (let x = 0; x < width; x += 1) {
    pushOutside(x, 0);
    pushOutside(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    pushOutside(0, y);
    pushOutside(width - 1, y);
  }

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) pushIndex(index - 1);
    if (x < width - 1) pushIndex(index + 1);
    if (y > 0) pushIndex(index - width);
    if (y < height - 1) pushIndex(index + width);
  }

  const visited = new Uint8Array(size);
  let holeCount = 0;
  let totalHolePixels = 0;
  let largestHolePixels = 0;

  for (let index = 0; index < size; index += 1) {
    if (!nonCatOrHole[index] || outside[index] || visited[index]) continue;
    const alpha = rgba[index * 4 + 3];
    if (alpha >= alphaHoleThreshold) continue;

    let componentPixels = 0;
    let hasVeryTransparentPixel = false;
    const componentQueue = [index];
    visited[index] = 1;

    for (let cursor = 0; cursor < componentQueue.length; cursor += 1) {
      const current = componentQueue[cursor];
      const currentAlpha = rgba[current * 4 + 3];
      componentPixels += 1;
      if (currentAlpha < alphaHoleThreshold) hasVeryTransparentPixel = true;
      const x = current % width;
      const y = Math.floor(current / width);
      visitNeighbor(current - 1, x > 0);
      visitNeighbor(current + 1, x < width - 1);
      visitNeighbor(current - width, y > 0);
      visitNeighbor(current + width, y < height - 1);
    }

    if (!hasVeryTransparentPixel) continue;
    holeCount += 1;
    totalHolePixels += componentPixels;
    largestHolePixels = Math.max(largestHolePixels, componentPixels);

    function visitNeighbor(next, inBounds) {
      if (!inBounds || visited[next] || !nonCatOrHole[next] || outside[next]) return;
      visited[next] = 1;
      componentQueue.push(next);
    }
  }

  return { width, height, holeCount, totalHolePixels, largestHolePixels };

  function pushOutside(x, y) {
    pushIndex(y * width + x);
  }

  function pushIndex(index) {
    if (!nonCatOrHole[index] || outside[index]) return;
    outside[index] = 1;
    queue.push(index);
  }
}

function readPngRgba(framePath) {
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

  if (bitDepth !== 8 || colorType !== 6) {
    throw new Error(`${framePath}: expected 8-bit RGBA PNG, got bitDepth=${bitDepth} colorType=${colorType}`);
  }

  const channels = 4;
  const rowBytes = width * channels;
  const inflated = inflateSync(Buffer.concat(idat));
  const rgba = Buffer.alloc(width * height * channels);
  let inputOffset = 0;
  let outputOffset = 0;
  let previous = Buffer.alloc(rowBytes);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    const raw = inflated.subarray(inputOffset, inputOffset + rowBytes);
    inputOffset += rowBytes;
    const row = unfilterRow(raw, previous, channels, filter);
    row.copy(rgba, outputOffset);
    outputOffset += row.length;
    previous = row;
  }

  return { width, height, rgba };
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
