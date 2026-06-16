import behaviorScheduleJson from "../../../docs/cat-behavior-schedule.json";
import type { PetStateName } from "../fsm/state-types";
import type { RuntimeAnimationAction, RuntimeAnimationManifest } from "./animation-manifest";
import { runtimeAnimationManifest } from "./animation-manifest";

interface BehaviorSchedule {
  interactionTriggers?: Record<string, {
    primaryAction?: string;
    fallbackAction?: string;
    cooldownSeconds?: number;
  }>;
}

export interface RuntimeInteractionSchedule {
  mouseNearState: PetStateName;
  clickState: PetStateName;
  repeatedClickState: PetStateName;
  dragState: PetStateName;
  wakeState: PetStateName;
  mouseNearCooldownMs: number;
  clickCooldownMs: number;
  repeatedClickCooldownMs: number;
  dragCooldownMs: number;
  wakeCooldownMs: number;
}

const preferredStates: Record<string, PetStateName[]> = {
  mouse_near: ["teaser", "waving"],
  click: ["surprised", "waving", "teaser"],
  repeated_click: ["shy", "surprised", "waving", "teaser"],
  drag: ["dragging", "waving", "teaser"],
  wake: ["waking", "idle"]
};

export function buildRuntimeInteractionSchedule(
  schedule: BehaviorSchedule = behaviorScheduleJson,
  manifest: Pick<RuntimeAnimationManifest, "defaultAction" | "actions" | "stateMap"> = runtimeAnimationManifest
): RuntimeInteractionSchedule {
  return {
    mouseNearState: stateForTrigger("mouse_near", schedule, manifest),
    clickState: stateForTrigger("click", schedule, manifest),
    repeatedClickState: stateForTrigger("repeated_click", schedule, manifest),
    dragState: stateForTrigger("drag", schedule, manifest),
    wakeState: stateForTrigger("wake", schedule, manifest),
    mouseNearCooldownMs: cooldownMsForTrigger("mouse_near", schedule),
    clickCooldownMs: cooldownMsForTrigger("click", schedule),
    repeatedClickCooldownMs: cooldownMsForTrigger("repeated_click", schedule),
    dragCooldownMs: cooldownMsForTrigger("drag", schedule),
    wakeCooldownMs: cooldownMsForTrigger("wake", schedule)
  };
}

function cooldownMsForTrigger(trigger: string, schedule: BehaviorSchedule): number {
  const seconds = schedule.interactionTriggers?.[trigger]?.cooldownSeconds ?? 0;
  return Math.max(0, Math.round(seconds * 1000));
}

function stateForTrigger(
  trigger: string,
  schedule: BehaviorSchedule,
  manifest: Pick<RuntimeAnimationManifest, "defaultAction" | "actions" | "stateMap">
): PetStateName {
  const config = schedule.interactionTriggers?.[trigger];
  const candidates = [config?.primaryAction, config?.fallbackAction, "paw_raise", manifest.defaultAction]
    .filter((action): action is string => typeof action === "string" && action.length > 0);

  for (const action of candidates) {
    const state = stateForRenderableAction(action, trigger, manifest);
    if (state) return state;
  }

  return "idle";
}

function stateForRenderableAction(
  action: string,
  trigger: string,
  manifest: Pick<RuntimeAnimationManifest, "actions" | "stateMap">
): PetStateName | null {
  if (!isRenderableAction(action, manifest)) return null;

  const preferred = preferredStates[trigger] ?? [];
  for (const state of preferred) {
    if (stateMapsToAction(state, action, manifest)) return state;
  }

  const found = Object.keys(manifest.stateMap).find((state) => stateMapsToAction(state as PetStateName, action, manifest));
  return found ? found as PetStateName : null;
}

function stateMapsToAction(
  state: PetStateName,
  action: string,
  manifest: Pick<RuntimeAnimationManifest, "stateMap">
): boolean {
  const mapped = manifest.stateMap[state];
  if (typeof mapped === "string") return mapped === action;
  return mapped.left === action || mapped.right === action || mapped.neutral === action;
}

function isRenderableAction(
  action: string,
  manifest: Pick<RuntimeAnimationManifest, "actions">
): action is RuntimeAnimationAction {
  const config = manifest.actions[action as RuntimeAnimationAction];
  return !!config && config.enabled && config.frameCount > 0;
}
