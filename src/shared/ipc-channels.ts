// IPC channel constants — single source of truth for main ↔ renderer communication
export const IPC = {
  // Window control
  WINDOW_MOVE: 'window:move',
  WINDOW_GET_POSITION: 'window:get-position',
  WINDOW_GET_BOUNDS: 'window:get-bounds',
  WINDOW_RESIZE: 'window:resize',

  // Mouse tracking
  MOUSE_GET_POSITION: 'mouse:get-position',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:get-all',

  // Events from main to renderer
  FEED_TRIGGER: 'feed:trigger',
  SETTINGS_CHANGED: 'settings:changed',
  PAUSE_TOGGLE: 'pause:toggle',
} as const;
