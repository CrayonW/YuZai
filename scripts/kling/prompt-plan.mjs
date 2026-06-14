import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const validCategories = new Set(["daily", "interactive", "transition"]);

export function loadActionPlan(root, planPath = "docs/kling-action-generation-plan.json") {
  const absolutePlanPath = resolve(root, planPath);
  let plan;
  try {
    plan = JSON.parse(readFileSync(absolutePlanPath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read action plan ${absolutePlanPath}: ${errorMessage(error)}`);
  }

  validatePlan(root, plan);
  return normalizePlan(plan);
}

export function selectActions(plan, options) {
  if (options.all) return plan.actions;
  if (!options.action) {
    throw new Error("Pass --action <name> or --all");
  }

  const action = plan.actions.find((candidate) => candidate.action === options.action);
  if (!action) {
    throw new Error(`Action not found in plan: ${options.action}`);
  }
  return [action];
}

function normalizePlan(plan) {
  return {
    ...plan,
    actions: plan.actions.map((action) => ({
      ...action,
      fullPrompt: [
        plan.basePrompt,
        `猫咪特征：${plan.catProfile}`,
        action.prompt
      ].filter(Boolean).join("\n"),
      negativePrompt: action.negativePrompt || plan.defaultNegativePrompt
    }))
  };
}

function validatePlan(root, plan) {
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
    throw new Error("Action plan must be an object");
  }
  requireString(plan, "referenceImage");
  requireString(plan, "catProfile");
  requireString(plan, "outputRoot");
  requireString(plan, "basePrompt");
  requireString(plan, "defaultNegativePrompt");

  const referencePath = join(root, plan.referenceImage);
  if (!existsSync(referencePath)) {
    throw new Error(`Reference image does not exist: ${plan.referenceImage}`);
  }

  if (!Array.isArray(plan.actions) || plan.actions.length === 0) {
    throw new Error("Action plan must include at least one action");
  }

  const seen = new Set();
  for (const action of plan.actions) {
    requireString(action, "action");
    requireString(action, "category");
    requireString(action, "prompt");
    requireString(action, "output");
    if (typeof action.loop !== "boolean") {
      throw new Error(`${action.action}: loop must be a boolean`);
    }
    if (!validCategories.has(action.category)) {
      throw new Error(`${action.action}: category must be daily, interactive, or transition`);
    }
    if (seen.has(action.action)) {
      throw new Error(`Duplicate action in plan: ${action.action}`);
    }
    seen.add(action.action);
  }
}

function requireString(object, key) {
  if (typeof object[key] !== "string" || object[key].trim() === "") {
    const label = object.action ? `${object.action}.${key}` : key;
    throw new Error(`${label} must be a non-empty string`);
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
