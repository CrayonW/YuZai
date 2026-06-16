import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "action-bridge-contract-validation");
const outfile = join(outdir, "action-bridge-contract.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "scripts", "action-bridge-contract.mjs")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  external: ["node:fs", "node:path", "node:url"],
  logLevel: "silent"
});

const { buildActionBridgeContractReport } = await import(pathToFileURL(outfile).href);

const validReport = buildActionBridgeContractReport({
  bridges: {
    reminder: { water: ["call_response"], rest: ["stretch_yawn"] },
    proximity: { mouse_near: ["cursor_watch", "paw_raise"] },
    click: { single: ["click_surprised"], repeated: ["poke_annoyed"], wake: ["waking"] },
    drag: { start: ["dragging"] }
  },
  plan: { actions: [
    { action: "call_response" },
    { action: "stretch_yawn" },
    { action: "cursor_watch" },
    { action: "click_surprised" },
    { action: "poke_annoyed" },
    { action: "waking" },
    { action: "dragging" }
  ] },
  manifest: { actions: { paw_raise: { enabled: true, frameCount: 72 } } }
});

const invalidReport = buildActionBridgeContractReport({
  bridges: {
    reminder: { water: ["not_in_plan"], rest: [] },
    proximity: { mouse_near: [] },
    click: { single: [], repeated: [], wake: [] },
    drag: { start: [] }
  },
  plan: { actions: [] },
  manifest: { actions: {} }
});

const checks = [
  ["valid fixture is ok", validReport.ok, true],
  ["valid fixture lists unique candidates", validReport.candidateCount, 8],
  ["invalid fixture is not ok", invalidReport.ok, false],
  ["invalid fixture reports unknown action", invalidReport.failures[0]?.action, "not_in_plan"],
  ["current project report is ok", buildActionBridgeContractReport().ok, true]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
