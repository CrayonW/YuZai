import { AutonomousBehavior } from "../core/behavior/autonomous-behavior";
import { clampWindowToBounds } from "../core/behavior/bounds-controller";
import { InteractionController } from "../core/behavior/interaction-controller";
import { ReminderBubbleController } from "../core/behavior/reminder-bubble-controller";
import { DEFAULT_CONFIG } from "../core/config/load-config";
import { PetStateMachine } from "../core/fsm/state-machine";
import { actionForPose, configForAction, runtimeAnimationManifest } from "../core/render/animation-manifest";
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
let lastRequestedAnimationAction: string | null = null;

window.yuzai.getScreenBounds().then((bounds) => {
  screenBounds = bounds;
});

window.yuzai.onFrequencyChange((frequency) => autonomous.setFrequency(frequency));
window.yuzai.onSizeChange((size) => {
  applyPetSize(size);
});

async function tick(now: number): Promise<void> {
  const deltaSeconds = Math.min(0.08, (now - lastFrameAt) / 1000);
  lastFrameAt = now;

  fsm.update(now);
  autonomous.update(now);
  await updateWindowMotion(deltaSeconds);
  const nextAnimationAction = actionForPose(fsm.snapshot.pose.state, fsm.snapshot.pose.direction);
  if (nextAnimationAction !== lastRequestedAnimationAction) {
    animationDirector.request(nextAnimationAction, now);
    lastRequestedAnimationAction = nextAnimationAction;
  }
  const animationFrame = animationDirector.update(now);
  renderer.render(fsm.snapshot, now, interaction.currentDragOffset, animationFrame);

  requestAnimationFrame((time) => void tick(time));
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
