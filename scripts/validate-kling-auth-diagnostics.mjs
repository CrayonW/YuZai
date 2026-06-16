import { buildKlingAuthDiagnostics } from "./kling/auth-diagnostics.mjs";
import { DEFAULT_KLING_API_BASE_URL, DEFAULT_KLING_MODEL_NAME } from "./kling/config.mjs";

const diagnostics = buildKlingAuthDiagnostics({
  accessKey: "a".repeat(32),
  secretKey: "b".repeat(32),
  baseUrl: DEFAULT_KLING_API_BASE_URL,
  probePath: "/v1/videos/image2video/nonexistent-auth-probe",
  status: 401,
  kind: "auth_failed",
  message: "Auth failed",
  serverDate: "Tue, 16 Jun 2026 05:46:39 GMT",
  nowMs: Date.parse("Tue, 16 Jun 2026 05:46:40 GMT")
});

const text = JSON.stringify(diagnostics);
const checks = [
  ["does not expose access key", text.includes("aaaaaaaa"), false],
  ["does not expose secret key", text.includes("bbbbbbbb"), false],
  ["reports access key length", diagnostics.accessKeyLength, 32],
  ["reports secret key length", diagnostics.secretKeyLength, 32],
  ["reports probe url", diagnostics.probeUrl, "https://api-beijing.klingai.com/v1/videos/image2video/nonexistent-auth-probe"],
  ["uses official image-to-video example model", DEFAULT_KLING_MODEL_NAME, "kling-v2-6"],
  ["reports token ttl", diagnostics.jwt.ttlSeconds, 1800],
  ["reports nbf grace", diagnostics.jwt.notBeforeOffsetSeconds, -5],
  ["reports server clock skew", diagnostics.serverClockSkewSeconds, -1],
  ["auth failure recommends key and permission check", diagnostics.recommendations.some((item) => item.includes("Secret Key") && item.includes("API 权限")), true]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
