import type { PetStateName } from "../fsm/state-types";

export interface TransitionConfig {
  emotionMs: number;
  postureMs: number;
  turnMs: number;
  wakeMs: number;
}

export const DEFAULT_TRANSITIONS: TransitionConfig = {
  emotionMs: 200,
  postureMs: 350,
  turnMs: 450,
  wakeMs: 500
};

const locomotionStates = new Set<PetStateName>(["walk", "walk_left", "walking"]);
const sleepStates = new Set<PetStateName>(["sleep", "sleepy", "sleeping"]);
const emotionStates = new Set<PetStateName>(["surprised", "shy", "waving", "teaser"]);

export function transitionDuration(from: PetStateName, to: PetStateName): number {
  if (sleepStates.has(from) || to === "waking") return DEFAULT_TRANSITIONS.wakeMs;
  if (locomotionStates.has(from) || locomotionStates.has(to)) return DEFAULT_TRANSITIONS.turnMs;
  if (emotionStates.has(from) || emotionStates.has(to)) return DEFAULT_TRANSITIONS.emotionMs;
  return DEFAULT_TRANSITIONS.postureMs;
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
