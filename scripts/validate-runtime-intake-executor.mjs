import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-runtime-intake-executor-"));
const bundlePath = join(tempRoot, "validate-runtime-intake-executor.mjs");
const executorPath = join(process.cwd(), "scripts", "runtime-intake-executor.mjs");

const testSource = `
  import { buildRuntimeIntakeExecutionPlan, assertRuntimeIntakeApproval, buildRuntimeIntakeManifestPatch, renderRuntimeIntakeExecutionPlan } from ${JSON.stringify(executorPath)};

  const plan = {
    waves: [
      {
        id: "wave1",
        name: "第一波",
        actions: [
          {
            action: "slow_blink",
            category: "daily",
            confirmation: "needs-user-confirmation",
            sourceVideo: "assets/origin/generated/kling/slow_blink.mp4",
            runtimeFrameRoot: "assets/runtime/animations/slow_blink/frames",
            bridge: "daily-rotation.low-fatigue",
            interruptPolicy: "at-safe-frame",
            returnTo: "idle_primary",
            reviewEvidence: ["assets/reviews/kling-generated/slow_blink_sweep.png"],
            transitionPlan: "从待机切入。",
            watermarkGate: "人工检查。"
          },
          {
            action: "click_surprised",
            category: "interactive",
            confirmation: "needs-user-confirmation",
            sourceVideo: "assets/origin/generated/kling/click_surprised.mp4",
            runtimeFrameRoot: "assets/runtime/animations/click_surprised/frames",
            bridge: "click.single",
            interruptPolicy: "locked",
            returnTo: "idle_primary",
            reviewEvidence: ["assets/reviews/kling-generated/click_surprised_sweep.png"],
            transitionPlan: "点击插入。",
            watermarkGate: "人工检查。"
          }
        ]
      }
    ]
  };
  const manifest = {
    actions: {
      idle_primary: { category: "daily", frameCount: 72 }
    }
  };
  const bridges = {
    dailyRotation: {
      lowFatigue: ["slow_blink"]
    },
    click: {
      single: ["click_surprised", "paw_raise"]
    }
  };

  const executionPlan = buildRuntimeIntakeExecutionPlan({ plan, waveId: "wave1", manifest, bridges });
  assertEqual(executionPlan.wave.id, "wave1", "keeps wave id");
  assertEqual(executionPlan.actions.length, 2, "plans all actions");
  assertEqual(executionPlan.actions[0].manifestOperation, "add", "new action is add");
  assertEqual(executionPlan.actions[0].frameOperation, "create", "new frames are create");
  assertEqual(executionPlan.actions[0].bridgeOperation, "already-referenced", "daily rotation bridge is detected");
  assertEqual(executionPlan.actions[1].bridgeOperation, "already-referenced", "existing bridge reference is detected");
  assertEqual(executionPlan.summary.actionsToAdd, 2, "counts manifest additions");
  assertEqual(executionPlan.summary.framesToCreate, 2, "counts frame directories");

  const patchedManifest = buildRuntimeIntakeManifestPatch({
    manifest,
    executionPlan,
    frameCounts: {
      slow_blink: 120,
      click_surprised: 120
    }
  });
  assertEqual(patchedManifest.actions.slow_blink.source, "assets/origin/generated/kling/slow_blink.mp4", "adds source video");
  assertEqual(patchedManifest.actions.slow_blink.frameRoot, "../assets/runtime/animations/slow_blink/frames", "adds runtime frame root");
  assertEqual(patchedManifest.actions.slow_blink.frameCount, 120, "uses extracted frame count");
  assertEqual(patchedManifest.actions.slow_blink.loop, false, "daily insert action is one-shot");
  assertEqual(patchedManifest.actions.slow_blink.interruptPolicy, "at-safe-frame", "keeps interrupt policy");
  assertEqual(patchedManifest.actions.click_surprised.category, "interactive", "keeps interactive category");
  assertEqual(patchedManifest.actions.click_surprised.interruptible, false, "locked interaction is not interruptible");
  assertEqual(patchedManifest.actions.click_surprised.loop, false, "interactive action is one-shot");
  assertEqual(manifest.actions.slow_blink, undefined, "does not mutate source manifest");

  const text = renderRuntimeIntakeExecutionPlan(executionPlan);
  assertIncludes(text, "# runtime 接入执行 dry-run：第一波", "renders title");
  assertIncludes(text, "本报告不执行抽帧", "renders dry-run warning");
  assertIncludes(text, "sourceVideo=assets/origin/generated/kling/slow_blink.mp4", "renders source");
  assertIncludes(text, "runtimeFrameRoot=assets/runtime/animations/slow_blink/frames", "renders runtime root");
  assertIncludes(text, "manifest=add", "renders manifest operation");
  assertIncludes(text, "bridge=already-referenced", "renders bridge operation");
  assertIncludes(text, "需要用户批准文件", "renders approval gate");

  let blocked = false;
  try {
    assertRuntimeIntakeApproval({ dryRun: false, approvalExists: false, waveId: "wave1" });
  } catch (error) {
    blocked = String(error.message).includes("缺少 runtime 接入批准文件");
  }
  assertEqual(blocked, true, "non dry-run requires approval");
  assertRuntimeIntakeApproval({ dryRun: true, approvalExists: false, waveId: "wave1" });

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
