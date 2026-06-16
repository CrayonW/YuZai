import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = join(tmpdir(), `yuzai-kling-generated-video-audit-${process.pid}`);
mkdirSync(tempRoot, { recursive: true });
const bundlePath = join(tempRoot, "validate-kling-generated-video-audit.mjs");
const auditPath = join(process.cwd(), "scripts", "kling-generated-video-audit.mjs");

const testSource = `
  import { buildKlingGeneratedVideoAudit, renderKlingGeneratedVideoAudit } from ${JSON.stringify(auditPath)};

  const plan = {
    batches: [
      {
        id: "daily",
        name: "日常动作",
        actions: [
          { action: "loaf_breathing", category: "daily", loop: true, durationSeconds: 8, output: "assets/origin/generated/kling/loaf_breathing.mp4" }
        ]
      },
      {
        id: "interactive",
        name: "交互动作",
        actions: [
          { action: "cursor_watch", category: "interactive", loop: false, durationSeconds: 4, output: "assets/origin/generated/kling/cursor_watch.mp4" },
          { action: "missing_action", category: "interactive", loop: false, durationSeconds: 4, output: "assets/origin/generated/kling/missing_action.mp4" }
        ]
      }
    ]
  };

  const files = new Map([
    ["assets/origin/generated/kling/loaf_breathing.mp4", { exists: true, sizeBytes: 6000 }],
    ["assets/origin/generated/kling/cursor_watch.mp4", { exists: true, sizeBytes: 5000 }],
    ["assets/origin/generated/kling/missing_action.mp4", { exists: false, sizeBytes: 0 }]
  ]);

  const metadata = new Map([
    ["assets/origin/generated/kling/loaf_breathing.mp4", { width: 1080, height: 1080, durationSeconds: 5.04, hasVideo: true }],
    ["assets/origin/generated/kling/cursor_watch.mp4", { width: 768, height: 768, durationSeconds: 4.92, hasVideo: true }]
  ]);

  const audit = buildKlingGeneratedVideoAudit({
    root: ${JSON.stringify(tempRoot)},
    plan,
    options: { batch: "all", minWidth: 512, minHeight: 512, minDurationSeconds: 3 },
    fileInfoForAction: (action) => files.get(action.output) || { exists: false, sizeBytes: 0 },
    metadataForAction: (action) => metadata.get(action.output)
  });

  assertEqual(audit.summary.total, 3, "counts all actions");
  assertEqual(audit.summary.ready, 2, "counts ready videos");
  assertEqual(audit.summary.missing, 1, "counts missing videos");
  assertEqual(audit.summary.daily, 1, "counts daily category");
  assertEqual(audit.summary.interactive, 2, "counts interactive category");
  assertEqual(audit.actions[0].manualChecks.length >= 5, true, "adds manual checks");
  assertIncludes(audit.actions[0].manualChecks.join("\\n"), "无水印", "manual checks include watermark");
  assertIncludes(audit.actions[0].manualChecks.join("\\n"), "猫咪身份一致", "manual checks include identity");
  assertEqual(audit.actions[2].status, "missing", "missing file remains missing");
  assertIncludes(audit.actions[0].recommendation, "可进入人工画面检查", "ready recommendation");
  assertIncludes(audit.actions[2].recommendation, "先补生成视频", "missing recommendation");

  const text = renderKlingGeneratedVideoAudit(audit);
  assertIncludes(text, "可灵生成视频素材审查报告", "renders Chinese title");
  assertIncludes(text, "loaf_breathing", "renders action row");
  assertIncludes(text, "无水印/无文字/无 logo", "renders watermark review requirement");
  assertIncludes(text, "不能直接接入 runtime", "renders runtime gate");
  assertIncludes(text, "assets/reviews/kling-generated", "renders preview evidence path");
  assertIncludes(text, "overview.png", "renders overview evidence path");

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
