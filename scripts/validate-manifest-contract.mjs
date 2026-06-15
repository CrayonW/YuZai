import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-manifest-contract-"));
const bundlePath = join(tempRoot, "validate-manifest-contract.mjs");
const contractPath = join(process.cwd(), "scripts", "manifest-contract.mjs");

const testSource = `
  import { extractPetStateNames, validateManifestContract } from ${JSON.stringify(contractPath)};

  const stateSource = 'export type PetStateName =\\n  | "idle"\\n  | "walking"\\n  | "teaser";\\n';
  const stateNames = extractPetStateNames(stateSource);
  assertEqual(stateNames.join(","), "idle,walking,teaser", "extracts union state names");

  const valid = validateManifestContract({
    defaultAction: "idle_primary",
    actions: {
      idle_primary: action({ category: "daily", loop: true, fallback: "idle_primary" }),
      walk: action({ category: "daily", loop: true, fallback: "idle_primary" }),
      paw_raise: action({ category: "interactive", loop: false, fallback: "idle_primary", returnTo: "idle_primary", interruptPolicy: "locked" })
    },
    stateMap: {
      idle: "idle_primary",
      walking: { left: "walk", right: "walk", neutral: "walk" },
      teaser: "paw_raise"
    }
  }, stateNames);
  assertEqual(valid.ok, true, "valid manifest contract passes");

  const missingState = validateManifestContract({
    defaultAction: "idle_primary",
    actions: { idle_primary: action({ category: "daily", loop: true, fallback: "idle_primary" }) },
    stateMap: { idle: "idle_primary" }
  }, stateNames);
  assertEqual(missingState.ok, false, "missing state fails");
  assertIncludes(missingState.failures.join("\\n"), "stateMap.walking is missing", "missing state is reported");

  const unknownState = validateManifestContract({
    defaultAction: "idle_primary",
    actions: { idle_primary: action({ category: "daily", loop: true, fallback: "idle_primary" }) },
    stateMap: {
      idle: "idle_primary",
      walking: "idle_primary",
      teaser: "idle_primary",
      unknown: "idle_primary"
    }
  }, stateNames);
  assertEqual(unknownState.ok, false, "unknown state fails");
  assertIncludes(unknownState.failures.join("\\n"), "stateMap.unknown is not a PetStateName", "unknown state is reported");

  const badInteractive = validateManifestContract({
    defaultAction: "idle_primary",
    actions: {
      idle_primary: action({ category: "daily", loop: true, fallback: "idle_primary" }),
      paw_raise: action({ category: "interactive", loop: false, fallback: "idle_primary", interruptPolicy: "locked" })
    },
    stateMap: {
      idle: "idle_primary",
      walking: "idle_primary",
      teaser: "paw_raise"
    }
  }, stateNames);
  assertEqual(badInteractive.ok, false, "non-loop interaction without returnTo fails");
  assertIncludes(badInteractive.failures.join("\\n"), "paw_raise: non-loop interactive actions must define returnTo", "missing returnTo is reported");

  function action(overrides) {
    return {
      source: "source.mp4",
      frameRoot: "../assets/runtime/animations/action/frames",
      filePattern: "frame_{index}.png",
      firstFrame: 1,
      frameCount: 72,
      fps: 24,
      loop: true,
      interruptible: true,
      enabled: true,
      category: "daily",
      entryFrames: [1],
      exitFrames: [72],
      interruptPolicy: "at-safe-frame",
      ...overrides
    };
  }

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
