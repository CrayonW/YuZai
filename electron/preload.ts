import { contextBridge, ipcRenderer } from "electron";

export type Frequency = "low" | "normal" | "high";
export type PetSize = 220 | 280 | 340;

contextBridge.exposeInMainWorld("yuzai", {
  setInteractive: (interactive: boolean) => ipcRenderer.send("window:set-interactive", interactive),
  moveTo: (point: { x: number; y: number }) => ipcRenderer.send("window:move-to", point),
  getPosition: () => ipcRenderer.invoke("window:get-position") as Promise<[number, number]>,
  getSize: () => ipcRenderer.invoke("window:get-size") as Promise<PetSize>,
  getScreenBounds: () =>
    ipcRenderer.invoke("window:get-screen-bounds") as Promise<Electron.Rectangle>,
  showContextMenu: () => ipcRenderer.send("menu:context"),
  onFrequencyChange: (callback: (frequency: Frequency) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, frequency: Frequency) => callback(frequency);
    ipcRenderer.on("settings:frequency", listener);
    return () => ipcRenderer.removeListener("settings:frequency", listener);
  },
  onSizeChange: (callback: (size: PetSize) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, size: PetSize) => callback(size);
    ipcRenderer.on("settings:size", listener);
    return () => ipcRenderer.removeListener("settings:size", listener);
  }
});
