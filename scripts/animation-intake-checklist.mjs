import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm", ".mkv"]);
const SOURCE_SUGGESTIONS = [
  {
    patterns: ["左右", "转头", "观察", "看"],
    action: "look_around",
    category: "daily"
  },
  {
    patterns: ["洗脸", "舔爪"],
    action: "groom_face_wash",
    category: "daily"
  },
  {
    patterns: ["嗅闻", "闻"],
    action: "desk_sniff",
    category: "daily"
  },
  {
    patterns: ["伸懒腰", "哈欠"],
    action: "stretch_yawn",
    category: "daily"
  }
];

export function buildAnimationIntakeChecklist({ manifest, originFiles }) {
  const actionBySource = new Map();
  for (const [action, config] of Object.entries(manifest.actions || {})) {
    if (!config?.source) continue;
    const source = normalize(config.source);
    const existing = actionBySource.get(source) || [];
    existing.push({ action, config });
    actionBySource.set(source, existing);
  }

  const items = originFiles
    .filter((file) => VIDEO_EXTENSIONS.has(fileExtension(file)))
    .sort((left, right) => left.localeCompare(right, "zh-Hans-CN"))
    .map((file) => {
      const source = normalize(`assets/origin/${file}`);
      const mapped = actionBySource.get(source) || [];
      const mappedConfigs = mapped.map((entry) => entry.config);
      const suggestion = mapped.length ? null : suggestActionForSource(file);
      return {
        source,
        action: mapped.length ? mapped.map((entry) => entry.action).join("、") : suggestion?.action ?? "待确认",
        category: uniqueJoined(mappedConfigs.map((config) => config.category)) || suggestion?.category || "待确认",
        status: mapped.length ? "已接入" : "待确认",
        overwritePath: uniqueJoined(mappedConfigs.map((config) => config.frameRoot).filter(Boolean).map(runtimePathToDisplay)) || "待确认",
        frameCount: uniqueJoined(mappedConfigs.map((config) => config.frameCount).filter((value) => value !== undefined)) || "待确认",
        manifestChange: mapped.length ? "否，除非本次要覆盖调度字段" : suggestion ? "是，确认后新增 manifest action" : "待确认"
      };
    });

  return {
    generatedAt: new Date().toISOString(),
    items,
    validations: [
      "npm run animations:audit-origin",
      "npm run animations:build-from-origin",
      "npm run validate:runtime-animations",
      "npm run validate:manifest-contract:current",
      "npm run validate:animation-director",
      "npm run validate:release"
    ],
    desktopAcceptance: [
      "YUZAI_CAPTURE_SEQUENCE_PATH=/private/tmp/yuzai-window-animation.png YUZAI_CAPTURE_SEQUENCE_COUNT=6 YUZAI_CAPTURE_SEQUENCE_INTERVAL_MS=160 YUZAI_CAPTURE_DELAY_MS=900 npm run dev",
      "npm run capture:inspect -- --sequence-path /private/tmp/yuzai-window-animation.png --count 6 --min-changed-frames 2 --min-width 200 --min-height 200"
    ]
  };
}

export function renderAnimationIntakeChecklist(checklist) {
  const lines = [
    "## 动作素材处理前确认清单",
    "",
    "执行原则：在删除、覆盖或重新生成动作素材之前，先把这份清单给用户确认；用户确认后再处理帧和 manifest。",
    "",
    "### 本次扫描到的源视频",
    ""
  ];

  for (const item of checklist.items) {
    lines.push(`- 源视频：${item.source}`);
    lines.push(`  - 目标 action：${item.action}`);
    lines.push(`  - 分类：${item.category}`);
    lines.push(`  - 当前状态：${item.status}`);
    lines.push(`  - 会覆盖路径：${item.overwritePath}`);
    lines.push(`  - 预期帧数：${item.frameCount}`);
    lines.push(`  - 是否修改 manifest：${item.manifestChange}`);
  }

  lines.push("", "### 必跑验证命令", "");
  for (const command of checklist.validations) {
    lines.push(`- \`${command}\``);
  }

  lines.push("", "### 桌面验收方式", "");
  for (const command of checklist.desktopAcceptance) {
    lines.push(`- \`${command}\``);
  }

  return `${lines.join("\n")}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const manifest = JSON.parse(readFileSync(join(root, "assets", "runtime", "animations", "manifest.json"), "utf8"));
  const originFiles = readdirSync(join(root, "assets", "origin"));
  process.stdout.write(renderAnimationIntakeChecklist(buildAnimationIntakeChecklist({ manifest, originFiles })));
}

function fileExtension(file) {
  const index = file.lastIndexOf(".");
  return index >= 0 ? file.slice(index).toLowerCase() : "";
}

function runtimePathToDisplay(frameRoot) {
  return normalize(frameRoot.replace(/^(\.\.\/)?assets\//, "assets/"));
}

function uniqueJoined(values) {
  return Array.from(new Set(values.map(String).filter(Boolean))).join("、");
}

function suggestActionForSource(file) {
  return SOURCE_SUGGESTIONS.find((suggestion) =>
    suggestion.patterns.some((pattern) => file.includes(pattern))
  ) || null;
}
