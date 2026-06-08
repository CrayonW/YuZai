export class AudioManager {
  private meow: HTMLAudioElement | null = null;
  private purr: HTMLAudioElement | null = null;
  private purrActive = false;

  constructor() {
    this.meow = document.getElementById('audio-meow') as HTMLAudioElement | null;
    this.purr = document.getElementById('audio-purr') as HTMLAudioElement | null;
    if (this.purr) this.purr.loop = true;
  }

  playMeow(): void {
    if (!this.meow) return;
    this.meow.currentTime = 0;
    this.meow.play().catch(() => { /* autoplay policy */ });
  }

  startPurr(): void {
    if (!this.purr || this.purrActive) return;
    this.purr.currentTime = 0;
    this.purr.play().catch(() => {});
    this.purrActive = true;
  }

  stopPurr(): void {
    if (!this.purr || !this.purrActive) return;
    this.purr.pause();
    this.purr.currentTime = 0;
    this.purrActive = false;
  }

  /** Reload <audio> sources (called when asset files are swapped at runtime). */
  reload(): void {
    this.meow?.load();
    this.purr?.load();
  }
}
