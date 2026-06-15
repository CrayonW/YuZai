import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function validateOriginVideoMetadata(metadata, options) {
  const failures = [];

  if (!metadata.hasVideo) {
    failures.push(`${metadata.source}: does not contain a video stream`);
  }

  if (metadata.durationSeconds < options.requiredDurationSeconds) {
    failures.push(
      `${metadata.source}: duration ${formatSeconds(metadata.durationSeconds)}s is shorter than required ${formatSeconds(options.requiredDurationSeconds)}s`
    );
  }

  if (metadata.width < options.minWidth || metadata.height < options.minHeight) {
    failures.push(
      `${metadata.source}: dimensions ${metadata.width}x${metadata.height} are below required ${options.minWidth}x${options.minHeight}`
    );
  }

  return {
    ok: failures.length === 0,
    source: metadata.source,
    width: metadata.width,
    height: metadata.height,
    durationSeconds: metadata.durationSeconds,
    hasVideo: metadata.hasVideo,
    failures
  };
}

export function auditOriginVideos({ manifest, root, options }) {
  const sources = uniqueSourcesFromManifest(manifest);
  const videos = sources.map((source) => {
    const absolutePath = join(root, source);
    if (!existsSync(absolutePath)) {
      return {
        ok: false,
        source,
        width: 0,
        height: 0,
        durationSeconds: 0,
        hasVideo: false,
        failures: [`${source}: file is missing`]
      };
    }
    return validateOriginVideoMetadata(readVideoMetadata(source, absolutePath), options);
  });

  const failures = videos.flatMap((video) => video.failures);
  return {
    ok: failures.length === 0,
    requiredDurationSeconds: options.requiredDurationSeconds,
    minWidth: options.minWidth,
    minHeight: options.minHeight,
    videos,
    failures
  };
}

function uniqueSourcesFromManifest(manifest) {
  const sources = [];
  for (const config of Object.values(manifest.actions || {})) {
    if (!config?.source) continue;
    if (!sources.includes(config.source)) sources.push(config.source);
  }
  return sources.sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));
}

function readVideoMetadata(source, absolutePath) {
  const raw = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,duration",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      absolutePath
    ],
    { encoding: "utf8" }
  );
  const parsed = JSON.parse(raw);
  const stream = parsed.streams?.[0] || null;
  const durationSeconds = Number(stream?.duration || parsed.format?.duration || 0);
  return {
    source,
    width: Number(stream?.width || 0),
    height: Number(stream?.height || 0),
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    hasVideo: Boolean(stream)
  };
}

function formatSeconds(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, "");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const manifest = JSON.parse(readFileSync(join(root, "assets", "runtime", "animations", "manifest.json"), "utf8"));
  const options = {
    requiredDurationSeconds: 72 / 24,
    minWidth: 256,
    minHeight: 256
  };
  const result = auditOriginVideos({ manifest, root, options });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
