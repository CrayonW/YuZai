import manifestJson from "../../../assets/runtime/animations/manifest.json";
import type { PetStateName } from "../fsm/state-types";

export type RuntimeAnimationAction = keyof typeof manifestJson.actions;

export interface RuntimeAnimationConfig {
  source: string;
  frameRoot: string;
  filePattern: string;
  firstFrame: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  interruptible: boolean;
  fallback: RuntimeAnimationAction;
  enabled: boolean;
  derivedFrom?: RuntimeAnimationAction;
  derivation?: "mirror-x";
  category?: "daily" | "interactive" | "transition";
  entryFrames?: number[];
  exitFrames?: number[];
  interruptPolicy?: "immediate" | "at-safe-frame" | "locked";
  returnTo?: RuntimeAnimationAction;
  transitionIn?: RuntimeAnimationAction | null;
  transitionOut?: RuntimeAnimationAction | null;
}

export interface DirectionalActionMap {
  left: RuntimeAnimationAction;
  right: RuntimeAnimationAction;
  neutral: RuntimeAnimationAction;
}

export interface RuntimeAnimationManifest {
  version: number;
  frameSize: number;
  defaultAction: RuntimeAnimationAction;
  actions: Record<RuntimeAnimationAction, RuntimeAnimationConfig>;
  stateMap: Record<PetStateName, RuntimeAnimationAction | DirectionalActionMap>;
}

export const runtimeAnimationManifest = manifestJson as unknown as RuntimeAnimationManifest;

export function actionForPose(state: PetStateName, direction: -1 | 0 | 1): RuntimeAnimationAction {
  const mapped = runtimeAnimationManifest.stateMap[state] ?? safeDefaultAction();
  if (typeof mapped === "string") return enabledOrFallback(mapped);
  if (direction < 0) return enabledOrFallback(isRuntimeAnimationAction(mapped.left) ? mapped.left : safeDefaultAction());
  if (direction > 0) return enabledOrFallback(isRuntimeAnimationAction(mapped.right) ? mapped.right : safeDefaultAction());
  return enabledOrFallback(isRuntimeAnimationAction(mapped.neutral) ? mapped.neutral : safeDefaultAction());
}

export function enabledOrFallback(
  action: RuntimeAnimationAction,
  visited = new Set<RuntimeAnimationAction>()
): RuntimeAnimationAction {
  if (visited.has(action)) return safeDefaultAction();
  visited.add(action);

  const config = getRuntimeAnimationConfig(action);
  const fallbackAction = config?.fallback;
  if (isRenderableAction(config)) return action;
  if (fallbackAction && fallbackAction !== action) return enabledOrFallback(fallbackAction, visited);
  return safeDefaultAction();
}

export function frameUrl(action: RuntimeAnimationAction, zeroBasedIndex: number): string {
  const resolvedAction = enabledOrFallback(action);
  const config = getRuntimeAnimationConfig(resolvedAction);
  if (!isRenderableAction(config)) {
    throw new Error(`Runtime animation ${resolvedAction} is not enabled or has no frames`);
  }
  if (zeroBasedIndex < 0 || zeroBasedIndex >= config.frameCount) {
    throw new Error(
      `Frame index ${zeroBasedIndex} is out of range for runtime animation ${resolvedAction} with ${config.frameCount} frames`
    );
  }
  const frameNumber = String(config.firstFrame + zeroBasedIndex).padStart(6, "0");
  return `${config.frameRoot}/${config.filePattern.replace("{index}", frameNumber)}`;
}

export function isRuntimeAnimationAction(action: string): action is RuntimeAnimationAction {
  return Object.prototype.hasOwnProperty.call(runtimeAnimationManifest.actions, action);
}

export function isRenderableAction(config: RuntimeAnimationConfig | undefined): config is RuntimeAnimationConfig {
  return !!config && config.enabled && config.frameCount > 0;
}

export function configForAction(action: RuntimeAnimationAction): RuntimeAnimationConfig | undefined {
  return getRuntimeAnimationConfig(action);
}

function getRuntimeAnimationConfig(action: string): RuntimeAnimationConfig | undefined {
  return isRuntimeAnimationAction(action) ? runtimeAnimationManifest.actions[action] : undefined;
}

function safeDefaultAction(): RuntimeAnimationAction {
  const defaultAction = runtimeAnimationManifest.defaultAction;
  if (isRuntimeAnimationAction(defaultAction)) return defaultAction;

  const firstAction = Object.keys(runtimeAnimationManifest.actions)[0];
  if (firstAction && isRuntimeAnimationAction(firstAction)) return firstAction;

  return defaultAction as RuntimeAnimationAction;
}
