import { drawPlaceholderYuzai } from "./placeholder-yuzai";
import type { AnimationFrameSelection } from "./animation-director";
import { DEFAULT_DRAG_VISUAL_FEEDBACK_CONFIG, type DragVisualFeedbackConfig } from "../config/load-config";
import type { StateSnapshot } from "../fsm/state-types";

export { DEFAULT_DRAG_VISUAL_FEEDBACK_CONFIG };

export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly pixelRatio = Math.max(1, window.devicePixelRatio || 1);
  private lastDrawableFrame: HTMLImageElement | null = null;
  private size = 280;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly dragVisualFeedbackConfig: DragVisualFeedbackConfig = DEFAULT_DRAG_VISUAL_FEEDBACK_CONFIG
  ) {
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
      const dragFeedback = dragVisualFeedbackForOffset(dragOffset, this.dragVisualFeedbackConfig);
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

export function dragVisualFeedbackForOffset(
  offset: { x: number; y: number },
  config: DragVisualFeedbackConfig = DEFAULT_DRAG_VISUAL_FEEDBACK_CONFIG
): DragVisualFeedback {
  const distance = Math.hypot(offset.x, offset.y);
  if (distance < config.neutralDistancePx) {
    return {
      translateX: 0,
      translateY: 0,
      liftY: 0,
      rotation: 0,
      scale: 1
    };
  }

  const strength = Math.min(1, distance / config.fullStrengthDistancePx);
  return {
    translateX: clamp(offset.x * config.horizontalFollowRatio, -config.maxTranslateX, config.maxTranslateX),
    translateY: clamp(offset.y * config.verticalFollowRatio, config.minTranslateY, config.maxTranslateY),
    liftY: -Math.round(config.minLiftPx + (config.maxLiftPx - config.minLiftPx) * strength),
    rotation: clamp(offset.x / config.rotationDistancePx, -config.maxRotationRadians, config.maxRotationRadians),
    scale: 1 + config.maxScaleBoost * strength
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
