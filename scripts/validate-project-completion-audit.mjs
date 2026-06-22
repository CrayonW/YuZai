import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const auditPath = join(root, "docs/project-completion-audit.md");
const packagePath = join(root, "package.json");
const failures = [];

if (!existsSync(auditPath)) {
  failures.push("missing docs/project-completion-audit.md");
} else {
  const audit = readFileSync(auditPath, "utf8");
  const requiredSnippets = [
    "# 鱼仔桌宠项目完成度审计",
    "MVP 核心能力：当前证据显示已完成",
    "13 状态覆盖：当前 13 个状态均有 independent runtime 动作",
    "桌面可见动态：已有 12 张连续桌面截图证据",
    "运行时动作数：`38`",
    "当前剩余产品风险：动作自然度仍有明确缺口",
    "Windows 实机验收清单：`docs/windows-release-smoke.md`",
    "Windows 远端打包入口：`.github/workflows/windows-package.yml`",
    "正式签名",
    "macOS 公证",
    "Windows 安装包实机验收",
    "high 风险回切",
    "`sleep_to_sleeping`",
    "`waking_to_idle`",
    "`poke_annoyed_to_idle`",
    "`paw_raise_to_idle`",
    "动作时长不足",
    "runtime 时长不足动作数为 `24`",
    "assets/reviews/runtime/duration-extension-phase1/idle-primary-contact-sheet.png",
    "assets/reviews/runtime/duration-extension-phase1/idle-secondary-contact-sheet.png",
    "assets/reviews/runtime/duration-extension-phase1/tail-wag-contact-sheet.png",
    "assets/reviews/runtime/duration-extension-phase1/groom-face-wash-contact-sheet.png",
    "assets/reviews/runtime/duration-extension-phase1/loaf-breathing-contact-sheet.png",
    "assets/reviews/runtime/duration-extension-phase1/sleeping-contact-sheet.png",
    "不得执行真实可灵生成",
    "不得抽帧",
    "不得创建正式 approved 文件",
    "不得修改 `assets/runtime/animations/manifest.json`",
    "不调用可灵生成视频",
    "不新增或覆盖 `assets/runtime/animations/*/frames`",
    "不触碰 `assets/references/yuzai-personalized-concept-alpha.png`",
    "不触碰 `assets/references/yuzai-personalized-concept.png`",
    "不触碰 `docs/yuzai-personalized-pet-concept.md`"
  ];

  for (const snippet of requiredSnippets) {
    if (!audit.includes(snippet)) {
      failures.push(`docs/project-completion-audit.md missing required text: ${snippet}`);
    }
  }

  for (const forbidden of [
    "项目已完全完成",
    "正式分发已完成",
    "Windows 实机验收已完成",
    "动作自然度已无缺口"
  ]) {
    if (audit.includes(forbidden)) {
      failures.push(`docs/project-completion-audit.md must not claim: ${forbidden}`);
    }
  }
}

if (!existsSync(packagePath)) {
  failures.push("missing package.json");
} else {
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  if (pkg.scripts?.["validate:project-completion-audit"] !== "node scripts/validate-project-completion-audit.mjs") {
    failures.push("package.json missing validate:project-completion-audit script");
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
