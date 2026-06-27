import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outdir = join(root, ".tmp", "reminder-bubble-controller-validation");
const outfile = join(outdir, "reminder-bubble-controller.mjs");

mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "core", "behavior", "reminder-bubble-controller.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  logLevel: "silent"
});

const { ReminderBubbleController } = await import(pathToFileURL(outfile).href);

const scheduled = [];
const cleared = [];
const shown = [];
let nextTimerId = 1;
const element = {
  textContent: "",
  classes: new Set(),
  classList: {
    add(name) {
      element.classes.add(name);
    },
    remove(name) {
      element.classes.delete(name);
    }
  }
};

const controller = new ReminderBubbleController(element, {
  messages: ["看你一眼", "喵一下"],
  firstDelayMs: 500,
  minIntervalMs: 45_000,
  maxIntervalMs: 90_000,
  visibleMs: 3_000,
  random: () => 0.5,
  onShow(event) {
    shown.push(event);
  },
  setTimeout(callback, delay) {
    const id = nextTimerId;
    nextTimerId += 1;
    scheduled.push({ id, callback, delay });
    return id;
  },
  clearTimeout(id) {
    cleared.push(id);
  }
});

controller.start();
const firstTimer = scheduled.shift();
firstTimer.callback();
const hideTimer = scheduled.shift();
const secondTimer = scheduled.shift();

const checks = [
  ["first reminder uses configured delay", firstTimer.delay, 500],
  ["first custom message is shown", element.textContent, "看你一眼"],
  ["first reminder event has water kind", shown[0]?.kind, "water"],
  ["first reminder event keeps custom message", shown[0]?.message, "看你一眼"],
  ["first reminder event has index", shown[0]?.index, 0],
  ["bubble becomes visible", element.classes.has("is-visible"), true],
  ["hide timer uses configured visible time", hideTimer.delay, 3000],
  ["next reminder uses randomized interval", secondTimer.delay, 67500]
];

secondTimer.callback();
checks.push(["second custom message is shown", element.textContent, "喵一下"]);
checks.push(["second reminder event has rest kind", shown[1]?.kind, "rest"]);
checks.push(["second reminder event has index", shown[1]?.index, 1]);

controller.stop();
checks.push(["stop clears timers", cleared.length >= 2, true]);
checks.push(["stop hides bubble", element.classes.has("is-visible"), false]);

const startupScheduled = [];
let startupTimerId = 100;
const startupElement = {
  textContent: "",
  classes: new Set(),
  classList: {
    add(name) {
      startupElement.classes.add(name);
    },
    remove(name) {
      startupElement.classes.delete(name);
    }
  }
};
const startupController = new ReminderBubbleController(startupElement, {
  random: () => 0,
  setTimeout(callback, delay) {
    const id = startupTimerId;
    startupTimerId += 1;
    startupScheduled.push({ id, callback, delay });
    return id;
  },
  clearTimeout() {}
});

startupController.start();
const startupFirstTimer = startupScheduled.shift();
checks.push(["startup has no immediate head text", startupElement.textContent, ""]);
checks.push(["startup bubble stays hidden before first timed reminder", startupElement.classes.has("is-visible"), false]);
checks.push(["default controller does not schedule removed drink/rest messages", startupFirstTimer, undefined]);

const failures = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([name, actual, expected]) => ({ name, actual, expected }));

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
