import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export type CatSize = 'small' | 'medium' | 'large';

export interface Settings {
  catSize: CatSize;
  windowX?: number;
  windowY?: number;
}

const defaults: Settings = {
  catSize: 'medium',
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

/** Map cat size label to window dimension in pixels. */
export function getWindowSize(size: CatSize): number {
  switch (size) {
    case 'small':  return 170;
    case 'medium': return 280;
    case 'large':  return 390;
  }
}
