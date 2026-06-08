import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { Settings, getWindowSize } from './settings';

export function createPetWindow(settings: Settings): BrowserWindow {
  const size = getWindowSize(settings.catSize);

  const win = new BrowserWindow({
    width: size,
    height: size,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    type: process.platform === 'darwin' ? 'panel' : 'toolbar',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Restore saved position or place at default (right side of screen, upper area)
  if (settings.windowX !== undefined && settings.windowY !== undefined) {
    win.setPosition(settings.windowX, settings.windowY);
  } else {
    const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
    win.setPosition(screenW - size - 60, Math.round(screenH * 0.25));
  }

  // Float above everything including fullscreen apps
  win.setAlwaysOnTop(true, 'screen-saver');
  // macOS: show on all desktops so the cat follows you
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  return win;
}
