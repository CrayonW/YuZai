import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-animation-director-"));
const bundlePath = join(tempRoot, "validate-animation-director.mjs");
const directorPath = join(process.cwd(), "src", "core", "render", "animation-director.ts");

const testSource = `
  import { AnimationDirector } from ${JSON.stringify(directorPath)};

  const sequences = {
    idle_primary: sequence("idle_primary", 24, true, 72),
    paw_raise: sequence("paw_raise", 24, false, 72)
  };

  const configs = {
    idle_primary: {
      category: "daily",
      entryFrames: [1, 24, 48],
      exitFrames: [24, 48, 72],
      interruptPolicy: "at-safe-frame",
      returnTo: "idle_primary"
    },
    paw_raise: {
      category: "interactive",
      entryFrames: [1],
      exitFrames: [72],
      interruptPolicy: "locked",
      returnTo: "idle_primary"
    }
  };

  const director = new AnimationDirector({
    defaultAction: "idle_primary",
    resolveSequence: (action) => sequences[action],
    resolveConfig: (action) => configs[action]
  });

  assertEqual(director.update(0).action, "idle_primary", "starts with daily action");
  assertEqual(director.update(0).frameIndex, 0, "starts at first daily frame");
  assertEqual(director.update(1000).frameIndex, 24, "daily timeline keeps advancing");

  director.request("paw_raise", 1010);
  assertEqual(director.update(1010).action, "idle_primary", "waits instead of hard cutting before safe exit frame");
  assertEqual(director.update(2000).action, "paw_raise", "switches to interaction at safe exit frame or timeout");
  assertEqual(director.update(2000).frameIndex, 0, "interaction starts at its entry frame");

  director.request("idle_primary", 2100);
  assertEqual(director.update(2100).action, "paw_raise", "does not interrupt locked interaction with stale daily request");
  assertEqual(director.update(5000).action, "idle_primary", "returns to daily action after interaction ends");
  assertEqual(director.update(6000).frameIndex, 24, "stale daily request does not reset daily timeline after return");

  function sequence(action, fps, loop, frameCount) {
    return {
      action,
      fps,
      loop,
      frames: Array.from({ length: frameCount }, (_, index) => ({ id: action + ":" + index }))
    };
  }

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
