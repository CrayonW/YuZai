import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-animation-intake-"));
const bundlePath = join(tempRoot, "validate-animation-intake-checklist.mjs");
const checklistPath = join(process.cwd(), "scripts", "animation-intake-checklist.mjs");

const testSource = `
  import { buildAnimationIntakeChecklist, renderAnimationIntakeChecklist } from ${JSON.stringify(checklistPath)};

  const manifest = {
    actions: {
      idle_primary: {
        source: "assets/origin/鱼仔待机动作1.mp4",
        category: "daily",
        frameRoot: "../assets/runtime/animations/idle_primary/frames",
        frameCount: 72
      },
      paw_raise: {
        source: "assets/origin/鱼仔前肢抬起视频.mp4",
        category: "interactive",
        frameRoot: "../assets/runtime/animations/paw_raise/frames",
        frameCount: 72
      },
      walk: {
        source: "assets/origin/鱼仔走路视频.mp4",
        category: "daily",
        frameRoot: "../assets/runtime/animations/walk/frames",
        frameCount: 72
      },
      walk_left: {
        source: "assets/origin/鱼仔走路视频.mp4",
        category: "daily",
        frameRoot: "../assets/runtime/animations/walk_left/frames",
        frameCount: 72,
        derivedFrom: "walk"
      }
    }
  };
  const originFiles = [
    "鱼仔待机动作1.mp4",
    "鱼仔前肢抬起视频.mp4",
    "鱼仔走路视频.mp4",
    "鱼仔新动作.mp4",
    "鱼仔参考图.png"
  ];

  const checklist = buildAnimationIntakeChecklist({ manifest, originFiles });
  assertEqual(checklist.items.length, 4, "only video files are listed");
  assertEqual(checklist.items[0].source, "assets/origin/鱼仔待机动作1.mp4", "known source keeps origin path");
  assertEqual(checklist.items[0].action, "idle_primary", "known source maps to manifest action");
  assertEqual(checklist.items[0].category, "daily", "known source keeps category");
  assertEqual(checklist.items[0].status, "已接入", "known source status");
  const walkItem = checklist.items.find((item) => item.source.endsWith("鱼仔走路视频.mp4"));
  assertEqual(walkItem.action, "walk、walk_left", "duplicate source lists every action");
  assertIncludes(walkItem.overwritePath, "assets/runtime/animations/walk/frames", "duplicate source includes primary overwrite path");
  assertIncludes(walkItem.overwritePath, "assets/runtime/animations/walk_left/frames", "duplicate source includes derived overwrite path");

  const unknownItem = checklist.items.find((item) => item.source.endsWith("鱼仔新动作.mp4"));
  assertEqual(unknownItem.action, "待确认", "unknown source requires action confirmation");
  assertEqual(unknownItem.status, "待确认", "unknown source status");

  const text = renderAnimationIntakeChecklist(checklist);
  assertIncludes(text, "## 动作素材处理前确认清单", "renders Chinese title");
  assertIncludes(text, "assets/origin/鱼仔新动作.mp4", "renders unknown source");
  assertIncludes(text, "目标 action：待确认", "renders action confirmation field");
  assertIncludes(text, "会覆盖路径：assets/runtime/animations/idle_primary/frames", "renders overwrite path");
  assertIncludes(text, "是否修改 manifest：待确认", "renders manifest decision");
  assertIncludes(text, "npm run validate:manifest-contract:current", "renders required validation command");

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
