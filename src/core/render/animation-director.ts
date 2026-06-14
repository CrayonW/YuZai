import type { RuntimeAnimationAction, RuntimeAnimationConfig } from "./animation-manifest";
import type { SpriteSequence } from "./sprite-assets";

export type AnimationCategory = "daily" | "interactive" | "transition";
export type InterruptPolicy = "immediate" | "at-safe-frame" | "locked";

export interface AnimationSchedulingConfig {
  category?: AnimationCategory;
  entryFrames?: number[];
  exitFrames?: number[];
  interruptPolicy?: InterruptPolicy;
  returnTo?: RuntimeAnimationAction;
  transitionIn?: RuntimeAnimationAction | null;
  transitionOut?: RuntimeAnimationAction | null;
}

export interface AnimationDirectorOptions {
  defaultAction: RuntimeAnimationAction;
  resolveSequence: (action: RuntimeAnimationAction) => SpriteSequence;
  resolveConfig: (action: RuntimeAnimationAction) => (RuntimeAnimationConfig & AnimationSchedulingConfig) | undefined;
  maxSafeFrameWaitMs?: number;
}

export interface AnimationFrameSelection {
  action: RuntimeAnimationAction;
  sequence: SpriteSequence;
  frameIndex: number;
  nextFrameIndex: number;
  blend: number;
}

interface PendingRequest {
  action: RuntimeAnimationAction;
  requestedAt: number;
}

export class AnimationDirector {
  private readonly maxSafeFrameWaitMs: number;
  private currentAction: RuntimeAnimationAction;
  private actionStartedAt = 0;
  private actionFrameOffset = 0;
  private pending: PendingRequest | null = null;

  constructor(private readonly options: AnimationDirectorOptions) {
    this.currentAction = options.defaultAction;
    this.maxSafeFrameWaitMs = options.maxSafeFrameWaitMs ?? 120;
  }

  request(action: RuntimeAnimationAction, now = performance.now()): void {
    if (action === this.currentAction && !this.pending) return;

    const currentConfig = this.configFor(this.currentAction);
    if (currentConfig.interruptPolicy === "immediate") {
      this.switchTo(action, now);
      return;
    }

    this.pending = { action, requestedAt: now };
  }

  update(now = performance.now()): AnimationFrameSelection {
    this.resolvePending(now);
    let selection = this.selectionFor(this.currentAction, now);

    if (this.shouldReturnToDaily(selection)) {
      const currentConfig = this.configFor(this.currentAction);
      this.switchTo(currentConfig.returnTo ?? this.options.defaultAction, now);
      selection = this.selectionFor(this.currentAction, now);
    }

    return selection;
  }

  private resolvePending(now: number): void {
    if (!this.pending) return;

    const currentConfig = this.configFor(this.currentAction);
    if (currentConfig.interruptPolicy === "locked") return;

    const currentSelection = this.selectionFor(this.currentAction, now);
    const waitedMs = now - this.pending.requestedAt;
    const canSwitch =
      currentConfig.interruptPolicy === "immediate" ||
      this.isExitFrame(currentSelection.frameIndex, currentConfig) ||
      waitedMs >= this.maxSafeFrameWaitMs;

    if (!canSwitch) return;

    const nextAction = this.pending.action;
    this.pending = null;
    this.switchTo(nextAction, now);
  }

  private switchTo(action: RuntimeAnimationAction, now: number): void {
    const config = this.configFor(action);
    const sequence = this.options.resolveSequence(action);
    const entryFrame = firstValidFrame(config.entryFrames, sequence.frames.length);
    this.currentAction = action;
    this.actionStartedAt = now;
    this.actionFrameOffset = entryFrame - 1;
  }

  private selectionFor(action: RuntimeAnimationAction, now: number): AnimationFrameSelection {
    const sequence = this.options.resolveSequence(action);
    const frameCount = Math.max(1, sequence.frames.length);
    const elapsedFrames = Math.max(0, (now - this.actionStartedAt) / 1000) * sequence.fps;
    const rawFrameIndex = this.actionFrameOffset + Math.floor(elapsedFrames);
    const frameIndex = sequence.loop ? rawFrameIndex % frameCount : Math.min(rawFrameIndex, frameCount - 1);
    const nextFrameIndex = sequence.loop ? (frameIndex + 1) % frameCount : Math.min(frameIndex + 1, frameCount - 1);

    return {
      action,
      sequence,
      frameIndex,
      nextFrameIndex,
      blend: elapsedFrames - Math.floor(elapsedFrames)
    };
  }

  private shouldReturnToDaily(selection: AnimationFrameSelection): boolean {
    const config = this.configFor(selection.action);
    if (config.category !== "interactive" && config.category !== "transition") return false;
    if (selection.sequence.loop) return false;
    return selection.frameIndex >= selection.sequence.frames.length - 1;
  }

  private isExitFrame(zeroBasedFrameIndex: number, config: RequiredSchedulingConfig): boolean {
    return config.exitFrames.includes(zeroBasedFrameIndex + 1);
  }

  private configFor(action: RuntimeAnimationAction): RequiredSchedulingConfig {
    const config = this.options.resolveConfig(action);
    const frameCount = Math.max(1, config?.frameCount ?? 1);
    return {
      category: config?.category ?? "daily",
      entryFrames: config?.entryFrames?.length ? config.entryFrames : [1],
      exitFrames: config?.exitFrames?.length ? config.exitFrames : [frameCount],
      interruptPolicy: config?.interruptPolicy ?? "at-safe-frame",
      returnTo: config?.returnTo,
      transitionIn: config?.transitionIn ?? null,
      transitionOut: config?.transitionOut ?? null
    };
  }
}

interface RequiredSchedulingConfig {
  category: AnimationCategory;
  entryFrames: number[];
  exitFrames: number[];
  interruptPolicy: InterruptPolicy;
  returnTo?: RuntimeAnimationAction;
  transitionIn: RuntimeAnimationAction | null;
  transitionOut: RuntimeAnimationAction | null;
}

function firstValidFrame(frames: number[] | undefined, frameCount: number): number {
  const first = frames?.find((frame) => Number.isInteger(frame) && frame >= 1 && frame <= frameCount);
  return first ?? 1;
}
