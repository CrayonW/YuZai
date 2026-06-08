import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { createPetWindow } from './window';
import { createTray } from './tray';
import { loadSettings, saveSettings, Settings, getWindowSize } from './settings';
import { IPC } from '../shared/ipc-channels';

let mainWindow: BrowserWindow | null = null;

// ──────────────────────────────────────────
// App lifecycle
// ──────────────────────────────────────────

app.whenReady().then(() => {
  const settings = loadSettings();
  mainWindow = createPetWindow(settings);
  createTray(mainWindow);
  registerIPC();

  // Hide from dock on macOS (it's a background pet, not a regular app window)
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }
});

app.on('window-all-closed', () => {
  // Don't quit — the tray keeps the app alive
});

app.on('before-quit', () => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    saveSettings({ windowX: x, windowY: y });
  }
});

// ──────────────────────────────────────────
// IPC handlers
// ──────────────────────────────────────────

function registerIPC(): void {
  // — Window movement —
  ipcMain.on(IPC.WINDOW_MOVE, (_event, x: number, y: number) => {
    mainWindow?.setPosition(Math.round(x), Math.round(y));
  });

  // — Window position query —
  ipcMain.handle(IPC.WINDOW_GET_POSITION, () => {
    if (!mainWindow) return { x: 0, y: 0 };
    const [x, y] = mainWindow.getPosition();
    return { x, y };
  });

  // — Window bounds query —
  ipcMain.handle(IPC.WINDOW_GET_BOUNDS, () => {
    if (!mainWindow) return { x: 0, y: 0, width: 0, height: 0 };
    const b = mainWindow.getBounds();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });

  // — Window resize (after size setting change) —
  ipcMain.handle(IPC.WINDOW_RESIZE, (_event, catSize: 'small' | 'medium' | 'large') => {
    if (!mainWindow) return;
    const newSize = getWindowSize(catSize);
    mainWindow.setSize(newSize, newSize);
  });

  // — Mouse position (screen coordinates) —
  ipcMain.handle(IPC.MOUSE_GET_POSITION, () => {
    const p = screen.getCursorScreenPoint();
    return { x: p.x, y: p.y };
  });

  // — Settings —
  ipcMain.handle(IPC.SETTINGS_GET, (_event, key: string) => {
    const s: Settings = loadSettings();
    return (s as Record<string, unknown>)[key];
  });

  ipcMain.handle(IPC.SETTINGS_SET, (_event, key: string, value: unknown) => {
    saveSettings({ [key]: value } as Partial<Settings>);
    return loadSettings();
  });

  ipcMain.handle(IPC.SETTINGS_GET_ALL, () => loadSettings());

  // — App quit from renderer —
  ipcMain.on(IPC.APP_QUIT, () => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      saveSettings({ windowX: x, windowY: y });
    }
    app.quit();
  });
}
