import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export function inspectCaptureSequence(options) {
  const count = Math.max(1, Math.floor(Number(options.count || 1)));
  const minChangedFrames = Math.max(1, Math.floor(Number(options.minChangedFrames || 2)));
  const minWidth = Math.max(1, Math.floor(Number(options.minWidth || 1)));
  const minHeight = Math.max(1, Math.floor(Number(options.minHeight || 1)));
  const frames = Array.from({ length: count }, (_, index) => inspectFrame(numberedPath(options.sequencePath, index + 1)));
  const failures = [];
  const presentFrames = frames.filter((frame) => frame.exists && frame.size > 0);
  const validFrames = presentFrames.filter((frame) => frame.isPng);
  const changedFrames = new Set(validFrames.map((frame) => frame.sha256)).size;

  for (const frame of frames) {
    if (!frame.exists) {
      failures.push(`${path.basename(frame.path)} is missing`);
    } else if (frame.size <= 0) {
      failures.push(`${path.basename(frame.path)} is empty`);
    } else if (!frame.isPng) {
      failures.push(`${path.basename(frame.path)} is not a valid PNG`);
    } else if (frame.width < minWidth || frame.height < minHeight) {
      failures.push(`${path.basename(frame.path)} dimensions ${frame.width}x${frame.height} are below required ${minWidth}x${minHeight}`);
    }
  }

  if (validFrames.length === count && changedFrames < minChangedFrames) {
    failures.push(`changed frame count ${changedFrames} is below required ${minChangedFrames}`);
  }

  return {
    ok: failures.length === 0,
    sequencePath: options.sequencePath,
    expectedCount: count,
    changedFrames,
    minChangedFrames,
    minWidth,
    minHeight,
    frames,
    failures
  };
}

export function numberedPath(filePath, frameNumber) {
  const parsed = path.parse(filePath);
  const suffix = String(frameNumber).padStart(3, "0");
  return path.join(parsed.dir, `${parsed.name}-${suffix}${parsed.ext || ".png"}`);
}

function inspectFrame(filePath) {
  if (!existsSync(filePath)) {
    return {
      path: filePath,
      exists: false,
      size: 0,
      isPng: false,
      width: 0,
      height: 0,
      sha256: null
    };
  }

  const size = statSync(filePath).size;
  const bytes = readFileSync(filePath);
  const dimensions = pngDimensions(bytes);
  return {
    path: filePath,
    exists: true,
    size,
    isPng: dimensions.isPng,
    width: dimensions.width,
    height: dimensions.height,
    sha256: createHash("sha256").update(bytes).digest("hex")
  };
}

function pngDimensions(bytes) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  const isPng =
    bytes.length >= 24 &&
    signature.every((value, index) => bytes[index] === value) &&
    bytes.toString("ascii", 12, 16) === "IHDR";

  if (!isPng) {
    return { isPng: false, width: 0, height: 0 };
  }

  return {
    isPng: true,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20)
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv.slice(2));
  const result = inspectCaptureSequence(options);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

function parseArgs(args) {
  const options = {
    sequencePath: "",
    count: 6,
    minChangedFrames: 2,
    minWidth: 10,
    minHeight: 10
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--sequence-path") {
      options.sequencePath = args[++index] || "";
    } else if (arg === "--count") {
      options.count = Number(args[++index]);
    } else if (arg === "--min-changed-frames") {
      options.minChangedFrames = Number(args[++index]);
    } else if (arg === "--min-width") {
      options.minWidth = Number(args[++index]);
    } else if (arg === "--min-height") {
      options.minHeight = Number(args[++index]);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.sequencePath) {
    throw new Error("Missing required argument: --sequence-path");
  }

  return options;
}
