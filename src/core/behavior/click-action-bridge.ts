export type ClickActionKind = "single" | "repeated" | "wake";

export interface ClickActionEvent {
  kind: ClickActionKind;
}

export type ClickActionAvailability = (action: string) => boolean;

const CLICK_ACTION_CANDIDATES: Record<ClickActionKind, string[]> = {
  single: ["click_surprised", "paw_raise"],
  repeated: ["poke_annoyed", "shy", "paw_raise"],
  wake: ["waking", "click_surprised", "paw_raise"]
};

export function resolveClickAnimationAction(event: ClickActionEvent, isAvailable: ClickActionAvailability): string | null {
  return CLICK_ACTION_CANDIDATES[event.kind].find((action) => isAvailable(action)) ?? null;
}
