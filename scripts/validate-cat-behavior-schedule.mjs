import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-cat-behavior-schedule-"));
const bundlePath = join(tempRoot, "validate-cat-behavior-schedule.mjs");
const schedulePath = join(process.cwd(), "scripts", "cat-behavior-schedule.mjs");

const testSource = `
  import { buildCatBehaviorSchedule, renderCatBehaviorSchedule } from ${JSON.stringify(schedulePath)};

  const plan = {
    actions: [
      { action: "idle_primary", category: "daily", loop: true, durationSeconds: 8, antiFatigueRole: "主待机", minCooldownSeconds: 0 },
      { action: "idle_secondary", category: "daily", loop: true, durationSeconds: 8, antiFatigueRole: "备用待机", minCooldownSeconds: 240 },
      { action: "groom_face_wash", category: "daily", loop: false, durationSeconds: 8, antiFatigueRole: "洗脸", minCooldownSeconds: 900 },
      { action: "loaf_breathing", category: "daily", loop: true, durationSeconds: 8, antiFatigueRole: "香箱趴", minCooldownSeconds: 1200 },
      { action: "desk_sniff", category: "daily", loop: false, durationSeconds: 6, antiFatigueRole: "嗅闻", minCooldownSeconds: 600 },
      { action: "stretch_yawn", category: "daily", loop: false, durationSeconds: 6, antiFatigueRole: "伸懒腰", minCooldownSeconds: 1500 },
      { action: "sleepy", category: "daily", loop: false, durationSeconds: 6, antiFatigueRole: "变困", minCooldownSeconds: 1200 },
      { action: "sleep", category: "daily", loop: false, durationSeconds: 6, antiFatigueRole: "入睡", minCooldownSeconds: 1200 },
      { action: "sleeping", category: "daily", loop: true, durationSeconds: 8, antiFatigueRole: "睡着", minCooldownSeconds: 1200 },
      { action: "walk", category: "daily", loop: true, durationSeconds: 6, antiFatigueRole: "走动", minCooldownSeconds: 300 },
      { action: "cursor_watch", category: "interactive", loop: false, durationSeconds: 4, antiFatigueRole: "看鼠标", minCooldownSeconds: 6 },
      { action: "paw_raise", category: "interactive", loop: false, durationSeconds: 4, antiFatigueRole: "打招呼", minCooldownSeconds: 10 },
      { action: "click_surprised", category: "interactive", loop: false, durationSeconds: 4, antiFatigueRole: "点击反馈", minCooldownSeconds: 8 },
      { action: "poke_annoyed", category: "interactive", loop: false, durationSeconds: 4, antiFatigueRole: "小不满", minCooldownSeconds: 20 },
      { action: "dragging", category: "interactive", loop: true, durationSeconds: 4, antiFatigueRole: "拖拽", minCooldownSeconds: 0 },
      { action: "waking", category: "interactive", loop: false, durationSeconds: 4, antiFatigueRole: "唤醒", minCooldownSeconds: 60 },
      { action: "idle_to_cursor_watch", category: "transition", loop: false, durationSeconds: 2, antiFatigueRole: "衔接", minCooldownSeconds: 0 }
    ]
  };

  const schedule = buildCatBehaviorSchedule(plan);
  assertEqual(schedule.dailyPool.length >= 8, true, "keeps a broad daily pool");
  assertEqual(schedule.dailyPool[0].action, "idle_primary", "main idle remains first");
  assertEqual(schedule.interactionTriggers.mouse_near.primaryAction, "cursor_watch", "mouse near watches cursor first");
  assertEqual(schedule.interactionTriggers.mouse_near.fallbackAction, "paw_raise", "mouse near can fall back to paw raise");
  assertEqual(schedule.interactionTriggers.click.primaryAction, "click_surprised", "click uses surprised response");
  assertEqual(schedule.interactionTriggers.repeated_click.primaryAction, "poke_annoyed", "repeated click uses varied emotion");
  assertEqual(schedule.interactionTriggers.drag.loopAction, "dragging", "dragging loops while dragging");
  assertEqual(schedule.sleepRoutine.join(","), "sleepy,sleep,sleeping,waking", "sleep routine has full chain");
  assertEqual(schedule.rules.interactionReturnTo, "idle_primary", "interactions return to daily idle");
  assertEqual(schedule.rules.minDailyGapSeconds >= 45, true, "daily gap avoids visual fatigue");

  const text = renderCatBehaviorSchedule(schedule);
  assertIncludes(text, "真实小猫行为调度策略", "renders Chinese title");
  assertIncludes(text, "鼠标靠近", "documents mouse interaction");
  assertIncludes(text, "sleepy -> sleep -> sleeping -> waking", "documents sleep chain");
  assertIncludes(text, "groom_face_wash", "documents grooming daily action");

  function assertEqual(actual, expected, label) {
    if (actual !== expected) {
      throw new Error(label + ": expected " + expected + ", got " + actual);
    }
  }

  function assertIncludes(text, expected, label) {
    if (!text.includes(expected)) {
      throw new Error(label + ": expected to include " + expected + ", got " + text);
    }
  }
`;

writeFileSync(join(tempRoot, "entry.mjs"), testSource);

await build({
  entryPoints: [join(tempRoot, "entry.mjs")],
  outfile: bundlePath,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  absWorkingDir: process.cwd(),
  logLevel: "silent"
});

await import(pathToFileURL(bundlePath).href);
console.log(JSON.stringify({ ok: true }, null, 2));
