export interface ProximityActionEvent {
  near: boolean;
}

export type ProximityActionAvailability = (action: string) => boolean;

const MOUSE_NEAR_ACTION_CANDIDATES = ["cursor_watch", "paw_raise"];

export function resolveProximityAnimationAction(
  event: ProximityActionEvent,
  isAvailable: ProximityActionAvailability
): string | null {
  if (!event.near) return null;
  return MOUSE_NEAR_ACTION_CANDIDATES.find((action) => isAvailable(action)) ?? null;
}
