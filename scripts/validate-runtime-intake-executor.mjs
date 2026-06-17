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
      },
      {
        id: "wave2",
        name: "第二波",
        actions: [
          {
            action: "groom_face_wash",
            category: "daily",
            confirmation: "needs-user-confirmation",
            sourceVideo: "assets/origin/generated/kling/groom_face_wash.mp4",
            runtimeFrameRoot: "assets/runtime/animations/groom_face_wash/frames",
            bridge: "daily-rotation.life",
            interruptPolicy: "at-safe-frame",
            returnTo: "idle_primary",
            reviewEvidence: ["assets/reviews/kling-generated/groom_face_wash_sweep.png"],
            transitionPlan: "洗脸后回待机。",
            watermarkGate: "人工检查。"
          },
          {
            action: "desk_sniff",
            category: "daily",
            confirmation: "needs-user-confirmation",
            sourceVideo: "assets/origin/generated/kling/desk_sniff.mp4",
            runtimeFrameRoot: "assets/runtime/animations/desk_sniff/frames",
            bridge: "daily-rotation.explore",
            interruptPolicy: "at-safe-frame",
            returnTo: "idle_primary",
            reviewEvidence: ["assets/reviews/kling-generated/desk_sniff_sweep.png"],
            transitionPlan: "探索后回待机。",
            watermarkGate: "人工检查。"
          },
          {
            action: "loaf_breathing",
            category: "daily",
            confirmation: "needs-user-confirmation",
            sourceVideo: "assets/origin/generated/kling/loaf_breathing.mp4",
            runtimeFrameRoot: "assets/runtime/animations/loaf_breathing/frames",
            loop: true,
            bridge: "daily-rotation.low-fatigue",
            interruptPolicy: "at-safe-frame",
            returnTo: "idle_primary",
            reviewEvidence: ["assets/reviews/kling-generated/loaf_breathing_sweep.png"],
            transitionPlan: "轻呼吸循环后回待机。",
            watermarkGate: "人工检查。"
          },
          {
            action: "shy",
            category: "interactive",
            confirmation: "needs-user-confirmation",
            sourceVideo: "assets/origin/generated/kling/shy.mp4",
            runtimeFrameRoot: "assets/runtime/animations/shy/frames",
            bridge: "interaction.gentle",
            interruptPolicy: "locked",
            returnTo: "idle_primary",
            reviewEvidence: ["assets/reviews/kling-generated/shy_sweep.png"],
            transitionPlan: "温柔回应后回待机。",
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
      lowFatigue: ["slow_blink", "loaf_breathing"],
      life: ["groom_face_wash"],
      explore: ["desk_sniff"]
    },
    interaction: {
      gentle: ["shy"]
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

  const wave2ExecutionPlan = buildRuntimeIntakeExecutionPlan({ plan, waveId: "wave2", manifest, bridges });
  assertEqual(
    wave2ExecutionPlan.actions.map((action) => action.bridgeOperation).join(","),
    "already-referenced,already-referenced,already-referenced,already-referenced",
    "wave2 life, explore, low-fatigue, and gentle bridges are detected"
  );

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

  const wave2Manifest = buildRuntimeIntakeManifestPatch({
    manifest,
    executionPlan: wave2ExecutionPlan,
    frameCounts: {
      groom_face_wash: 120,
      desk_sniff: 120,
      loaf_breathing: 120,
      shy: 120
    }
  });
  assertEqual(wave2Manifest.actions.loaf_breathing.loop, true, "keeps explicit loop actions looping");
  assertEqual(wave2Manifest.actions.groom_face_wash.loop, false, "keeps default daily insert actions one-shot");

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
