import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createKlingJwt } from "./jwt.mjs";
import { loadDotEnv, requireEnv } from "./env.mjs";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

loadDotEnv(root);

const accessKey = requireEnv("KLING_ACCESS_KEY");
const secretKey = requireEnv("KLING_SECRET_KEY");
const baseUrl = (process.env.KLING_API_BASE_URL || "https://api.klingai.com").replace(/\/$/, "");
const queryPath = process.env.KLING_IMAGE_TO_VIDEO_QUERY_PATH || "/v1/videos/image2video/{task_id}";
const probePath = queryPath.replace("{task_id}", "nonexistent-auth-probe");
const token = createKlingJwt(accessKey, secretKey);

try {
  const response = await fetch(`${baseUrl}${probePath}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const text = await response.text();
  const parsed = parseJson(text);
  const message = parsed?.message || parsed?.raw || "";

  if (response.status === 401) {
    console.log(JSON.stringify({
      ok: false,
      status: response.status,
      kind: "auth_failed",
      message,
      serverDate: response.headers.get("date")
    }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({
      ok: true,
      status: response.status,
      kind: "auth_accepted",
      message,
      serverDate: response.headers.get("date")
    }, null, 2));
  }
} catch (error) {
  console.log(JSON.stringify({
    ok: false,
    kind: "network_error",
    message: error instanceof Error ? error.message : String(error)
  }, null, 2));
  process.exitCode = 1;
}

function parseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
