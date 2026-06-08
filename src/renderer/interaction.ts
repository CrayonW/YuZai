import { CatStateMachine } from './state-machine';
import { CatRenderer } from './cat-renderer';
import { AudioManager } from './audio-manager';
import { Point, CONFIG, CatSize } from './types';

export class InteractionManager {
  private isDragging = false;
  private dragStartPos: Point = { x: 0, y: 0 };
  private mouseDownPos: Point = { x: 0, y: 0 };
  private mouseInWindow = false;
  private lastMouseRel: Point = { x: 0, y: 0 };
  private lastClickTime = 0;  // for double-click detection
  private cleanupFns: (() => void)[] = [];
  private contextMenu: HTMLElement | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private fsm: CatStateMachine,
    private renderer: CatRenderer,
    private audio: AudioManager,
  ) {
    this.bindEvents();
    this.bindIPC();
    this.bindContextMenu();
  }

  // ── DOM events ──

  private bindEvents() {
    const onMouseDown = (e: MouseEvent) => {
      this.mouseDownPos = { x: e.clientX, y: e.clientY };
      this.dragStartPos = { x: e.clientX, y: e.clientY };

      if (this.fsm.isMouseOverCat(e.clientX, e.clientY)) {
        this.isDragging = false; // wait for movement to confirm drag
        this.canvas.classList.add('grabbable');
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      this.mouseInWindow = true;
      this.lastMouseRel = { x: e.clientX, y: e.clientY };

      // Drag detection
      if (this.canvas.classList.contains('grabbable')) {
        const dx = e.clientX - this.dragStartPos.x;
        const dy = e.clientY - this.dragStartPos.y;
        if (Math.abs(dx) > CONFIG.dragThreshold || Math.abs(dy) > CONFIG.dragThreshold) {
          // Start drag
          this.isDragging = true;
          this.canvas.classList.remove('grabbable');
          this.canvas.classList.add('dragging');
          // Get current window position for drag offset calculation
          window.yuZaiAPI.getWindowPosition().then((winPos) => {
            const offsetX = e.screenX - winPos.x;
            const offsetY = e.screenY - winPos.y;
            this.fsm.startDrag({ x: offsetX, y: offsetY });
          });
        }
      }

      // Drag movement
      if (this.isDragging) {
        const offset = this.fsm.getDragOffset();
        const newX = e.screenX - offset.x;
        const newY = e.screenY - offset.y;
        window.yuZaiAPI.moveWindow(newX, newY);
        this.fsm.screenPos = { x: newX + offset.x, y: newY + offset.y };
      }

      // Purr detection (mouse hovering over cat)
      if (!this.isDragging && this.fsm.isMouseOverCat(e.clientX, e.clientY)) {
        this.fsm.startPurr();
        this.audio.startPurr();
      } else if (this.fsm.state === 'purring') {
        this.fsm.stopPurr();
        this.audio.stopPurr();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      this.canvas.classList.remove('grabbable', 'dragging');

      if (this.isDragging) {
        this.isDragging = false;
        this.fsm.stopDrag();
        return;
      }

      // Check if it was a click (little movement)
      const dx = e.clientX - this.mouseDownPos.x;
      const dy = e.clientY - this.mouseDownPos.y;
      if (Math.abs(dx) < CONFIG.dragThreshold && Math.abs(dy) < CONFIG.dragThreshold) {
        if (this.fsm.isMouseOverCat(e.clientX, e.clientY)) {
          const now = performance.now();
          // Double-click detection
          if (now - this.lastClickTime < CONFIG.dblClickWindow) {
            this.lastClickTime = 0;
            if (this.fsm.roll()) {
              this.audio.playMeow();
            }
          } else {
            this.lastClickTime = now;
            if (this.fsm.onClick()) {
              this.audio.playMeow();
            }
          }
        }
      }
    };

    const onMouseLeave = () => {
      this.mouseInWindow = false;
      if (this.fsm.state === 'purring') {
        this.fsm.stopPurr();
        this.audio.stopPurr();
      }
    };

    const onMouseEnter = () => { this.mouseInWindow = true; };

    this.canvas.addEventListener('mousedown', onMouseDown);
    this.canvas.addEventListener('mousemove', onMouseMove);
    this.canvas.addEventListener('mouseup', onMouseUp);
    this.canvas.addEventListener('mouseleave', onMouseLeave);
    this.canvas.addEventListener('mouseenter', onMouseEnter);

    // Prevent default drag behavior (image drag, text selection)
    this.canvas.addEventListener('dragstart', (e) => e.preventDefault());

    this.cleanupFns.push(() => {
      this.canvas.removeEventListener('mousedown', onMouseDown);
      this.canvas.removeEventListener('mousemove', onMouseMove);
      this.canvas.removeEventListener('mouseup', onMouseUp);
      this.canvas.removeEventListener('mouseleave', onMouseLeave);
      this.canvas.removeEventListener('mouseenter', onMouseEnter);
    });
  }

  // ── Context menu ──

  private bindContextMenu(): void {
    this.contextMenu = document.getElementById('context-menu');
    if (!this.contextMenu) return;

    // Prevent default browser context menu on canvas
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (this.fsm.isMouseOverCat(e.clientX, e.clientY)) {
        this.showContextMenu(e.clientX, e.clientY);
      }
    };

    // Click on menu item
    const onMenuClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-action');
      if (!action) return;

      this.hideContextMenu();
      this.handleMenuAction(action);
    };

    // Click elsewhere hides menu
    const onClickOutside = (_e: MouseEvent) => {
      this.hideContextMenu();
    };

    this.canvas.addEventListener('contextmenu', onContextMenu);
    this.contextMenu.addEventListener('click', onMenuClick);
    document.addEventListener('click', onClickOutside);

    this.cleanupFns.push(() => {
      this.canvas.removeEventListener('contextmenu', onContextMenu);
      this.contextMenu?.removeEventListener('click', onMenuClick);
      document.removeEventListener('click', onClickOutside);
    });
  }

  private showContextMenu(x: number, y: number): void {
    if (!this.contextMenu) return;
    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;
    this.contextMenu.classList.remove('hidden');
  }

  private hideContextMenu(): void {
    this.contextMenu?.classList.add('hidden');
  }

  private handleMenuAction(action: string): void {
    switch (action) {
      case 'feed':
        this.fsm.feed();
        break;
      case 'size-small':
        this.changeSize('small');
        break;
      case 'size-medium':
        this.changeSize('medium');
        break;
      case 'size-large':
        this.changeSize('large');
        break;
      case 'pause':
        this.fsm.paused = !this.fsm.paused;
        break;
      case 'quit':
        window.yuZaiAPI.quitApp();
        break;
    }
  }

  private async changeSize(size: CatSize): Promise<void> {
    this.fsm.setSize(size);
    this.renderer.setSize(size);
    await window.yuZaiAPI.setSetting('catSize', size);
    await window.yuZaiAPI.resizeWindow(size);
  }

  // ── IPC events from main process ──

  private bindIPC() {
    const unsubFeed = window.yuZaiAPI.onFeedTrigger(() => {
      this.fsm.feed();
    });
    this.cleanupFns.push(unsubFeed);

    const unsubPause = window.yuZaiAPI.onPauseToggle((paused) => {
      this.fsm.paused = paused;
    });
    this.cleanupFns.push(unsubPause);

    const unsubSettings = window.yuZaiAPI.onSettingsChanged(async (s) => {
      if (s.catSize) {
        await this.changeSize(s.catSize as CatSize);
      }
    });
    this.cleanupFns.push(unsubSettings);
  }

  // ── Public ──

  isMouseInWindow(): boolean { return this.mouseInWindow; }
  getLastMouseRel(): Point { return this.lastMouseRel; }

  destroy() {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }
}
