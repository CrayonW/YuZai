export type InteractionTrigger = "mouse_near" | "click" | "repeated_click" | "drag" | "wake";

export type InteractionCooldownMap = Record<InteractionTrigger, number>;

export class InteractionCooldowns {
  private readonly lastUsedAt = new Map<InteractionTrigger, number>();

  constructor(private readonly cooldownMsByTrigger: InteractionCooldownMap) {}

  tryUse(trigger: InteractionTrigger, now: number): boolean {
    const cooldownMs = Math.max(0, this.cooldownMsByTrigger[trigger] ?? 0);
    const lastUsedAt = this.lastUsedAt.get(trigger);
    if (lastUsedAt !== undefined && now - lastUsedAt < cooldownMs) {
      return false;
    }

    this.lastUsedAt.set(trigger, now);
    return true;
  }
}
