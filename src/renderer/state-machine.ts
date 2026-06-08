import { CatState, CONFIG, Point, CAT_PIXEL_SIZE, CatSize } from './types';

export interface StateMachineSnapshot {
  state: CatState;
  position: Point;
  animTimer: number;
  idleTimer: number;
  targetPos: Point | null;
  paused: boolean;
}

export class CatStateMachine {
  state: CatState = 'idle';
  position: Point = { x: 0.5, y: 0.5 };   // relative [0-1] inside window
  screenPos: Point = { x: 0, y: 0 };       // cached screen coords (updated externally)
  animTimer = 0;
  idleTimer = 0;
  targetPos: Point | null = null;
  paused = false;
  facingRight = true;                       // current facing direction

  private meowTimer = 0;
  private eatTimer = 0;
  private purrTimer = 0;
  private rollTimer = 0;
  private dragOffset: Point = { x: 0, y: 0 };
  private walkTarget: Point | null = null;
  private size: CatSize = 'medium';

  setSize(s: CatSize) { this.size = s; }
  get catPixelSize() { return CAT_PIXEL_SIZE[this.size]; }

  // ── Transitions ──

  startDrag(offset: Point) {
    this.state = 'dragged';
    this.dragOffset = offset;
    this.walkTarget = null;
    this.targetPos = null;
  }

  stopDrag() {
    this.state = 'idle';
    this.idleTimer = 0;
  }

  onClick(): boolean {
    // Returns true if it was a click (not drag) → triggers MEOW
    if (this.state === 'dragged') return false;
    if (this.state === 'sleeping') { this.state = 'idle'; this.idleTimer = 0; return true; }
    this.state = 'meowing';
    this.meowTimer = 0.6; // seconds
    return true;
  }

  startPurr() {
    if (this.state === 'dragged' || this.state === 'meowing' || this.state === 'eating') return;
    if (this.state !== 'purring') this.state = 'purring';
    this.purrTimer = 0;
  }

  stopPurr() {
    if (this.state === 'purring') { this.state = 'idle'; this.idleTimer = 0; }
  }

  feed() {
    this.state = 'eating';
    this.eatTimer = 3.0;
    this.walkTarget = null;
  }

  roll(): boolean {
    // Returns true if roll was triggered
    if (this.state === 'dragged' || this.state === 'sleeping' || this.state === 'eating' || this.state === 'rolling') return false;
    this.state = 'rolling';
    this.rollTimer = CONFIG.rollDuration;
    return true;
  }

  isMouseOverCat(mouseRelX: number, mouseRelY: number): boolean {
    const cx = this.position.x * window.innerWidth;
    const cy = this.position.y * window.innerHeight;
    const dist = Math.hypot(mouseRelX - cx, mouseRelY - cy);
    return dist < this.catPixelSize * 0.45;
  }

  // ── Main update (called each frame) ──

  update(dt: number, mouseScreen: Point, mouseInWindow: Point | null, windowW: number, windowH: number) {
    if (this.paused) { this.animTimer += dt; return null; }
    this.animTimer += dt;

    switch (this.state) {
      case 'idle':       return this.updateIdle(dt, mouseScreen, mouseInWindow, windowW, windowH);
      case 'walking':    return this.updateWalking(dt);
      case 'sleeping':   return this.updateSleeping(dt, mouseInWindow, windowW, windowH);
      case 'chasing':    return this.updateChasing(dt, mouseScreen);
      case 'dragged':    return this.updateDragged();
      case 'purring':    return this.updatePurring(dt, mouseInWindow, windowW, windowH);
      case 'eating':     return this.updateEating(dt);
      case 'meowing':    return this.updateMeowing(dt);
      case 'rolling':    return this.updateRolling(dt);
      default:           return null;
    }
  }

  // ── State updates (return window-move delta or null) ──

  private updateIdle(dt: number, mouseScreen: Point, mouseInWindow: Point | null, wW: number, wH: number): Point | null {
    this.idleTimer += dt;

    // Chase mouse?
    if (mouseInWindow) {
      const cx = this.position.x * wW, cy = this.position.y * wH;
      const dist = Math.hypot(mouseInWindow.x - cx, mouseInWindow.y - cy);
      if (dist < CONFIG.chaseDistance) {
        this.state = 'chasing';
        return null;
      }
    }

    // Sleep?
    if (this.idleTimer > CONFIG.sleepAfterIdle / 1000) {
      this.state = 'sleeping';
      return null;
    }

    // Walk randomly?
    const timeout = CONFIG.idleTimeoutMin / 1000 + Math.random() * (CONFIG.idleTimeoutMax - CONFIG.idleTimeoutMin) / 1000;
    if (this.idleTimer > timeout) {
      this.state = 'walking';
      this.walkTarget = this.randomScreenPoint();
      return null;
    }

    return null;
  }

