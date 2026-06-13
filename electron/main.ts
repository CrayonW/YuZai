import { app, BrowserWindow, ipcMain, Menu, screen } from "electron";
import { writeFileSync } from "node:fs";
import path from "node:path";

type Frequency = "low" | "normal" | "high";

let petWindow: BrowserWindow | null = null;
let actionFrequency: Frequency = "normal";

const WINDOW_SIZE = { width: 280, height: 280 };

function createPetWindow(): void {
  const display = screen.getPrimaryDisplay();
  const { workArea } = display;

  petWindow = new BrowserWindow({
    width: WINDOW_SIZE.width,
    height: WINDOW_SIZE.height,
    x: workArea.x + workArea.width - WINDOW_SIZE.width - 80,
    y: workArea.y + workArea.height - WINDOW_SIZE.height - 80,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.setAlwaysOnTop(true, "screen-saver");
  petWindow.setIgnoreMouseEvents(true, { forward: true });
  petWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`);
  });
  petWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[renderer:load-failed] ${errorCode} ${errorDescription}: ${validatedURL}`);
  });
  petWindow.webContents.on("did-finish-load", () => {
    const capturePath = process.env.YUZAI_CAPTURE_PATH;
    if (!capturePath) return;

    setTimeout(() => {
      petWindow?.webContents.capturePage()
        .then((image) => {
          writeFileSync(capturePath, image.toPNG());
          console.log(`[capture] ${capturePath}`);
          app.quit();
        })
        .catch((error: unknown) => {
          console.error("[capture:failed]", error);
          app.quit();
        });
    }, 1200);
  });
  petWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
}

function resetPosition(): void {
  if (!petWindow) return;
  const { workArea } = screen.getPrimaryDisplay();
  petWindow.setPosition(
    workArea.x + workArea.width - WINDOW_SIZE.width - 80,
    workArea.y + workArea.height - WINDOW_SIZE.height - 80
  );
}

function showContextMenu(): void {
  if (!petWindow) return;

  const menu = Menu.buildFromTemplate([
    {
      label: "隐藏宠物",
      click: () => petWindow?.hide()
    },
    {
      label: "显示宠物",
      click: () => petWindow?.show()
    },
    {
      label: "重置位置",
      click: resetPosition
    },
    {
      label: "动作频率",
      submenu: [
        frequencyItem("低", "low"),
        frequencyItem("标准", "normal"),
        frequencyItem("高", "high")
      ]
    },
    { type: "separator" },
    {
      label: "退出程序",
      click: () => app.quit()
    }
  ]);

  menu.popup({ window: petWindow });
}

function frequencyItem(label: string, value: Frequency): Electron.MenuItemConstructorOptions {
  return {
    label,
    type: "radio",
    checked: actionFrequency === value,
    click: () => {
      actionFrequency = value;
      petWindow?.webContents.send("settings:frequency", value);
    }
  };
}

app.whenReady().then(() => {
  createPetWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createPetWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("window:get-position", () => petWindow?.getPosition() ?? [0, 0]);
ipcMain.handle("window:get-screen-bounds", () => screen.getPrimaryDisplay().workArea);

ipcMain.on("window:set-interactive", (_event, interactive: boolean) => {
  petWindow?.setIgnoreMouseEvents(!interactive, { forward: true });
});

ipcMain.on("window:move-to", (_event, point: { x: number; y: number }) => {
  petWindow?.setPosition(Math.round(point.x), Math.round(point.y));
});

ipcMain.on("menu:context", showContextMenu);
