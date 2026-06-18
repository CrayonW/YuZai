import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const evidencePath = join(process.cwd(), "docs", "mvp-evidence.json");
const requirementsPath = join(process.cwd(), "docs", "requirements-mvp.md");
const failures = [];

if (!existsSync(evidencePath)) {
  fail(["missing docs/mvp-evidence.json"]);
}

if (!existsSync(requirementsPath)) {
  fail(["missing docs/requirements-mvp.md"]);
}

const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
const requirements = readFileSync(requirementsPath, "utf8");

const requiredItems = [
  "desktop-visible-animated-cat",
  "always-on-top-transparent-window",
  "reminder-bubbles",
  "size-and-position-controls",
  "mouse-proximity-reaction",
  "pose-variation",
  "source-material-checklist"
];

if (evidence.version !== 1) {
  failures.push("version must be 1");
}

if (typeof evidence.updatedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(evidence.updatedAt)) {
  failures.push("updatedAt must use YYYY-MM-DD");
}

if (!Array.isArray(evidence.items)) {
  failures.push("items must be an array");
} else {
  const itemIds = new Set(evidence.items.map((item) => item.id));
  for (const requiredItem of requiredItems) {
    if (!itemIds.has(requiredItem)) {
      failures.push(`missing MVP evidence item ${requiredItem}`);
    }
  }

  for (const item of evidence.items) {
    const prefix = `item ${item.id ?? "<unknown>"}`;
    if (!requiredItems.includes(item.id)) {
      failures.push(`${prefix}: unknown id`);
    }
    if (item.status !== "verified") {
      failures.push(`${prefix}: status must be verified`);
    }
    if (!item.requirement || !requirements.includes(item.requirement)) {
      failures.push(`${prefix}: requirement must quote text from docs/requirements-mvp.md`);
    }
    if (!Array.isArray(item.evidenceCommands) || item.evidenceCommands.length === 0) {
      failures.push(`${prefix}: evidenceCommands are required`);
    }
    if (!Array.isArray(item.evidenceFiles) || item.evidenceFiles.length === 0) {
      failures.push(`${prefix}: evidenceFiles are required`);
    }
    for (const evidenceFile of item.evidenceFiles ?? []) {
      if (!existsSync(join(process.cwd(), evidenceFile))) {
        failures.push(`${prefix}: missing evidence file ${evidenceFile}`);
      }
    }
  }
}

if (failures.length > 0) {
  fail(failures);
}

console.log(JSON.stringify({ ok: true, itemCount: evidence.items.length }, null, 2));

function fail(failures) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
