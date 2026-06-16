import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const triggerDefaults = {
  mouse_near: {
    label: "鼠标靠近",
    primary: "cursor_watch",
    fallback: "paw_raise",
    cooldownSeconds: 6
  },
  click: {
    label: "单次点击",
    primary: "click_surprised",
    fallback: "paw_raise",
    cooldownSeconds: 8
  },
  repeated_click: {
    label: "连续点击",
    primary: "poke_annoyed",
    fallback: "shy",
    cooldownSeconds: 20
  },
  drag: {
    label: "拖拽移动",
    primary: "dragging",
    fallback: "paw_raise",
    cooldownSeconds: 0
  },
  wake: {
    label: "唤醒",
    primary: "waking",
    fallback: "idle_primary",
    cooldownSeconds: 60
  },
  call: {
    label: "召唤回应",
    primary: "call_response",
    fallback: "paw_raise",
    cooldownSeconds: 20
  }
};

export function buildCatBehaviorSchedule(plan) {
  const actions = Array.isArray(plan?.actions) ? plan.actions : [];
  const byName = new Map(actions.map((action) => [action.action, action]));
  const dailyPool = actions
    .filter((action) => action.category === "daily")
    .sort(compareDailyActions)
    .map(toScheduleItem);

  const interactionTriggers = {};
  for (const [trigger, config] of Object.entries(triggerDefaults)) {
    const primary = byName.get(config.primary);
    const fallback = byName.get(config.fallback);
    interactionTriggers[trigger] = {
      label: config.label,
      primaryAction: primary?.action ?? fallback?.action ?? "idle_primary",
      fallbackAction: fallback?.action ?? "idle_primary",
      loopAction: primary?.loop ? primary.action : null,
      cooldownSeconds: primary?.minCooldownSeconds ?? config.cooldownSeconds,
      returnTo: "idle_primary"
    };
  }

  return {
    version: 1,
    sourcePlan: "docs/kling-action-generation-plan.json",
    generatedFor: "真实小猫桌宠行为调度",
    rules: {
      minDailyGapSeconds: 45,
      maxDailyGapSeconds: 150,
      interactionReturnTo: "idle_primary",
      preferLongDailySeconds: 6,
      avoidImmediateRepeat: true,
      useTransitionWhenAvailable: true,
      onlyUseRuntimeEnabledActions: true
    },
    dailyPool,
    interactionTriggers,
    sleepRoutine: buildSleepRoutine(byName),
    transitionHints: actions
      .filter((action) => action.category === "transition")
      .map(toScheduleItem)
  };
}

