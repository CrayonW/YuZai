import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-origin-video-audit-"));
const bundlePath = join(tempRoot, "validate-origin-video-audit.mjs");
const auditPath = join(process.cwd(), "scripts", "origin-video-audit.mjs");

const testSource = `
  import { validateOriginVideoMetadata } from ${JSON.stringify(auditPath)};

  const valid = validateOriginVideoMetadata({
    source: "assets/origin/idle.mp4",
    width: 720,
    height: 960,
    durationSeconds: 3.2,
    hasVideo: true
  }, { requiredDurationSeconds: 3, minWidth: 256, minHeight: 256 });
  assertEqual(valid.ok, true, "valid metadata passes");
  assertEqual(valid.failures.length, 0, "valid metadata has no failures");

  const short = validateOriginVideoMetadata({
    source: "assets/origin/short.mp4",
    width: 720,
    height: 960,
    durationSeconds: 2.4,
    hasVideo: true
  }, { requiredDurationSeconds: 3, minWidth: 256, minHeight: 256 });
  assertEqual(short.ok, false, "short video fails");
  assertIncludes(short.failures.join("\\n"), "duration 2.4s is shorter than required 3s", "short video reports duration");

  const tiny = validateOriginVideoMetadata({
    source: "assets/origin/tiny.mp4",
    width: 120,
    height: 120,
    durationSeconds: 3.2,
    hasVideo: true
  }, { requiredDurationSeconds: 3, minWidth: 256, minHeight: 256 });
  assertEqual(tiny.ok, false, "tiny video fails");
  assertIncludes(tiny.failures.join("\\n"), "dimensions 120x120 are below required 256x256", "tiny video reports dimensions");

  const noVideo = validateOriginVideoMetadata({
    source: "assets/origin/audio.mp4",
    width: 0,
    height: 0,
    durationSeconds: 3.2,
    hasVideo: false
  }, { requiredDurationSeconds: 3, minWidth: 256, minHeight: 256 });
  assertEqual(noVideo.ok, false, "file without video stream fails");
  assertIncludes(noVideo.failures.join("\\n"), "does not contain a video stream", "missing video stream is reported");

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
