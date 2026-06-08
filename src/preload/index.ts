import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipc-channels';

export interface YuZaiAPI {
  moveWindow: (x: number, y: number) => void;
  getWindowPosition: () => Promise<{ x: number; y: number }>;
  getWindowBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;
  resizeWindow: (size: 'small' | 'medium' | 'large') => Promise<void>;
  getMousePosition: () => Promise<{ x: number; y: number }>;
  getSetting: (key: string) => Promise<unknown>;
  setSetting: (key: string, value: unknown) => Promise<unknown>;
  getAllSettings: () => Promise<Record<string, unknown>>;
  onFeedTrigger: (cb: () => void) => () => void;
  onSettingsChanged: (cb: (s: Record<string, unknown>) => void) => () => void;
  onPauseToggle: (cb: (paused: boolean) => void) => () => void;
}

contextBridge.exposeInMainWorld('yuZaiAPI', {
  moveWindow: (x: number, y: number) => ipcRenderer.send(IPC.WINDOW_MOVE, x, y),
  getWindowPosition: () => ipcRenderer.invoke(IPC.WINDOW_GET_POSITION),
  getWindowBounds: () => ipcRenderer.invoke(IPC.WINDOW_GET_BOUNDS),
  resizeWindow: (size: string) => ipcRenderer.invoke(IPC.WINDOW_RESIZE, size),
  getMousePosition: () => ipcRenderer.invoke(IPC.MOUSE_GET_POSITION),
  getSetting: (key: string) => ipcRenderer.invoke(IPC.SETTINGS_GET, key),
  setSetting: (key: string, value: unknown) => ipcRenderer.invoke(IPC.SETTINGS_SET, key, value),
  getAllSettings: () => ipcRenderer.invoke(IPC.SETTINGS_GET_ALL),

  onFeedTrigger: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on(IPC.FEED_TRIGGER, handler);
    return () => ipcRenderer.removeListener(IPC.FEED_TRIGGER, handler);
  },
  onSettingsChanged: (cb: (s: Record<string, unknown>) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, s: Record<string, unknown>) => cb(s);
    ipcRenderer.on(IPC.SETTINGS_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC.SETTINGS_CHANGED, handler);
  },
  onPauseToggle: (cb: (paused: boolean) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, paused: boolean) => cb(paused);
    ipcRenderer.on(IPC.PAUSE_TOGGLE, handler);
    return () => ipcRenderer.removeListener(IPC.PAUSE_TOGGLE, handler);
  },
} satisfies YuZaiAPI);
