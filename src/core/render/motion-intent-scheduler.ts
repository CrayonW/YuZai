import type { RuntimeAnimationAction } from "./animation-manifest";

export type MotionIntentType = "preview" | "drag" | "click" | "proximity" | "mouse-follow" | "daily" | "base";

export interface MotionIntentSchedulerOptions {
  defaultAction: RuntimeAnimationAction;
  mouseFollowStableMs?: number;
  mouseFollowMinHoldMs?: number;
}

export type MotionIntent =
  | { type: "preview"; action: RuntimeAnimationAction; now: number; until: number }
  | { type: "drag" | "click" | "proximity"; action: RuntimeAnimationAction; now: number; lockMs?: number }
  | { type: "mouse-follow"; action: RuntimeAnimationAction; now: number; near: boolean }
  | { type: "daily"; action: RuntimeAnimationAction; now: number; holdMs?: number }
  | { type: "base"; action: RuntimeAnimationAction; now: number };

interface LockedIntent {
  type: MotionIntentType;
  action: RuntimeAnimationAction;
  until: number;
}

interface MouseFollowCandidate {
  action: RuntimeAnimationAction;
  since: number;
}

export class MotionIntentScheduler {
  private readonly defaultAction: RuntimeAnimationAction;
  private readonly mouseFollowStableMs: number;
  private readonly mouseFollowMinHoldMs: number;
  private baseAction: RuntimeAnimationAction;
  private dailyAction: RuntimeAnimationAction;
  private dailyUntil = 0;
  private currentLock: LockedIntent | null = null;
  private queuedOneShots = new Map<MotionIntentType, LockedIntent>();
  private preview: { action: RuntimeAnimationAction; until: number } | null = null;
  private mouseFollowCandidate: MouseFollowCandidate | null = null;
  private activeMouseFollow: { action: RuntimeAnimationAction; startedAt: number } | null = null;

  constructor(options: MotionIntentSchedulerOptions) {
    this.defaultAction = options.defaultAction;
    this.baseAction = options.defaultAction;
    this.dailyAction = options.defaultAction;
    this.mouseFollowStableMs = options.mouseFollowStableMs ?? 160;
    this.mouseFollowMinHoldMs = options.mouseFollowMinHoldMs ?? 300;
  }

  submit(intent: MotionIntent): void {
    if (intent.type === "preview") {
      this.preview = { action: intent.action, until: intent.until };
      return;
    }

    if (intent.type === "base") {
      this.baseAction = intent.action;
      if (this.dailyAction === this.defaultAction) this.dailyAction = intent.action;
      return;
    }

    if (intent.type === "daily") {
      this.dailyAction = intent.action;
      this.dailyUntil = intent.now + (intent.holdMs ?? 0);
      return;
    }

    if (intent.type === "mouse-follow") {
      this.submitMouseFollow(intent);
      return;
    }

    const lock = {
      type: intent.type,
      action: intent.action,
      until: intent.now + (intent.lockMs ?? 0)
    };

    if (!this.currentLock || priorityFor(intent.type) > priorityFor(this.currentLock.type)) {
      this.currentLock = lock;
      return;
    }

    if (this.currentLock.type === intent.type && this.currentLock.action === intent.action) return;
    this.queuedOneShots.set(intent.type, lock);
  }

  resolve(now: number): RuntimeAnimationAction {
    if (this.preview && now < this.preview.until) return this.preview.action;
    if (this.preview && now >= this.preview.until) this.preview = null;

    if (this.currentLock && now < this.currentLock.until) return this.currentLock.action;
    if (this.currentLock && now >= this.currentLock.until) this.releaseCurrentLock();

    const queued = this.nextQueuedOneShot();
    if (queued) {
      this.currentLock = queued;
      return queued.action;
    }

    const mouseFollowAction = this.resolveMouseFollow(now);
    if (mouseFollowAction) return mouseFollowAction;

    if (this.dailyUntil > 0 && now >= this.dailyUntil) {
      this.dailyAction = this.baseAction || this.defaultAction;
      this.dailyUntil = 0;
    }

    return this.dailyAction || this.baseAction || this.defaultAction;
  }

  completeCurrent(action: RuntimeAnimationAction, now: number): void {
    if (this.currentLock?.action === action) {
      this.currentLock = null;
      this.resolve(now);
    }
  }

  pendingCount(): number {
    return this.queuedOneShots.size + (this.currentLock ? 1 : 0);
  }

  private submitMouseFollow(intent: Extract<MotionIntent, { type: "mouse-follow" }>): void {
    if (!intent.near) {
      this.mouseFollowCandidate = null;
      this.activeMouseFollow = null;
      return;
    }

    if (this.mouseFollowCandidate?.action === intent.action) return;
    this.mouseFollowCandidate = { action: intent.action, since: intent.now };
  }

  private resolveMouseFollow(now: number): RuntimeAnimationAction | null {
    if (!this.mouseFollowCandidate) return this.activeMouseFollow?.action ?? null;

    const candidateStable = now - this.mouseFollowCandidate.since >= this.mouseFollowStableMs;
    const activeHeld =
      !this.activeMouseFollow || now - this.activeMouseFollow.startedAt >= this.mouseFollowMinHoldMs;

    if (candidateStable && activeHeld) {
      if (this.activeMouseFollow?.action !== this.mouseFollowCandidate.action) {
        this.activeMouseFollow = { action: this.mouseFollowCandidate.action, startedAt: now };
      }
    }

    return this.activeMouseFollow?.action ?? null;
  }

  private releaseCurrentLock(): void {
    this.currentLock = null;
  }

  private nextQueuedOneShot(): LockedIntent | null {
    const queued = [...this.queuedOneShots.values()].sort((left, right) => priorityFor(right.type) - priorityFor(left.type))[0];
    if (!queued) return null;
    this.queuedOneShots.delete(queued.type);
    return queued;
  }
}

function priorityFor(type: MotionIntentType): number {
  switch (type) {
    case "preview":
      return 100;
    case "drag":
      return 90;
    case "click":
      return 80;
    case "proximity":
      return 70;
    case "mouse-follow":
      return 60;
    case "daily":
      return 20;
    case "base":
      return 10;
  }
}
