// ── Renderer-side type declarations ──
import type { YuZaiAPI } from '../preload/index';

declare global {
  interface Window {
    yuZaiAPI: YuZaiAPI;
  }
}

export type CatState =
  | 'idle'
  | 'walking'
  | 'sleeping'
  | 'chasing'
  | 'dragged'
  | 'purring'
  | 'eating'
  | 'meowing';

export type CatSize = 'small' | 'medium' | 'large';

export interface Point {
  x: number;
  y: number;
}

/** Pixel-dimension of the cat for each size preset (the cat itself, not the window). */
export const CAT_PIXEL_SIZE: Record<CatSize, number> = {
  small:  150,
  medium: 250,
  large:  350,
};

/** Behaviour tuning knobs */
export const CONFIG = {
  walkSpeed:        180,  // px/s window movement when walking
  chaseSpeed:       300,  // px/s window movement when chasing cursor
  idleTimeoutMin:   5000,  // ms — minimum idle before maybe walking
  idleTimeoutMax:   15000, // ms — maximum idle before walking
  sleepAfterIdle:   30000, // ms — idle before sleeping
  chaseDistance:    250,  // px — mouse distance that triggers chase
  purrDistance:     120,  // px — mouse distance that triggers purring
  dragThreshold:    5,    // px — movement before drag is detected
  fps:              60,
} as const;
