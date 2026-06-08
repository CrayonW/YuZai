export class AudioManager {
  private meow: HTMLAudioElement | null = null;
  private purr: HTMLAudioElement | null = null;
  private purrActive = false;

  /** Whether audio sources are actually available (set after loading) */
  private meowAvailable = false;
  private purrAvailable = false;

  constructor() {
    this.meow = document.getElementById('audio-meow') as HTMLAudioElement | null;
    this.purr = document.getElementById('audio-purr') as HTMLAudioElement | null;
    // Try loading audio sources; fail silently if files missing
    this.tryLoadMeow();
    this.tryLoadPurr();
  }

  /** Attempt to load meow.mp3 from assets/audio/ */
  private tryLoadMeow(): void {
    if (!this.meow) return;
    const src = '../assets/audio/meow.mp3';
    this.meow.src = src;
    this.meow.oncanplaythrough = () => {
      this.meowAvailable = true;
    };
    this.meow.onerror = () => {
      // Audio file not available — cat will be silent (no console spam)
      this.meowAvailable = false;
    };
    this.meow.load();
  }

  /** Attempt to load purr.mp3 from assets/audio/ */
  private tryLoadPurr(): void {
    if (!this.purr) return;
    this.purr.loop = true;
    const src = '../assets/audio/purr.mp3';
    this.purr.src = src;
    this.purr.oncanplaythrough = () => {
      this.purrAvailable = true;
    };
    this.purr.onerror = () => {
      this.purrAvailable = false;
    };
    this.purr.load();
  }

  /** Check if meow audio is ready to play */
  canMeow(): boolean {
    return this.meowAvailable && this.meow !== null;
  }

  /** Check if purr audio is ready to play */
  canPurr(): boolean {
    return this.purrAvailable && this.purr !== null;
  }

  playMeow(): void {
    if (!this.canMeow() || !this.meow) return;
    this.meow.currentTime = 0;
    this.meow.play().catch(() => { /* autoplay policy */ });
  }

  startPurr(): void {
    if (!this.canPurr() || !this.purr || this.purrActive) return;
    this.purr.play().catch(() => {});
    this.purrActive = true;
  }

  stopPurr(): void {
    if (!this.purr || !this.purrActive) return;
    this.purr.pause();
    this.purr.currentTime = 0;
    this.purrActive = false;
  }

  /** Reload audio sources (e.g. after placing new files in assets/) */
  reload(): void {
    this.tryLoadMeow();
    this.tryLoadPurr();
  }
}
