import { spawnSync } from "node:child_process";

const steps = [
  ["validate:runtime-animations", ["npm", "run", "validate:runtime-animations"]],
  ["validate:animation-smoothness", ["npm", "run", "validate:animation-smoothness"]],
  ["validate:animation-director", ["npm", "run", "validate:animation-director"]],
  ["validate:daily-animation-rotator", ["npm", "run", "validate:daily-animation-rotator"]],
  ["validate:runtime-behavior-schedule", ["npm", "run", "validate:runtime-behavior-schedule"]],
  ["validate:runtime-interaction-schedule", ["npm", "run", "validate:runtime-interaction-schedule"]],
  ["validate:manifest-contract", ["npm", "run", "validate:manifest-contract"]],
  ["validate:manifest-contract:current", ["npm", "run", "validate:manifest-contract:current"]],
  ["validate:animation-intake-checklist", ["npm", "run", "validate:animation-intake-checklist"]],
  ["validate:origin-video-audit", ["npm", "run", "validate:origin-video-audit"]],
  ["animations:audit-origin", ["npm", "run", "animations:audit-origin"]],
  ["validate:state-coverage-report", ["npm", "run", "validate:state-coverage-report"]],
  ["validate:state-backlog", ["npm", "run", "validate:state-backlog"]],
  ["validate:kling-plan-quality", ["npm", "run", "validate:kling-plan-quality"]],
  ["validate:cat-behavior-schedule", ["npm", "run", "validate:cat-behavior-schedule"]],
  ["validate:capture-plan", ["npm", "run", "validate:capture-plan"]],
  ["validate:capture-sequence-inspector", ["npm", "run", "validate:capture-sequence-inspector"]],
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
