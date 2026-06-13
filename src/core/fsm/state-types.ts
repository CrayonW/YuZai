export type PetStateName =
  | "idle"
  | "walk"
  | "walk_left"
  | "walking"
  | "sleep"
  | "sleepy"
  | "sleeping"
  | "waking"
  | "surprised"
  | "shy"
  | "dragging"
  | "waving"
  | "teaser";

export type PetView = "front" | "left" | "right";

export type PetMood = "neutral" | "happy" | "sleepy" | "surprised" | "shy";

export interface PetPose {
  state: PetStateName;
  view: PetView;
  mood: PetMood;
  direction: -1 | 0 | 1;
}

export interface CachedPose {
  pose: PetPose;
  timestamp: number;
}

export interface Transition {
  from: PetStateName;
  to: PetStateName;
  durationMs: number;
  startedAt: number;
}

export interface StateSnapshot {
  pose: PetPose;
  transition: Transition | null;
  previous: CachedPose | null;
}

export interface StateRequest {
  state: PetStateName;
  view?: PetView;
  mood?: PetMood;
  direction?: -1 | 0 | 1;
  force?: boolean;
  cacheCurrent?: boolean;
}
