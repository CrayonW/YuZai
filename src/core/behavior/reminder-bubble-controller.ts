const REMINDER_MESSAGES = ["喝口水吧", "休息一下眼睛"];
const FIRST_REMINDER_DELAY_MS = 900;
const MIN_REMINDER_INTERVAL_MS = 45_000;
const MAX_REMINDER_INTERVAL_MS = 90_000;
const BUBBLE_VISIBLE_MS = 3_600;

export interface ReminderBubbleControllerOptions {
  messages?: string[];
  firstDelayMs?: number;
  minIntervalMs?: number;
  maxIntervalMs?: number;
  visibleMs?: number;
  random?: () => number;
  setTimeout?: (callback: () => void, delay: number) => number;
  clearTimeout?: (id: number) => void;
}

export class ReminderBubbleController {
  private readonly messages: string[];
  private readonly firstDelayMs: number;
  private readonly minIntervalMs: number;
  private readonly maxIntervalMs: number;
  private readonly visibleMs: number;
  private readonly random: () => number;
  private readonly setTimer: (callback: () => void, delay: number) => number;
  private readonly clearTimer: (id: number) => void;
  private messageIndex = 0;
  private hideTimer: number | null = null;
  private nextReminderTimer: number | null = null;

  constructor(private readonly element: HTMLElement, options: ReminderBubbleControllerOptions = {}) {
    this.messages = options.messages?.length ? options.messages : REMINDER_MESSAGES;
    this.firstDelayMs = options.firstDelayMs ?? FIRST_REMINDER_DELAY_MS;
    this.minIntervalMs = options.minIntervalMs ?? MIN_REMINDER_INTERVAL_MS;
    this.maxIntervalMs = Math.max(this.minIntervalMs, options.maxIntervalMs ?? MAX_REMINDER_INTERVAL_MS);
    this.visibleMs = options.visibleMs ?? BUBBLE_VISIBLE_MS;
    this.random = options.random ?? Math.random;
    this.setTimer = options.setTimeout ?? ((callback, delay) => window.setTimeout(callback, delay));
    this.clearTimer = options.clearTimeout ?? ((id) => window.clearTimeout(id));
  }

  start(): void {
    if (this.nextReminderTimer !== null) return;
    this.nextReminderTimer = this.setTimer(() => this.showNext(), this.firstDelayMs);
  }

  stop(): void {
    if (this.hideTimer !== null) this.clearTimer(this.hideTimer);
    if (this.nextReminderTimer !== null) this.clearTimer(this.nextReminderTimer);
    this.hideTimer = null;
    this.nextReminderTimer = null;
    this.element.classList.remove("is-visible");
  }

  private showNext(): void {
    this.nextReminderTimer = null;
    this.element.textContent = this.messages[this.messageIndex];
    this.messageIndex = (this.messageIndex + 1) % this.messages.length;
    this.element.classList.add("is-visible");

    if (this.hideTimer !== null) this.clearTimer(this.hideTimer);
    this.hideTimer = this.setTimer(() => {
      this.element.classList.remove("is-visible");
      this.hideTimer = null;
    }, this.visibleMs);
    this.scheduleNextReminder();
  }

  private scheduleNextReminder(): void {
    const span = Math.max(0, this.maxIntervalMs - this.minIntervalMs);
    const roll = Math.min(1, Math.max(0, this.random()));
    this.nextReminderTimer = this.setTimer(() => this.showNext(), Math.round(this.minIntervalMs + span * roll));
  }
}
