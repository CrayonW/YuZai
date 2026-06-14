import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createKlingJwt } from "./jwt.mjs";
import { envNumber, requireEnv } from "./env.mjs";

export class KlingClient {
  constructor(root) {
    this.root = root;
    this.accessKey = requireEnv("KLING_ACCESS_KEY");
    this.secretKey = requireEnv("KLING_SECRET_KEY");
    this.baseUrl = (process.env.KLING_API_BASE_URL || "https://api.klingai.com").replace(/\/$/, "");
    this.submitPath = process.env.KLING_IMAGE_TO_VIDEO_SUBMIT_PATH || "/v1/videos/image2video";
    this.queryPath = process.env.KLING_IMAGE_TO_VIDEO_QUERY_PATH || "/v1/videos/image2video/{task_id}";
    this.modelName = process.env.KLING_MODEL_NAME || "kling-v1";
    this.mode = process.env.KLING_MODE || "std";
    this.duration = process.env.KLING_DURATION || "5";
    this.cfgScale = Number(process.env.KLING_CFG_SCALE || "0.5");
    this.pollIntervalMs = envNumber("KLING_POLL_INTERVAL_MS", 5000);
    this.pollTimeoutMs = envNumber("KLING_POLL_TIMEOUT_MS", 600000);
  }

  async generate(action, plan, options = {}) {
    const outputPath = join(this.root, action.output);
    if (existsSync(outputPath) && !options.force) {
      return { skipped: true, outputPath };
    }

    const task = await this.submitImageToVideo(action, plan);
    const result = await this.waitForTask(task.taskId);
    const videoUrl = extractVideoUrl(result.raw);
    if (!videoUrl) {
      throw new Error(`${action.action}: task succeeded but response did not include a video URL`);
    }

    await downloadFile(videoUrl, outputPath);
    const size = statSync(outputPath).size;
    if (size <= 0) {
      throw new Error(`${action.action}: downloaded file is empty`);
    }

    return {
      skipped: false,
      taskId: task.taskId,
      outputPath,
      size
    };
  }

  async submitImageToVideo(action, plan) {
    const referenceImagePath = join(this.root, plan.referenceImage);
    const image = readFileSync(referenceImagePath).toString("base64");
    const body = {
      model_name: this.modelName,
      image,
      prompt: action.fullPrompt,
      negative_prompt: action.negativePrompt,
      cfg_scale: this.cfgScale,
      mode: this.mode,
      duration: this.duration,
      aspect_ratio: plan.video?.aspectRatio || "4:5"
    };

    const response = await this.request("POST", this.submitPath, body);
    const taskId = extractTaskId(response);
    if (!taskId) {
      throw new Error(`${action.action}: submit response did not include a task id`);
    }
    return { taskId, raw: response };
  }

  async waitForTask(taskId) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < this.pollTimeoutMs) {
      const response = await this.request("GET", this.queryPath.replace("{task_id}", encodeURIComponent(taskId)));
      const status = extractTaskStatus(response);
      if (isSuccessStatus(status, response)) {
        return { taskId, raw: response };
      }
      if (isFailureStatus(status, response)) {
        throw new Error(`Kling task ${taskId} failed: ${status || "unknown status"}`);
      }
      await sleep(this.pollIntervalMs);
    }
    throw new Error(`Kling task ${taskId} timed out after ${this.pollTimeoutMs}ms`);
  }

  async request(method, path, body) {
    const url = `${this.baseUrl}${path}`;
    const token = createKlingJwt(this.accessKey, this.secretKey);
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    const text = await response.text();
    let parsed = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }
    }

    if (!response.ok) {
      throw new Error(`Kling API ${method} ${path} failed with HTTP ${response.status}: ${safeResponseSummary(parsed)}`);
    }
    if (parsed && typeof parsed.code !== "undefined" && Number(parsed.code) !== 0) {
      throw new Error(`Kling API ${method} ${path} returned code ${parsed.code}: ${safeResponseSummary(parsed)}`);
    }
    return parsed;
  }
}

function extractTaskId(response) {
  return response?.data?.task_id || response?.task_id || response?.data?.id || response?.id || null;
}

function extractTaskStatus(response) {
  return response?.data?.task_status || response?.task_status || response?.data?.status || response?.status || null;
}

function extractVideoUrl(response) {
  return (
    response?.data?.task_result?.videos?.[0]?.url ||
    response?.data?.videos?.[0]?.url ||
    response?.task_result?.videos?.[0]?.url ||
    response?.videos?.[0]?.url ||
    response?.data?.video_url ||
    response?.video_url ||
    null
  );
}

function isSuccessStatus(status, response) {
  return ["succeed", "succeeded", "success", "completed", "finish", "finished"].includes(String(status).toLowerCase()) ||
    !!extractVideoUrl(response);
}

function isFailureStatus(status, response) {
  const normalized = String(status || "").toLowerCase();
  return ["failed", "fail", "failure", "error", "canceled", "cancelled"].includes(normalized) ||
    Number(response?.code) > 0;
}

async function downloadFile(url, outputPath) {
  mkdirSync(dirname(outputPath), { recursive: true });
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Video download failed with HTTP ${response.status}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(outputPath));
}

function safeResponseSummary(response) {
  if (!response) return "empty response";
  const clone = JSON.parse(JSON.stringify(response));
  delete clone.Authorization;
  delete clone.authorization;
  return JSON.stringify(clone).slice(0, 800);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
