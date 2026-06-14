import { app, BrowserWindow, ipcMain, Menu, nativeImage, screen, Tray } from "electron";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type Frequency = "low" | "normal" | "high";
type PetSize = 220 | 280 | 340;

interface PetSettings {
  petSize: PetSize;
  actionFrequency: Frequency;
  position: { x: number; y: number } | null;
}

let petWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let actionFrequency: Frequency = "normal";
let petSize: PetSize = 280;
let mouseProximityTimer: NodeJS.Timeout | null = null;
let savePositionTimer: NodeJS.Timeout | null = null;
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

function defaultSettings(): PetSettings {
  return {
    petSize: 280,
    actionFrequency: "normal",
    position: null
  };
}

function settingsPath(): string {
  return process.env.YUZAI_SETTINGS_PATH || path.join(app.getPath("userData"), "settings.json");
}

function loadSettings(): void {
  const settings = readSettings();
  petSize = settings.petSize;
  actionFrequency = settings.actionFrequency;
}

function readSettings(): PetSettings {
  const defaults = defaultSettings();
  const filePath = settingsPath();
  if (!existsSync(filePath)) return defaults;

  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as Partial<PetSettings>;
    return {
      petSize: isPetSize(parsed.petSize) ? parsed.petSize : defaults.petSize,
      actionFrequency: isFrequency(parsed.actionFrequency) ? parsed.actionFrequency : defaults.actionFrequency,
      position: isPosition(parsed.position) ? parsed.position : defaults.position
    };
  } catch (error: unknown) {
    console.warn("[settings] failed to read settings, using defaults", error);
    return defaults;
  }
}

function saveSettings(patch: Partial<PetSettings> = {}): void {
  const current = readSettings();
  const next: PetSettings = {
    petSize,
    actionFrequency,
    position: current.position,
    ...patch
  };
  const filePath = settingsPath();
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`);
}

function isFrequency(value: unknown): value is Frequency {
  return value === "low" || value === "normal" || value === "high";
}

function isPetSize(value: unknown): value is PetSize {
  return value === 220 || value === 280 || value === 340;
}

function isPosition(value: unknown): value is { x: number; y: number } {
  if (!value || typeof value !== "object") return false;
  const point = value as { x?: unknown; y?: unknown };
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

function savedOrDefaultPosition(workArea: Electron.Rectangle, size: { width: number; height: number }): { x: number; y: number } {
  const saved = readSettings().position;
  if (saved) {
    return clampPointToWorkArea(saved, workArea, size);
  }
  return {
    x: workArea.x + workArea.width - size.width - 80,
    y: workArea.y + workArea.height - size.height - 80
  };
}

function clampPointToWorkArea(
  point: { x: number; y: number },
  workArea: Electron.Rectangle,
  size: { width: number; height: number }
): { x: number; y: number } {
  return {
    x: Math.min(Math.max(Math.round(point.x), workArea.x), workArea.x + workArea.width - size.width),
    y: Math.min(Math.max(Math.round(point.y), workArea.y), workArea.y + workArea.height - size.height)
  };
}

function persistCurrentPosition(): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  const [x, y] = petWindow.getPosition();
  saveSettings({ position: { x, y } });
}

function schedulePositionSave(): void {
  if (savePositionTimer) clearTimeout(savePositionTimer);
  savePositionTimer = setTimeout(() => {
    savePositionTimer = null;
    persistCurrentPosition();
  }, 250);
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
  const position = savedOrDefaultPosition(workArea, size);

  petWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    x: position.x,
    y: position.y,
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
  petWindow.on("moved", schedulePositionSave);
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
    const testMoveMs = envNumber("YUZAI_TEST_MOVE_MS", 0);
    const testMoveX = envNumber("YUZAI_TEST_MOVE_X", Number.NaN);
    const testMoveY = envNumber("YUZAI_TEST_MOVE_Y", Number.NaN);
    if (testMoveMs > 0 && Number.isFinite(testMoveX) && Number.isFinite(testMoveY)) {
      setTimeout(() => {
        movePetTo({ x: testMoveX, y: testMoveY });
        console.log(`[test] pet moved ${Math.round(testMoveX)},${Math.round(testMoveY)}`);
      }, testMoveMs);
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
  persistCurrentPosition();
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

function movePetTo(point: { x: number; y: number }): void {
  petWindow?.setPosition(Math.round(point.x), Math.round(point.y));
  schedulePositionSave();
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
      saveSettings();
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
      saveSettings({ position: { x, y } });
      updateTrayMenu();
    }
  };
}

app.whenReady().then(() => {
  loadSettings();
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
  if (savePositionTimer) {
    clearTimeout(savePositionTimer);
    savePositionTimer = null;
  }
  persistCurrentPosition();
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("window:get-position", () => petWindow?.getPosition() ?? [0, 0]);
ipcMain.handle("window:get-size", () => petSize);
ipcMain.handle("window:get-screen-bounds", () => screen.getPrimaryDisplay().workArea);

ipcMain.on("window:set-interactive", (_event, interactive: boolean) => {
  petWindow?.setIgnoreMouseEvents(!interactive, { forward: true });
});

ipcMain.on("window:move-to", (_event, point: { x: number; y: number }) => {
  movePetTo(point);
});

ipcMain.on("menu:context", showContextMenu);
