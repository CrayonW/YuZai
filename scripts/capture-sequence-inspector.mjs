import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export function inspectCaptureSequence(options) {
  const count = Math.max(1, Math.floor(Number(options.count || 1)));
  const minChangedFrames = Math.max(1, Math.floor(Number(options.minChangedFrames || 2)));
  const frames = Array.from({ length: count }, (_, index) => inspectFrame(numberedPath(options.sequencePath, index + 1)));
  const failures = [];
  const presentFrames = frames.filter((frame) => frame.exists && frame.size > 0);
  const changedFrames = new Set(presentFrames.map((frame) => frame.sha256)).size;

  for (const frame of frames) {
    if (!frame.exists) {
      failures.push(`${path.basename(frame.path)} is missing`);
    } else if (frame.size <= 0) {
      failures.push(`${path.basename(frame.path)} is empty`);
    }
  }

  if (presentFrames.length === count && changedFrames < minChangedFrames) {
    failures.push(`changed frame count ${changedFrames} is below required ${minChangedFrames}`);
  }

  return {
    ok: failures.length === 0,
    sequencePath: options.sequencePath,
    expectedCount: count,
    changedFrames,
    minChangedFrames,
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
      sha256: null
    };
  }

  const size = statSync(filePath).size;
  const bytes = readFileSync(filePath);
  return {
    path: filePath,
    exists: true,
    size,
    sha256: createHash("sha256").update(bytes).digest("hex")
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
    minChangedFrames: 2
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--sequence-path") {
      options.sequencePath = args[++index] || "";
    } else if (arg === "--count") {
      options.count = Number(args[++index]);
    } else if (arg === "--min-changed-frames") {
      options.minChangedFrames = Number(args[++index]);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.sequencePath) {
    throw new Error("Missing required argument: --sequence-path");
  }

  return options;
}
