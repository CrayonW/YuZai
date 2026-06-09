import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export type CatSize = 'small' | 'medium' | 'large';

export interface Settings {
  catSize: CatSize;
  autoStart: boolean;
  windowX?: number;
  windowY?: number;
}

const defaults: Settings = {
  catSize: 'medium',
  autoStart: false,
};

function settingsPath(): string {
  return path.join(app.getPath('userData'), 'yuzai-settings.json');
}

export function loadSettings(): Settings {
  try {
    const raw = fs.readFileSync(settingsPath(), 'utf-8');
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(partial: Partial<Settings>): Settings {
  const current = loadSettings();
  const updated = { ...current, ...partial };
  fs.writeFileSync(settingsPath(), JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

/** Fish photo (yuzai.png) natural aspect ratio: 718 / 372 */
const CAT_ASPECT_RATIO = 718 / 372;

/** Map cat size label to window dimensions (width × height in CSS pixels). */
export function getWindowSize(size: CatSize): { width: number; height: number } {
  const h = (() => {
    switch (size) {
      case 'small':  return 170;
      case 'medium': return 280;
      case 'large':  return 390;
    }
  })();
  return { width: Math.round(h * CAT_ASPECT_RATIO), height: h };
}