  private updateWalking(dt: number): Point | null {
    if (!this.walkTarget) { this.state = 'idle'; this.idleTimer = 0; return null; }
    const dx = this.walkTarget.x - this.screenPos.x;
    const dy = this.walkTarget.y - this.screenPos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) { this.state = 'idle'; this.idleTimer = 0; this.walkTarget = null; return null; }
    const step = CONFIG.walkSpeed * dt;
    const ratio = Math.min(step / dist, 1);
    const mx = dx * ratio, my = dy * ratio;
    this.facingRight = dx >= 0;
    const newPos = this.clampToScreen(
      this.screenPos.x + mx,
      this.screenPos.y + my,
    );
    const clampedMx = newPos.x - this.screenPos.x;
    const clampedMy = newPos.y - this.screenPos.y;
    this.screenPos = newPos;
    return { x: clampedMx, y: clampedMy };
  }

  private updateSleeping(dt: number, mouseInWindow: Point | null, wW: number, wH: number): Point | null {
    // Wake on mouse proximity or click (click handled in onClick)
    if (mouseInWindow) {
      const cx = this.position.x * wW, cy = this.position.y * wH;
      if (Math.hypot(mouseInWindow.x - cx, mouseInWindow.y - cy) < this.catPixelSize * 0.5) {
        this.state = 'idle'; this.idleTimer = 0;
      }
    }
    return null;
  }

  private updateChasing(dt: number, mouseScreen: Point): Point | null {
    const dx = mouseScreen.x - this.screenPos.x;
    const dy = mouseScreen.y - this.screenPos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 30) { this.state = 'idle'; this.idleTimer = 0; return null; }
    if (dist > CONFIG.chaseDistance * 2) { this.state = 'idle'; this.idleTimer = 0; return null; }
    const step = CONFIG.chaseSpeed * dt;
    const ratio = Math.min(step / dist, 1);
    const mx = dx * ratio, my = dy * ratio;
    this.facingRight = dx >= 0;
    const newPos = this.clampToScreen(
      this.screenPos.x + mx,
      this.screenPos.y + my,
    );
    const clampedMx = newPos.x - this.screenPos.x;
    const clampedMy = newPos.y - this.screenPos.y;
    this.screenPos = newPos;
    return { x: clampedMx, y: clampedMy };
  }

  private updateDragged(): Point | null {
    // Actual movement is done externally via moveWindow; this is a placeholder
    return null;
  }

  private updatePurring(dt: number, mouseInWindow: Point | null, wW: number, wH: number): Point | null {
    if (!mouseInWindow) { this.stopPurr(); return null; }
    const cx = this.position.x * wW, cy = this.position.y * wH;
    if (Math.hypot(mouseInWindow.x - cx, mouseInWindow.y - cy) > CONFIG.purrDistance) {
      this.stopPurr();
    }
    return null;
  }

  private updateEating(dt: number): Point | null {
    this.eatTimer -= dt;
    if (this.eatTimer <= 0) { this.state = 'idle'; this.idleTimer = 0; }
    return null;
  }

  private updateMeowing(dt: number): Point | null {
    this.meowTimer -= dt;
    if (this.meowTimer <= 0) { this.state = 'idle'; this.idleTimer = 0; }
    return null;
  }

  private updateRolling(dt: number): Point | null {
    this.rollTimer -= dt;
    if (this.rollTimer <= 0) { this.state = 'idle'; this.idleTimer = 0; }
    return null;
  }

  // ── Helpers ──

  private screenW = 1920;  // screen work area width (initialized by app)
  private screenH = 1080;  // screen work area height

  setScreenBounds(w: number, h: number): void {
    this.screenW = w;
    this.screenH = h;
  }

  private randomScreenPoint(): Point {
    const margin = this.catPixelSize;
    return {
      x: margin + Math.random() * (this.screenW - margin * 2),
      y: margin + Math.random() * (this.screenH - margin * 2),
    };
  }

  private clampToScreen(x: number, y: number): Point {
    const margin = this.catPixelSize / 2;
    return {
      x: Math.max(margin, Math.min(this.screenW - margin, x)),
      y: Math.max(margin, Math.min(this.screenH - margin, y)),
    };
  }

  getDragOffset(): Point { return this.dragOffset; }

  snapshot(): StateMachineSnapshot {
    return {
      state: this.state, position: { ...this.position },
      animTimer: this.animTimer, idleTimer: this.idleTimer,
      targetPos: this.targetPos ? { ...this.targetPos } : null, paused: this.paused,
    };
  }
}
