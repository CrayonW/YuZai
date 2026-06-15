import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = join(tmpdir(), `yuzai-kling-batch-status-${process.pid}`);
mkdirSync(tempRoot, { recursive: true });
const bundlePath = join(tempRoot, "validate-kling-batch-status.mjs");
const statusPath = join(process.cwd(), "scripts", "kling", "batch-status.mjs");

const outputRoot = join(tempRoot, "assets", "origin", "generated", "kling");
mkdirSync(outputRoot, { recursive: true });
writeFileSync(join(outputRoot, "ready.mp4"), "video-bytes");
writeFileSync(join(outputRoot, "empty.mp4"), "");

const testSource = `
  import { buildKlingBatchStatus, renderKlingBatchStatus } from ${JSON.stringify(statusPath)};

  const batches = {
    batches: [
      {
        id: "first",
        name: "第一批",
        actions: [
          { action: "ready", output: "assets/origin/generated/kling/ready.mp4" },
          { action: "empty", output: "assets/origin/generated/kling/empty.mp4" },
          { action: "missing", output: "assets/origin/generated/kling/missing.mp4" }
        ]
      }
    ]
  };

  const status = buildKlingBatchStatus(${JSON.stringify(tempRoot)}, batches, { batch: "1" });
  assertEqual(status.summary.ready, 1, "counts ready file");
  assertEqual(status.summary.empty, 1, "counts empty file");
  assertEqual(status.summary.missing, 1, "counts missing file");
  assertEqual(status.actions.map((item) => item.status).join(","), "ready,empty,missing", "keeps batch order and statuses");
  assertEqual(status.actions[0].sizeBytes > 0, true, "records ready size");

  const text = renderKlingBatchStatus(status);
  assertIncludes(text, "可灵批次产物状态", "renders Chinese title");
  assertIncludes(text, "| ready | ready |", "renders ready row");
  assertIncludes(text, "npm run kling:generate-batch -- --batch first", "renders generation hint");

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
