import { CatState, CatSize, CAT_PIXEL_SIZE } from './types';

/**
 * Video-based cat renderer using Canvas 2D.
 *
 * Plays yuzai.mp4 on loop and draws each frame to canvas with
 * state-specific transforms (bounce, flip, rotate, etc.).
 */
export class CatRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement | null = null;
  private videoReady = false;
  private catSize: CatSize = 'medium';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.initVideo();
  }

  private initVideo(): void {
    // Create a hidden video element for playing the mp4
    this.video = document.createElement('video');
    this.video.muted = true;      // required for autoplay
    this.video.loop = true;
    this.video.playsInline = true;
    this.video.preload = 'auto';
    this.video.style.display = 'none';

    this.video.addEventListener('loadeddata', () => {
      this.videoReady = true;
      this.video!.play().catch(() => {
        // Retry on first user interaction
        document.addEventListener('click', () => {
          this.video?.play().catch(() => {});
        }, { once: true });
      });
    });

    this.video.addEventListener('error', () => {
      console.warn('鱼仔视频未找到，请将 yuzai.mp4 放入 assets/images/ 目录');
      this.videoReady = false;
    });

    // Path relative to dist/renderer/ where the HTML is loaded
    this.video.src = '../../assets/images/yuzai.mp4';
    this.video.load();

    document.body.appendChild(this.video);
  }

  setSize(size: CatSize): void {
    this.catSize = size;
  }

  /** Main render entry — called every frame */
  render(state: CatState, t: number, _dt: number, facingRight = true): void {
    const ctx = this.ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Fallback: placeholder if video not ready
    if (!this.videoReady || !this.video) {
      this.drawPlaceholder(ctx, cx, cy, CAT_PIXEL_SIZE[this.catSize]);
      return;
    }

    const vw = this.video.videoWidth || 720;
    const vh = this.video.videoHeight || 1280;

    // Scale to fill window width (window is sized for the video aspect ratio)
    const scale = w / vw;

    ctx.save();
    ctx.translate(cx, cy);

    // Draw soft drop shadow under the cat
    this.drawShadow(ctx, scale * vw * 0.85, scale * vh * 0.08);

    // Apply facing direction flip
    ctx.scale(facingRight ? 1 : -1, 1);

    // Apply state-specific transforms
    switch (state) {
      case 'idle':       this.applyIdle(ctx, t, scale, vw, vh); break;
      case 'walking':    this.applyWalking(ctx, t, scale, vw, vh); break;
      case 'chasing':    this.applyChasing(ctx, t, scale, vw, vh); break;
      case 'sleeping':   this.applySleeping(ctx, t, scale, vw, vh); break;
      case 'meowing':    this.applyMeowing(ctx, t, scale, vw, vh); break;
      case 'eating':     this.applyEating(ctx, t, scale, vw, vh); break;
      case 'dragged':    this.applyDragged(ctx, t, scale, vw, vh); break;
      case 'rolling':    this.applyRolling(ctx, t, scale, vw, vh); break;
      case 'grooming':   this.applyGrooming(ctx, t, scale, vw, vh); break;
      default:           this.applyIdle(ctx, t, scale, vw, vh); break;
    }

    ctx.restore();
  }

  // ── State transforms ──

  private drawVideo(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
    ctx.drawImage(this.video!, -vw / 2, -vh / 2, vw, vh);
  }

  private applyIdle(ctx: CanvasRenderingContext2D, t: number, s: number, vw: number, vh: number): void {
    const breathe = 1 + Math.sin(t * 1.8) * 0.02;
    ctx.save();
    ctx.scale(s * breathe, s * breathe);
    this.drawVideo(ctx, vw, vh);
    ctx.restore();
  }

  private applyWalking(ctx: CanvasRenderingContext2D, t: number, s: number, vw: number, vh: number): void {
    const bounceY = Math.abs(Math.sin(t * 8)) * 6;
    ctx.save();
    ctx.translate(0, -bounceY);
    ctx.scale(s, s);
    this.drawVideo(ctx, vw, vh);
    ctx.restore();
  }

  private applyChasing(ctx: CanvasRenderingContext2D, t: number, s: number, vw: number, vh: number): void {
    const bounceY = Math.abs(Math.sin(t * 12)) * 4;
    ctx.save();
    ctx.translate(0, -bounceY);
    ctx.scale(s * 1.03, s * 0.97);
    this.drawVideo(ctx, vw, vh);
    ctx.restore();
  }

  private applySleeping(ctx: CanvasRenderingContext2D, t: number, s: number, vw: number, vh: number): void {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.rotate(Math.sin(t * 0.5) * 0.05);
    ctx.scale(s * 0.85, s * 0.85);
    this.drawVideo(ctx, vw, vh);
    ctx.restore();

    // Zzz text
    const zPhase = t * 2;
    ctx.fillStyle = 'rgba(200, 200, 255, 0.8)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('z', vw * s * 0.35, -vh * s * 0.1 + Math.sin(zPhase) * 5);
    ctx.fillText('Z', vw * s * 0.42, -vh * s * 0.2 + Math.sin(zPhase + 1) * 5);
    ctx.fillText('Z', vw * s * 0.49, -vh * s * 0.3 + Math.sin(zPhase + 2) * 5);
  }

  private applyMeowing(ctx: CanvasRenderingContext2D, t: number, s: number, vw: number, vh: number): void {
    const pulse = 1 + Math.abs(Math.sin(t * 12)) * 0.06;
    ctx.save();
    ctx.scale(s * pulse, s * pulse);
    this.drawVideo(ctx, vw, vh);
    ctx.restore();
  }

  private applyEating(ctx: CanvasRenderingContext2D, t: number, s: number, vw: number, vh: number): void {
    const nod = Math.sin(t * 10) * 3;
    ctx.save();
    ctx.translate(0, nod);
    ctx.scale(s, s);
    this.drawVideo(ctx, vw, vh);
    ctx.restore();
  }

  private applyDragged(ctx: CanvasRenderingContext2D, t: number, s: number, vw: number, vh: number): void {
    const wobble = Math.sin(t * 6) * 1.5;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.rotate(wobble * 0.02);
    ctx.scale(s * 1.05, s * 0.95);
    this.drawVideo(ctx, vw, vh);
    ctx.restore();
  }

  private applyRolling(ctx: CanvasRenderingContext2D, t: number, s: number, vw: number, vh: number): void {
    const rollAngle = Math.sin(t * 8) * 0.6;
    ctx.save();
    ctx.rotate(rollAngle);
    const squash = 1 + Math.abs(Math.sin(t * 8)) * 0.2;
    ctx.scale(s / squash, s * squash);
    this.drawVideo(ctx, vw, vh);
    ctx.restore();

    // Sparkle particles
    for (let i = 0; i < 4; i++) {
      const sx = Math.sin(t * 5 + i * 1.6) * vw * s * 0.25;
      const sy = -vh * s * 0.15 + Math.cos(t * 5 + i * 1.6) * vh * s * 0.2;
      const alpha = 0.3 + Math.sin(t * 8 + i) * 0.3;
      ctx.fillStyle = `rgba(255, 150, 200, ${Math.max(0, alpha)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + Math.sin(t * 10 + i) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private applyGrooming(ctx: CanvasRenderingContext2D, t: number, s: number, vw: number, vh: number): void {
    const tilt = Math.sin(t * 3) * 0.08;
    ctx.save();
    ctx.rotate(tilt);
    ctx.scale(s, s);
    this.drawVideo(ctx, vw, vh);
    ctx.restore();
  }

  /** Draw a soft elliptical shadow beneath the cat. */
  private drawShadow(ctx: CanvasRenderingContext2D, shadowW: number, offsetY: number): void {
    ctx.save();
    const gradient = ctx.createRadialGradient(0, offsetY, shadowW * 0.05, 0, offsetY, shadowW * 0.5);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, offsetY, shadowW * 0.5, shadowW * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Fallback ──

  private drawPlaceholder(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#F5A623';
    ctx.beginPath();
    ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${size / 3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐱', 0, 0);
    ctx.restore();
  }
}
