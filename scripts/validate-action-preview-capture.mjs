import { existsSync, readFileSync } from "node:fs";

const files = {
  packageJson: JSON.parse(readFileSync("package.json", "utf8")),
  main: readFileSync("electron/main.ts", "utf8"),
  preload: readFileSync("electron/preload.ts", "utf8"),
  global: readFileSync("src/renderer/global.d.ts", "utf8"),
  renderer: readFileSync("src/renderer/main.ts", "utf8"),
  manifest: JSON.parse(readFileSync("assets/runtime/animations/manifest.json", "utf8")),
  mouseFollowChecklist: readFileSync("docs/mouse-follow-16-action-checklist.md", "utf8")
};

const expectedActions = Object.entries(files.manifest.actions)
  .filter(([, config]) => config.enabled === true && String(config.source || "").startsWith("assets/origin/generated/kling/"))
  .map(([action]) => action)
  .sort();

const failures = [];

if (expectedActions.length < 16) {
  failures.push(`expected at least 16 active generated Kling actions, found ${expectedActions.length}: ${expectedActions.join(", ")}`);
}

const mouseFollowActions = Array.from(files.mouseFollowChecklist.matchAll(/`(look_[a-z]+)`/g), (match) => match[1])
  .filter((action, index, actions) => actions.indexOf(action) === index)
  .sort();

if (mouseFollowActions.length !== 16) {
  failures.push(`mouse follow checklist must contain 16 look_* actions, found ${mouseFollowActions.length}`);
}

for (const action of mouseFollowActions) {
  if (!expectedActions.includes(action)) {
    failures.push(`${action}: missing from active generated preview actions`);
  }
}

if (!files.packageJson.scripts["validate:action-preview-capture"]) {
  failures.push("missing package script validate:action-preview-capture");
}

if (!readFileSync("scripts/validate-all.mjs", "utf8").includes("validate:action-preview-capture")) {
  failures.push("validate:all does not include validate:action-preview-capture");
}

if (!files.main.includes("YUZAI_PREVIEW_ACTION")) {
  failures.push("electron main does not read YUZAI_PREVIEW_ACTION");
}

if (!files.main.includes("test:preview-action")) {
  failures.push("electron main does not send test:preview-action");
}

if (!files.preload.includes("onTestPreviewAction")) {
  failures.push("preload does not expose onTestPreviewAction");
}

if (!files.global.includes("onTestPreviewAction")) {
  failures.push("renderer global type does not include onTestPreviewAction");
}

if (!files.renderer.includes("onTestPreviewAction")) {
  failures.push("renderer does not subscribe to onTestPreviewAction");
}

if (!files.renderer.includes("previewActionUntil")) {
  failures.push("renderer preview action is not held long enough for capture");
}

if (!files.renderer.includes("isRenderableRuntimeAnimationAction(action)")) {
  failures.push("renderer preview action is not guarded by isRenderableRuntimeAnimationAction");
}

for (const action of expectedActions) {
  const frameRoot = files.manifest.actions[action].frameRoot.replace(/^\.\.\//, "");
  if (!existsSync(frameRoot)) {
    failures.push(`${action}: missing frame root ${frameRoot}`);
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, actionCount: expectedActions.length, actions: expectedActions }, null, 2));
