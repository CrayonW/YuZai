import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildRuntimeNaturalnessObservation } from "./runtime-naturalness-observation.mjs";

const root = process.cwd();
const reportPath = join(root, "docs/runtime-naturalness-observation.md");
const failures = [];

if (!existsSync(reportPath)) {
  failures.push("missing docs/runtime-naturalness-observation.md; run npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md");
} else {
  const actual = readFileSync(reportPath, "utf8");
  const expected = buildRuntimeNaturalnessObservation(root);
  if (actual !== expected) {
    failures.push("docs/runtime-naturalness-observation.md is not current; run npm run observe:naturalness -- --write docs/runtime-naturalness-observation.md");
  }

  for (const required of [
    "不调用可灵生成视频",
    "不修改 `assets/runtime/animations/manifest.json`",
    "high 风险回切",
    "assets/reviews/runtime/naturalness-observation"
  ]) {
    if (!actual.includes(required)) {
      failures.push(`report missing boundary or priority text: ${required}`);
    }
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