export function renderCatBehaviorSchedule(schedule) {
  const lines = [
    "# 真实小猫行为调度策略",
    "",
    "本文档由 `docs/kling-action-generation-plan.json` 派生，用于说明后续真实视频和运行时 manifest 补齐后，桌宠应如何安排日常动作、交互动作和睡眠链路。",
    "",
    "## 调度原则",
    "",
    `- 日常动作间隔：${schedule.rules.minDailyGapSeconds}-${schedule.rules.maxDailyGapSeconds} 秒，避免短时间重复。`,
    `- 日常动作优先使用 ${schedule.rules.preferLongDailySeconds} 秒以上的视频。`,
    "- 不连续播放同一个日常变化动作。",
    "- 用户交互优先级高于日常动作，交互结束后回到 `idle_primary` 或当前日常基础姿势。",
    "- 只有动作已经生成源视频、抽帧并写入运行时 manifest 后，播放器才允许真正调度该动作。",
    "",
    "## 日常动作池",
    "",
    "| action | 时长 | 循环 | 冷却 | 作用 |",
    "| --- | ---: | --- | ---: | --- |"
  ];

  for (const item of schedule.dailyPool) {
    lines.push(`| ${item.action} | ${item.durationSeconds}s | ${item.loop ? "是" : "否"} | ${item.minCooldownSeconds}s | ${item.role} |`);
  }

  lines.push("", "## 交互触发", "", "| 触发 | 主动作 | 兜底动作 | 循环动作 | 冷却 | 回切 |", "| --- | --- | --- | --- | ---: | --- |");
  for (const trigger of Object.values(schedule.interactionTriggers)) {
    lines.push(`| ${trigger.label} | ${trigger.primaryAction} | ${trigger.fallbackAction} | ${trigger.loopAction ?? "-"} | ${trigger.cooldownSeconds}s | ${trigger.returnTo} |`);
  }

  lines.push(
    "",
    "运行时会把表中的冷却时间转换成毫秒，并在 `InteractionController` 内分别记录每种触发的最后执行时间。鼠标靠近、单次点击、连续点击、拖拽和唤醒互不共享冷却；冷却期内重复触发会被忽略，避免同一交互动作用极短间隔连续插入，影响日常动作序列帧的流畅播放。`dragging` 当前冷却为 0 秒，仍允许每次拖拽立即进入拖拽反馈。",
    "",
    "## 睡眠链路",
    "",
    `推荐顺序：${schedule.sleepRoutine.join(" -> ")}`,
    "",
    "睡眠链路不应随机打散。`sleepy` 表示变困，`sleep` 表示入睡过渡，`sleeping` 表示睡着循环，用户靠近或点击时再用 `waking` 回到清醒状态。",
    "",
    "## 过渡候选",
    "",
    "| action | 时长 | 作用 |",
    "| --- | ---: | --- |"
  );

  for (const item of schedule.transitionHints) {
    lines.push(`| ${item.action} | ${item.durationSeconds}s | ${item.role} |`);
  }

  lines.push(
    "",
    "## 接入顺序",
    "",
    "1. 先生成或补充源视频，并运行 `npm run animations:intake-checklist` 列出清单给用户确认。",
    "2. 确认后执行源视频预检、去水印/抠绿、序列帧生成和 manifest 更新。",
    "3. 运行 `npm run validate:release` 和桌面多帧截图验收。",
    "4. 当目标 action 已存在于运行时 manifest 且帧稳定后，再把播放器调度切换到本策略。"
  );

  return `${lines.join("\n")}\n`;
}

export function writeCatBehaviorSchedule(schedule, jsonPath, markdownPath) {
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(schedule, null, 2)}\n`);
  const markdown = renderCatBehaviorSchedule(schedule);
  if (markdownPath) {
    mkdirSync(dirname(markdownPath), { recursive: true });
    writeFileSync(markdownPath, markdown);
  }
  return markdown;
}

function compareDailyActions(left, right) {
  const leftRank = dailyRank(left.action);
  const rightRank = dailyRank(right.action);
  if (leftRank !== rightRank) return leftRank - rightRank;
  return Number(right.durationSeconds || 0) - Number(left.durationSeconds || 0);
}

function dailyRank(action) {
  const ranks = [
    "idle_primary",
    "tail_wag",
    "idle_secondary",
    "slow_blink",
    "look_around",
    "groom_face_wash",
    "loaf_breathing",
    "desk_sniff",
    "stretch_yawn",
    "sleepy",
    "sleep",
    "sleeping",
    "walk"
  ];
  const index = ranks.indexOf(action);
  return index === -1 ? ranks.length : index;
}

function toScheduleItem(action) {
  return {
    action: action.action,
    durationSeconds: action.durationSeconds,
    loop: action.loop,
    minCooldownSeconds: action.minCooldownSeconds ?? 0,
    role: action.antiFatigueRole || ""
  };
}

function buildSleepRoutine(byName) {
  return ["sleepy", "sleep", "sleeping", "waking"].filter((action) => byName.has(action));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv.slice(2));
  const plan = JSON.parse(readFileSync(args.plan, "utf8"));
  const schedule = buildCatBehaviorSchedule(plan);
  const markdown = args.writeJson || args.writeMarkdown
    ? writeCatBehaviorSchedule(schedule, args.writeJson || "docs/cat-behavior-schedule.json", args.writeMarkdown)
    : renderCatBehaviorSchedule(schedule);
  console.log(markdown);
}

function parseArgs(args) {
  const options = {
    plan: "docs/kling-action-generation-plan.json",
    writeJson: "",
    writeMarkdown: ""
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--plan") {
      options.plan = args[++index];
    } else if (arg === "--write-json") {
      options.writeJson = args[++index];
    } else if (arg === "--write-md") {
      options.writeMarkdown = args[++index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}
