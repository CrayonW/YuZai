import { DEFAULT_CONFIG, frequencyMultiplier, type RuntimeConfig } from "../config/load-config";
import type { PetStateMachine } from "../fsm/state-machine";

export type Frequency = "low" | "normal" | "high";

export class AutonomousBehavior {
  private config: RuntimeConfig = DEFAULT_CONFIG;
  private frequency: Frequency = "normal";
  private lastStateChange = performance.now();
  private stateDeadline = performance.now() + DEFAULT_CONFIG.timing.minIdleMs;

  constructor(private readonly fsm: PetStateMachine) {}

  setFrequency(frequency: Frequency): void {
    this.frequency = frequency;
    this.scheduleNextIdleAction(performance.now());
  }

  notifyStateChanged(now = performance.now()): void {
    this.lastStateChange = now;
    if (this.fsm.state === "idle") this.scheduleNextIdleAction(now);
    if (this.fsm.state === "walking") this.stateDeadline = now + this.config.timing.walkMs;
    if (this.fsm.state === "sleepy") this.stateDeadline = now + this.config.timing.sleepyMs;
    if (this.fsm.state === "sleep") this.stateDeadline = now + this.config.timing.sleepMs;
    if (["surprised", "waving", "waking", "teaser"].includes(this.fsm.state)) {
      this.stateDeadline = now + this.config.timing.interactionMs;
    }
    if (this.fsm.state === "shy") this.stateDeadline = now + 1800;
  }

  update(now = performance.now()): void {
    if (now < this.stateDeadline) return;

    if (this.fsm.state === "idle") {
      // Phase 1 keeps sleep transitions manual until real sleep source videos exist.
      this.requestIdleAction(now);
      this.notifyStateChanged(now);
      return;
    }

    if (this.fsm.state === "walking") {
      this.fsm.returnToIdle(now);
      this.notifyStateChanged(now);
      return;
    }

    if (this.fsm.state === "sleepy") {
      this.fsm.request({ state: "sleep", mood: "sleepy", view: "front", direction: 0, force: true }, now);
      this.notifyStateChanged(now);
      return;
    }

    if (this.fsm.state === "sleep") {
      this.fsm.request({ state: "sleeping", mood: "sleepy", view: "front", direction: 0, force: true }, now);
      this.stateDeadline = Number.POSITIVE_INFINITY;
      return;
    }

    if (["surprised", "shy", "waving", "waking", "teaser"].includes(this.fsm.state)) {
      this.fsm.returnToIdle(now);
      this.notifyStateChanged(now);
    }
  }

  private requestIdleAction(now: number): void {
    const roll = Math.random();

    if (roll < 0.55) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      this.fsm.request({ state: "walking", direction, mood: "neutral" }, now);
      return;
    }

    if (roll < 0.8) {
      this.fsm.request({ state: "teaser", mood: "happy", view: "front", direction: 0 }, now);
      this.fsm.lockFor(this.config.timing.interactionMs, now);
      return;
    }

    this.fsm.request({ state: "waving", mood: "happy", view: "front", direction: 0 }, now);
    this.fsm.lockFor(this.config.timing.interactionMs, now);
  }

  private scheduleNextIdleAction(now: number): void {
    const multiplier = frequencyMultiplier(this.frequency);
    const jitter = 900 + Math.random() * 2200;
    this.stateDeadline = now + this.config.timing.minIdleMs * multiplier + jitter;
  }
}
