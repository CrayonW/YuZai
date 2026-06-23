import { AutonomousBehavior } from "../core/behavior/autonomous-behavior";
import { clampWindowToBounds } from "../core/behavior/bounds-controller";
import { resolveClickAnimationAction } from "../core/behavior/click-action-bridge";
import { resolveDragAnimationAction } from "../core/behavior/drag-action-bridge";
import { InteractionController } from "../core/behavior/interaction-controller";
import { resolveProximityAnimationAction } from "../core/behavior/proximity-action-bridge";
import { resolveReminderAnimationAction } from "../core/behavior/reminder-action-bridge";
import { ReminderBubbleController } from "../core/behavior/reminder-bubble-controller";
import { DEFAULT_CONFIG } from "../core/config/load-config";
import { PetStateMachine } from "../core/fsm/state-machine";
import {
  actionForPose,
  configForAction,
  isRenderableRuntimeAnimationAction,
  runtimeAnimationManifest,
  type RuntimeAnimationAction
} from "../core/render/animation-manifest";
import { AnimationDirector } from "../core/render/animation-director";
import { CanvasRenderer } from "../core/render/canvas-renderer";
import { DailyAnimationRotator } from "../core/render/daily-animation-rotator";
import { buildRuntimeDailyRotatorOptions } from "../core/render/runtime-behavior-schedule";
import { preloadSpriteSequences, sequenceForAction } from "../core/render/sprite-assets";
import { entryFrameForTransition } from "../core/render/transition-anchors";

const canvas = document.querySelector<HTMLCanvasElement>("#pet-canvas");
if (!canvas) throw new Error("Missing #pet-canvas");

const reminderBubble = document.querySelector<HTMLElement>("#reminder-bubble");
if (!reminderBubble) throw new Error("Missing #reminder-bubble");

const fsm = new PetStateMachine();
const renderer = new CanvasRenderer(canvas, DEFAULT_CONFIG.interaction.dragVisualFeedback);
const animationDirector = new AnimationDirector({
  defaultAction: runtimeAnimationManifest.defaultAction,
  resolveSequence: sequenceForAction,
  resolveConfig: configForAction,
  resolveEntryFrame: entryFrameForTransition
});
const autonomous = new AutonomousBehavior(fsm);
const interaction = new InteractionController(canvas, fsm, () => autonomous.notifyStateChanged(), undefined, {
  onMouseNearAccepted() {
    const action = resolveProximityAnimationAction({ near: true }, isRenderableRuntimeAnimationAction);
    if (action && isRenderableRuntimeAnimationAction(action)) {
      animationDirector.request(action, performance.now());
    }
  },
  onClickAccepted(kind) {
    const action = resolveClickAnimationAction({ kind }, isRenderableRuntimeAnimationAction);
    if (action && isRenderableRuntimeAnimationAction(action)) {
      animationDirector.request(action, performance.now());
    }
  },
  onDragAccepted() {
    const action = resolveDragAnimationAction({ phase: "start" }, isRenderableRuntimeAnimationAction);
    if (action && isRenderableRuntimeAnimationAction(action)) {
      animationDirector.request(action, performance.now());
    }
  }
});
const reminders = new ReminderBubbleController(reminderBubble, {
  onShow(event) {
    const action = resolveReminderAnimationAction(event, isRenderableRuntimeAnimationAction);
    if (action && isRenderableRuntimeAnimationAction(action)) {
      animationDirector.request(action, performance.now());
    }
  }
});

let lastFrameAt = performance.now();
let screenBounds: { x: number; y: number; width: number; height: number } | null = null;
let petSize = 280;
let lastRequestedAnimationAction: RuntimeAnimationAction | null = null;
let previewAction: RuntimeAnimationAction | null = null;
let previewActionUntil = 0;
let mouseFollowAction: RuntimeAnimationAction | null = null;
const dailyRotator = new DailyAnimationRotator(buildRuntimeDailyRotatorOptions());

window.yuzai.getScreenBounds().then((bounds) => {
  screenBounds = bounds;
});

window.yuzai.onFrequencyChange((frequency) => autonomous.setFrequency(frequency));
window.yuzai.onSizeChange((size) => {
  applyPetSize(size);
});
window.yuzai.onMouseProximityChange((near) => {
  interaction.setGlobalProximity(near);
  if (!near) mouseFollowAction = null;
});
window.yuzai.onMouseFollowDirectionChange((payload) => {
  if (!payload.near || !payload.action || !isRenderableRuntimeAnimationAction(payload.action)) {
    mouseFollowAction = null;
    return;
  }
  mouseFollowAction = payload.action;
});
window.yuzai.onTestDrag((payload) => {
  void interaction.simulateDragForTest({ x: payload.x, y: payload.y }, payload.holdMs);
});
window.yuzai.onTestPreviewAction((action) => {
  if (isRenderableRuntimeAnimationAction(action)) {
    const now = performance.now();
    previewAction = action;
    previewActionUntil = now + 2400;
    animationDirector.request(action, now);
    lastRequestedAnimationAction = action;
  } else {
    console.warn(`[preview] ignored unavailable action: ${action}`);
  }
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
  if (previewAction && now < previewActionUntil) return previewAction;
  previewAction = null;
  if (mouseFollowAction && (fsm.snapshot.pose.state === "idle" || fsm.snapshot.pose.state === "teaser")) {
    return mouseFollowAction;
  }
  const baseAction = actionForPose(fsm.snapshot.pose.state, fsm.snapshot.pose.direction);
  return dailyRotator.resolve(baseAction, fsm.snapshot.pose.state === "idle", now);
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
  void preloadSpriteSequences().catch((error: unknown) => {
    console.error("Failed to preload sprite sequences", error);
  });
}

void start();

function applyPetSize(size: number): void {
  petSize = size;
  renderer.resize(size);
  interaction.setPetSize(size);
}
