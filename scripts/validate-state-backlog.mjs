import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-state-backlog-"));
const bundlePath = join(tempRoot, "validate-state-backlog.mjs");
const backlogPath = join(process.cwd(), "scripts", "state-backlog.mjs");

const testSource = `
  import { buildStateBacklog, renderStateBacklog, writeStateBacklog } from ${JSON.stringify(backlogPath)};
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";

  const coverage = {
    states: [
      { state: "idle", status: "independent", actions: ["idle_primary"], promptAction: null },
      { state: "waking", status: "fallback", actions: ["idle_primary"], promptAction: "waking" },
      { state: "surprised", status: "fallback", actions: ["idle_primary"], promptAction: "click_surprised" },
      { state: "sleep", status: "fallback", actions: ["idle_primary"], promptAction: null }
    ]
  };
  const plan = {
    actions: [
      { action: "waking", category: "interactive", output: "assets/origin/generated/kling/waking.mp4" },
      { action: "click_surprised", category: "interactive", output: "assets/origin/generated/kling/click_surprised.mp4" }
    ]
  };

  const backlog = buildStateBacklog({ coverage, plan });
  assertEqual(backlog.items.length, 3, "only fallback states become backlog items");
  assertEqual(backlog.items[0].state, "waking", "keeps fallback state order");
  assertEqual(backlog.items[0].suggestedAction, "waking", "uses prompt action when available");
  assertEqual(backlog.items[0].output, "assets/origin/generated/kling/waking.mp4", "uses plan output");
  assertEqual(backlog.items[2].suggestedAction, "待补提示词", "missing prompt is explicit");

  const text = renderStateBacklog(backlog);
  assertIncludes(text, "## 13 状态动作补齐待办", "renders Chinese title");
  assertIncludes(text, "| waking | waking | interactive | assets/origin/generated/kling/waking.mp4 |", "renders waking row");
  assertIncludes(text, "| sleep | 待补提示词 | 待确认 | 待确认 |", "renders prompt gap row");
  assertIncludes(text, "先生成/补充源视频，再运行素材处理前确认清单", "renders process note");

  const outputPath = join(${JSON.stringify(tempRoot)}, "state-backlog.md");
  const written = writeStateBacklog(backlog, outputPath);
  assertEqual(written, text, "write returns rendered text");
  assertEqual(existsSync(outputPath), true, "writes backlog file");
  assertIncludes(readFileSync(outputPath, "utf8"), "click_surprised", "written file includes plan action");

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
