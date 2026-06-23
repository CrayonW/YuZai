import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");
const checklistPath = join(root, "docs", "runtime-duration-extension-phase1-checklist.md");
const failures = [];
const phase1Actions = [
  { action: "idle_primary", phase: "phase1-a", expectedLoop: true, expectedReturnTo: "idle_primary" },
  { action: "idle_secondary", phase: "phase1-a", expectedLoop: true, expectedReturnTo: "idle_primary" },
  { action: "tail_wag", phase: "phase1-a", expectedLoop: true, expectedReturnTo: "idle_primary" },
  { action: "groom_face_wash", phase: "phase1-b", expectedLoop: false, expectedReturnTo: "idle_primary" },
  { action: "loaf_breathing", phase: "phase1-b", expectedLoop: true, expectedReturnTo: "idle_primary" },
  { action: "sleeping", phase: "phase1-b", expectedLoop: true, expectedReturnTo: "waking" },
  { action: "slow_blink", phase: "phase1-c", expectedFrameCount: 144, expectedLoop: false, expectedCategory: "daily", expectedReturnTo: "idle_primary", expectedEntryFrames: [1, 48, 96], expectedExitFrames: [48, 96, 144] },
  { action: "look_around", phase: "phase1-c", expectedFrameCount: 144, expectedLoop: false, expectedCategory: "daily", expectedReturnTo: "idle_primary", expectedEntryFrames: [1, 48, 96], expectedExitFrames: [48, 96, 144] },
  { action: "desk_sniff", phase: "phase1-c", expectedFrameCount: 144, expectedLoop: false, expectedCategory: "daily", expectedReturnTo: "idle_primary", expectedEntryFrames: [1, 48, 96], expectedExitFrames: [48, 96, 144] },
  { action: "stretch_yawn", phase: "phase1-c", expectedFrameCount: 144, expectedLoop: false, expectedCategory: "daily", expectedReturnTo: "idle_primary", expectedEntryFrames: [1, 48, 96], expectedExitFrames: [48, 96, 144] },
  { action: "sleepy", phase: "phase1-c", expectedFrameCount: 144, expectedLoop: false, expectedCategory: "transition", expectedReturnTo: "sleep", expectedEntryFrames: [1, 48, 96], expectedExitFrames: [48, 96, 144] },
  { action: "sleep", phase: "phase1-c", expectedFrameCount: 144, expectedLoop: false, expectedCategory: "transition", expectedReturnTo: "sleeping", expectedEntryFrames: [1, 48, 96], expectedExitFrames: [48, 96, 144] },
  { action: "paw_raise", phase: "phase1-c", expectedFrameCount: 96, expectedLoop: false, expectedCategory: "interactive", expectedReturnTo: "idle_primary", expectedEntryFrames: [1, 48], expectedExitFrames: [48, 96] }
];
const expectedFrameCount = 192;
const expectedAnchors = [1, 48, 96, 144];
const expectedExitFrames = [48, 96, 144, 192];

let manifest;

try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  failures.push(`manifest: unable to parse ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`);
}

if (!existsSync(checklistPath)) {
  failures.push("missing docs/runtime-duration-extension-phase1-checklist.md");
} else {
  const checklist = readFileSync(checklistPath, "utf8");
  for (const { action } of phase1Actions) {
    if (!checklist.includes(action)) failures.push(`checklist missing ${action}`);
  }
  if (!checklist.includes("phase1-a")) failures.push("checklist must mention phase1-a");
  if (!checklist.includes("phase1-b")) failures.push("checklist must mention phase1-b");
  if (!checklist.includes("phase1-c")) failures.push("checklist must mention phase1-c");
}

if (manifest) {
  for (const actionPlan of phase1Actions) {
    const { action, expectedLoop, expectedReturnTo } = actionPlan;
    const actionFrameCount = actionPlan.expectedFrameCount ?? expectedFrameCount;
    const actionEntryFrames = actionPlan.expectedEntryFrames ?? expectedAnchors;
    const actionExitFrames = actionPlan.expectedExitFrames ?? expectedExitFrames;
    const actionCategory = actionPlan.expectedCategory ?? "daily";
    const config = manifest.actions?.[action];
    if (!config) {
      failures.push(`${action}: missing manifest action`);
      continue;
    }

    if (config.frameCount !== actionFrameCount) {
      failures.push(`${action}: expected frameCount ${actionFrameCount}, got ${config.frameCount}`);
    }
    if (config.loop !== expectedLoop) failures.push(`${action}: expected loop ${expectedLoop}`);
    if (config.category !== actionCategory) failures.push(`${action}: expected category ${actionCategory}, got ${config.category}`);
    if (config.returnTo !== expectedReturnTo) {
      failures.push(`${action}: expected returnTo ${expectedReturnTo}, got ${config.returnTo}`);
    }
    assertArrayEqual(config.entryFrames, actionEntryFrames, `${action}: entryFrames`);
    assertArrayEqual(config.exitFrames, actionExitFrames, `${action}: exitFrames`);

    const frameRoot = runtimePathToDisk(config.frameRoot);
    if (!existsSync(frameRoot)) {
      failures.push(`${action}: missing frame folder ${frameRoot}`);
      continue;
    }

    const files = readdirSync(frameRoot).filter((file) => file.endsWith(".png")).sort();
    if (files.length !== actionFrameCount) {
      failures.push(`${action}: expected ${actionFrameCount} PNG frames, found ${files.length}`);
    }

    for (const frame of requiredFramesFor(actionFrameCount)) {
      const number = String(frame).padStart(6, "0");
      const expected = config.filePattern.replace("{index}", number);
      if (!existsSync(join(frameRoot, expected))) failures.push(`${action}: missing ${expected}`);
    }
  }
}

function requiredFramesFor(frameCount) {
  if (frameCount === 96) return [1, 48, 72, 73, 96];
  if (frameCount === 144) return [1, 72, 120, 121, 144];
  return [1, 72, 73, 144, 145, 192];
}

console.log(JSON.stringify({ ok: failures.length === 0, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;

function runtimePathToDisk(frameRoot) {
  const normalized = normalize(frameRoot.replace(/^(\.\.\/)?assets\//, "assets/"));
  return join(root, normalized);
}

function assertArrayEqual(actual, expected, label) {
  if (!Array.isArray(actual)) {
    failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    return;
  }
  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
