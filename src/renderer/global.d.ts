import type { Frequency } from "../../electron/preload";

declare global {
  interface Window {
    yuzai: {
      setInteractive(interactive: boolean): void;
      moveTo(point: { x: number; y: number }): void;
      getPosition(): Promise<[number, number]>;
      getScreenBounds(): Promise<{ x: number; y: number; width: number; height: number }>;
      showContextMenu(): void;
      onFrequencyChange(callback: (frequency: Frequency) => void): () => void;
    };
  }
}

export {};
