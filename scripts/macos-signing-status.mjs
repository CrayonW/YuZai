import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

export function buildMacosSigningStatus({ runtimeRoot = root } = {}) {
  const packageJson = JSON.parse(readFileSync(join(runtimeRoot, "package.json"), "utf8"));
  const productName = packageJson.build?.productName ?? packageJson.productName ?? packageJson.name;
  const appPath = join("release", "mac-arm64", `${productName}.app`);
  const macConfig = packageJson.build?.mac ?? {};
  const identity = Object.prototype.hasOwnProperty.call(macConfig, "identity") ? macConfig.identity : undefined;
  const notarizeConfigPresent = !!packageJson.build?.afterSign || !!packageJson.build?.notarize;

  return {
    updatedAt: "2026-06-27",
    purpose: "记录 macOS 签名、公证和签名后安全复核的当前事实。用户已确认项目只在本人电脑本机运行，因此正式签名、公证和签名后安全复核不再作为项目完成阻塞。",
    package: {
      productName,
      appPath,
      validationCommand: "npm run validate:release"
    },
    signing: {
      identityConfigured: typeof identity === "string" && identity.length > 0,
      identityValue: identity === null ? "null" : (identity ?? "未配置"),
      explicitlyUnsigned: identity === null,
      notarizeConfigPresent
    },
    blockers: {
      macosSignNotarize: "canceled",
      signedUserSafetyRecheck: "canceled"
    },
    requiredActions: [
      "本机自用继续使用 npm run validate:release 生成本地验证包",
      "若未来改为对外分发，再重新启用 Developer ID 签名、公证和普通用户安全提示复核"
    ]
  };
}

export function renderMacosSigningStatus(status) {
  const lines = [
    "# macOS 签名与公证状态报告",
    "",
    `更新日期：${status.updatedAt}`,
    "",
    status.purpose,
    "",
    "## 当前包",
    "",
    `- 产品名：${status.package.productName}`,
    `- app 路径：${status.package.appPath}`,
    `- 本地验证命令：${status.package.validationCommand}`,
    "",
    "## 签名与公证配置",
    "",
    `- 签名 identity：${status.signing.identityValue}`,
    `- 是否显式未签名：${status.signing.explicitlyUnsigned ? "是" : "否"}`,
    `- 是否配置正式签名身份：${status.signing.identityConfigured ? "是" : "否"}`,
    `- 是否发现公证配置：${status.signing.notarizeConfigPresent ? "是" : "否"}`,
    "",
    "## blocker 状态",
    "",
    `- macos_sign_notarize：${status.blockers.macosSignNotarize}`,
    `- signed_user_safety_recheck：${status.blockers.signedUserSafetyRecheck}`,
    "",
    "## 关闭前必须完成",
    ""
  ];

  for (const action of status.requiredActions) {
    lines.push(`- ${action}`);
  }

  lines.push(
    "",
    "## 当前边界",
    "",
    "- 本报告只读取本地配置和预期 release app 路径。",
    "- 本报告不执行签名、不调用 notarytool、不上传 Apple 公证。",
    "- `macos_sign_notarize` 和 `signed_user_safety_recheck` 已按用户本机自用口径取消。",
    "- 当前若 `identity=null`，表示本地验证包显式跳过签名。"
  );

  return `${lines.join("\n")}\n`;
}

export function writeMacosSigningStatus(status, outputPath) {
  const text = renderMacosSigningStatus(status);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, text);
  return text;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const status = buildMacosSigningStatus({ runtimeRoot: root });
  const writePath = argValue(args, "--write");
  const text = writePath
    ? writeMacosSigningStatus(status, join(root, writePath))
    : renderMacosSigningStatus(status);
  process.stdout.write(text);
}

function argValue(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  const value = args[index + 1];
  if (!value) throw new Error(`Missing value after ${name}`);
  return value;
}
