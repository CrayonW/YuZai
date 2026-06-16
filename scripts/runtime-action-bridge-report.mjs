import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const root = process.cwd();
const manifestJson = JSON.parse(readFileSync(join(root, "assets/runtime/animations/manifest.json"), "utf8"));
const actionBridges = JSON.parse(readFileSync(join(root, "assets/config/action-bridges.json"), "utf8"));

const TRIGGER_LABELS = {
  daily_low_fatigue: "低疲劳日常轮换",
  reminder_water: "喝水提醒",
  reminder_rest: "休息提醒",
  mouse_near: "鼠标靠近",
  click_single: "普通点击",
  click_repeated: "多次点击",
  click_wake: "睡眠叫醒",
  drag_start: "拖拽开始"
};

export function buildRuntimeActionBridgeReport({ manifest = manifestJson } = {}) {
  const triggerSpecs = [
    { id: "daily_low_fatigue", candidates: actionBridges.dailyRotation?.lowFatigue ?? [] },
    { id: "reminder_water", candidates: actionBridges.reminder.water },
    { id: "reminder_rest", candidates: actionBridges.reminder.rest },
    { id: "mouse_near", candidates: actionBridges.proximity.mouse_near },
    { id: "click_single", candidates: actionBridges.click.single },
    { id: "click_repeated", candidates: actionBridges.click.repeated },
    { id: "click_wake", candidates: actionBridges.click.wake },
    { id: "drag_start", candidates: actionBridges.drag.start }
  ];

  return {
    generatedAt: new Date().toISOString(),
    summary: summarizeManifest(manifest),
    triggers: triggerSpecs.map((trigger) => ({
      id: trigger.id,
      label: TRIGGER_LABELS[trigger.id],
      candidates: trigger.candidates.map((action, priorityIndex) => ({
        action,
        priority: priorityIndex + 1,
        status: isRenderable(manifest, action) ? "ready" : "missing",
        frameCount: manifest.actions?.[action]?.frameCount ?? 0
      }))
    }))
  };
}

export function renderRuntimeActionBridgeReportMarkdown(report) {
  const lines = [
    "# 运行时动作桥接矩阵",
    "",
    "本文档由 `npm run runtime:action-bridge-report -- --write docs/runtime-action-bridge-report.md` 生成，用于检查提醒、鼠标、点击和拖拽入口会优先请求哪些动作，以及这些动作当前是否已经接入运行时 manifest。",
    "",
    "## 汇总",
    "",
    `- 当前 manifest 可播放动作：${report.summary.readyActions.join("、") || "无"}`,
    `- 可播放动作数量：${report.summary.readyCount}`,
    `- 候选缺失数量：${report.summary.missingCandidateCount}`,
    "",
    "## 矩阵",
    "",
    "| 触发入口 | 优先级 | action | 状态 | 帧数 |",
    "| --- | ---: | --- | --- | ---: |"
  ];

  for (const trigger of report.triggers) {
    for (const candidate of trigger.candidates) {
      lines.push(
        `| ${trigger.label} | ${candidate.priority} | ${candidate.action} | ${candidate.status} | ${candidate.frameCount} |`
      );
    }
  }

  lines.push(
    "",
    "## 接入说明",
    "",
    "- `ready` 表示该动作已经在 `assets/runtime/animations/manifest.json` 中启用且帧数大于 0。",
    "- `missing` 表示桥接入口已经准备好，但对应视频尚未生成、抽帧或接入 manifest。",
    "- 后续可灵视频生成后，先按素材清单确认，再做水印检查/去水印、抽帧和 manifest 接入；接入完成后重新生成本文档。"
  );

  return `${lines.join("\n")}\n`;
}

function summarizeManifest(manifest) {
  const readyActions = Object.entries(manifest.actions ?? {})
    .filter(([, config]) => config.enabled && config.frameCount > 0)
    .map(([action]) => action);
  const triggerCandidates = [
    ...(actionBridges.dailyRotation?.lowFatigue ?? []),
    ...actionBridges.reminder.water,
    ...actionBridges.reminder.rest,
    ...actionBridges.proximity.mouse_near,
    ...actionBridges.click.single,
    ...actionBridges.click.repeated,
    ...actionBridges.click.wake,
    ...actionBridges.drag.start
  ];
  const missingCandidateCount = triggerCandidates.filter((action) => !isRenderable(manifest, action)).length;

  return {
    readyActions,
    readyCount: readyActions.length,
    missingCandidateCount
  };
}

function isRenderable(manifest, action) {
  const config = manifest.actions?.[action];
  return !!config && config.enabled && config.frameCount > 0;
}

function argValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const markdown = renderRuntimeActionBridgeReportMarkdown(buildRuntimeActionBridgeReport());
  const writePath = argValue(process.argv.slice(2), "--write");
  if (writePath) {
    mkdirSync(dirname(writePath), { recursive: true });
    writeFileSync(writePath, markdown);
  }
  console.log(markdown);
}
