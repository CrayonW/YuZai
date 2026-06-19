import anchorsJson from "../../../assets/runtime/animations/transition-anchors.json";
import type { RuntimeAnimationAction } from "./animation-manifest";

interface TransitionAnchor {
  fromAction: string;
  toAction: string;
  fromFrame: number;
  toFrame: number;
  metric: number;
}

interface TransitionAnchorManifest {
  version: number;
  anchors: Record<string, TransitionAnchor>;
}

const transitionAnchors = anchorsJson as TransitionAnchorManifest;

export function entryFrameForTransition(
  fromAction: RuntimeAnimationAction,
  toAction: RuntimeAnimationAction
): number | undefined {
  const anchor = transitionAnchors.anchors?.[`${fromAction}->${toAction}`];
  if (!anchor) return undefined;
  return Number.isInteger(anchor.toFrame) && anchor.toFrame > 0 ? anchor.toFrame : undefined;
}
