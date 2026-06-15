import path from "node:path";

export interface CapturePlanInput {
  singlePath: string;
  sequencePath: string;
  count: number;
  intervalMs: number;
  delayMs: number;
}

export interface CaptureFramePlan {
  path: string;
  delayMs: number;
}

export interface CapturePlan {
  enabled: boolean;
  frames: CaptureFramePlan[];
  quitAfterCapture: boolean;
}

export function buildCapturePlan(input: CapturePlanInput): CapturePlan {
  const sequencePath = input.sequencePath.trim();
  if (sequencePath) {
    const count = Math.max(1, Math.floor(input.count));
    const intervalMs = Math.max(1, Math.floor(input.intervalMs));
    return {
      enabled: true,
      frames: Array.from({ length: count }, (_, index) => ({
        path: numberedPath(sequencePath, index + 1),
        delayMs: input.delayMs + index * intervalMs
      })),
      quitAfterCapture: true
    };
  }

  const singlePath = input.singlePath.trim();
  if (singlePath) {
    return {
      enabled: true,
      frames: [{ path: singlePath, delayMs: input.delayMs }],
      quitAfterCapture: true
    };
  }

  return {
    enabled: false,
    frames: [],
    quitAfterCapture: false
  };
}

function numberedPath(filePath: string, frameNumber: number): string {
  const parsed = path.parse(filePath);
  const suffix = String(frameNumber).padStart(3, "0");
  return path.join(parsed.dir, `${parsed.name}-${suffix}${parsed.ext || ".png"}`);
}
