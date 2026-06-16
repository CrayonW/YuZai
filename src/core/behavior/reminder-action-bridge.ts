import type { ReminderBubbleShowEvent } from "./reminder-bubble-controller";
import actionBridges from "../../../assets/config/action-bridges.json";

export type ReminderActionAvailability = (action: string) => boolean;

export const REMINDER_ACTION_CANDIDATES = actionBridges.reminder as Record<ReminderBubbleShowEvent["kind"], string[]>;

export function resolveReminderAnimationAction(
  event: ReminderBubbleShowEvent,
  isAvailable: ReminderActionAvailability
): string | null {
  return REMINDER_ACTION_CANDIDATES[event.kind].find((action) => isAvailable(action)) ?? null;
}
