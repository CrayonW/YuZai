import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-kling-generation-batches-"));
const bundlePath = join(tempRoot, "validate-kling-generation-batches.mjs");
const batchesPath = join(process.cwd(), "scripts", "kling-generation-batches.mjs");

const testSource = `
  import { buildKlingGenerationBatches, renderKlingGenerationBatches } from ${JSON.stringify(batchesPath)};

  const plan = {
    actions: [
      action("idle_primary", "daily", 8, "主待机"),
      action("tail_wag", "daily", 8, "摇尾"),
      action("idle_secondary", "daily", 8, "备用"),
      action("groom_face_wash", "daily", 8, "洗脸"),
      action("loaf_breathing", "daily", 8, "香箱趴"),
      action("desk_sniff", "daily", 6, "嗅闻"),
      action("stretch_yawn", "daily", 6, "伸懒腰"),
      action("sleepy", "daily", 6, "变困"),
      action("sleep", "daily", 6, "入睡"),
      action("sleeping", "daily", 8, "睡着"),
      action("cursor_watch", "interactive", 4, "看鼠标"),
      action("click_surprised", "interactive", 4, "点击"),
      action("poke_annoyed", "interactive", 4, "连续点击"),
      action("dragging", "interactive", 4, "拖拽"),
      action("waking", "interactive", 4, "唤醒")
    ]
  };
  const backlog = {
    items: [
      { state: "sleep", suggestedAction: "sleep" },
      { state: "sleepy", suggestedAction: "sleepy" },
      { state: "sleeping", suggestedAction: "sleeping" },
      { state: "waking", suggestedAction: "waking" },
      { state: "surprised", suggestedAction: "click_surprised" },
      { state: "dragging", suggestedAction: "dragging" }
    ]
  };

  const batches = buildKlingGenerationBatches({ plan, backlog });
  assertEqual(batches.batches.length, 3, "creates three batches");
  assertEqual(batches.batches[0].name, "第一批：降低疲劳与关键交互", "names first batch");
  assertEqual(batches.batches[0].actions.map((item) => item.action).join(","), "groom_face_wash,loaf_breathing,cursor_watch,click_surprised", "first batch focuses on fatigue and key interaction");
  assertEqual(batches.batches[1].actions.map((item) => item.action).join(","), "sleepy,sleep,sleeping,waking", "second batch is sleep chain");
  assertIncludes(batches.batches[2].actions.map((item) => item.action).join(","), "dragging", "third batch includes remaining interaction backlog");
  assertEqual(batches.summary.totalActions, 12, "deduplicates planned actions across batches");

  const text = renderKlingGenerationBatches(batches);
  assertIncludes(text, "可灵视频生成优先批次", "renders Chinese title");
  assertIncludes(text, "npm run kling:generate-batch -- --batch 1 --dry-run", "renders batch dry-run command");
  assertIncludes(text, "npm run kling:generate -- --action groom_face_wash", "renders generation command");
  assertIncludes(text, "8s / API 5s", "renders separate design and API duration");
  assertIncludes(text, "先运行 auth-check", "renders auth prerequisite");

  function action(action, category, durationSeconds, antiFatigueRole) {
    return { action, category, durationSeconds, generationDurationSeconds: 5, antiFatigueRole, output: "assets/origin/generated/kling/" + action + ".mp4" };
  }

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
