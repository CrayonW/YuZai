import { spawnSync } from "node:child_process";

const steps = [
  ["validate:runtime-animations", ["npm", "run", "validate:runtime-animations"]],
  ["validate:runtime-alpha-quality", ["npm", "run", "validate:runtime-alpha-quality"]],
  ["validate:animation-smoothness", ["npm", "run", "validate:animation-smoothness"]],
  ["validate:animation-director", ["npm", "run", "validate:animation-director"]],
  ["validate:daily-animation-rotator", ["npm", "run", "validate:daily-animation-rotator"]],
  ["validate:autonomous-behavior-schedule", ["npm", "run", "validate:autonomous-behavior-schedule"]],
  ["validate:runtime-behavior-schedule", ["npm", "run", "validate:runtime-behavior-schedule"]],
  ["validate:runtime-interaction-schedule", ["npm", "run", "validate:runtime-interaction-schedule"]],
  ["validate:interaction-cooldowns", ["npm", "run", "validate:interaction-cooldowns"]],
  ["validate:interaction-controller", ["npm", "run", "validate:interaction-controller"]],
  ["validate:reminder-bubble-controller", ["npm", "run", "validate:reminder-bubble-controller"]],
  ["validate:reminder-action-bridge", ["npm", "run", "validate:reminder-action-bridge"]],
  ["validate:proximity-action-bridge", ["npm", "run", "validate:proximity-action-bridge"]],
  ["validate:click-action-bridge", ["npm", "run", "validate:click-action-bridge"]],
  ["validate:drag-action-bridge", ["npm", "run", "validate:drag-action-bridge"]],
  ["validate:drag-visual-feedback", ["npm", "run", "validate:drag-visual-feedback"]],
  ["validate:mouse-follow-direction", ["npm", "run", "validate:mouse-follow-direction"]],
  ["validate:canvas-transition-smoothing", ["npm", "run", "validate:canvas-transition-smoothing"]],
  ["validate:transition-anchors", ["npm", "run", "validate:transition-anchors"]],
  ["validate:action-transition-risk-report", ["npm", "run", "validate:action-transition-risk-report"]],
  ["validate:transition-out-checklist", ["npm", "run", "validate:transition-out-checklist"]],
  ["validate:transition-out-intake-proposal", ["npm", "run", "validate:transition-out-intake-proposal"]],
  ["validate:runtime-action-bridge-report", ["npm", "run", "validate:runtime-action-bridge-report"]],
  ["validate:action-bridge-contract", ["npm", "run", "validate:action-bridge-contract"]],
  ["validate:manifest-contract", ["npm", "run", "validate:manifest-contract"]],
  ["validate:manifest-contract:current", ["npm", "run", "validate:manifest-contract:current"]],
  ["validate:animation-asset-contract", ["npm", "run", "validate:animation-asset-contract"]],
  ["validate:runtime-duration-extension-plan-current", ["npm", "run", "validate:runtime-duration-extension-plan-current"]],
  ["validate:runtime-duration-phase1", ["npm", "run", "validate:runtime-duration-phase1"]],
  ["validate:animation-intake-checklist", ["npm", "run", "validate:animation-intake-checklist"]],
  ["validate:origin-video-audit", ["npm", "run", "validate:origin-video-audit"]],
  ["animations:audit-origin", ["npm", "run", "animations:audit-origin"]],
  ["validate:state-coverage-report", ["npm", "run", "validate:state-coverage-report"]],
  ["validate:state-coverage-current", ["npm", "run", "validate:state-coverage-current"]],
  ["validate:state-backlog", ["npm", "run", "validate:state-backlog"]],
  ["validate:state-backlog-current", ["npm", "run", "validate:state-backlog-current"]],
  ["validate:kling-plan-quality", ["npm", "run", "validate:kling-plan-quality"]],
  ["validate:kling-generation-batches", ["npm", "run", "validate:kling-generation-batches"]],
  ["validate:mouse-follow-16-plan", ["npm", "run", "validate:mouse-follow-16-plan"]],
  ["validate:kling-batch-plan", ["npm", "run", "validate:kling-batch-plan"]],
  ["validate:kling-batch-status", ["npm", "run", "validate:kling-batch-status"]],
  ["validate:kling-batch-intake-checklist", ["npm", "run", "validate:kling-batch-intake-checklist"]],
  ["validate:kling-generated-video-audit", ["npm", "run", "validate:kling-generated-video-audit"]],
  ["validate:runtime-intake-waves", ["npm", "run", "validate:runtime-intake-waves"]],
  ["validate:runtime-intake-checklist", ["npm", "run", "validate:runtime-intake-checklist"]],
  ["validate:runtime-intake-checklists-current", ["npm", "run", "validate:runtime-intake-checklists-current"]],
  ["validate:runtime-intake-preflight", ["npm", "run", "validate:runtime-intake-preflight"]],
  ["validate:runtime-intake-preflights-current", ["npm", "run", "validate:runtime-intake-preflights-current"]],
  ["validate:runtime-intake-dry-runs-current", ["npm", "run", "validate:runtime-intake-dry-runs-current"]],
  ["validate:runtime-intake-approvals-current", ["npm", "run", "validate:runtime-intake-approvals-current"]],
  ["validate:runtime-intake-approval-examples", ["npm", "run", "validate:runtime-intake-approval-examples"]],
  ["validate:runtime-intake-executor", ["npm", "run", "validate:runtime-intake-executor"]],
  ["validate:kling-preflight", ["npm", "run", "validate:kling-preflight"]],
  ["validate:kling-auth-diagnostics", ["npm", "run", "validate:kling-auth-diagnostics"]],
  ["validate:cat-behavior-schedule", ["npm", "run", "validate:cat-behavior-schedule"]],
  ["validate:capture-plan", ["npm", "run", "validate:capture-plan"]],
  ["validate:capture-sequence-inspector", ["npm", "run", "validate:capture-sequence-inspector"]],
  ["validate:action-preview-capture", ["npm", "run", "validate:action-preview-capture"]],
  ["validate:mvp-evidence", ["npm", "run", "validate:mvp-evidence"]],
  ["validate:runtime-naturalness-observation", ["npm", "run", "validate:runtime-naturalness-observation"]],
  ["validate:project-completion-audit", ["npm", "run", "validate:project-completion-audit"]],
  ["validate:release-blockers", ["npm", "run", "validate:release-blockers"]],
  ["validate:release-blockers-report-current", ["npm", "run", "validate:release-blockers-report-current"]],
  ["validate:release-readiness", ["npm", "run", "validate:release-readiness"]],
  ["validate:macos-signing-status-current", ["npm", "run", "validate:macos-signing-status-current"]],
  ["validate:windows-package-workflow", ["npm", "run", "validate:windows-package-workflow"]],
  ["validate:github-actions-status-tool", ["npm", "run", "validate:github-actions-status-tool"]],
  ["validate:github-actions-dispatch-tool", ["npm", "run", "validate:github-actions-dispatch-tool"]],
  ["validate:distribution-live-check", ["npm", "run", "validate:distribution-live-check"]],
  ["validate:project-status-current", ["npm", "run", "validate:project-status-current"]],
  ["typecheck", ["npm", "run", "typecheck"]],
  ["build", ["npm", "run", "build"]]
];

for (const [name, command] of steps) {
  console.log(`\n[validate:all] ${name}`);
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    stdio: "inherit"
  });

  if (result.status !== 0) {
    console.error(`\n[validate:all] failed at ${name}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\n[validate:all] ok");
