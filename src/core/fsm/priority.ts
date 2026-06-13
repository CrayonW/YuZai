import type { PetStateName } from "./state-types";

export const STATE_PRIORITY: Record<PetStateName, number> = {
  dragging: 1,
  surprised: 1,
  shy: 1,
  waving: 1,
  waking: 1,
  teaser: 2,
  idle: 4,
  walk: 4,
  walk_left: 4,
  walking: 4,
  sleep: 5,
  sleepy: 5,
  sleeping: 5
};

export function canInterrupt(current: PetStateName, next: PetStateName): boolean {
  return STATE_PRIORITY[next] <= STATE_PRIORITY[current];
}
