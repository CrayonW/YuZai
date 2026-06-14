import { AutonomousBehavior } from "../core/behavior/autonomous-behavior";
import { clampWindowToBounds } from "../core/behavior/bounds-controller";
import { InteractionController } from "../core/behavior/interaction-controller";
import { ReminderBubbleController } from "../core/behavior/reminder-bubble-controller";
import { DEFAULT_CONFIG } from "../core/config/load-config";
import { PetStateMachine } from "../core/fsm/state-machine";
import { actionForPose, configForAction, runtimeAnimationManifest, type RuntimeAnimationAction } from "../core/render/animation-manifest";
import { AnimationDirector } from "../core/render/animation-director";
import { CanvasRenderer } from "../core/render/canvas-renderer";
import { preloadSpriteSequences, sequenceForAction } from "../core/render/sprite-assets";

const canvas = document.querySelector<HTMLCanvasElement>("#pet-canvas");
if (!canvas) throw new Error("Missing #pet-canvas");

const reminderBubble = document.querySelector<HTMLElement>("#reminder-bubble");
if (!reminderBubble) throw new Error("Missing #reminder-bubble");

const fsm = new PetStateMachine();
const renderer = new CanvasRenderer(canvas);
const animationDirector = new AnimationDirector({
  defaultAction: runtimeAnimationManifest.defaultAction,
  resolveSequence: sequenceForAction,
  resolveConfig: configForAction
});
const autonomous = new AutonomousBehavior(fsm);
const interaction = new InteractionController(canvas, fsm, () => autonomous.notifyStateChanged());
const reminders = new ReminderBubbleController(reminderBubble);

let lastFrameAt = performance.now();
let screenBounds: { x: number; y: number; width: number; height: number } | null = null;
let petSize = 280;
let lastRequestedAnimationAction: RuntimeAnimationAction | null = null;
let nextDailyVariationAt = performance.now() + 1500;
let activeDailyVariation: { action: RuntimeAnimationAction; endsAt: number } | null = null;
let dailyVariationIndex = 0;

const DAILY_VARIATIONS: RuntimeAnimationAction[] = ["tail_wag", "idle_secondary"];
const DAILY_VARIATION_DURATION_MS = 3000;
const DAILY_VARIATION_GAP_MS = 7000;

window.yuzai.getScreenBounds().then((bounds) => {
  screenBounds = bounds;
});

window.yuzai.onFrequencyChange((frequency) => autonomous.setFrequency(frequency));
window.yuzai.onSizeChange((size) => {
  applyPetSize(size);
});
window.yuzai.onMouseProximityChange((near) => {
  interaction.setGlobalProximity(near);
});

async function tick(now: number): Promise<void> {
  const deltaSeconds = Math.min(0.08, (now - lastFrameAt) / 1000);
  lastFrameAt = now;

  fsm.update(now);
  autonomous.update(now);
  await updateWindowMotion(deltaSeconds);
  const nextAnimationAction = resolveAnimationAction(now);
  if (nextAnimationAction !== lastRequestedAnimationAction) {
    animationDirector.request(nextAnimationAction, now);
    lastRequestedAnimationAction = nextAnimationAction;
  }
  const animationFrame = animationDirector.update(now);
  renderer.render(fsm.snapshot, now, interaction.currentDragOffset, animationFrame);

  requestAnimationFrame((time) => void tick(time));
}

function resolveAnimationAction(now: number): RuntimeAnimationAction {
  const baseAction = actionForPose(fsm.snapshot.pose.state, fsm.snapshot.pose.direction);
  if (baseAction !== runtimeAnimationManifest.defaultAction || fsm.snapshot.pose.state !== "idle") {
    activeDailyVariation = null;
    scheduleNextDailyVariation(now);
    return baseAction;
  }

  if (activeDailyVariation) {
    if (now < activeDailyVariation.endsAt) return activeDailyVariation.action;
    activeDailyVariation = null;
    scheduleNextDailyVariation(now);
    return runtimeAnimationManifest.defaultAction;
  }

  if (now >= nextDailyVariationAt) {
    activeDailyVariation = {
      action: DAILY_VARIATIONS[dailyVariationIndex % DAILY_VARIATIONS.length],
      endsAt: now + DAILY_VARIATION_DURATION_MS
    };
    dailyVariationIndex += 1;
    return activeDailyVariation.action;
  }

  return runtimeAnimationManifest.defaultAction;
}

function scheduleNextDailyVariation(now: number): void {
  nextDailyVariationAt = now + DAILY_VARIATION_GAP_MS;
}

async function updateWindowMotion(deltaSeconds: number): Promise<void> {
  if (fsm.state !== "walking" || !screenBounds) return;

  const [x, y] = await window.yuzai.getPosition();
  const direction = fsm.snapshot.pose.direction || 1;
  const next = {
    x: x + direction * DEFAULT_CONFIG.movement.speedPxPerSecond * deltaSeconds,
    y
  };

  const clamped = clampWindowToBounds(
    next,
    { width: petSize, height: petSize },
    screenBounds,
    DEFAULT_CONFIG.movement.edgePadding
  );
  window.yuzai.moveTo(clamped.position);

  if (clamped.bounced) {
    fsm.request({
      state: "walking",
      direction: direction > 0 ? -1 : 1,
      mood: "neutral",
      force: true
    });
  }
}

async function start(): Promise<void> {
  lastFrameAt = performance.now();
  applyPetSize(await window.yuzai.getSize());
  reminders.start();
  requestAnimationFrame((time) => void tick(time));
  preloadSpriteSequences().catch((error: unknown) => {
    console.error("Failed to preload sprite sequences", error);
  });
}

void start();

function applyPetSize(size: number): void {
  petSize = size;
  renderer.resize(size);
  interaction.setPetSize(size);
}
