export const DEFAULT_KLING_API_BASE_URL = "https://api-beijing.klingai.com";
export const DEFAULT_KLING_IMAGE_TO_VIDEO_SUBMIT_PATH = "/v1/videos/image2video";
export const DEFAULT_KLING_IMAGE_TO_VIDEO_QUERY_PATH = "/v1/videos/image2video/{task_id}";
export const DEFAULT_KLING_MODEL_NAME = "kling-v2-6";

export function envKlingApiBaseUrl(env = process.env) {
  return (env.KLING_API_BASE_URL || DEFAULT_KLING_API_BASE_URL).replace(/\/$/, "");
}

export function envKlingImageToVideoSubmitPath(env = process.env) {
  return env.KLING_IMAGE_TO_VIDEO_SUBMIT_PATH || DEFAULT_KLING_IMAGE_TO_VIDEO_SUBMIT_PATH;
}

export function envKlingImageToVideoQueryPath(env = process.env) {
  return env.KLING_IMAGE_TO_VIDEO_QUERY_PATH || DEFAULT_KLING_IMAGE_TO_VIDEO_QUERY_PATH;
}

export function envKlingModelName(env = process.env) {
  return env.KLING_MODEL_NAME || DEFAULT_KLING_MODEL_NAME;
}
