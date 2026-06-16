import type { ReminderBubbleShowEvent } from "./reminder-bubble-controller";

export type ReminderActionAvailability = (action: string) => boolean;

const REMINDER_ACTION_CANDIDATES: Record<ReminderBubbleShowEvent["kind"], string[]> = {
  water: ["call_response", "cursor_watch"],
  rest: ["stretch_yawn", "sleepy", "sleep"]
};

export function resolveReminderAnimationAction(
  event: ReminderBubbleShowEvent,
  isAvailable: ReminderActionAvailability
): string | null {
  return REMINDER_ACTION_CANDIDATES[event.kind].find((action) => isAvailable(action)) ?? null;
}
