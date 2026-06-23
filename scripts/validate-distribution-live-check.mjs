import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const docsPath = join(root, "docs", "distribution-live-check.md");
const blockersPath = join(root, "docs", "release-blockers.json");
const packagePath = join(root, "package.json");
const failures = [];

if (!existsSync(docsPath)) {
  failures.push("missing docs/distribution-live-check.md");
} else {
  const docs = readFileSync(docsPath, "utf8");
  for (const snippet of [
    "# 发布阻塞现场检查记录",
    "Windows Actions 查询",
    "npm run actions:windows-status",
    "GitHub API rate limit",
    "macOS 签名身份检查",
    "security find-identity -v -p codesigning",
    "0 valid identities found",
    "notarytool 可用性检查",
    "xcrun notarytool --help",
    "不替代 Windows 实机验收",
    "不执行签名、不调用 notarytool submit、不上传 Apple 公证"
  ]) {
    if (!docs.includes(snippet)) {
      failures.push(`docs/distribution-live-check.md missing required text: ${snippet}`);
    }
  }
  for (const forbidden of [
    "Access Key:",
    "Secret Key:",
    "KLING_ACCESS_KEY",
    "KLING_SECRET_KEY"
  ]) {
    if (docs.includes(forbidden)) {
      failures.push(`docs/distribution-live-check.md must not include secret text: ${forbidden}`);
    }
  }
}

if (!existsSync(blockersPath)) {
  failures.push("missing docs/release-blockers.json");
} else {
  const blockers = JSON.parse(readFileSync(blockersPath, "utf8"));
  for (const id of ["windows_real_machine_smoke", "macos_sign_notarize", "signed_user_safety_recheck"]) {
    const blocker = blockers.blockers?.find((item) => item.id === id);
    if (!blocker) {
      failures.push(`docs/release-blockers.json missing blocker: ${id}`);
    } else if (!blocker.evidence?.includes("docs/distribution-live-check.md")) {
      failures.push(`${id} evidence must include docs/distribution-live-check.md`);
    }
  }
}

if (!existsSync(packagePath)) {
  failures.push("missing package.json");
} else {
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  if (pkg.scripts?.["validate:distribution-live-check"] !== "node scripts/validate-distribution-live-check.mjs") {
    failures.push("package.json missing validate:distribution-live-check script");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
