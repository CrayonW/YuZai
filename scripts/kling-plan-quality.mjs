const minimums = {
  dailyActions: 5,
  interactiveActions: 5,
  longDailyActions: 5,
  dailyDurationSeconds: 6,
  interactiveDurationSeconds: 4
};

export function buildKlingPlanQualityReport(plan) {
  const actions = Array.isArray(plan?.actions) ? plan.actions : [];
  const dailyActions = actions.filter((action) => action.category === "daily");
  const interactiveActions = actions.filter((action) => action.category === "interactive");
  const transitionActions = actions.filter((action) => action.category === "transition");
  const longDailyActions = dailyActions.filter((action) => Number(action.durationSeconds) >= minimums.dailyDurationSeconds);
  const issues = [];

  if (dailyActions.length < minimums.dailyActions) {
    issues.push(`至少 ${minimums.dailyActions} 个日常动作，当前 ${dailyActions.length} 个。`);
  }
  if (interactiveActions.length < minimums.interactiveActions) {
    issues.push(`至少 ${minimums.interactiveActions} 个交互动作，当前 ${interactiveActions.length} 个。`);
  }
  if (longDailyActions.length < minimums.longDailyActions) {
    issues.push(`至少 ${minimums.longDailyActions} 个日常动作时长至少 ${minimums.dailyDurationSeconds} 秒，当前 ${longDailyActions.length} 个。`);
  }

  for (const action of actions) {
    const duration = Number(action.durationSeconds);
    if (!Number.isFinite(duration) || duration <= 0) {
      issues.push(`${action.action}: durationSeconds 必须是正数。`);
    }
    if (action.category === "daily" && duration < minimums.dailyDurationSeconds) {
      issues.push(`${action.action}: 日常动作时长至少 ${minimums.dailyDurationSeconds} 秒。`);
    }
    if (action.category === "interactive" && duration < minimums.interactiveDurationSeconds) {
      issues.push(`${action.action}: 交互动作时长至少 ${minimums.interactiveDurationSeconds} 秒。`);
    }
    if (typeof action.antiFatigueRole !== "string" || action.antiFatigueRole.trim() === "") {
      issues.push(`${action.action}: antiFatigueRole 必须说明这个动作如何减少重复感。`);
    }
    if (typeof action.minCooldownSeconds !== "number" || action.minCooldownSeconds < 0) {
      issues.push(`${action.action}: minCooldownSeconds 必须是非负数字。`);
    }
    const promptText = `${action.prompt || ""} ${plan?.basePrompt || ""} ${plan?.defaultNegativePrompt || ""}`;
    if (!/水印/.test(promptText) || !/logo/i.test(promptText)) {
      issues.push(`${action.action}: 提示词必须明确排除水印和 logo。`);
    }
    if (!String(action.output || "").startsWith(`${plan.outputRoot || "assets/origin/generated/kling"}/`)) {
      issues.push(`${action.action}: output 必须位于 ${plan.outputRoot}。`);
    }
  }

  return {
    ok: issues.length === 0,
    minimums,
    summary: {
      totalActions: actions.length,
      dailyActions: dailyActions.length,
      interactiveActions: interactiveActions.length,
      transitionActions: transitionActions.length,
      longDailyActions: longDailyActions.length
    },
    issues
  };
}

export function renderKlingPlanQualityReport(report) {
  const lines = [
    "## 可灵动作计划质量报告",
    "",
    `结果：${report.ok ? "通过" : "未通过"}`,
    `动作总数：${report.summary.totalActions}`,
    `日常动作：${report.summary.dailyActions}`,
    `交互动作：${report.summary.interactiveActions}`,
    `过渡动作：${report.summary.transitionActions}`,
    `长日常动作：${report.summary.longDailyActions}`,
    ""
  ];

  if (report.issues.length > 0) {
    lines.push("### 问题", "");
    for (const issue of report.issues) {
      lines.push(`- ${issue}`);
    }
  } else {
    lines.push("### 问题", "", "- 无");
  }

  return `${lines.join("\n")}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import("node:fs");
  const planPath = process.argv[2] || "docs/kling-action-generation-plan.json";
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  const report = buildKlingPlanQualityReport(plan);
  console.log(renderKlingPlanQualityReport(report));
  if (!report.ok) {
    process.exitCode = 1;
  }
}
