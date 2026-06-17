import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "interaction-controller-validation");
const outfile = join(outdir, "interaction-controller.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "behavior", "interaction-controller.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const scheduled = [];
const moves = [];
let interactive = null;
globalThis.window = {
  addEventListener() {},
  setTimeout(callback, delay) {
    scheduled.push({ callback, delay });
    return scheduled.length;
  },
  yuzai: {
    setInteractive(value) {
      interactive = value;
    },
    moveTo(point) {
      moves.push(point);
    },
    getPosition() {
      return Promise.resolve([100, 120]);
    },
    showContextMenu() {}
  }
};

const { InteractionController } = await import(pathToFileURL(outfile).href);

const requests = [];
let returnedToIdle = false;
let notified = 0;
let dragAccepted = 0;
const fsm = {
  state: "idle",
  request(pose) {
    requests.push(pose);
    this.state = pose.state;
  },
  returnToIdle() {
    returnedToIdle = true;
    this.state = "idle";
  }
};
const canvas = {
  getBoundingClientRect() {
    return { left: 0, top: 0 };
  }
};
const runtimeInteractions = {
  mouseNearState: "teaser",
  clickState: "surprised",
  repeatedClickState: "shy",
  dragState: "dragging",
  wakeState: "waking",
  mouseNearCooldownMs: 0,
  clickCooldownMs: 0,
  repeatedClickCooldownMs: 0,
  dragCooldownMs: 0,
  wakeCooldownMs: 0
};

const controller = new InteractionController(
  canvas,
  fsm,
  () => {
    notified += 1;
  },
  runtimeInteractions,
  {
    onDragAccepted() {
      dragAccepted += 1;
    }
  }
);

await controller.simulateDragForTest({ x: 36, y: 42 }, 640);

const checks = [
  ["drag test does not toggle hit-test interactivity", interactive, null],
  ["drag test requests dragging state", requests[0]?.state, "dragging"],
  ["drag test uses surprised mood", requests[0]?.mood, "surprised"],
  ["drag action callback fires", dragAccepted, 1],
  ["drag test moves window by offset", JSON.stringify(moves[0]), JSON.stringify({ x: 136, y: 162 })],
  ["drag offset is visible during hold", JSON.stringify(controller.currentDragOffset), JSON.stringify({ x: 36, y: 42 })],
  ["drag release is scheduled with hold", scheduled[0]?.delay, 640],
  ["drag start notifies renderer", notified, 1]
];

scheduled[0].callback();
checks.push(["drag release returns to idle", returnedToIdle, true]);
checks.push(["drag offset resets after release", JSON.stringify(controller.currentDragOffset), JSON.stringify({ x: 0, y: 0 })]);
checks.push(["drag release notifies renderer", notified, 2]);

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
