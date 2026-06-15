import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-capture-plan-"));
const bundlePath = join(tempRoot, "validate-capture-plan.mjs");
const capturePlanPath = join(process.cwd(), "electron", "capture-plan.ts");

const testSource = `
  import { buildCapturePlan } from ${JSON.stringify(capturePlanPath)};

  const single = buildCapturePlan({
    singlePath: "/private/tmp/yuzai-window.png",
    sequencePath: "",
    count: 0,
    intervalMs: 0,
    delayMs: 1200
  });
  assertEqual(single.enabled, true, "single capture is enabled");
  assertEqual(single.frames.length, 1, "single capture plans one frame");
  assertEqual(single.frames[0].path, "/private/tmp/yuzai-window.png", "single capture keeps exact path");
  assertEqual(single.frames[0].delayMs, 1200, "single capture uses delay");
  assertEqual(single.quitAfterCapture, true, "single capture quits after capture");

  const sequence = buildCapturePlan({
    singlePath: "",
    sequencePath: "/private/tmp/yuzai-window.png",
    count: 4,
    intervalMs: 160,
    delayMs: 800
  });
  assertEqual(sequence.enabled, true, "sequence capture is enabled");
  assertEqual(sequence.frames.length, 4, "sequence capture plans requested frames");
  assertEqual(sequence.frames[0].path, "/private/tmp/yuzai-window-001.png", "sequence first path is numbered");
  assertEqual(sequence.frames[3].path, "/private/tmp/yuzai-window-004.png", "sequence last path is numbered");
  assertEqual(sequence.frames[0].delayMs, 800, "sequence first delay uses start delay");
  assertEqual(sequence.frames[1].delayMs, 960, "sequence frame delay adds interval");
  assertEqual(sequence.quitAfterCapture, true, "sequence capture quits after last frame");

  const disabled = buildCapturePlan({
    singlePath: "",
    sequencePath: "",
    count: 4,
    intervalMs: 160,
    delayMs: 800
  });
  assertEqual(disabled.enabled, false, "capture is disabled without a path");
  assertEqual(disabled.frames.length, 0, "disabled capture has no frames");

  function assertEqual(actual, expected, label) {
    if (actual !== expected) {
      throw new Error(label + ": expected " + expected + ", got " + actual);
    }
  }
`;

writeFileSync(join(tempRoot, "entry.ts"), testSource);

await build({
  entryPoints: [join(tempRoot, "entry.ts")],
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
