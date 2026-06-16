import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-kling-batch-intake-"));
const bundlePath = join(tempRoot, "validate-kling-batch-intake-checklist.mjs");
const checklistPath = join(process.cwd(), "scripts", "kling-batch-intake-checklist.mjs");

const testSource = `
  import { buildKlingBatchIntakeChecklist, renderKlingBatchIntakeChecklist } from ${JSON.stringify(checklistPath)};

  const plan = {
    actions: [
      { action: "groom_face_wash", category: "daily", loop: false, durationSeconds: 8, output: "assets/origin/generated/kling/groom_face_wash.mp4" },
      { action: "click_surprised", category: "interactive", loop: false, durationSeconds: 4, output: "assets/origin/generated/kling/click_surprised.mp4" }
    ]
  };
  const batches = {
    batches: [
      { id: "first", name: "第一批", actions: [{ action: "groom_face_wash" }, { action: "click_surprised" }] }
    ]
  };
  const manifest = {
    actions: {
      click_surprised: {
        category: "interactive",
        frameRoot: "../assets/runtime/animations/click_surprised/frames",
        frameCount: 72
      }
    },
    stateMap: {
      surprised: "click_surprised"
    }
  };

  const checklist = buildKlingBatchIntakeChecklist({ plan, batches, manifest, batch: "1" });
  assertEqual(checklist.items.length, 2, "lists every batch action");
  assertEqual(checklist.items[0].sourceVideo, "assets/origin/generated/kling/groom_face_wash.mp4", "uses generated video as source");
  assertEqual(checklist.items[0].targetAction, "groom_face_wash", "uses action name");
  assertEqual(checklist.items[0].manifestStatus, "待新增", "new action requires manifest add");
  assertEqual(checklist.items[0].overwritePath, "assets/runtime/animations/groom_face_wash/frames", "suggests runtime frame path");
  assertEqual(checklist.items[1].manifestStatus, "已存在", "existing action is detected");
  assertEqual(checklist.items[1].stateHint, "surprised", "state mapping hint is detected");

  const text = renderKlingBatchIntakeChecklist(checklist);
  assertIncludes(text, "可灵批次素材接入前确认清单", "renders Chinese title");
  assertIncludes(text, "必须先给用户确认", "renders user confirmation rule");
  assertIncludes(text, "assets/origin/generated/kling/groom_face_wash.mp4", "renders source video");
  assertIncludes(text, "目标 action：groom_face_wash", "renders target action");
  assertIncludes(text, "npm run animations:audit-origin", "renders validation command");

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
