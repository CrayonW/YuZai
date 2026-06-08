import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import { CatSize, loadSettings } from './settings';
import { IPC } from '../shared/ipc-channels';

function buildTrayIcon(): nativeImage {
  // Programmatically build a small orange cat-paw tray icon (16×16 PNG)
  // Fallback: a simple coloured square if canvas isn't available
  const size = 16;
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const cx = x - 7.5, cy = y - 7.5;
      const d = Math.sqrt(cx * cx + cy * cy);
      // Main paw pad (large circle at bottom-center)
      const pawY = y > 8 && Math.abs(x - 8) < 4;
      // Toe beans (three small circles at top)
      const toe1 = Math.sqrt((x - 4) ** 2 + (y - 4) ** 2) < 3;
      const toe2 = Math.sqrt((x - 8) ** 2 + (y - 3) ** 2) < 3;
      const toe3 = Math.sqrt((x - 12) ** 2 + (y - 4) ** 2) < 3;
      const pad = d < 6 && y > 7;

      if (pad || toe1 || toe2 || toe3) {
        buf[i] = 255;     // R
        buf[i + 1] = 140; // G
        buf[i + 2] = 50;  // B
        buf[i + 3] = 255; // A
      } else {
        buf[i + 3] = 0;   // transparent
      }
    }
  }
  return nativeImage.createFromBuffer(buf, { width: size, height: size, scaleFactor: 2 });
}

export function createTray(mainWindow: BrowserWindow): Tray {
  const icon = buildTrayIcon();
  const tray = new Tray(icon);
  tray.setToolTip('鱼仔桌面宠物');

  function buildMenu(): Menu {
    const settings = loadSettings();

    return Menu.buildFromTemplate([
      {
        label: '🐟 喂食鱼仔',
        click: () => mainWindow.webContents.send(IPC.FEED_TRIGGER),
      },
      { type: 'separator' },
      {
        label: '鱼仔大小',
        submenu: [
          {
            label: '🐱 小',
            type: 'radio',
            checked: settings.catSize === 'small',
            click: () => mainWindow.webContents.send(IPC.SETTINGS_CHANGED, { catSize: 'small' as CatSize }),
          },
          {
            label: '🐱 中',
            type: 'radio',
            checked: settings.catSize === 'medium',
            click: () => mainWindow.webContents.send(IPC.SETTINGS_CHANGED, { catSize: 'medium' as CatSize }),
          },
          {
            label: '🐱 大',
            type: 'radio',
            checked: settings.catSize === 'large',
            click: () => mainWindow.webContents.send(IPC.SETTINGS_CHANGED, { catSize: 'large' as CatSize }),
          },
        ],
      },
      { type: 'separator' },
      {
        label: '⏸ 暂停动画',
        type: 'checkbox',
        checked: false,
        click: (menuItem) => mainWindow.webContents.send(IPC.PAUSE_TOGGLE, menuItem.checked),
      },
      { type: 'separator' },
      {
        label: '退出鱼仔',
        click: () => {
          // Save position before quit
          const [x, y] = mainWindow.getPosition();
          const { saveSettings } = require('./settings');
          saveSettings({ windowX: x, windowY: y });
          app.quit();
        },
      },
    ]);
  }

  tray.setContextMenu(buildMenu());

  // Rebuild menu each time it's opened so radio items reflect current state
  tray.on('right-click', () => {
    tray.setContextMenu(buildMenu());
  });

  return tray;
}
