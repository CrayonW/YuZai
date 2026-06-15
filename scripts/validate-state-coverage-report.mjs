import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-state-coverage-"));
const bundlePath = join(tempRoot, "validate-state-coverage-report.mjs");
const reportPath = join(process.cwd(), "scripts", "state-coverage-report.mjs");

const testSource = `
  import { buildStateCoverageReport, renderStateCoverageReport, writeStateCoverageReport } from ${JSON.stringify(reportPath)};
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";

  const manifest = {
    defaultAction: "idle_primary",
    actions: {
      idle_primary: { source: "assets/origin/idle.mp4", category: "daily" },
      walk: { source: "assets/origin/walk.mp4", category: "daily" },
      paw_raise: { source: "assets/origin/paw.mp4", category: "interactive" }
    },
    stateMap: {
      idle: "idle_primary",
      walking: { left: "walk", right: "walk", neutral: "idle_primary" },
      teaser: "paw_raise",
      sleepy: "idle_primary"
    }
  };
  const report = buildStateCoverageReport({
    manifest,
    stateNames: ["idle", "walking", "teaser", "sleepy", "missing_state"],
    promptActions: ["sleepy", "teaser"]
  });

  assertEqual(report.totalStates, 5, "reports total states");
  assertEqual(report.summary.fallback, 1, "counts fallback states");
  assertEqual(report.summary.independent, 2, "counts independent states");
  assertEqual(report.summary.mixed, 1, "counts mixed states");
  assertEqual(report.summary.missing, 1, "counts missing states");

  const walking = report.states.find((state) => state.state === "walking");
  assertEqual(walking.status, "mixed", "directional default plus real action is mixed");
  assertIncludes(walking.actions.join(","), "walk", "mixed state lists non-default action");

  const sleepy = report.states.find((state) => state.state === "sleepy");
  assertEqual(sleepy.status, "fallback", "default-only state is fallback");
  assertEqual(sleepy.promptAction, "sleepy", "matching prompt action is reported");

  const missing = report.states.find((state) => state.state === "missing_state");
  assertEqual(missing.status, "missing", "missing state is reported");

  const text = renderStateCoverageReport(report);
  assertIncludes(text, "## 桌宠状态动作覆盖报告", "renders Chinese title");
  assertIncludes(text, "sleepy | fallback", "renders fallback row");
  assertIncludes(text, "missing_state | missing", "renders missing row");
  assertIncludes(text, "prompt: sleepy", "renders prompt hint");

  const outputPath = join(${JSON.stringify(tempRoot)}, "state-coverage.md");
  const written = writeStateCoverageReport(report, outputPath);
  assertEqual(existsSync(outputPath), true, "writes report file");
  assertEqual(written, text, "write helper returns rendered text");
  assertIncludes(readFileSync(outputPath, "utf8"), "覆盖摘要：independent 2", "written report includes summary");

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
