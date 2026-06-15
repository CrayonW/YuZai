import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-kling-batch-plan-"));
const bundlePath = join(tempRoot, "validate-kling-batch-plan.mjs");
const batchPlanPath = join(process.cwd(), "scripts", "kling", "batch-plan.mjs");

const testSource = `
  import { selectBatchActionNames, selectBatchActions } from ${JSON.stringify(batchPlanPath)};

  const batches = {
    batches: [
      { id: "fatigue-and-key-interaction", actions: [{ action: "groom_face_wash" }, { action: "cursor_watch" }] },
      { id: "sleep-routine", actions: [{ action: "sleepy" }, { action: "sleep" }] }
    ]
  };
  const plan = {
    actions: [
      { action: "groom_face_wash", category: "daily" },
      { action: "cursor_watch", category: "interactive" },
      { action: "sleepy", category: "daily" },
      { action: "sleep", category: "daily" }
    ]
  };

  assertEqual(selectBatchActionNames(batches, { batch: "1" }).join(","), "groom_face_wash,cursor_watch", "selects numeric batch");
  assertEqual(selectBatchActionNames(batches, { batch: "sleep-routine" }).join(","), "sleepy,sleep", "selects id batch");
  assertEqual(selectBatchActions(plan, batches, { batch: "2" }).map((item) => item.action).join(","), "sleepy,sleep", "returns plan actions in batch order");

  assertThrows(() => selectBatchActionNames(batches, { batch: "4" }), "Batch not found", "rejects missing batch");
  assertThrows(() => selectBatchActions({ actions: [{ action: "sleepy" }] }, batches, { batch: "1" }), "Action from batch not found in plan", "rejects stale batch action");

  function assertEqual(actual, expected, label) {
    if (actual !== expected) {
      throw new Error(label + ": expected " + expected + ", got " + actual);
    }
  }

  function assertThrows(fn, expected, label) {
    try {
      fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes(expected)) {
        throw new Error(label + ": expected error containing " + expected + ", got " + message);
      }
      return;
    }
    throw new Error(label + ": expected function to throw");
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
