import { build } from "esbuild";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tempRoot = mkdtempSync(join(tmpdir(), "yuzai-kling-preflight-"));
const bundlePath = join(tempRoot, "validate-kling-preflight.mjs");
const preflightPath = join(process.cwd(), "scripts", "kling-preflight.mjs");

const testSource = `
  import { mkdirSync, writeFileSync } from "node:fs";
  import { join } from "node:path";
  import { buildKlingPreflightReport, renderKlingPreflightReport } from ${JSON.stringify(preflightPath)};

  const root = ${JSON.stringify(tempRoot)};
  mkdirSync(join(root, "assets", "origin", "generated", "kling"), { recursive: true });
  mkdirSync(join(root, "assets", "origin"), { recursive: true });
  writeFileSync(join(root, "assets", "origin", "鱼仔参考图.png"), "fake-image");
  writeFileSync(join(root, "assets", "origin", "generated", "kling", "ready.mp4"), "video");

  const plan = {
    referenceImage: "assets/origin/鱼仔参考图.png",
    actions: [
      { action: "ready", category: "daily", output: "assets/origin/generated/kling/ready.mp4" },
      { action: "missing", category: "interactive", output: "assets/origin/generated/kling/missing.mp4" }
    ]
  };
  const batches = {
    batches: [
      { id: "first", name: "第一批", actions: [{ action: "ready" }, { action: "missing" }] }
    ]
  };

  const report = buildKlingPreflightReport({
    root,
    plan,
    batches,
    batch: "1",
    env: { KLING_ACCESS_KEY: "12345678901234567890123456789012", KLING_SECRET_KEY: "abcdefghijklmnopqrstuvwxyz123456" },
    auth: {
      ok: false,
      status: 401,
      kind: "auth_failed",
      message: "Auth failed",
      diagnostics: {
        probeUrl: "https://api.klingai.com/v1/videos/image2video/nonexistent-auth-probe",
        serverClockSkewSeconds: 0,
        jwt: {
          expiresAtIso: "2026-06-16T06:19:00.000Z"
        },
        recommendations: [
          "确认 Access Key 与 Secret Key 来自同一组可灵开放平台 API Key，Secret Key 复制完整，并确认该 Key 已开通开放平台 API 权限。"
        ]
      }
    }
  });

  assertEqual(report.ok, false, "auth failure blocks preflight");
  assertEqual(report.referenceImage.exists, true, "detects reference image");
  assertEqual(report.credentials.accessKey.present, true, "detects access key");
  assertEqual(report.credentials.secretKey.length, 32, "records secret key length only");
  assertEqual(report.batch.actionCount, 2, "counts batch actions");
  assertEqual(report.outputs.readyCount, 1, "counts ready videos");
  assertEqual(report.outputs.missingCount, 1, "counts missing videos");
  assertEqual(report.authDiagnostics.probeUrl, "https://api.klingai.com/v1/videos/image2video/nonexistent-auth-probe", "keeps auth diagnostics probe url");
  assertEqual(report.authDiagnostics.serverClockSkewSeconds, 0, "keeps auth diagnostics clock skew");
  assertIncludes(report.nextSteps[0], "npm run kling:auth-check", "auth failure directs to auth check");

  const markdown = renderKlingPreflightReport(report);
  assertIncludes(markdown, "可灵生成前置检查报告", "renders Chinese title");
  assertIncludes(markdown, "鉴权未通过", "renders auth failure");
  assertIncludes(markdown, "ready.mp4", "renders ready output");
  assertIncludes(markdown, "missing.mp4", "renders missing output");
  assertIncludes(markdown, "### 鉴权诊断", "renders auth diagnostics section");
  assertIncludes(markdown, "服务端时间差：0 秒", "renders clock skew");
  assertIncludes(markdown, "JWT 过期时间：2026-06-16T06:19:00.000Z", "renders jwt expiration");
  assertIncludes(markdown, "不输出真实密钥", "states secret safety");

  function assertEqual(actual, expected, label) {
    if (actual !== expected) {
      throw new Error(label + ": expected " + expected + ", got " + actual);
    }
  }

  function assertIncludes(text, expected, label) {
    if (!String(text).includes(expected)) {
      throw new Error(label + ": expected to include " + expected + ", got " + text);
    }
  }
`;

writeFileSync(join(tempRoot, "entry.mjs"), testSource);

await build({
  entryPoints: [join(tempRoot, "entry.mjs")],
  outfile: bundlePath,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  absWorkingDir: process.cwd(),
  logLevel: "silent"
});

await import(pathToFileURL(bundlePath).href);
console.log(JSON.stringify({ ok: true }, null, 2));
