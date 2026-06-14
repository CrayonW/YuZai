import { app, BrowserWindow, ipcMain, Menu, nativeImage, screen, Tray } from "electron";
import { writeFileSync } from "node:fs";
import path from "node:path";

type Frequency = "low" | "normal" | "high";
type PetSize = 220 | 280 | 340;

let petWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let actionFrequency: Frequency = "normal";
let petSize: PetSize = 280;
let mouseProximityTimer: NodeJS.Timeout | null = null;
let lastMouseNear = false;
let testMouseNearUntil = 0;

const SIZE_OPTIONS: Array<{ label: string; value: PetSize }> = [
  { label: "小", value: 220 },
  { label: "标准", value: 280 },
  { label: "大", value: 340 }
];

function windowSize(): { width: number; height: number } {
  return { width: petSize, height: petSize };
}

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function createPetWindow(): void {
  const display = screen.getPrimaryDisplay();
  const { workArea } = display;
  const size = windowSize();

  petWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    x: workArea.x + workArea.width - size.width - 80,
    y: workArea.y + workArea.height - size.height - 80,
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
  startMouseProximityWatcher();
  petWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`);
  });
  petWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[renderer:load-failed] ${errorCode} ${errorDescription}: ${validatedURL}`);
  });
  petWindow.webContents.on("did-finish-load", () => {
    const capturePath = process.env.YUZAI_CAPTURE_PATH;
    const testHideMs = envNumber("YUZAI_TEST_HIDE_MS", 0);
    const testShowMs = envNumber("YUZAI_TEST_SHOW_MS", 0);
    if (testHideMs > 0) {
      setTimeout(() => {
        hidePet();
        console.log("[test] pet hidden");
      }, testHideMs);
    }
    if (testShowMs > 0) {
      setTimeout(() => {
        showPet();
        console.log("[test] pet shown");
      }, testShowMs);
    }

    const testMouseProximityMs = envNumber("YUZAI_TEST_MOUSE_PROXIMITY_MS", 0);
    if (testMouseProximityMs > 0) {
      setTimeout(() => {
        if (!petWindow || petWindow.isDestroyed()) return;
        testMouseNearUntil = Date.now() + envNumber("YUZAI_TEST_MOUSE_PROXIMITY_HOLD_MS", 2200);
        lastMouseNear = true;
        petWindow.webContents.send("mouse:proximity", true);
        console.log("[test] mouse:proximity true");
      }, testMouseProximityMs);
    }

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
    }, envNumber("YUZAI_CAPTURE_DELAY_MS", 1200));
  });
  petWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
}

function createTray(): void {
  if (tray) return;

  const iconPath = path.join(__dirname, "../assets/runtime/animations/idle_primary/frames/frame_000001.png");
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 });
  tray = new Tray(icon);
  tray.setToolTip("鱼仔桌面宠物");
  tray.on("click", showPet);
  updateTrayMenu();
}

function updateTrayMenu(): void {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate(menuTemplate()));
}

function startMouseProximityWatcher(): void {
  if (mouseProximityTimer) return;

  mouseProximityTimer = setInterval(() => {
    if (!petWindow || petWindow.isDestroyed() || !petWindow.isVisible()) return;

    const cursor = screen.getCursorScreenPoint();
    const bounds = petWindow.getBounds();
    const margin = Math.round(Math.max(bounds.width, bounds.height) * 0.28);
    const testNear = Date.now() < testMouseNearUntil;
    const near =
      testNear ||
      (cursor.x >= bounds.x - margin &&
        cursor.x <= bounds.x + bounds.width + margin &&
        cursor.y >= bounds.y - margin &&
        cursor.y <= bounds.y + bounds.height + margin);

    if (near === lastMouseNear) return;
    lastMouseNear = near;
    petWindow.webContents.send("mouse:proximity", near);
  }, 120);
}

function resetPosition(): void {
  if (!petWindow) return;
  const { workArea } = screen.getPrimaryDisplay();
  const size = windowSize();
  petWindow.setPosition(
    workArea.x + workArea.width - size.width - 80,
    workArea.y + workArea.height - size.height - 80
  );
}

function showPet(): void {
  if (!petWindow || petWindow.isDestroyed()) {
    createPetWindow();
    updateTrayMenu();
    return;
  }

  petWindow.show();
  petWindow.focus();
  petWindow.setAlwaysOnTop(true, "screen-saver");
  updateTrayMenu();
}

function hidePet(): void {
  petWindow?.hide();
  updateTrayMenu();
}

function showContextMenu(): void {
  if (!petWindow) return;
  Menu.buildFromTemplate(menuTemplate()).popup({ window: petWindow });
}

function menuTemplate(): Electron.MenuItemConstructorOptions[] {
  const visible = Boolean(petWindow && !petWindow.isDestroyed() && petWindow.isVisible());
  return [
    {
      label: "隐藏宠物",
      enabled: visible,
      click: hidePet
    },
    {
      label: "显示宠物",
      enabled: !visible,
      click: showPet
    },
    {
      label: "重置位置",
      click: resetPosition
    },
    {
      label: "角色大小",
      submenu: SIZE_OPTIONS.map(sizeItem)
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
  ];
}

function frequencyItem(label: string, value: Frequency): Electron.MenuItemConstructorOptions {
  return {
    label,
    type: "radio",
    checked: actionFrequency === value,
    click: () => {
      actionFrequency = value;
      petWindow?.webContents.send("settings:frequency", value);
      updateTrayMenu();
    }
  };
}

function sizeItem(option: { label: string; value: PetSize }): Electron.MenuItemConstructorOptions {
  return {
    label: option.label,
    type: "radio",
    checked: petSize === option.value,
    click: () => {
      petSize = option.value;
      const [x, y] = petWindow?.getPosition() ?? [0, 0];
      petWindow?.setBounds({ x, y, width: petSize, height: petSize });
      petWindow?.webContents.send("settings:size", petSize);
      updateTrayMenu();
    }
  };
}

app.whenReady().then(() => {
  createPetWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createPetWindow();
    showPet();
  });
});

app.on("window-all-closed", () => {
  if (mouseProximityTimer) {
    clearInterval(mouseProximityTimer);
    mouseProximityTimer = null;
  }
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("window:get-position", () => petWindow?.getPosition() ?? [0, 0]);
ipcMain.handle("window:get-size", () => petSize);
ipcMain.handle("window:get-screen-bounds", () => screen.getPrimaryDisplay().workArea);

ipcMain.on("window:set-interactive", (_event, interactive: boolean) => {
  petWindow?.setIgnoreMouseEvents(!interactive, { forward: true });
});

ipcMain.on("window:move-to", (_event, point: { x: number; y: number }) => {
  petWindow?.setPosition(Math.round(point.x), Math.round(point.y));
});

ipcMain.on("menu:context", showContextMenu);
