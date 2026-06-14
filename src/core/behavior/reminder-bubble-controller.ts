const REMINDER_MESSAGES = ["喝口水吧", "休息一下眼睛"];
const FIRST_REMINDER_DELAY_MS = 900;
const REMINDER_INTERVAL_MS = 45_000;
const BUBBLE_VISIBLE_MS = 3_600;

export class ReminderBubbleController {
  private messageIndex = 0;
  private hideTimer: number | null = null;
  private intervalTimer: number | null = null;

  constructor(private readonly element: HTMLElement) {}

  start(): void {
    window.setTimeout(() => this.showNext(), FIRST_REMINDER_DELAY_MS);
    this.intervalTimer = window.setInterval(() => this.showNext(), REMINDER_INTERVAL_MS);
  }

  stop(): void {
    if (this.hideTimer !== null) window.clearTimeout(this.hideTimer);
    if (this.intervalTimer !== null) window.clearInterval(this.intervalTimer);
    this.hideTimer = null;
    this.intervalTimer = null;
    this.element.classList.remove("is-visible");
  }

  private showNext(): void {
    this.element.textContent = REMINDER_MESSAGES[this.messageIndex];
    this.messageIndex = (this.messageIndex + 1) % REMINDER_MESSAGES.length;
    this.element.classList.add("is-visible");

    if (this.hideTimer !== null) window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => {
      this.element.classList.remove("is-visible");
      this.hideTimer = null;
    }, BUBBLE_VISIBLE_MS);
  }
}
