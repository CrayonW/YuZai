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
    updatedAt: "2026-06-20",
    purpose: "记录 macOS 签名、公证和签名后安全复核的当前事实。本文档不执行签名、不上传公证、不关闭 release blocker。",
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
      macosSignNotarize: "open",
      signedUserSafetyRecheck: "open"
    },
    requiredActions: [
      "配置正式 Developer ID Application 签名身份",
      "移除本地验证包的 identity=null 或按正式发布配置签名",
      "完成 macOS notarization",
      "验证 Gatekeeper 首次打开体验",
      "在签名/公证包上复核普通用户安装安全提示",
      "重新运行 npm run validate:release"
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
    "- 本报告不关闭 `macos_sign_notarize` 或 `signed_user_safety_recheck`。",
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
