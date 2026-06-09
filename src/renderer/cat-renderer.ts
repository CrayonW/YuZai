import { CatState, CatSize, CAT_PIXEL_SIZE } from './types';

/**
 * Photo-based cat renderer using Canvas 2D.
 *
 * Draws 鱼仔's real photo (yuzai.png) with state-specific transforms:
 * - idle: gentle breathing (subtle scale pulse)
 * - walking/chasing: vertical bounce + facing flip
 * - sleeping: slight rotation + dim + Zzz text
 * - meowing: mouth-open scale pulse
 * - eating: small head nod
 * - dragged: wobble + slight opacity reduction
 * - rolling: full rotation animation
 * - grooming: side-to-side tilt
 * - purring: subtle vibration
 */
export class CatRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private imageLoaded = false;
  private catSize: CatSize = 'medium';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.loadImage();
  }

  private loadImage(): void {
    this.image = new Image();
    this.image.onload = () => {
      this.imageLoaded = true;
    };
    this.image.onerror = () => {
      console.warn('鱼仔照片未找到，请将 yuzai.png 放入 assets/images/ 目录');
      this.imageLoaded = false;
    };
    // Path relative to dist/renderer/ where the HTML is loaded
    this.image.src = '../../assets/images/yuzai.png';
  }

  setSize(size: CatSize): void {
    this.catSize = size;
  }

  /** Main render entry — called every frame */
  render(state: CatState, t: number, _dt: number, facingRight = true): void {
    const ctx = this.ctx;
    // Use CSS-pixel dimensions (after setTransform(dpr,0,0,dpr,0,0) in app.ts)
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const targetSize = CAT_PIXEL_SIZE[this.catSize];

    ctx.clearRect(0, 0, w, h);

    // Fallback: show placeholder text if image not loaded
    if (!this.imageLoaded || !this.image) {
      this.drawPlaceholder(ctx, cx, cy, targetSize);
      return;
    }

    // Scale to fill window height (window is already sized for photo aspect ratio)
    const imgW = this.image.width;
    const imgH = this.image.height;
    const scale = h / imgH;

    ctx.save();
    ctx.translate(cx, cy);

    // Draw soft drop shadow under the cat
    this.drawShadow(ctx, scale * imgW * 0.85, scale * imgH * 0.1);

    // Apply facing direction flip
    ctx.scale(facingRight ? 1 : -1, 1);

    // Apply state-specific transforms
    switch (state) {
      case 'idle':       this.applyIdle(ctx, t, scale, imgW, imgH); break;
      case 'walking':    this.applyWalking(ctx, t, scale, imgW, imgH); break;
      case 'chasing':    this.applyChasing(ctx, t, scale, imgW, imgH); break;
      case 'sleeping':   this.applySleeping(ctx, t, scale, imgW, imgH); break;
      case 'meowing':    this.applyMeowing(ctx, t, scale, imgW, imgH); break;
      case 'eating':     this.applyEating(ctx, t, scale, imgW, imgH); break;
      case 'dragged':    this.applyDragged(ctx, t, scale, imgW, imgH); break;
      case 'rolling':    this.applyRolling(ctx, t, scale, imgW, imgH); break;
      case 'grooming':   this.applyGrooming(ctx, t, scale, imgW, imgH); break;
      case 'purring':    this.applyIdle(ctx, t, scale, imgW, imgH); break;
      default:           this.applyIdle(ctx, t, scale, imgW, imgH); break;
    }

    ctx.restore();
  }

  // ── State transforms ──

  private applyIdle(ctx: CanvasRenderingContext2D, t: number, s: number, iw: number, ih: number): void {
    // Gentle breathing — subtle scale oscillation
    const breathe = 1 + Math.sin(t * 1.8) * 0.02;
    ctx.save();
    ctx.scale(s * breathe, s * breathe);
    ctx.drawImage(this.image!, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();
  }

  private applyWalking(ctx: CanvasRenderingContext2D, t: number, s: number, iw: number, ih: number): void {
    // Bounce up and down while walking
    const bounceY = Math.abs(Math.sin(t * 8)) * 6;
    ctx.save();
    ctx.translate(0, -bounceY);
    ctx.scale(s, s);
    ctx.drawImage(this.image!, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();
  }

  private applyChasing(ctx: CanvasRenderingContext2D, t: number, s: number, iw: number, ih: number): void {
    // Faster, more eager bounce
    const bounceY = Math.abs(Math.sin(t * 12)) * 4;
    ctx.save();
    ctx.translate(0, -bounceY);
    ctx.scale(s * 1.03, s * 0.97); // slightly stretched forward
    ctx.drawImage(this.image!, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();
  }

  private applySleeping(ctx: CanvasRenderingContext2D, t: number, s: number, iw: number, ih: number): void {
    // Slightly rotated, dimmed — cat curled up sleeping
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.rotate(Math.sin(t * 0.5) * 0.05);
    ctx.scale(s * 0.85, s * 0.85);
    ctx.drawImage(this.image!, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();

    // Zzz text
    ctx.save();
    const zPhase = t * 2;
    ctx.fillStyle = 'rgba(200, 200, 255, 0.8)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('z', iw * s * 0.35, -ih * s * 0.1 + Math.sin(zPhase) * 5);
    ctx.fillText('Z', iw * s * 0.42, -ih * s * 0.2 + Math.sin(zPhase + 1) * 5);
    ctx.fillText('Z', iw * s * 0.49, -ih * s * 0.3 + Math.sin(zPhase + 2) * 5);
    ctx.restore();
  }

  private applyMeowing(ctx: CanvasRenderingContext2D, t: number, s: number, iw: number, ih: number): void {
    // Quick scale pulse — cat opens mouth
    const pulse = 1 + Math.abs(Math.sin(t * 12)) * 0.06;
    ctx.save();
    ctx.scale(s * pulse, s * pulse);
    ctx.drawImage(this.image!, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();
  }

  private applyEating(ctx: CanvasRenderingContext2D, t: number, s: number, iw: number, ih: number): void {
    // Head nod while eating
    const nod = Math.sin(t * 10) * 3;
    ctx.save();
    ctx.translate(0, nod);
    ctx.scale(s, s);
    ctx.drawImage(this.image!, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();
  }

  private applyDragged(ctx: CanvasRenderingContext2D, t: number, s: number, iw: number, ih: number): void {
    // Wobble + slight transparency when being dragged
    const wobble = Math.sin(t * 6) * 1.5;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.rotate(wobble * 0.02);
    ctx.scale(s * 1.05, s * 0.95); // slightly stretched
    ctx.drawImage(this.image!, -iw / 2, -ih / 2 + 3, iw, ih);
    ctx.restore();
  }

  private applyRolling(ctx: CanvasRenderingContext2D, t: number, s: number, iw: number, ih: number): void {
    // Full side-to-side roll
    const rollAngle = Math.sin(t * 8) * 0.6;
    ctx.save();
    ctx.rotate(rollAngle);

    const squash = 1 + Math.abs(Math.sin(t * 8)) * 0.2;
    ctx.scale(s / squash, s * squash);
    ctx.drawImage(this.image!, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();

    // Sparkle particles
    const sparkleCount = 4;
    for (let i = 0; i < sparkleCount; i++) {
      const sx = Math.sin(t * 5 + i * 1.6) * iw * s * 0.25;
      const sy = -ih * s * 0.15 + Math.cos(t * 5 + i * 1.6) * ih * s * 0.2;
      const alpha = 0.3 + Math.sin(t * 8 + i) * 0.3;
      ctx.fillStyle = `rgba(255, 150, 200, ${Math.max(0, alpha)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + Math.sin(t * 10 + i) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private applyGrooming(ctx: CanvasRenderingContext2D, t: number, s: number, iw: number, ih: number): void {
    // Side-to-side tilt — cat cleaning itself
    const tilt = Math.sin(t * 3) * 0.08;
    ctx.save();
    ctx.rotate(tilt);
    ctx.scale(s, s);
    ctx.drawImage(this.image!, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();
  }

  /** Draw a soft elliptical shadow beneath the cat. */
  private drawShadow(ctx: CanvasRenderingContext2D, shadowW: number, offsetY: number): void {
    ctx.save();
    // Elliptical blur shadow below the cat
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
    // Draw a cute placeholder circle with text when image isn't loaded
    ctx.save();
    ctx.translate(cx, cy);

    // Orange circle
    ctx.fillStyle = '#F5A623';
    ctx.beginPath();
    ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cat face emoji text
    ctx.fillStyle = '#fff';
    ctx.font = `${size / 3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐱', 0, 0);

    ctx.restore();
  }
}
