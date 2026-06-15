import behaviorScheduleJson from "../../../docs/cat-behavior-schedule.json";

interface BehaviorSchedule {
  rules?: {
    minDailyGapSeconds?: number;
    maxDailyGapSeconds?: number;
  };
}

export interface RuntimeAutonomousSchedule {
  minIdleMs: number;
  maxIdleMs: number;
}

export function buildRuntimeAutonomousSchedule(schedule: BehaviorSchedule = behaviorScheduleJson): RuntimeAutonomousSchedule {
  const minSeconds = Math.max(3, schedule.rules?.minDailyGapSeconds ?? 45);
  const maxSeconds = Math.max(minSeconds, schedule.rules?.maxDailyGapSeconds ?? minSeconds);
  return {
    minIdleMs: Math.round(minSeconds * 1000),
    maxIdleMs: Math.round(maxSeconds * 1000)
  };
}
