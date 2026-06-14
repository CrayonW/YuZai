import type { RuntimeAnimationAction } from "./animation-manifest";

export interface DailyAnimationRotatorOptions {
  defaultAction: RuntimeAnimationAction;
  variations: RuntimeAnimationAction[];
  firstDelayMs?: number;
  variationDurationMs?: number;
  gapMs?: number;
}

export class DailyAnimationRotator {
  private readonly firstDelayMs: number;
  private readonly variationDurationMs: number;
  private readonly gapMs: number;
  private nextVariationAt: number;
  private activeVariation: { action: RuntimeAnimationAction; endsAt: number } | null = null;
  private variationIndex = 0;

  constructor(private readonly options: DailyAnimationRotatorOptions, startedAt = performance.now()) {
    this.firstDelayMs = options.firstDelayMs ?? 1500;
    this.variationDurationMs = options.variationDurationMs ?? 3000;
    this.gapMs = options.gapMs ?? 7000;
    this.nextVariationAt = startedAt + this.firstDelayMs;
  }

  resolve(baseAction: RuntimeAnimationAction, isIdle: boolean, now = performance.now()): RuntimeAnimationAction {
    if (!isIdle || baseAction !== this.options.defaultAction || this.options.variations.length === 0) {
      this.activeVariation = null;
      this.scheduleNext(now);
      return baseAction;
    }

    if (this.activeVariation) {
      if (now < this.activeVariation.endsAt) return this.activeVariation.action;
      this.activeVariation = null;
      this.scheduleNext(now);
      return this.options.defaultAction;
    }

    if (now >= this.nextVariationAt) {
      this.activeVariation = {
        action: this.options.variations[this.variationIndex % this.options.variations.length],
        endsAt: now + this.variationDurationMs
      };
      this.variationIndex += 1;
      return this.activeVariation.action;
    }

    return this.options.defaultAction;
  }

  private scheduleNext(now: number): void {
    this.nextVariationAt = now + this.gapMs;
  }
}
