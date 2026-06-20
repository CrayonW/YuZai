import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildMacosSigningStatus, renderMacosSigningStatus } from "./macos-signing-status.mjs";

const root = process.cwd();
const statusPath = join(root, "docs", "macos-signing-notarization-status.md");
const blockersPath = join(root, "docs", "release-blockers.json");
const failures = [];

if (!existsSync(statusPath)) {
  failures.push("missing docs/macos-signing-notarization-status.md; run npm run release:macos-signing-status -- --write docs/macos-signing-notarization-status.md");
} else {
  const expected = renderMacosSigningStatus(buildMacosSigningStatus({ runtimeRoot: root }));
  const actual = readFileSync(statusPath, "utf8");
  if (actual !== expected) {
    failures.push("docs/macos-signing-notarization-status.md is stale; run npm run release:macos-signing-status -- --write docs/macos-signing-notarization-status.md");
  }
  for (const snippet of [
    "# macOS 签名与公证状态报告",
    "签名 identity：null",
    "是否显式未签名：是",
    "是否配置正式签名身份：否",
    "macos_sign_notarize：open",
    "signed_user_safety_recheck：open",
    "不执行签名、不调用 notarytool、不上传 Apple 公证",
    "不关闭 `macos_sign_notarize` 或 `signed_user_safety_recheck`"
  ]) {
    if (!actual.includes(snippet)) {
      failures.push(`docs/macos-signing-notarization-status.md missing text: ${snippet}`);
    }
  }
}

if (!existsSync(blockersPath)) {
  failures.push("missing docs/release-blockers.json");
} else {
  const blockers = JSON.parse(readFileSync(blockersPath, "utf8"));
  for (const id of ["macos_sign_notarize", "signed_user_safety_recheck"]) {
    const blocker = blockers.blockers?.find((item) => item.id === id);
    if (!blocker) {
      failures.push(`docs/release-blockers.json missing ${id} blocker`);
    } else if (!blocker.evidence?.includes("docs/macos-signing-notarization-status.md")) {
      failures.push(`${id} evidence must include docs/macos-signing-notarization-status.md`);
    }
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
