import behaviorScheduleJson from "../../../docs/cat-behavior-schedule.json";
import type { RuntimeAnimationAction, RuntimeAnimationManifest } from "./animation-manifest";
import { runtimeAnimationManifest } from "./animation-manifest";
import type { DailyAnimationRotatorOptions } from "./daily-animation-rotator";

interface BehaviorSchedule {
  rules?: {
    minDailyGapSeconds?: number;
    maxDailyGapSeconds?: number;
  };
  dailyPool?: Array<{
    action: string;
    durationSeconds?: number;
    loop?: boolean;
    minCooldownSeconds?: number;
  }>;
}

const nonIdleDailyActions = new Set(["walk", "walk_left", "sleep", "sleepy", "sleeping"]);

export function buildRuntimeDailyRotatorOptions(
  schedule: BehaviorSchedule = behaviorScheduleJson,
  manifest: Pick<RuntimeAnimationManifest, "defaultAction" | "actions"> = runtimeAnimationManifest
): DailyAnimationRotatorOptions {
  const defaultAction = manifest.defaultAction;
  const variations = (schedule.dailyPool ?? [])
    .map((item) => item.action)
    .filter((action): action is RuntimeAnimationAction => isRuntimeAction(action, manifest))
    .filter((action) => action !== defaultAction)
    .filter((action) => !nonIdleDailyActions.has(action))
    .filter((action) => isEnabledIdleCompatibleDaily(action, manifest));

  const variationDurationMs = Math.max(
    3000,
    ...variations.map((action) => {
      const item = schedule.dailyPool?.find((candidate) => candidate.action === action);
      return Math.round((item?.durationSeconds ?? 3) * 1000);
    })
  );
  const variationCooldownMs = Object.fromEntries(
    variations.map((action) => {
      const item = schedule.dailyPool?.find((candidate) => candidate.action === action);
      return [action, Math.max(0, Math.round((item?.minCooldownSeconds ?? 0) * 1000))];
    })
  ) as Partial<Record<RuntimeAnimationAction, number>>;
  const gapMs = Math.round((schedule.rules?.minDailyGapSeconds ?? 45) * 1000);

  return {
    defaultAction,
    variations,
    firstDelayMs: Math.max(1500, Math.round(gapMs / 10)),
    variationDurationMs,
    variationCooldownMs,
    gapMs
  };
}

function isRuntimeAction(
  action: string,
  manifest: Pick<RuntimeAnimationManifest, "actions">
): action is RuntimeAnimationAction {
  return Object.prototype.hasOwnProperty.call(manifest.actions, action);
}

function isEnabledIdleCompatibleDaily(
  action: RuntimeAnimationAction,
  manifest: Pick<RuntimeAnimationManifest, "actions">
): boolean {
  const config = manifest.actions[action];
  return !!config && config.enabled && config.frameCount > 0 && config.category === "daily";
}
