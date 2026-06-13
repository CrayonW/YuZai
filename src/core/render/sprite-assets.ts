import { actionForPose, frameUrl, runtimeAnimationManifest, type RuntimeAnimationAction } from "./animation-manifest";
import type { PetStateName } from "../fsm/state-types";

export type SpriteAction = RuntimeAnimationAction;

export interface SpriteSequence {
  action: SpriteAction;
  fps: number;
  loop: boolean;
  frames: HTMLImageElement[];
}

const cache = new Map<SpriteAction, SpriteSequence>();
const preloadCache = new Map<SpriteAction, Promise<void>>();

export function sequenceForState(state: PetStateName, direction: -1 | 0 | 1): SpriteSequence {
  return sequenceForAction(actionForPose(state, direction));
}

export function preloadSpriteSequences(): Promise<void> {
  const actions = Object.entries(runtimeAnimationManifest.actions)
    .filter(([, config]) => config.enabled && config.frameCount > 0)
    .map(([action]) => preloadAction(action as SpriteAction));
  return Promise.all(actions).then(() => undefined);
}

function sequenceForAction(action: SpriteAction): SpriteSequence {
  let sequence = cache.get(action);
  if (!sequence) {
    const config = runtimeAnimationManifest.actions[action];
    sequence = {
      action,
      fps: config.fps,
      loop: config.loop,
      frames: loadFrames(action)
    };
    cache.set(action, sequence);
  }
  return sequence;
}

function loadFrames(action: SpriteAction): HTMLImageElement[] {
  const config = runtimeAnimationManifest.actions[action];
  if (!config.enabled || config.frameCount <= 0) return [];
  return Array.from({ length: config.frameCount }, (_, index) => {
    const frame = new Image();
    frame.decoding = "async";
    frame.src = frameUrl(action, index);
    return frame;
  });
}

function preloadAction(action: SpriteAction): Promise<void> {
  let preload = preloadCache.get(action);
  if (!preload) {
    const sequence = sequenceForAction(action);
    preload = Promise.all(sequence.frames.map((frame) => decodeFrame(frame))).then(() => undefined);
    preloadCache.set(action, preload);
  }
  return preload;
}

function decodeFrame(frame: HTMLImageElement): Promise<void> {
  if (frame.complete && frame.naturalWidth > 0) return Promise.resolve();
  if (typeof frame.decode === "function") {
    return frame.decode().catch(() => waitForImage(frame));
  }
  return waitForImage(frame);
}

function waitForImage(frame: HTMLImageElement): Promise<void> {
  if (frame.complete && frame.naturalWidth <= 0) {
    return Promise.reject(new Error(`Failed to load ${frame.src}`));
  }

  return new Promise((resolve, reject) => {
    frame.addEventListener("load", () => resolve(), { once: true });
    frame.addEventListener("error", () => reject(new Error(`Failed to load ${frame.src}`)), { once: true });
  });
}
