import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const manifestPath = "assets/runtime/animations/manifest.json";
const wavesPath = "docs/runtime-intake-waves.json";
const approvalPath = "docs/runtime-intake-approvals/c1-interaction-transitions.approved.json";
const dryRunPath = "docs/runtime-intake-c1-interaction-transitions-dry-run.md";
const logPath = "docs/animation-production-log.md";

const expectedPairs = [
  ["paw_raise", "idle_primary_to_paw_raise", "paw_raise_to_idle_primary"],
  ["cursor_watch", "idle_primary_to_cursor_watch", "cursor_watch_to_idle_primary"],
  ["click_surprised", "idle_primary_to_click_surprised", "click_surprised_to_idle_primary"],
  ["poke_annoyed", "idle_primary_to_poke_annoyed", "poke_annoyed_to_idle_primary"]
];
const expectedTransitions = expectedPairs.flatMap(([, transitionIn, transitionOut]) => [transitionIn, transitionOut]);
const failures = [];

for (const path of [manifestPath, wavesPath, approvalPath, dryRunPath, logPath]) {
  if (!existsSync(join(root, path))) failures.push(`missing ${path}`);
}

{
  const manifest = existsSync(join(root, manifestPath)) ? readJson(manifestPath) : null;
  const waves = existsSync(join(root, wavesPath)) ? readJson(wavesPath) : null;
  const approval = existsSync(join(root, approvalPath)) ? readJson(approvalPath) : null;
  const dryRun = existsSync(join(root, dryRunPath)) ? readFileSync(join(root, dryRunPath), "utf8") : "";
  const log = existsSync(join(root, logPath)) ? readFileSync(join(root, logPath), "utf8") : "";
  const wave = waves?.waves?.find((item) => item.id === "c1-interaction-transitions");

  if (waves && !wave) {
    failures.push("runtime-intake-waves missing c1-interaction-transitions wave");
  } else if (wave) {
    const waveActions = wave.actions.map((action) => action.action).sort();
    if (waveActions.join("\n") !== [...expectedTransitions].sort().join("\n")) {
      failures.push(`c1 wave actions mismatch: ${waveActions.join(", ")}`);
    }
  }

  if (approval && approval.waveId !== "c1-interaction-transitions") {
    failures.push("approval waveId must be c1-interaction-transitions");
  }
  if (approval) {
    const approvedActions = approval.approvedActions ?? approval.allowedActions ?? [];
    if ([...approvedActions].sort().join("\n") !== [...expectedTransitions].sort().join("\n")) {
      failures.push("approval approvedActions must match the 8 C1 transition actions");
    }
  }

  for (const action of expectedTransitions) {
    const runtimeAction = manifest?.actions?.[action];
    if (!runtimeAction) {
      failures.push(`${action}: missing runtime manifest action`);
      continue;
    }
    const frameRoot = `assets/runtime/animations/${action}/frames`;
    const frameFiles = existsSync(join(root, frameRoot))
      ? readdirSync(join(root, frameRoot)).filter((file) => /^frame_\d{6}\.png$/.test(file)).sort()
      : [];
    if (runtimeAction.category !== "transition") failures.push(`${action}: category must be transition`);
    if (runtimeAction.loop !== false) failures.push(`${action}: loop must be false`);
    if (runtimeAction.returnTo !== actionToReturnTarget(action)) {
      failures.push(`${action}: returnTo must be ${actionToReturnTarget(action)}`);
    }
    if (!runtimeAction.source?.endsWith(`${action}.mp4`)) failures.push(`${action}: source must point to generated C1 mp4`);
    if (!runtimeAction.frameRoot?.includes(`/assets/runtime/animations/${action}/frames`)) {
      failures.push(`${action}: frameRoot must point to ${frameRoot}`);
    }
    if (runtimeAction.frameCount !== frameFiles.length || frameFiles.length < 72) {
      failures.push(`${action}: frameCount must match at least 72 extracted frames, got manifest=${runtimeAction.frameCount}, files=${frameFiles.length}`);
    }
    const exitFrames = runtimeAction.exitFrames ?? [];
    const lastExitFrame = Math.max(...exitFrames);
    if (!Number.isInteger(lastExitFrame) || lastExitFrame < 1 || lastExitFrame > runtimeAction.frameCount) {
      failures.push(`${action}: exitFrames must contain a valid safe exit frame`);
    }
  }

  for (const [interactiveAction, transitionIn, transitionOut] of expectedPairs) {
    const config = manifest?.actions?.[interactiveAction];
    if (config?.transitionIn !== transitionIn) {
      failures.push(`${interactiveAction}.transitionIn must be ${transitionIn}`);
    }
    if (config?.transitionOut !== transitionOut) {
      failures.push(`${interactiveAction}.transitionOut must be ${transitionOut}`);
    }
  }

  for (const text of [
    "c1-interaction-transitions",
    "manifest 更新：8",
    "覆盖帧目录：8",
    "frameCommand=ffmpeg",
    "chromakey=0x00ff00:0.28:0.10",
    "watermarkGate=正式抽帧前逐视频播放检查无文字、水印、logo"
  ]) {
    if (!dryRun.includes(text)) failures.push(`dry-run missing ${text}`);
  }
  if (!log.includes("C1 互动动作专用过渡视频接入 runtime")) {
    failures.push("animation-production-log missing C1 runtime intake entry");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, transitionCount: expectedTransitions.length }, null, 2));

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

function actionToReturnTarget(action) {
  return action.startsWith("idle_primary_to_") ? action.slice("idle_primary_to_".length) : "idle_primary";
}
