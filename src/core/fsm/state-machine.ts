import { transitionDuration } from "../animation/transition";
import { canInterrupt } from "./priority";
import type { CachedPose, PetPose, PetStateName, StateRequest, StateSnapshot, Transition } from "./state-types";

const INITIAL_POSE: PetPose = {
  state: "idle",
  view: "front",
  mood: "neutral",
  direction: 0
};

export class PetStateMachine {
  private pose: PetPose = { ...INITIAL_POSE };
  private transition: Transition | null = null;
  private previous: CachedPose | null = null;
  private lockedUntil = 0;

  get snapshot(): StateSnapshot {
    return {
      pose: { ...this.pose },
      transition: this.transition ? { ...this.transition } : null,
      previous: this.previous ? { ...this.previous, pose: { ...this.previous.pose } } : null
    };
  }

  get state(): PetStateName {
    return this.pose.state;
  }

  request(request: StateRequest, now = performance.now()): boolean {
    if (request.state === this.pose.state && !request.force) return false;
    if (now < this.lockedUntil && !request.force) return false;
    if (!request.force && !canInterrupt(this.pose.state, request.state)) return false;

    if (request.cacheCurrent) {
      this.previous = { pose: { ...this.pose }, timestamp: now };
    }

    const from = this.pose.state;
    const to = request.state;
    const durationMs = transitionDuration(from, to);

    this.transition = { from, to, durationMs, startedAt: now };
    this.pose = {
      state: to,
      view: request.view ?? this.deriveView(request.direction ?? this.pose.direction),
      mood: request.mood ?? this.deriveMood(to),
      direction: request.direction ?? this.pose.direction
    };

    return true;
  }

  lockFor(durationMs: number, now = performance.now()): void {
    this.lockedUntil = Math.max(this.lockedUntil, now + durationMs);
  }

  update(now = performance.now()): void {
    if (!this.transition) return;
    if (now - this.transition.startedAt >= this.transition.durationMs) {
      this.transition = null;
    }
  }

  returnToIdle(now = performance.now()): void {
    this.request({ state: "idle", mood: "neutral", direction: 0, view: "front", force: true }, now);
  }

  restorePrevious(now = performance.now()): boolean {
    if (!this.previous) {
      this.returnToIdle(now);
      return false;
    }

    const restored = this.previous.pose;
    this.previous = null;
    this.request({ ...restored, force: true }, now);
    return true;
  }

  private deriveMood(state: PetStateName) {
    if (state === "sleep" || state === "sleepy" || state === "sleeping" || state === "waking") return "sleepy";
    if (state === "surprised") return "surprised";
    if (state === "shy") return "shy";
    if (state === "waving" || state === "teaser") return "happy";
    return "neutral";
  }

  private deriveView(direction: -1 | 0 | 1) {
    if (direction < 0) return "left";
    if (direction > 0) return "right";
    return "front";
  }
}
