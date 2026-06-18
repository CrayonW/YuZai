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
  interaction: {
    dragVisualFeedback: DragVisualFeedbackConfig;
  };
}

export interface DragVisualFeedbackConfig {
  neutralDistancePx: number;
  fullStrengthDistancePx: number;
  horizontalFollowRatio: number;
  verticalFollowRatio: number;
  maxTranslateX: number;
  minTranslateY: number;
  maxTranslateY: number;
  minLiftPx: number;
  maxLiftPx: number;
  rotationDistancePx: number;
  maxRotationRadians: number;
  maxScaleBoost: number;
}

export const DEFAULT_DRAG_VISUAL_FEEDBACK_CONFIG: DragVisualFeedbackConfig = {
  neutralDistancePx: 8,
  fullStrengthDistancePx: 96,
  horizontalFollowRatio: 0.2,
  verticalFollowRatio: 0.08,
  maxTranslateX: 28,
  minTranslateY: -10,
  maxTranslateY: 16,
  minLiftPx: 14,
  maxLiftPx: 24,
  rotationDistancePx: 520,
  maxRotationRadians: 0.18,
  maxScaleBoost: 0.055
};

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
  },
  interaction: {
    dragVisualFeedback: DEFAULT_DRAG_VISUAL_FEEDBACK_CONFIG
  }
};

export function frequencyMultiplier(frequency: "low" | "normal" | "high"): number {
  if (frequency === "low") return 1.8;
  if (frequency === "high") return 0.62;
  return 1;
}
