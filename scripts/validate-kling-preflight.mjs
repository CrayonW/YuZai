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
    auth: { ok: false, status: 401, kind: "auth_failed", message: "Auth failed" }
  });

  assertEqual(report.ok, false, "auth failure blocks preflight");
  assertEqual(report.referenceImage.exists, true, "detects reference image");
  assertEqual(report.credentials.accessKey.present, true, "detects access key");
  assertEqual(report.credentials.secretKey.length, 32, "records secret key length only");
  assertEqual(report.batch.actionCount, 2, "counts batch actions");
  assertEqual(report.outputs.readyCount, 1, "counts ready videos");
  assertEqual(report.outputs.missingCount, 1, "counts missing videos");
  assertIncludes(report.nextSteps[0], "npm run kling:auth-check", "auth failure directs to auth check");

  const markdown = renderKlingPreflightReport(report);
  assertIncludes(markdown, "可灵生成前置检查报告", "renders Chinese title");
  assertIncludes(markdown, "鉴权未通过", "renders auth failure");
  assertIncludes(markdown, "ready.mp4", "renders ready output");
  assertIncludes(markdown, "missing.mp4", "renders missing output");
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
