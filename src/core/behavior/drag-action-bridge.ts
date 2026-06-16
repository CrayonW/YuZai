import actionBridges from "../../../assets/config/action-bridges.json";

export type DragActionPhase = "start" | "end";

export interface DragActionEvent {
  phase: DragActionPhase;
}

export type DragActionAvailability = (action: string) => boolean;

export const DRAG_START_ACTION_CANDIDATES = actionBridges.drag.start;

export function resolveDragAnimationAction(event: DragActionEvent, isAvailable: DragActionAvailability): string | null {
  if (event.phase !== "start") return null;
  return DRAG_START_ACTION_CANDIDATES.find((action) => isAvailable(action)) ?? null;
}
