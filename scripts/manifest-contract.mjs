import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CATEGORIES = new Set(["daily", "interactive", "transition"]);
const INTERRUPT_POLICIES = new Set(["immediate", "at-safe-frame", "locked"]);

export function extractPetStateNames(source) {
  const match = source.match(/export\s+type\s+PetStateName\s*=([\s\S]*?);/);
  if (!match) return [];
  return Array.from(match[1].matchAll(/"([^"]+)"/g), (entry) => entry[1]);
}

export function validateManifestContract(manifest, stateNames) {
  const failures = [];
  const actions = manifest?.actions && typeof manifest.actions === "object" ? manifest.actions : {};
  const stateMap = manifest?.stateMap && typeof manifest.stateMap === "object" ? manifest.stateMap : {};
  const knownStates = new Set(stateNames);

  for (const state of stateNames) {
    if (!(state in stateMap)) failures.push(`stateMap.${state} is missing`);
  }

  for (const state of Object.keys(stateMap)) {
    if (!knownStates.has(state)) failures.push(`stateMap.${state} is not a PetStateName`);
  }

  for (const [action, config] of Object.entries(actions)) {
    if (!config || typeof config !== "object" || Array.isArray(config)) continue;

    if (!CATEGORIES.has(config.category)) {
      failures.push(`${action}: category is required and must be daily, interactive, or transition`);
    }

    if (!INTERRUPT_POLICIES.has(config.interruptPolicy)) {
      failures.push(`${action}: interruptPolicy is required and must be immediate, at-safe-frame, or locked`);
    }

    if (!Array.isArray(config.entryFrames) || config.entryFrames.length === 0) {
      failures.push(`${action}: entryFrames is required`);
    }

    if (!Array.isArray(config.exitFrames) || config.exitFrames.length === 0) {
      failures.push(`${action}: exitFrames is required`);
    }

    if (config.category === "interactive" && config.loop === false && !config.returnTo) {
      failures.push(`${action}: non-loop interactive actions must define returnTo`);
    }

    if (config.category === "transition" && config.loop === false && !config.returnTo) {
      failures.push(`${action}: non-loop transition actions must define returnTo`);
    }

    if (config.fallback && !actions[config.fallback]) {
      failures.push(`${action}: fallback ${config.fallback} does not exist`);
    }

    if (config.returnTo && !actions[config.returnTo]) {
      failures.push(`${action}: returnTo ${config.returnTo} does not exist`);
    }
  }

  return {
    ok: failures.length === 0,
    stateCount: stateNames.length,
    actionCount: Object.keys(actions).length,
    failures
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const manifest = JSON.parse(readFileSync(join(root, "assets", "runtime", "animations", "manifest.json"), "utf8"));
  const stateSource = readFileSync(join(root, "src", "core", "fsm", "state-types.ts"), "utf8");
  const result = validateManifestContract(manifest, extractPetStateNames(stateSource));
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
