import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

const root = process.cwd();
const alphaSolidThreshold = 96;
const alphaHoleThreshold = 32;

export function repairRuntimeAlphaHoles(manifestPath = "assets/runtime/animations/manifest.json") {
  const manifest = JSON.parse(readFileSync(join(root, manifestPath), "utf8"));
  const repaired = [];

  for (const [action, config] of Object.entries(manifest.actions)) {
    if (!config.enabled || config.frameCount <= 0) continue;
    const frameRoot = join(root, config.frameRoot.replace(/^\.\.\//, ""));
    if (!existsSync(frameRoot)) continue;

    for (const fileName of pngFrames(frameRoot)) {
      const framePath = join(frameRoot, fileName);
      const result = repairAlphaHolesInFrame(framePath);
      if (result.repairedPixels > 0) {
        repaired.push({
          action,
          frame: fileName,
          repairedPixels: result.repairedPixels,
          holeCount: result.holeCount
        });
      }
    }
  }

  return repaired;
}

export function repairAlphaHolesInFrame(framePath) {
  const image = readPngRgba(framePath);
  const result = fillInternalAlphaHoles(image);
  const greenSpill = repairGreenSpillColor(image);
  if (result.repairedPixels > 0 || greenSpill.repairedGreenPixels > 0) writePngRgba(framePath, image);
  result.repairedGreenPixels = greenSpill.repairedGreenPixels;
  return result;
}

function fillInternalAlphaHoles(image) {
  const { width, height, rgba } = image;
  const size = width * height;
  const nonCatOrHole = new Uint8Array(size);
  const outside = new Uint8Array(size);
  const outsideQueue = [];

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

  for (let cursor = 0; cursor < outsideQueue.length; cursor += 1) {
    const index = outsideQueue[cursor];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) pushIndex(index - 1);
    if (x < width - 1) pushIndex(index + 1);
    if (y > 0) pushIndex(index - width);
    if (y < height - 1) pushIndex(index + width);
  }

  const visited = new Uint8Array(size);
  let repairedPixels = 0;
  let holeCount = 0;

  for (let index = 0; index < size; index += 1) {
    if (!nonCatOrHole[index] || outside[index] || visited[index]) continue;
    const alpha = rgba[index * 4 + 3];
    if (alpha >= alphaHoleThreshold) continue;

    const component = [];
    const border = [];
    const componentQueue = [index];
    visited[index] = 1;

    for (let cursor = 0; cursor < componentQueue.length; cursor += 1) {
      const current = componentQueue[cursor];
      component.push(current);
      const x = current % width;
      const y = Math.floor(current / width);
      visitNeighbor(current - 1, x > 0);
      visitNeighbor(current + 1, x < width - 1);
      visitNeighbor(current - width, y > 0);
      visitNeighbor(current + width, y < height - 1);
      collectBorder(current - 1, x > 0);
      collectBorder(current + 1, x < width - 1);
      collectBorder(current - width, y > 0);
      collectBorder(current + width, y < height - 1);
    }

    const fill = averageBorderColor(border, rgba);
    if (!fill) continue;
    for (const pixelIndex of component) {
      const offset = pixelIndex * 4;
      rgba[offset] = fill.r;
      rgba[offset + 1] = fill.g;
      rgba[offset + 2] = fill.b;
      rgba[offset + 3] = fill.a;
    }
    repairedPixels += component.length;
    holeCount += 1;

    function visitNeighbor(next, inBounds) {
      if (!inBounds || visited[next] || !nonCatOrHole[next] || outside[next]) return;
      visited[next] = 1;
      componentQueue.push(next);
    }

    function collectBorder(next, inBounds) {
      if (!inBounds || nonCatOrHole[next]) return;
      border.push(next);
    }
  }

  return { repairedPixels, holeCount };

  function pushOutside(x, y) {
    pushIndex(y * width + x);
  }

  function pushIndex(index) {
    if (!nonCatOrHole[index] || outside[index]) return;
    outside[index] = 1;
    outsideQueue.push(index);
  }
}

function averageBorderColor(border, rgba) {
  if (border.length === 0) return null;
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  for (const pixelIndex of border) {
    const offset = pixelIndex * 4;
    r += rgba[offset];
    g += rgba[offset + 1];
    b += rgba[offset + 2];
    a += rgba[offset + 3];
  }

  return {
    r: Math.round(r / border.length),
    g: Math.round(g / border.length),
    b: Math.round(b / border.length),
    a: Math.max(alphaSolidThreshold, Math.round(a / border.length))
  };
}

function repairGreenSpillColor(image) {
  const { rgba } = image;
  let repairedGreenPixels = 0;
  for (let offset = 0; offset < rgba.length; offset += 4) {
    const r = rgba[offset];
    const g = rgba[offset + 1];
    const b = rgba[offset + 2];
    const a = rgba[offset + 3];
    if (a <= 1 || g <= 15 || g <= r * 1.08 || g <= b * 1.08) continue;

    const targetGreen = Math.max(r, b);
    rgba[offset + 1] = Math.max(0, Math.min(255, Math.round(targetGreen * 1.02)));
    repairedGreenPixels += 1;
  }
  return { repairedGreenPixels };
}

function pngFrames(frameRoot) {
  return readdirSync(frameRoot)
    .filter((file) => /^frame_\d{6}\.png$/.test(file))
    .sort();
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

function writePngRgba(framePath, image) {
  const { width, height, rgba } = image;
  const rowBytes = width * 4;
  const raw = Buffer.alloc((rowBytes + 1) * height);
  let inputOffset = 0;
  let outputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    raw[outputOffset] = 0;
    outputOffset += 1;
    rgba.copy(raw, outputOffset, inputOffset, inputOffset + rowBytes);
    inputOffset += rowBytes;
    outputOffset += rowBytes;
  }

  const chunks = [
    makeChunk("IHDR", ihdr(width, height)),
    makeChunk("IDAT", deflateSync(raw, { level: 9 })),
    makeChunk("IEND", Buffer.alloc(0))
  ];
  writeFileSync(framePath, Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), ...chunks]));
}

function ihdr(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return data;
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

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

if (import.meta.url === `file://${process.argv[1]}`) {
  const repaired = repairRuntimeAlphaHoles(process.argv[2] || "assets/runtime/animations/manifest.json");
  console.log(JSON.stringify({ ok: true, repairedFrameCount: repaired.length, repaired: repaired.slice(0, 80) }, null, 2));
}
