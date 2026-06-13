export interface ActionTiming {
  minIdleMs: number;
  walkMs: number;
  sleepMs: number;
  sleepyMs: number;
  sleepAfterMs: number;
  interactionMs: number;
  shyClickCount: number;
  clickDebounceMs: number;
}

export interface RuntimeConfig {
  timing: ActionTiming;
  movement: {
    speedPxPerSecond: number;
    edgePadding: number;
  };
}

export const DEFAULT_CONFIG: RuntimeConfig = {
  timing: {
    minIdleMs: 3000,
    walkMs: 5200,
    sleepMs: 2200,
    sleepyMs: 2400,
    sleepAfterMs: 16000,
    interactionMs: 1200,
    shyClickCount: 3,
    clickDebounceMs: 300
  },
  movement: {
    speedPxPerSecond: 42,
    edgePadding: 20
  }
};

export function frequencyMultiplier(frequency: "low" | "normal" | "high"): number {
  if (frequency === "low") return 1.8;
  if (frequency === "high") return 0.62;
  return 1;
}
