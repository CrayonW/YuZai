import { drawPlaceholderYuzai } from "./placeholder-yuzai";
import type { AnimationFrameSelection } from "./animation-director";
import type { StateSnapshot } from "../fsm/state-types";

export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly pixelRatio = Math.max(1, window.devicePixelRatio || 1);
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

  render(
    snapshot: StateSnapshot,
    now: number,
    dragOffset: { x: number; y: number },
    selection?: AnimationFrameSelection
  ): void {
    const width = this.size;
    const height = this.size;
    const sequence = selection?.sequence;

    if (!sequence || sequence.frames.length === 0) {
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

    const frame = this.drawableFrame(sequence.frames[selection.frameIndex]);
    const nextFrame = this.drawableFrame(sequence.frames[selection.nextFrameIndex], false);

    this.ctx.clearRect(0, 0, width, height);

    if (frame) {
      const dragFeedback = dragVisualFeedbackForOffset(dragOffset);
      this.ctx.save();
      this.ctx.translate(width / 2 + dragFeedback.translateX, height / 2 + dragFeedback.translateY + dragFeedback.liftY);
      this.ctx.rotate(dragFeedback.rotation);
      this.ctx.scale(dragFeedback.scale, dragFeedback.scale);
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = "high";
      this.ctx.drawImage(frame, -width / 2, -height / 2, width, height);
      if (nextFrame && nextFrame !== frame && selection.blend > 0.18 && selection.blend < 0.82) {
        this.ctx.globalAlpha = Math.min(0.24, (1 - Math.abs(0.5 - selection.blend) * 2) * 0.24);
        this.ctx.drawImage(nextFrame, -width / 2, -height / 2, width, height);
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

export interface DragVisualFeedback {
  translateX: number;
  translateY: number;
  liftY: number;
  rotation: number;
  scale: number;
}

export function dragVisualFeedbackForOffset(offset: { x: number; y: number }): DragVisualFeedback {
  const distance = Math.hypot(offset.x, offset.y);
  if (distance < 8) {
    return {
      translateX: 0,
      translateY: 0,
      liftY: 0,
      rotation: 0,
      scale: 1
    };
  }

  const strength = Math.min(1, distance / 96);
  return {
    translateX: clamp(offset.x * 0.2, -28, 28),
    translateY: clamp(offset.y * 0.08, -10, 16),
    liftY: -Math.round(14 + 10 * strength),
    rotation: clamp(offset.x / 520, -0.18, 0.18),
    scale: 1 + 0.055 * strength
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
