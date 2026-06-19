export const MOUSE_FOLLOW_DIRECTION_ACTIONS = [
  "look_e",
  "look_ene",
  "look_ne",
  "look_nne",
  "look_n",
  "look_nnw",
  "look_nw",
  "look_wnw",
  "look_w",
  "look_wsw",
  "look_sw",
  "look_ssw",
  "look_s",
  "look_sse",
  "look_se",
  "look_ese"
] as const;

export type MouseFollowAction = (typeof MOUSE_FOLLOW_DIRECTION_ACTIONS)[number];

export interface MouseFollowDirectionPayload {
  near: boolean;
  angleDegrees: number;
  action: MouseFollowAction | null;
}

const sectorDegrees = 360 / MOUSE_FOLLOW_DIRECTION_ACTIONS.length;
const hysteresisDegrees = 7;

export function angleFromCenterToCursor(
  center: { x: number; y: number },
  cursor: { x: number; y: number }
): number {
  const radians = Math.atan2(center.y - cursor.y, cursor.x - center.x);
  return normalizeDegrees((radians * 180) / Math.PI);
}

export function resolveMouseFollowAction(
  angleDegrees: number,
  previousAction: MouseFollowAction | null = null
): MouseFollowAction {
  const angle = normalizeDegrees(angleDegrees);
  if (previousAction && angularDistance(angle, centerForAction(previousAction)) <= sectorDegrees / 2 + hysteresisDegrees) {
    return previousAction;
  }

  const sector = Math.round(angle / sectorDegrees) % MOUSE_FOLLOW_DIRECTION_ACTIONS.length;
  return MOUSE_FOLLOW_DIRECTION_ACTIONS[sector];
}

export function buildMouseFollowPayload(input: {
  near: boolean;
  center: { x: number; y: number };
  cursor: { x: number; y: number };
  previousAction?: MouseFollowAction | null;
}): MouseFollowDirectionPayload {
  if (!input.near) {
    return {
      near: false,
      angleDegrees: 0,
      action: null
    };
  }

  const angleDegrees = angleFromCenterToCursor(input.center, input.cursor);
  return {
    near: true,
    angleDegrees,
    action: resolveMouseFollowAction(angleDegrees, input.previousAction ?? null)
  };
}

function centerForAction(action: MouseFollowAction): number {
  return MOUSE_FOLLOW_DIRECTION_ACTIONS.indexOf(action) * sectorDegrees;
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function angularDistance(left: number, right: number): number {
  const delta = Math.abs(normalizeDegrees(left) - normalizeDegrees(right));
  return Math.min(delta, 360 - delta);
}
