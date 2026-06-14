import { drawPlaceholderYuzai } from "./placeholder-yuzai";
import { sequenceForState } from "./sprite-assets";
import type { StateSnapshot } from "../fsm/state-types";

export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly pixelRatio = Math.max(1, window.devicePixelRatio || 1);
  private currentAction: string | null = null;
  private actionStartedAt = 0;
  private lastDrawableFrame: HTMLImageElement | null = null;
  private size = 280;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas 2D context is unavailable.");
    this.ctx = ctx;
    this.resize(this.size);
  }

  resize(size: number): void {
    this.size = size;
    const width = this.size;
    const height = this.size;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = Math.floor(width * this.pixelRatio);
    this.canvas.height = Math.floor(height * this.pixelRatio);
    this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  render(snapshot: StateSnapshot, now: number, dragOffset: { x: number; y: number }): void {
    const width = this.size;
    const height = this.size;
    const sequence = sequenceForState(snapshot.pose.state, snapshot.pose.direction);
    if (sequence.action !== this.currentAction) {
      this.currentAction = sequence.action;
      this.actionStartedAt = now;
      this.lastDrawableFrame = null;
    }

    if (sequence.frames.length === 0) {
      this.ctx.clearRect(0, 0, width, height);
      this.lastDrawableFrame = null;
      drawPlaceholderYuzai(this.ctx, snapshot, {
        width,
        height,
        now,
        dragOffset
      });
      return;
    }

    const elapsedFrames = Math.max(0, (now - this.actionStartedAt) / 1000) * sequence.fps;
    const rawFrameIndex = Math.floor(elapsedFrames);
    const frameIndex = sequence.loop
      ? rawFrameIndex % sequence.frames.length
      : Math.min(rawFrameIndex, sequence.frames.length - 1);
    const nextFrameIndex = sequence.loop
      ? (frameIndex + 1) % sequence.frames.length
      : Math.min(frameIndex + 1, sequence.frames.length - 1);
    const blend = elapsedFrames - Math.floor(elapsedFrames);
    const frame = this.drawableFrame(sequence.frames[frameIndex]);
    const nextFrame = this.drawableFrame(sequence.frames[nextFrameIndex], false);

    this.ctx.clearRect(0, 0, width, height);

    if (frame) {
      this.ctx.save();
      this.ctx.translate(dragOffset.x * 0.12, dragOffset.y * 0.12);
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = "high";
      this.ctx.drawImage(frame, 0, 0, width, height);
      if (nextFrame && nextFrame !== frame && blend > 0.18 && blend < 0.82) {
        this.ctx.globalAlpha = Math.min(0.42, (1 - Math.abs(0.5 - blend) * 2) * 0.42);
        this.ctx.drawImage(nextFrame, 0, 0, width, height);
      }
      this.ctx.restore();
      return;
    }

    drawPlaceholderYuzai(this.ctx, snapshot, {
      width,
      height,
      now,
      dragOffset
    });
  }

  private drawableFrame(frame: HTMLImageElement, remember = true): HTMLImageElement | null {
    if (frame.complete && frame.naturalWidth > 0) {
      if (remember) this.lastDrawableFrame = frame;
      return frame;
    }
    return remember ? this.lastDrawableFrame : null;
  }
}
