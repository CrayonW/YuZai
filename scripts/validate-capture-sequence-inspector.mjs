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
  writeFileSync(join(goodDir, "frame-001.png"), pngBytes(12, 10, "a"));
  writeFileSync(join(goodDir, "frame-002.png"), pngBytes(12, 10, "b"));
  writeFileSync(join(goodDir, "frame-003.png"), pngBytes(12, 10, "c"));

  const good = inspectCaptureSequence({
    sequencePath: join(goodDir, "frame.png"),
    count: 3,
    minChangedFrames: 2,
    minWidth: 10,
    minHeight: 10
  });
  assertEqual(good.ok, true, "changed sequence passes");
  assertEqual(good.frames.length, 3, "changed sequence reports every frame");
  assertEqual(good.changedFrames, 3, "changed sequence counts unique frame hashes");
  assertEqual(good.frames[0].width, 12, "valid png reports width");
  assertEqual(good.frames[0].height, 10, "valid png reports height");
  assertEqual(good.failures.length, 0, "changed sequence has no failures");

  const duplicateDir = join(root, "duplicate");
  mkdirSync(duplicateDir, { recursive: true });
  writeFileSync(join(duplicateDir, "frame-001.png"), pngBytes(12, 10, "same"));
  writeFileSync(join(duplicateDir, "frame-002.png"), pngBytes(12, 10, "same"));
  writeFileSync(join(duplicateDir, "frame-003.png"), pngBytes(12, 10, "same"));
  const duplicate = inspectCaptureSequence({
    sequencePath: join(duplicateDir, "frame.png"),
    count: 3,
    minChangedFrames: 2,
    minWidth: 10,
    minHeight: 10
  });
  assertEqual(duplicate.ok, false, "duplicate sequence fails");
  assertIncludes(duplicate.failures.join("\\n"), "changed frame count 1 is below required 2", "duplicate sequence explains low motion");

  const brokenDir = join(root, "broken");
  mkdirSync(brokenDir, { recursive: true });
  writeFileSync(join(brokenDir, "frame-001.png"), pngBytes(12, 10, "a"));
  writeFileSync(join(brokenDir, "frame-002.png"), "");
  const broken = inspectCaptureSequence({
    sequencePath: join(brokenDir, "frame.png"),
    count: 3,
    minChangedFrames: 2,
    minWidth: 10,
    minHeight: 10
  });
  assertEqual(broken.ok, false, "broken sequence fails");
  assertIncludes(broken.failures.join("\\n"), "frame-002.png is empty", "broken sequence reports empty frame");
  assertIncludes(broken.failures.join("\\n"), "frame-003.png is missing", "broken sequence reports missing frame");

  const invalidDir = join(root, "invalid");
  mkdirSync(invalidDir, { recursive: true });
  writeFileSync(join(invalidDir, "frame-001.png"), pngBytes(12, 10, "a"));
  writeFileSync(join(invalidDir, "frame-002.png"), "not a png");
  writeFileSync(join(invalidDir, "frame-003.png"), pngBytes(4, 4, "c"));
  const invalid = inspectCaptureSequence({
    sequencePath: join(invalidDir, "frame.png"),
    count: 3,
    minChangedFrames: 2,
    minWidth: 10,
    minHeight: 10
  });
  assertEqual(invalid.ok, false, "invalid png sequence fails");
  assertIncludes(invalid.failures.join("\\n"), "frame-002.png is not a valid PNG", "invalid sequence reports bad png signature");
  assertIncludes(invalid.failures.join("\\n"), "frame-003.png dimensions 4x4 are below required 10x10", "invalid sequence reports too-small dimensions");

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

  function pngBytes(width, height, marker) {
    const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const length = Buffer.from([0, 0, 0, 13]);
    const type = Buffer.from("IHDR");
    const data = Buffer.alloc(13);
    data.writeUInt32BE(width, 0);
    data.writeUInt32BE(height, 4);
    data[8] = 8;
    data[9] = 6;
    const rest = Buffer.from(marker);
    return Buffer.concat([header, length, type, data, rest]);
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
