import { easeInOut } from "../animation/transition";
import type { StateSnapshot } from "../fsm/state-types";

export interface DrawOptions {
  width: number;
  height: number;
  now: number;
  dragOffset: { x: number; y: number };
}

export function drawPlaceholderYuzai(
  ctx: CanvasRenderingContext2D,
  snapshot: StateSnapshot,
  options: DrawOptions
): void {
  const { width, height, now, dragOffset } = options;
  const { pose, transition } = snapshot;
  const t = now / 1000;
  const bob = Math.sin(t * 4) * (pose.state === "sleeping" ? 1 : 4);
  const walk = pose.state === "walking" ? Math.sin(t * 12) : 0;
  const transitionLift = transition
    ? (1 - easeInOut(Math.min(1, (now - transition.startedAt) / transition.durationMs))) * 6
    : 0;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2 + dragOffset.x * 0.12, height / 2 + 18 + bob - transitionLift);

  if (pose.view === "left") ctx.scale(-1, 1);
  if (pose.view === "front") ctx.scale(1, 1);

  const sleepySquash = pose.state === "sleeping" ? 0.78 : pose.state === "sleepy" ? 0.9 : 1;
  ctx.scale(1, sleepySquash);

  drawShadow(ctx, pose.state);
  drawTail(ctx, t, pose.state);
  drawBody(ctx, pose.state);
  drawFins(ctx, walk);
  drawFace(ctx, pose.mood, pose.state, t);
  drawEffects(ctx, pose.state, t);

  ctx.restore();
}

export function hitTestYuzai(x: number, y: number, width = 280, height = 280): boolean {
  const scaleX = width / 280;
  const scaleY = height / 280;
  const cx = 140 * scaleX;
  const cy = 150 * scaleY;
  const rx = 116 * scaleX;
  const ry = 124 * scaleY;
  const normalized = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
  return normalized <= 1.08;
}

function drawShadow(ctx: CanvasRenderingContext2D, state: string): void {
  ctx.save();
  ctx.globalAlpha = state === "dragging" ? 0.16 : 0.24;
  ctx.fillStyle = "#2b2f36";
  ctx.beginPath();
  ctx.ellipse(0, 72, 78, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBody(ctx: CanvasRenderingContext2D, state: string): void {
  const bodyHeight = state === "sleeping" ? 58 : 82;
  const gradient = ctx.createLinearGradient(-70, -56, 70, 46);
  gradient.addColorStop(0, "#ffdf7d");
  gradient.addColorStop(0.5, "#ffb65c");
  gradient.addColorStop(1, "#f47f5b");

  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#593c35";
  ctx.lineWidth = 4;
  roundedBlob(ctx, -76, -58, 152, bodyHeight, 44);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.34)";
  roundedBlob(ctx, -42, -28, 74, 36, 20);
  ctx.fill();
}

function drawTail(ctx: CanvasRenderingContext2D, t: number, state: string): void {
  const wag = state === "walking" ? Math.sin(t * 10) * 9 : Math.sin(t * 3) * 4;
  ctx.save();
  ctx.translate(-72, -14);
  ctx.rotate((-18 + wag) * (Math.PI / 180));
  ctx.fillStyle = "#f06f64";
  ctx.strokeStyle = "#593c35";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-44, -34, -54, 12);
  ctx.quadraticCurveTo(-30, 6, 0, 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFins(ctx: CanvasRenderingContext2D, walk: number): void {
  ctx.strokeStyle = "#593c35";
  ctx.lineWidth = 4;
  ctx.fillStyle = "#ffc56d";

  ctx.save();
  ctx.translate(-32, 32);
  ctx.rotate(walk * 0.18);
  roundedBlob(ctx, -18, 0, 32, 26, 16);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(34, 32);
  ctx.rotate(-walk * 0.18);
  roundedBlob(ctx, -14, 0, 32, 26, 16);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFace(ctx: CanvasRenderingContext2D, mood: string, state: string, t: number): void {
  const blink = Math.sin(t * 1.7) > 0.94;
  const sleeping = state === "sleeping";
  const eyeY = -20;

  ctx.strokeStyle = "#3d2b2b";
  ctx.fillStyle = "#3d2b2b";
  ctx.lineWidth = 4;

  if (sleeping || mood === "sleepy") {
    sleepyEye(ctx, -26, eyeY);
    sleepyEye(ctx, 28, eyeY);
  } else if (mood === "surprised") {
    roundEye(ctx, -26, eyeY, 9);
    roundEye(ctx, 28, eyeY, 9);
  } else if (blink) {
    sleepyEye(ctx, -26, eyeY);
    sleepyEye(ctx, 28, eyeY);
  } else {
    roundEye(ctx, -26, eyeY, 6);
    roundEye(ctx, 28, eyeY, 6);
  }

  ctx.beginPath();
  if (mood === "shy") {
    ctx.arc(0, 4, 12, 0.08 * Math.PI, 0.92 * Math.PI);
  } else if (mood === "surprised") {
    ctx.ellipse(0, 6, 8, 10, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(0, 2, 12, 0.15 * Math.PI, 0.85 * Math.PI);
  }
  ctx.stroke();

  if (mood === "shy") {
    ctx.fillStyle = "rgba(255, 101, 125, 0.42)";
    ctx.beginPath();
    ctx.ellipse(-48, -2, 13, 7, -0.2, 0, Math.PI * 2);
    ctx.ellipse(48, -2, 13, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEffects(ctx: CanvasRenderingContext2D, state: string, t: number): void {
  if (state === "sleeping") {
    ctx.fillStyle = "#5d6b82";
    ctx.font = "700 22px system-ui";
    ctx.fillText("Z", 48, -66 - Math.sin(t * 2) * 5);
    ctx.font = "700 16px system-ui";
    ctx.fillText("Z", 70, -86 - Math.sin(t * 2 + 0.8) * 5);
  }

  if (state === "waving") {
    ctx.strokeStyle = "#f6b04f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(76, -44, 14, -0.8, 0.7);
    ctx.arc(88, -36, 18, -0.8, 0.6);
    ctx.stroke();
  }
}

function roundEye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function sleepyEye(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath();
  ctx.arc(x, y, 10, 0.08 * Math.PI, 0.92 * Math.PI);
  ctx.stroke();
}

function roundedBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
