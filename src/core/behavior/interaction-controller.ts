import { DEFAULT_CONFIG } from "../config/load-config";
import { hitTestYuzai } from "../render/placeholder-yuzai";
import type { PetStateMachine } from "../fsm/state-machine";
import { buildRuntimeInteractionSchedule, type RuntimeInteractionSchedule } from "../render/runtime-interaction-schedule";
import { InteractionCooldowns } from "./interaction-cooldowns";

interface DragSession {
  startPointer: { x: number; y: number };
  startWindow: { x: number; y: number };
  active: boolean;
}

export interface InteractionControllerEvents {
  onMouseNearAccepted?: () => void;
  onClickAccepted?: (kind: "single" | "repeated" | "wake") => void;
  onDragAccepted?: () => void;
}

export class InteractionController {
  private lastClickAt = 0;
  private clickCount = 0;
  private drag: DragSession | null = null;
  private interactive = false;
  private dragOffset = { x: 0, y: 0 };
  private petSize = 280;
  private readonly runtimeInteractions: RuntimeInteractionSchedule;
  private readonly interactionCooldowns: InteractionCooldowns;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly fsm: PetStateMachine,
    private readonly notifyStateChanged: () => void,
    runtimeInteractions = buildRuntimeInteractionSchedule(),
    private readonly events: InteractionControllerEvents = {}
  ) {
    this.runtimeInteractions = runtimeInteractions;
    this.interactionCooldowns = new InteractionCooldowns({
      mouse_near: runtimeInteractions.mouseNearCooldownMs,
      click: runtimeInteractions.clickCooldownMs,
      repeated_click: runtimeInteractions.repeatedClickCooldownMs,
      drag: runtimeInteractions.dragCooldownMs,
      wake: runtimeInteractions.wakeCooldownMs
    });
    this.bind();
  }

  get currentDragOffset(): { x: number; y: number } {
    return this.dragOffset;
  }

  setPetSize(size: number): void {
    this.petSize = size;
  }

  setGlobalProximity(near: boolean): void {
    this.handleHoverChange(near);
  }

  async simulateDragForTest(offset: { x: number; y: number }, holdMs: number): Promise<void> {
    if (this.drag?.active) return;
    const [x, y] = await window.yuzai.getPosition();
    const now = performance.now();
    if (!this.interactionCooldowns.tryUse("drag", now)) return;

    this.drag = {
      startPointer: { x: 0, y: 0 },
      startWindow: { x, y },
      active: true
    };
    this.dragOffset = { x: offset.x, y: offset.y };
    this.fsm.request({ state: this.runtimeInteractions.dragState, mood: "surprised", view: "front", direction: 0, cacheCurrent: true, force: true });
    this.events.onDragAccepted?.();
    window.yuzai.moveTo({ x: x + offset.x, y: y + offset.y });
    this.notifyStateChanged();
    window.setTimeout(() => this.handleMouseUp(), Math.max(0, holdMs));
  }

  private bind(): void {
    window.addEventListener("mousemove", (event) => this.handleMouseMove(event));
    window.addEventListener("mousedown", (event) => void this.handleMouseDown(event));
    window.addEventListener("mouseup", () => this.handleMouseUp());
    window.addEventListener("mouseleave", () => {
      this.handleHoverChange(false);
      this.handleMouseUp();
    });
    window.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (this.isHit(event)) window.yuzai.showContextMenu();
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    const hit = this.isHit(event);
    if (hit !== this.interactive) {
      this.interactive = hit;
      window.yuzai.setInteractive(hit);
      this.handleHoverChange(hit);
    }

    if (!this.drag?.active) return;

    const next = {
      x: this.drag.startWindow.x + event.screenX - this.drag.startPointer.x,
      y: this.drag.startWindow.y + event.screenY - this.drag.startPointer.y
    };
    this.dragOffset = {
      x: event.screenX - this.drag.startPointer.x,
      y: event.screenY - this.drag.startPointer.y
    };
    window.yuzai.moveTo(next);
  }

  private async handleMouseDown(event: MouseEvent): Promise<void> {
    if (event.button !== 0 || !this.isHit(event)) return;
    const [x, y] = await window.yuzai.getPosition();
    this.drag = {
      startPointer: { x: event.screenX, y: event.screenY },
      startWindow: { x, y },
      active: false
    };

    window.setTimeout(() => {
      if (!this.drag) return;
      const now = performance.now();
      if (!this.interactionCooldowns.tryUse("drag", now)) return;
      this.drag.active = true;
      this.fsm.request({ state: this.runtimeInteractions.dragState, mood: "surprised", view: "front", direction: 0, cacheCurrent: true, force: true });
      this.events.onDragAccepted?.();
      this.notifyStateChanged();
    }, 160);
  }

  private handleMouseUp(): void {
    if (!this.drag) return;
    const wasDragging = this.drag.active;
    this.drag = null;
    this.dragOffset = { x: 0, y: 0 };

    if (wasDragging) {
      this.fsm.returnToIdle();
      this.notifyStateChanged();
      return;
    }

    this.handleClick();
  }

  private handleHoverChange(hit: boolean): void {
    if (this.drag?.active) return;

    if (hit && this.fsm.state === "idle") {
      const now = performance.now();
      if (!this.interactionCooldowns.tryUse("mouse_near", now)) return;
      this.fsm.request({ state: this.runtimeInteractions.mouseNearState, mood: "happy", view: "front", direction: 0, cacheCurrent: true, force: true });
      this.events.onMouseNearAccepted?.();
      this.notifyStateChanged();
      return;
    }

    if (!hit && this.fsm.state === this.runtimeInteractions.mouseNearState) {
      this.fsm.restorePrevious();
      this.notifyStateChanged();
    }
  }

  private handleClick(): void {
    const now = performance.now();
    if (now - this.lastClickAt < DEFAULT_CONFIG.timing.clickDebounceMs) return;

    const longGap = now - this.lastClickAt > 120000;
    this.clickCount = now - this.lastClickAt < 1800 ? this.clickCount + 1 : 1;
    this.lastClickAt = now;

    if (this.fsm.state === "sleeping") {
      if (!this.interactionCooldowns.tryUse("wake", now)) return;
      this.fsm.request({ state: this.runtimeInteractions.wakeState, mood: "sleepy", view: "front", direction: 0, cacheCurrent: true, force: true }, now);
      this.events.onClickAccepted?.("wake");
      this.fsm.lockFor(700, now);
      window.setTimeout(() => {
        this.fsm.request({ state: this.runtimeInteractions.clickState, mood: "surprised", view: "front", direction: 0, force: true });
        this.fsm.lockFor(DEFAULT_CONFIG.timing.interactionMs);
        this.notifyStateChanged();
      }, 520);
      this.notifyStateChanged();
      return;
    }

    if (this.clickCount >= DEFAULT_CONFIG.timing.shyClickCount) {
      if (!this.interactionCooldowns.tryUse("repeated_click", now)) {
        this.clickCount = 0;
        return;
      }
      this.fsm.request({ state: this.runtimeInteractions.repeatedClickState, mood: "shy", view: "front", direction: 0, cacheCurrent: true, force: true }, now);
      this.events.onClickAccepted?.("repeated");
      this.fsm.lockFor(1600, now);
      this.clickCount = 0;
    } else if (longGap) {
      if (!this.interactionCooldowns.tryUse("click", now)) return;
      this.fsm.request({ state: this.runtimeInteractions.clickState, mood: "happy", view: "front", direction: 0, cacheCurrent: true, force: true }, now);
      this.events.onClickAccepted?.("single");
      this.fsm.lockFor(DEFAULT_CONFIG.timing.interactionMs, now);
    } else {
      if (!this.interactionCooldowns.tryUse("click", now)) return;
      this.fsm.request({ state: this.runtimeInteractions.clickState, mood: "surprised", view: "front", direction: 0, cacheCurrent: true, force: true }, now);
      this.events.onClickAccepted?.("single");
      this.fsm.lockFor(DEFAULT_CONFIG.timing.interactionMs, now);
    }

    this.notifyStateChanged();
  }

  private isHit(event: MouseEvent): boolean {
    const rect = this.canvas.getBoundingClientRect();
    return hitTestYuzai(event.clientX - rect.left, event.clientY - rect.top, this.petSize, this.petSize);
  }
}
