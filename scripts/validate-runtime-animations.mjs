import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, "assets", "runtime", "animations", "manifest.json");
const failures = [];
const warnings = [];

let manifest;

try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  failures.push(`manifest: unable to read or parse ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`);
}

if (manifest) {
  if (manifest.version !== 1) failures.push("manifest.version must be 1");
  if (!manifest.defaultAction) failures.push("manifest.defaultAction is required");
  const actionsAreObject = isPlainObject(manifest.actions);
  const stateMapAreObject = isPlainObject(manifest.stateMap);
  const frameSizeIsValid = Number.isInteger(manifest.frameSize) && manifest.frameSize > 0;

  if (!frameSizeIsValid) failures.push("manifest.frameSize must be a positive integer");
  if (!actionsAreObject) failures.push("manifest.actions must be an object");
  if (!stateMapAreObject) failures.push("manifest.stateMap must be an object");
  if (actionsAreObject && !manifest.actions[manifest.defaultAction]) {
    failures.push("manifest.defaultAction must exist in actions");
  }

  if (actionsAreObject) {
    for (const [action, config] of Object.entries(manifest.actions)) {
      if (!config || typeof config !== "object" || Array.isArray(config)) {
        failures.push(`${action}: config must be an object`);
        continue;
      }

      if (!config.source) failures.push(`${action}: source is required`);
      else if (!existsSync(join(root, config.source))) failures.push(`${action}: missing source ${config.source}`);

      if (typeof config.frameRoot !== "string" || !config.frameRoot) failures.push(`${action}: frameRoot is required`);
      if (typeof config.filePattern !== "string" || !config.filePattern.includes("{index}")) failures.push(`${action}: filePattern must include {index}`);
      if (!Number.isInteger(config.firstFrame) || config.firstFrame < 1) failures.push(`${action}: firstFrame must be a positive integer`);
      if (!Number.isInteger(config.frameCount) || config.frameCount < 0) failures.push(`${action}: frameCount must be a non-negative integer`);
      if (typeof config.fps !== "number" || config.fps <= 0) failures.push(`${action}: fps must be positive`);
      if (!manifest.actions[config.fallback]) failures.push(`${action}: fallback ${config.fallback} does not exist`);
      validateSchedulingFields(action, config);

      if (!config.enabled) continue;

      if (config.frameCount <= 0) {
        failures.push(`${action}: enabled actions must have frameCount > 0`);
        continue;
      }

      validateFrames(action, config, frameSizeIsValid);
    }
  }

  if (stateMapAreObject) {
    for (const [state, mapped] of Object.entries(manifest.stateMap)) {
      if (typeof mapped === "string") {
        if (actionsAreObject && !manifest.actions[mapped]) failures.push(`stateMap.${state}: action ${mapped} does not exist`);
        continue;
      }

      if (!mapped || typeof mapped !== "object" || Array.isArray(mapped)) {
        failures.push(`stateMap.${state}: mapping must be an action name or directional map`);
        continue;
      }

      for (const direction of ["left", "right", "neutral"]) {
        if (typeof mapped[direction] !== "string") {
          failures.push(`stateMap.${state}.${direction}: action is required`);
          continue;
        }
        if (actionsAreObject && !manifest.actions[mapped[direction]]) {
          failures.push(`stateMap.${state}.${direction}: action ${mapped[direction]} does not exist`);
        }
      }
    }
  }
}

finish();

function finish() {
  console.log(JSON.stringify({ ok: failures.length === 0, failures, warnings }, null, 2));
  if (failures.length > 0) process.exitCode = 1;
}

function validateFrames(action, config, frameSizeIsValid) {
  const frameRoot = runtimePathToDisk(config.frameRoot);
  if (!existsSync(frameRoot)) {
    failures.push(`${action}: missing frame folder ${frameRoot}`);
    return;
  }

  const files = readdirSync(frameRoot).filter((file) => file.endsWith(".png")).sort();
  if (files.length !== config.frameCount) {
    failures.push(`${action}: expected ${config.frameCount} PNG frames, found ${files.length}`);
  }

  for (let index = 0; index < config.frameCount; index += 1) {
    const number = String(config.firstFrame + index).padStart(6, "0");
    const expected = config.filePattern.replace("{index}", number);
    const filePath = join(frameRoot, expected);

    if (!existsSync(filePath)) {
      failures.push(`${action}: missing ${expected}`);
      continue;
    }

    const metrics = imageMetrics(filePath);
    if (frameSizeIsValid && (metrics.width !== manifest.frameSize || metrics.height !== manifest.frameSize)) {
      failures.push(`${action}/${expected}: expected ${manifest.frameSize}x${manifest.frameSize}, got ${metrics.width}x${metrics.height}`);
    }
    if (!metrics.channels.includes("a")) failures.push(`${action}/${expected}: missing alpha channel`);
    if (metrics.maxAlpha <= 0) failures.push(`${action}/${expected}: no visible pixels`);
  }
}

function validateSchedulingFields(action, config) {
  if (config.category !== undefined && !["daily", "interactive", "transition"].includes(config.category)) {
    failures.push(`${action}: category must be daily, interactive, or transition`);
  }

  if (config.interruptPolicy !== undefined && !["immediate", "at-safe-frame", "locked"].includes(config.interruptPolicy)) {
    failures.push(`${action}: interruptPolicy must be immediate, at-safe-frame, or locked`);
  }

  validateFrameList(action, config, "entryFrames");
  validateFrameList(action, config, "exitFrames");

  for (const field of ["returnTo", "transitionIn", "transitionOut"]) {
    if (config[field] === undefined || config[field] === null) continue;
    if (!manifest.actions[config[field]]) failures.push(`${action}: ${field} ${config[field]} does not exist`);
  }
}

function validateFrameList(action, config, field) {
  if (config[field] === undefined) return;
  if (!Array.isArray(config[field]) || config[field].length === 0) {
    failures.push(`${action}: ${field} must be a non-empty array when present`);
    return;
  }

  for (const frame of config[field]) {
    if (!Number.isInteger(frame) || frame < config.firstFrame || frame >= config.firstFrame + config.frameCount) {
      failures.push(`${action}: ${field} frame ${frame} is out of range`);
    }
  }
}

function runtimePathToDisk(frameRoot) {
  const normalized = normalize(frameRoot.replace(/^(\.\.\/)?assets\//, "assets/"));
  return join(root, normalized);
}

function imageMetrics(filePath) {
  try {
    const identify = execFileSync("magick", ["identify", "-format", "%w %h %[channels]", filePath], { encoding: "utf8" }).trim();
    const [width, height, channels] = identify.split(/\s+/);
    const alphaStats = execFileSync("magick", [filePath, "-alpha", "extract", "-format", "%[fx:maxima]", "info:"], { encoding: "utf8" }).trim();
    return { width: Number(width), height: Number(height), channels, maxAlpha: Number(alphaStats) };
  } catch (error) {
    failures.push(`${filePath}: unable to inspect image metrics via magick: ${error instanceof Error ? error.message : String(error)}`);
    return { width: NaN, height: NaN, channels: "", maxAlpha: NaN };
  }
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
