import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-capture-sequence-"));
const bundlePath = join(tempRoot, "validate-capture-sequence-inspector.mjs");
const inspectorPath = join(process.cwd(), "scripts", "capture-sequence-inspector.mjs");

const testSource = `
  import { inspectCaptureSequence } from ${JSON.stringify(inspectorPath)};
  import { mkdirSync, writeFileSync } from "node:fs";
  import { join } from "node:path";

  const root = ${JSON.stringify(tempRoot)};
  const goodDir = join(root, "good");
  mkdirSync(goodDir, { recursive: true });
  writeFileSync(join(goodDir, "frame-001.png"), "aaa");
  writeFileSync(join(goodDir, "frame-002.png"), "aab");
  writeFileSync(join(goodDir, "frame-003.png"), "aac");

  const good = inspectCaptureSequence({
    sequencePath: join(goodDir, "frame.png"),
    count: 3,
    minChangedFrames: 2
  });
  assertEqual(good.ok, true, "changed sequence passes");
  assertEqual(good.frames.length, 3, "changed sequence reports every frame");
  assertEqual(good.changedFrames, 3, "changed sequence counts unique frame hashes");
  assertEqual(good.failures.length, 0, "changed sequence has no failures");

  const duplicateDir = join(root, "duplicate");
  mkdirSync(duplicateDir, { recursive: true });
  writeFileSync(join(duplicateDir, "frame-001.png"), "same");
  writeFileSync(join(duplicateDir, "frame-002.png"), "same");
  writeFileSync(join(duplicateDir, "frame-003.png"), "same");
  const duplicate = inspectCaptureSequence({
    sequencePath: join(duplicateDir, "frame.png"),
    count: 3,
    minChangedFrames: 2
  });
  assertEqual(duplicate.ok, false, "duplicate sequence fails");
  assertIncludes(duplicate.failures.join("\\n"), "changed frame count 1 is below required 2", "duplicate sequence explains low motion");

  const brokenDir = join(root, "broken");
  mkdirSync(brokenDir, { recursive: true });
  writeFileSync(join(brokenDir, "frame-001.png"), "aaa");
  writeFileSync(join(brokenDir, "frame-002.png"), "");
  const broken = inspectCaptureSequence({
    sequencePath: join(brokenDir, "frame.png"),
    count: 3,
    minChangedFrames: 2
  });
  assertEqual(broken.ok, false, "broken sequence fails");
  assertIncludes(broken.failures.join("\\n"), "frame-002.png is empty", "broken sequence reports empty frame");
  assertIncludes(broken.failures.join("\\n"), "frame-003.png is missing", "broken sequence reports missing frame");

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
