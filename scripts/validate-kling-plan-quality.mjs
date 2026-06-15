import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-kling-plan-quality-"));
const bundlePath = join(tempRoot, "validate-kling-plan-quality.mjs");
const qualityPath = join(process.cwd(), "scripts", "kling-plan-quality.mjs");

const testSource = `
  import { buildKlingPlanQualityReport, renderKlingPlanQualityReport } from ${JSON.stringify(qualityPath)};

  const plan = {
    referenceImage: "assets/origin/鱼仔参考图.png",
    outputRoot: "assets/origin/generated/kling",
    video: { fps: 24, aspectRatio: "4:5", defaultDailyDurationSeconds: 6, defaultInteractiveDurationSeconds: 4, defaultTransitionDurationSeconds: 2 },
    actions: [
      { action: "idle_primary", category: "daily", loop: true, durationSeconds: 8, prompt: "自然呼吸，开始和结束姿势几乎一致，没有文字、水印、logo。", output: "assets/origin/generated/kling/idle_primary.mp4", antiFatigueRole: "主待机", minCooldownSeconds: 0 },
      { action: "groom_face_wash", category: "daily", loop: false, durationSeconds: 8, prompt: "舔前爪并轻轻洗脸，没有文字、水印、logo。", output: "assets/origin/generated/kling/groom_face_wash.mp4", antiFatigueRole: "生活化变化", minCooldownSeconds: 600 },
      { action: "loaf_breathing", category: "daily", loop: true, durationSeconds: 8, prompt: "香箱趴姿轻微呼吸，没有文字、水印、logo。", output: "assets/origin/generated/kling/loaf_breathing.mp4", antiFatigueRole: "长时间陪伴", minCooldownSeconds: 900 },
      { action: "desk_sniff", category: "daily", loop: false, durationSeconds: 6, prompt: "向前嗅闻桌面边缘，没有文字、水印、logo。", output: "assets/origin/generated/kling/desk_sniff.mp4", antiFatigueRole: "好奇观察", minCooldownSeconds: 480 },
      { action: "stretch_yawn", category: "daily", loop: false, durationSeconds: 6, prompt: "伸懒腰并轻轻打哈欠，没有文字、水印、logo。", output: "assets/origin/generated/kling/stretch_yawn.mp4", antiFatigueRole: "作息变化", minCooldownSeconds: 1200 },
      { action: "cursor_watch", category: "interactive", loop: false, durationSeconds: 4, prompt: "眼睛和头部跟随鼠标靠近，没有文字、水印、logo。", output: "assets/origin/generated/kling/cursor_watch.mp4", antiFatigueRole: "鼠标靠近回应", minCooldownSeconds: 4 },
      { action: "poke_annoyed", category: "interactive", loop: false, durationSeconds: 4, prompt: "轻微不满地看一眼再恢复，没有文字、水印、logo。", output: "assets/origin/generated/kling/poke_annoyed.mp4", antiFatigueRole: "点击变化", minCooldownSeconds: 12 },
      { action: "paw_raise", category: "interactive", loop: false, durationSeconds: 4, prompt: "抬起前爪打招呼，没有文字、水印、logo。", output: "assets/origin/generated/kling/paw_raise.mp4", antiFatigueRole: "打招呼", minCooldownSeconds: 8 },
      { action: "shy", category: "interactive", loop: false, durationSeconds: 4, prompt: "害羞低头再恢复，没有文字、水印、logo。", output: "assets/origin/generated/kling/shy.mp4", antiFatigueRole: "温柔回应", minCooldownSeconds: 20 },
      { action: "call_response", category: "interactive", loop: false, durationSeconds: 4, prompt: "听到召唤后抬头回应，没有文字、水印、logo。", output: "assets/origin/generated/kling/call_response.mp4", antiFatigueRole: "召唤回应", minCooldownSeconds: 20 },
      { action: "idle_to_cursor_watch", category: "transition", loop: false, durationSeconds: 2, prompt: "从待机转向关注鼠标，没有文字、水印、logo。", output: "assets/origin/generated/kling/idle_to_cursor_watch.mp4", antiFatigueRole: "衔接", minCooldownSeconds: 0 }
    ]
  };

  const report = buildKlingPlanQualityReport(plan);
  assertEqual(report.ok, true, "valid plan passes");
  assertEqual(report.summary.dailyActions, 5, "counts daily actions");
  assertEqual(report.summary.interactiveActions, 5, "counts interactive actions");
  assertEqual(report.summary.transitionActions, 1, "counts transition actions");
  assertEqual(report.summary.longDailyActions, 5, "counts long daily actions");
  assertEqual(report.issues.length, 0, "valid plan has no issues");

  const text = renderKlingPlanQualityReport(report);
  assertIncludes(text, "可灵动作计划质量报告", "renders Chinese title");
  assertIncludes(text, "日常动作：5", "renders daily count");
  assertIncludes(text, "长日常动作：5", "renders long daily count");

  const weakPlan = { ...plan, actions: plan.actions.slice(0, 3).map((action) => ({ ...action, durationSeconds: 3, prompt: "短动作" })) };
  const weakReport = buildKlingPlanQualityReport(weakPlan);
  assertEqual(weakReport.ok, false, "weak plan fails");
  assertIncludes(weakReport.issues.join("\\n"), "至少 5 个日常动作", "requires daily variety");
  assertIncludes(weakReport.issues.join("\\n"), "日常动作时长至少 6 秒", "requires longer daily duration");
  assertIncludes(weakReport.issues.join("\\n"), "提示词必须明确排除水印", "requires watermark exclusion");

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
