import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-runtime-intake-checklist-"));
const bundlePath = join(tempRoot, "validate-runtime-intake-checklist.mjs");
const checklistPath = join(process.cwd(), "scripts", "runtime-intake-checklist.mjs");

const testSource = `
  import { buildRuntimeIntakeChecklist, renderRuntimeIntakeChecklist } from ${JSON.stringify(checklistPath)};

  const plan = {
    version: 1,
    confirmationRule: "每一波正式处理前，必须先把清单给用户确认；确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。",
    waves: [
      {
        id: "wave1",
        name: "第一波：低疲劳日常与关键交互",
        intent: "先降低待机重复感，并让鼠标靠近、点击和提醒拥有更真实的小猫反馈。",
        actions: [
          {
            action: "slow_blink",
            category: "daily",
            status: "recommended",
            confirmation: "needs-user-confirmation",
            sourceVideo: "assets/origin/generated/kling/slow_blink.mp4",
            reviewEvidence: ["assets/reviews/kling-generated/slow_blink_sweep.png"],
            runtimeFrameRoot: "assets/runtime/animations/slow_blink/frames",
            interruptPolicy: "at-safe-frame",
            returnTo: "idle_primary",
            bridge: "daily-rotation.low-fatigue",
            transitionPlan: "从 idle_primary 的安全帧切入。",
            watermarkGate: "正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。"
          },
          {
            action: "click_surprised",
            category: "interactive",
            status: "recommended",
            confirmation: "needs-user-confirmation",
            sourceVideo: "assets/origin/generated/kling/click_surprised.mp4",
            reviewEvidence: ["assets/reviews/kling-generated/click_surprised_sweep.png"],
            runtimeFrameRoot: "assets/runtime/animations/click_surprised/frames",
            interruptPolicy: "locked",
            returnTo: "idle_primary",
            bridge: "click.single",
            transitionPlan: "点击后锁定播放。",
            watermarkGate: "正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。"
          }
        ]
      }
    ]
  };

  const checklist = buildRuntimeIntakeChecklist({ plan, waveId: "wave1" });
  assertEqual(checklist.wave.id, "wave1", "keeps wave id");
  assertEqual(checklist.actions.length, 2, "lists all wave actions");
  assertEqual(checklist.actions[0].action, "slow_blink", "keeps action name");
  assertEqual(checklist.actions[0].sourceVideo, "assets/origin/generated/kling/slow_blink.mp4", "keeps source video");
  assertEqual(checklist.actions[0].runtimeFrameRoot, "assets/runtime/animations/slow_blink/frames", "keeps runtime path");
  assertEqual(checklist.actions[1].bridge, "click.single", "keeps bridge");
  assertEqual(checklist.summary.recommendedCount, 2, "counts recommended actions");
  assertEqual(checklist.summary.needsConfirmationCount, 2, "counts confirmation gates");

  const text = renderRuntimeIntakeChecklist(checklist);
  assertIncludes(text, "# runtime 接入前用户确认清单：第一波：低疲劳日常与关键交互", "renders Chinese title");
  assertIncludes(text, "确认前禁止抽帧", "renders confirmation rule");
  assertIncludes(text, "只允许在用户明确确认本清单后执行", "renders approval wording");
  assertIncludes(text, "目标 action：slow_blink", "renders action");
  assertIncludes(text, "来源视频：assets/origin/generated/kling/slow_blink.mp4", "renders source video");
  assertIncludes(text, "审查证据：assets/reviews/kling-generated/slow_blink_sweep.png", "renders evidence");
  assertIncludes(text, "运行帧输出：assets/runtime/animations/slow_blink/frames", "renders runtime output");
  assertIncludes(text, "桥接入口：click.single", "renders bridge");
  assertIncludes(text, "中断策略：locked", "renders interrupt policy");
  assertIncludes(text, "衔接策略：点击后锁定播放。", "renders transition plan");
  assertIncludes(text, "水印门禁：正式抽帧前逐视频播放检查无文字、水印、logo 和额外物体。", "renders watermark gate");
  assertIncludes(text, "禁止把 mp4 强制加入 Git", "renders mp4 git ban");
  assertIncludes(text, "npm run validate:runtime-intake-waves", "renders validation command");
  assertIncludes(text, "npm run validate:release", "renders release validation command");

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
