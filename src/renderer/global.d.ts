import type { Frequency, PetSize } from "../../electron/preload";

declare global {
  interface Window {
    yuzai: {
      setInteractive(interactive: boolean): void;
      moveTo(point: { x: number; y: number }): void;
      getPosition(): Promise<[number, number]>;
      getSize(): Promise<PetSize>;
      getScreenBounds(): Promise<{ x: number; y: number; width: number; height: number }>;
      showContextMenu(): void;
      onFrequencyChange(callback: (frequency: Frequency) => void): () => void;
      onSizeChange(callback: (size: PetSize) => void): () => void;
    };
  }
}

export {};
