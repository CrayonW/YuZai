import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-motion-intent-scheduler-"));
const bundlePath = join(tempRoot, "validate-motion-intent-scheduler.mjs");
const schedulerPath = join(process.cwd(), "src", "core", "render", "motion-intent-scheduler.ts");

const testSource = `
  import { MotionIntentScheduler } from ${JSON.stringify(schedulerPath)};

  const scheduler = new MotionIntentScheduler({
    defaultAction: "idle_primary",
    mouseFollowStableMs: 160,
    mouseFollowMinHoldMs: 300
  });

  assertEqual(scheduler.resolve(0), "idle_primary", "starts from default action");

  scheduler.submit({ type: "base", action: "idle_primary", now: 0 });
  scheduler.submit({ type: "daily", action: "idle_secondary", now: 10, holdMs: 1000 });
  assertEqual(scheduler.resolve(10), "idle_secondary", "daily can replace base while idle");

  scheduler.submit({ type: "proximity", action: "paw_raise", now: 20, lockMs: 1800 });
  assertEqual(scheduler.resolve(20), "paw_raise", "interaction takes priority over daily");

  scheduler.submit({ type: "daily", action: "tail_wag", now: 30, holdMs: 5000 });
  assertEqual(scheduler.resolve(30), "paw_raise", "daily cannot interrupt locked interaction chain");

  scheduler.submit({ type: "proximity", action: "paw_raise", now: 40, lockMs: 1800 });
  assertEqual(scheduler.pendingCount(), 1, "duplicate one-shot interaction is merged");

  scheduler.completeCurrent("paw_raise", 1900);
  assertEqual(scheduler.resolve(1900), "tail_wag", "latest daily resumes after interaction completes");

  scheduler.submit({ type: "mouse-follow", action: "look_e", now: 2000, near: true });
  assertEqual(scheduler.resolve(2100), "tail_wag", "mouse-follow waits for stable direction window");
  assertEqual(scheduler.resolve(2160), "look_e", "mouse-follow activates after stable direction window");

  scheduler.submit({ type: "mouse-follow", action: "look_ne", now: 2200, near: true });
  assertEqual(scheduler.resolve(2250), "look_e", "mouse-follow respects minimum hold before switching direction");
  assertEqual(scheduler.resolve(2520), "look_ne", "mouse-follow can switch after hold and stable window");

  scheduler.submit({ type: "mouse-follow", action: "look_ne", now: 2600, near: false });
  assertEqual(scheduler.resolve(2600), "tail_wag", "mouse-follow leaves through base/daily target instead of sticking");

  scheduler.submit({ type: "preview", action: "click_surprised", now: 2700, until: 3300 });
  assertEqual(scheduler.resolve(2800), "click_surprised", "preview overrides all normal intents");
  assertEqual(scheduler.resolve(3400), "tail_wag", "preview releases back to latest non-preview target");

  scheduler.submit({ type: "drag", action: "dragging", now: 3500, lockMs: 500 });
  assertEqual(scheduler.resolve(3500), "dragging", "drag takes priority immediately");
  scheduler.completeCurrent("dragging", 4100);
  assertEqual(scheduler.resolve(4100), "tail_wag", "drag completion releases back to daily target");

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
