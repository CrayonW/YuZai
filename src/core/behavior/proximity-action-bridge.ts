import actionBridges from "../../../assets/config/action-bridges.json";

export interface ProximityActionEvent {
  near: boolean;
}

export type ProximityActionAvailability = (action: string) => boolean;

export const MOUSE_NEAR_ACTION_CANDIDATES = actionBridges.proximity.mouse_near;

export function resolveProximityAnimationAction(
  event: ProximityActionEvent,
  isAvailable: ProximityActionAvailability
): string | null {
  if (!event.near) return null;
  return MOUSE_NEAR_ACTION_CANDIDATES.find((action) => isAvailable(action)) ?? null;
}
