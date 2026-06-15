import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "autonomous-behavior-schedule-validation");
const outfile = join(outdir, "autonomous-behavior.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "behavior", "autonomous-behavior.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { AutonomousBehavior } = await import(pathToFileURL(outfile).href);

const fakeFsm = {
  state: "idle",
  requests: [],
  request(request) {
    this.requests.push(request);
    this.state = request.state;
    return true;
  },
  lockFor() {},
  returnToIdle() {
    this.state = "idle";
  }
};

const startedAt = performance.now();
const autonomous = new AutonomousBehavior(fakeFsm);

autonomous.update(startedAt + 44000);
const beforeGapRequests = fakeFsm.requests.length;

autonomous.update(startedAt + 45100);
const afterGapRequests = fakeFsm.requests.length;

const checks = [
  ["does not trigger autonomous action before behavior schedule gap", beforeGapRequests, 0],
  ["triggers an autonomous action after behavior schedule gap", afterGapRequests, 1]
];

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
