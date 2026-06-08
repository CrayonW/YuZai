import { CatState, CatSize, CAT_PIXEL_SIZE } from './types';

/**
 * Procedural placeholder cat renderer using Canvas 2D.
 *
 * When real photos / sprite sheets are added later, replace the draw*()
 * methods with image-based rendering while keeping the same public API.
 */
export class CatRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private blinkTimer = 0;
  private blinkState = false;
  private catSize: CatSize = 'medium';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  setSize(size: CatSize): void {
    this.catSize = size;
  }

  /** Main render entry — called every frame */
  render(state: CatState, t: number, dt: number, facingRight = true): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const s = CAT_PIXEL_SIZE[this.catSize] / 250; // scale normalized to medium

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(facingRight ? s : -s, s);

    // Blink logic (shared across most states)
    this.blinkTimer += dt;
    this.blinkState = Math.sin(this.blinkTimer * 3) > 0.92;

    switch (state) {
      case 'sleeping':  this.drawSleeping(t); break;
      case 'eating':    this.drawEating(t); break;
      case 'meowing':   this.drawMeowing(t); break;
      case 'purring':   this.drawHappy(t); break;
      case 'dragged':   this.drawDragged(t); break;
      case 'walking':
      case 'chasing':   this.drawWalking(t); break;
      case 'rolling':   this.drawRolling(t); break;
      default:          this.drawIdle(t); break;
    }

    ctx.restore();
  }

  // ────────────────────────────────────────
  //  Colour palette
  // ────────────────────────────────────────

  private catOrange = '#F5A623';
  private catLight = '#FCC77B';
  private catDark = '#D4891A';
  private catWhite = '#FFF5E6';
  private earPink = '#FFB3B3';
  private eyeGreen = '#7EC850';
  private nosePink = '#FF8C94';
  private pupilBlack = '#1A1A2E';

  // ────────────────────────────────────────
  //  Drawing primitives (used by state drawers)
  // ────────────────────────────────────────

  /** Draw only the cat body (pear shape + belly patch). */
  private drawBody(ctx: CanvasRenderingContext2D, yOff = 0, squash = 1): void {
    ctx.save();
    ctx.scale(1, squash);
    ctx.translate(0, yOff);

    // Main body — pear shape
    ctx.fillStyle = this.catOrange;
    ctx.beginPath();
    ctx.ellipse(0, 15, 42, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly patch
    ctx.fillStyle = this.catWhite;
    ctx.beginPath();
    ctx.ellipse(0, 20, 28, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /** Draw head with ears, eyes, nose, mouth, whiskers. */
  private drawHead(ctx: CanvasRenderingContext2D, yOff = 0, mouthOpen = 0): void {
    const y = -38 + yOff;

    // Ears
    ctx.fillStyle = this.catOrange;
    ctx.beginPath();
    ctx.moveTo(-28, y + 5); ctx.lineTo(-22, y - 18); ctx.lineTo(-8, y + 5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(28, y + 5); ctx.lineTo(22, y - 18); ctx.lineTo(8, y + 5);
    ctx.closePath(); ctx.fill();

    // Inner ears
    ctx.fillStyle = this.earPink;
    ctx.beginPath();
    ctx.moveTo(-24, y + 3); ctx.lineTo(-20, y - 12); ctx.lineTo(-12, y + 3);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(24, y + 3); ctx.lineTo(20, y - 12); ctx.lineTo(12, y + 3);
    ctx.closePath(); ctx.fill();

    // Head circle
    ctx.fillStyle = this.catOrange;
    ctx.beginPath();
    ctx.ellipse(0, y, 38, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheek fluff
    ctx.fillStyle = this.catLight;
    ctx.beginPath();
    ctx.ellipse(-18, y + 10, 14, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18, y + 10, 14, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    if (!this.blinkState) {
      ctx.fillStyle = this.eyeGreen;
      ctx.beginPath();
      ctx.ellipse(-14, y - 2, 8, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(14, y - 2, 8, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = this.pupilBlack;
      ctx.beginPath();
      ctx.ellipse(-14, y, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(14, y, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-17, y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(11, y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Closed eyes (lines)
      ctx.strokeStyle = this.catDark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-22, y - 2); ctx.lineTo(-6, y - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, y - 2); ctx.lineTo(22, y - 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // Nose
    ctx.fillStyle = this.nosePink;
    ctx.beginPath();
    ctx.moveTo(0, y + 5);
    ctx.lineTo(-4, y + 10);
    ctx.lineTo(4, y + 10);
    ctx.closePath();
    ctx.fill();

    // Mouth
    ctx.strokeStyle = this.catDark;
    ctx.lineWidth = 1.5;
    if (mouthOpen > 0) {
      // Open mouth (meow)
      ctx.fillStyle = '#4A1520';
      ctx.beginPath();
      ctx.ellipse(0, y + 18, 6 * mouthOpen, 5 * mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal mouth
      ctx.beginPath();
      ctx.moveTo(0, y + 12);
      ctx.lineTo(-6, y + 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y + 12);
      ctx.lineTo(6, y + 16);
      ctx.stroke();
    }

    // Whiskers
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for (const side of [-1, 1]) {
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(side * 10, y + 8 + i * 3);
        ctx.lineTo(side * 45, y + 5 + i * 10);
        ctx.stroke();
      }
    }
  }

  /** Draw head with happy half-closed eyes on top of a regular head. */
  private drawHeadHappy(ctx: CanvasRenderingContext2D, _t: number): void {
    // Draw the full head first
    this.drawHead(ctx, 0, 0);

    // Overlay half-closed eyelids
    const y = -38;
    ctx.fillStyle = this.catOrange;
    ctx.beginPath();
    ctx.rect(-22, y - 8, 16, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.rect(6, y - 8, 16, 5);
    ctx.fill();
  }

  /** Draw tail with configurable wag angle and curl. */
  private drawTail(ctx: CanvasRenderingContext2D, angle = 0.3, curl = 0): void {
    ctx.strokeStyle = this.catOrange;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30, 40);
    ctx.bezierCurveTo(55, 20 + curl * 15, 65, -10 - curl * 20, 50 + angle * 20, -30 - curl * 25);
    ctx.stroke();

    // Tail tip highlight
    ctx.strokeStyle = this.catDark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(48, -20 - curl * 15);
    ctx.lineTo(52, -30 - curl * 25);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  // ────────────────────────────────────────
  //  State-specific drawing
  // ────────────────────────────────────────

  private drawIdle(t: number): void {
    const breathe = Math.sin(t * 2.5) * 2;
    const ctx = this.ctx;
    this.drawTail(ctx, 0.3 + Math.sin(t * 1.8) * 0.15);
    this.drawBody(ctx, breathe * 0.3);
    this.drawHead(ctx, breathe * 0.5);
  }

  private drawWalking(t: number): void {
    const bob = Math.abs(Math.sin(t * 8)) * 4;
    const legPhase = Math.sin(t * 10);
    const ctx = this.ctx;

    // Body bounces
    ctx.save();
    ctx.translate(0, bob - 2);

    // Alternate paws slightly
    ctx.save();
    ctx.translate(legPhase * 3, 0);
    this.drawBody(ctx, 0);
    ctx.restore();

    this.drawHead(ctx, bob * 0.6);
    this.drawTail(ctx, 0.5 + legPhase * 0.3);
    ctx.restore();
  }

  private drawSleeping(t: number): void {
    const breathe = Math.sin(t * 1.5) * 3;
    const ctx = this.ctx;

    // Curled up body (oval)
    ctx.fillStyle = this.catOrange;
    ctx.beginPath();
    ctx.ellipse(0, 10, 55, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Darker stripes
    ctx.fillStyle = this.catDark;
    ctx.beginPath();
    ctx.arc(30, -5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-20, 15, 8, 0, Math.PI * 2);
    ctx.fill();

    // Curled tail wrapping
    ctx.strokeStyle = this.catOrange;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(20, 25, 25, 0, Math.PI * 1.2);
    ctx.stroke();

    // Head tucked in
    ctx.fillStyle = this.catOrange;
    ctx.beginPath();
    ctx.ellipse(-25, -5, 28, 24, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Ear tips visible
    ctx.fillStyle = this.catOrange;
    ctx.beginPath();
    ctx.moveTo(-38, -22); ctx.lineTo(-35, -35); ctx.lineTo(-25, -20);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-18, -26); ctx.lineTo(-12, -38); ctx.lineTo(-5, -24);
    ctx.closePath(); ctx.fill();

    // Closed eyes
    ctx.strokeStyle = this.catDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-38, -5); ctx.lineTo(-28, -5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-18, -5); ctx.lineTo(-8, -5);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Sleeping Zs
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 16px sans-serif';
    const zPhase = t * 2;
    ctx.fillText('z', 38, -20 + Math.sin(zPhase) * 6);
    ctx.fillText('Z', 50, -35 + Math.sin(zPhase + 1) * 6);
    ctx.fillText('Z', 62, -50 + Math.sin(zPhase + 2) * 6);

    // Breathing overlay
    ctx.fillStyle = this.catLight;
    ctx.beginPath();
    ctx.ellipse(0, 10 + breathe * 0.4, 52, 29, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHappy(t: number): void {
    const purr = Math.sin(t * 20) * 1.5;
    const ctx = this.ctx;

    // Slight body vibration from purring
    ctx.save();
    ctx.translate(purr * 0.5, 0);

    this.drawTail(ctx, 0.6 + Math.sin(t * 3) * 0.2, 0.5);
    this.drawBody(ctx, 0);
    this.drawHeadHappy(ctx, t);

    ctx.restore();
  }

  private drawDragged(t: number): void {
    const wobble = Math.sin(t * 6) * 3;
    const ctx = this.ctx;

    // Slightly elongated body
    ctx.save();
    ctx.scale(1, 1.15);
    this.drawBody(ctx, 5);
    ctx.restore();

    // Worried head
    ctx.save();
    ctx.translate(wobble * 0.3, 0);
    this.drawHead(ctx, -8);
    ctx.restore();

    // Drooping tail
    ctx.strokeStyle = this.catOrange;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30, 45);
    ctx.quadraticCurveTo(40, 75, 25, 90);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Worried eyebrows
    ctx.strokeStyle = this.catDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-18, -40); ctx.lineTo(-6, -37);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, -40); ctx.lineTo(6, -37);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  private drawEating(t: number): void {
    const nod = Math.sin(t * 10) * 5;
    const ctx = this.ctx;
    this.drawTail(ctx, 0.5);
    this.drawBody(ctx);
    this.drawHead(ctx, nod * 0.8);
  }

  private drawMeowing(t: number): void {
    const mouthWide = 0.6 + Math.sin(t * 12) * 0.4;
    const ctx = this.ctx;

    this.drawTail(ctx, 0.4);
    this.drawBody(ctx);

    // Head tilted up slightly
    ctx.save();
    ctx.translate(0, -5);
    this.drawHead(ctx, 0, Math.max(0, mouthWide));
    ctx.restore();
  }

  // ────────────────────────────────────────
  //  Utils
  // ────────────────────────────────────────

  /** Rolling / cute animation — cat flops on its side then back */
  private drawRolling(t: number): void {
    const ctx = this.ctx;
    const phase = t * 8; // rotation speed
    const rollAngle = Math.sin(phase) * 0.8; // ±45 degrees max

    ctx.save();
    // Rotate the whole cat for the roll effect
    ctx.rotate(rollAngle);

    // Slightly squished body during roll
    const squash = 1 + Math.abs(Math.sin(phase)) * 0.3;
    ctx.save();
    ctx.scale(1 / squash, squash);
    this.drawBody(ctx, -5);
    ctx.restore();

    // Head tilted
    ctx.save();
    ctx.rotate(-rollAngle * 0.5);
    this.drawHead(ctx, 5);
    ctx.restore();

    // Happy wiggling tail
    const tailWag = Math.sin(t * 15) * 0.4;
    this.drawTail(ctx, 0.3 + tailWag, 0.3);

    ctx.restore();

    // Sparkle / heart particles around the cat
    const sparkleCount = 4;
    for (let i = 0; i < sparkleCount; i++) {
      const sx = Math.sin(t * 5 + i * 1.6) * 35;
      const sy = -20 + Math.cos(t * 5 + i * 1.6) * 25;
      const alpha = 0.3 + Math.sin(t * 8 + i) * 0.3;
      ctx.fillStyle = `rgba(255, 150, 200, ${Math.max(0, alpha)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + Math.sin(t * 10 + i) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Utils ──

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }
}
