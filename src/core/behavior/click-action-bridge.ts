import actionBridges from "../../../assets/config/action-bridges.json";

export type ClickActionKind = "single" | "repeated" | "wake";

export interface ClickActionEvent {
  kind: ClickActionKind;
}

export type ClickActionAvailability = (action: string) => boolean;

export const CLICK_ACTION_CANDIDATES = actionBridges.click as Record<ClickActionKind, string[]>;

export function resolveClickAnimationAction(event: ClickActionEvent, isAvailable: ClickActionAvailability): string | null {
  return CLICK_ACTION_CANDIDATES[event.kind].find((action) => isAvailable(action)) ?? null;
}
