import { contextBridge, ipcRenderer } from "electron";

export type Frequency = "low" | "normal" | "high";

contextBridge.exposeInMainWorld("yuzai", {
  setInteractive: (interactive: boolean) => ipcRenderer.send("window:set-interactive", interactive),
  moveTo: (point: { x: number; y: number }) => ipcRenderer.send("window:move-to", point),
  getPosition: () => ipcRenderer.invoke("window:get-position") as Promise<[number, number]>,
  getScreenBounds: () =>
    ipcRenderer.invoke("window:get-screen-bounds") as Promise<Electron.Rectangle>,
  showContextMenu: () => ipcRenderer.send("menu:context"),
  onFrequencyChange: (callback: (frequency: Frequency) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, frequency: Frequency) => callback(frequency);
    ipcRenderer.on("settings:frequency", listener);
    return () => ipcRenderer.removeListener("settings:frequency", listener);
  }
});
