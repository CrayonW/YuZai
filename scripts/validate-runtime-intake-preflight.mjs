import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-runtime-intake-preflight-"));
const bundlePath = join(tempRoot, "validate-runtime-intake-preflight.mjs");
const preflightPath = join(process.cwd(), "scripts", "runtime-intake-preflight.mjs");

const testSource = `
  import { buildRuntimeIntakePreflight, renderRuntimeIntakePreflight } from ${JSON.stringify(preflightPath)};

  const plan = {
    version: 1,
    confirmationRule: "确认前禁止抽帧、禁止去水印/抠绿、禁止修改 runtime manifest。",
    waves: [
      {
        id: "wave1",
        name: "第一波：低疲劳日常与关键交互",
        intent: "降低重复感。",
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
            transitionPlan: "从待机切入。",
            watermarkGate: "逐视频播放检查。"
          },
          {
            action: "cursor_watch",
            category: "interactive",
            status: "recommended",
            confirmation: "needs-user-confirmation",
            sourceVideo: "assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4",
            reviewEvidence: ["assets/reviews/kling-generated/cursor_watch_clean_candidate_v3_sweep.png"],
            runtimeFrameRoot: "assets/runtime/animations/cursor_watch/frames",
            interruptPolicy: "locked",
            returnTo: "idle_primary",
            bridge: "proximity.mouse_near",
            transitionPlan: "鼠标靠近插入。",
            watermarkGate: "检查无光点。"
          }
        ]
      }
    ]
  };

  const preflight = buildRuntimeIntakePreflight({
    plan,
    waveId: "wave1",
    fileInfoForAction: (action) => ({ exists: true, sizeBytes: action.action === "slow_blink" ? 1024 : 2048 }),
    metadataForAction: (action) => action.action === "slow_blink"
      ? { width: 1920, height: 1080, durationSeconds: 5.125, hasVideo: true }
      : { width: 1280, height: 720, durationSeconds: 4.8, hasVideo: true },
    evidenceExists: () => true
  });

  assertEqual(preflight.wave.id, "wave1", "keeps wave id");
  assertEqual(preflight.summary.total, 2, "counts actions");
  assertEqual(preflight.summary.readyForManualReview, 2, "counts ready actions");
  assertEqual(preflight.summary.needsConfirmation, 2, "counts confirmation gates");
  assertEqual(preflight.actions[0].width, 1920, "keeps width");
  assertEqual(preflight.actions[0].height, 1080, "keeps height");
  assertEqual(preflight.actions[0].durationSeconds, 5.125, "keeps duration");
  assertEqual(preflight.actions[1].bridge, "proximity.mouse_near", "keeps bridge");

  const text = renderRuntimeIntakePreflight(preflight);
  assertIncludes(text, "# runtime 接入预检报告：第一波：低疲劳日常与关键交互", "renders title");
  assertIncludes(text, "本报告不能直接批准 runtime 接入", "renders hard gate");
  assertIncludes(text, "slow_blink", "renders action");
  assertIncludes(text, "assets/origin/generated/kling/slow_blink.mp4", "renders source");
  assertIncludes(text, "1920x1080", "renders dimensions");
  assertIncludes(text, "5.125s", "renders duration");
  assertIncludes(text, "assets/reviews/kling-generated/slow_blink_sweep.png", "renders evidence");
  assertIncludes(text, "needs-user-confirmation", "renders confirmation");
  assertIncludes(text, "proximity.mouse_near", "renders bridge");
  assertIncludes(text, "检查无光点。", "renders watermark gate");
  assertIncludes(text, "禁止抽帧", "renders ban");
  assertIncludes(text, "npm run validate:runtime-intake-preflight", "renders validation command");

  function assertEqual(actual, expected, label) {
    if (actual !== expected) throw new Error(label + ": expected " + expected + ", got " + actual);
  }

  function assertIncludes(text, expected, label) {
    if (!text.includes(expected)) throw new Error(label + ": expected to include " + expected);
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
