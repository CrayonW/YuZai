export type DragActionPhase = "start" | "end";

export interface DragActionEvent {
  phase: DragActionPhase;
}

export type DragActionAvailability = (action: string) => boolean;

const DRAG_START_ACTION_CANDIDATES = ["dragging", "paw_raise"];

export function resolveDragAnimationAction(event: DragActionEvent, isAvailable: DragActionAvailability): string | null {
  if (event.phase !== "start") return null;
  return DRAG_START_ACTION_CANDIDATES.find((action) => isAvailable(action)) ?? null;
}
