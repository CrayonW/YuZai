import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const planPath = join(process.cwd(), "docs", "runtime-intake-waves.json");

if (!existsSync(planPath)) {
  fail(["missing docs/runtime-intake-waves.json"]);
}

const plan = JSON.parse(readFileSync(planPath, "utf8"));

const allowedCategories = new Set(["daily", "interactive", "transition", "sleep-routine"]);
const allowedStatuses = new Set(["recommended", "deferred", "rejected"]);
const allowedConfirmation = new Set(["needs-user-confirmation", "confirmed"]);
const allowedInterruptPolicies = new Set(["at-safe-frame", "locked", "never"]);
const failures = [];

if (plan.version !== 1) {
  failures.push("version must be 1");
}

if (!Array.isArray(plan.waves) || plan.waves.length < 2) {
  failures.push("waves must contain at least two runtime intake waves");
}

const actionNames = new Set();
const requiredWaveIds = ["wave1", "wave2", "sleep-routine", "dragging-special"];
for (const waveId of requiredWaveIds) {
  if (!plan.waves?.some((wave) => wave.id === waveId)) {
    failures.push(`missing required wave ${waveId}`);
  }
}

for (const wave of plan.waves ?? []) {
  if (!wave.id || typeof wave.id !== "string") {
    failures.push("wave id is required");
  }
  if (!wave.name || typeof wave.name !== "string") {
    failures.push(`wave ${wave.id ?? "<unknown>"} name is required`);
  }
  if (!Array.isArray(wave.actions) || wave.actions.length === 0) {
    failures.push(`wave ${wave.id ?? "<unknown>"} must contain actions`);
    continue;
  }

  for (const action of wave.actions) {
    const prefix = `wave ${wave.id} action ${action.action ?? "<unknown>"}`;
    if (!action.action || typeof action.action !== "string") {
      failures.push(`${prefix}: action is required`);
      continue;
    }
    if (actionNames.has(action.action)) {
      failures.push(`${prefix}: duplicate action`);
    }
    actionNames.add(action.action);

    if (!allowedCategories.has(action.category)) {
      failures.push(`${prefix}: invalid category ${action.category}`);
    }
    if (!allowedStatuses.has(action.status)) {
      failures.push(`${prefix}: invalid status ${action.status}`);
    }
    if (!allowedConfirmation.has(action.confirmation)) {
      failures.push(`${prefix}: invalid confirmation ${action.confirmation}`);
    }
    if (!allowedInterruptPolicies.has(action.interruptPolicy)) {
      failures.push(`${prefix}: invalid interruptPolicy ${action.interruptPolicy}`);
    }
    if (!action.sourceVideo?.startsWith("assets/origin/generated/kling/")) {
      failures.push(`${prefix}: sourceVideo must point to assets/origin/generated/kling`);
    } else if (!existsSync(join(process.cwd(), action.sourceVideo))) {
      failures.push(`${prefix}: sourceVideo does not exist: ${action.sourceVideo}`);
    }
    if (!Array.isArray(action.reviewEvidence) || action.reviewEvidence.length === 0) {
      failures.push(`${prefix}: reviewEvidence is required`);
    } else {
      for (const evidence of action.reviewEvidence) {
        if (!existsSync(join(process.cwd(), evidence))) {
          failures.push(`${prefix}: missing review evidence ${evidence}`);
        }
      }
    }
    if (!action.runtimeFrameRoot?.startsWith("assets/runtime/animations/")) {
      failures.push(`${prefix}: runtimeFrameRoot must point to assets/runtime/animations`);
    }
    if (!action.returnTo || typeof action.returnTo !== "string") {
      failures.push(`${prefix}: returnTo is required`);
    }
    if (!action.bridge || typeof action.bridge !== "string") {
      failures.push(`${prefix}: bridge is required`);
    }
    if (!action.transitionPlan || typeof action.transitionPlan !== "string") {
      failures.push(`${prefix}: transitionPlan is required`);
    }
    if (!action.watermarkGate || typeof action.watermarkGate !== "string") {
      failures.push(`${prefix}: watermarkGate is required`);
    }
    if (action.status === "recommended" && action.confirmation !== "needs-user-confirmation") {
      failures.push(`${prefix}: recommended actions must stay behind user confirmation until intake starts`);
    }
  }
}

if (failures.length > 0) {
  fail(failures);
}

console.log(JSON.stringify({ ok: true, waveCount: plan.waves.length, actionCount: actionNames.size }, null, 2));

function fail(failures) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
