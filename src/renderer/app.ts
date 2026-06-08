import './types'; // side-effect: global Window type augmentation
import { CatRenderer } from './cat-renderer';
import { CatStateMachine } from './state-machine';
import { InteractionManager } from './interaction';
import { AudioManager } from './audio-manager';
import { CatSize } from './types';

// ── Bootstrap ──

async function main() {
  const canvas = document.getElementById('pet-canvas') as HTMLCanvasElement;
  if (!canvas) throw new Error('Canvas #pet-canvas not found');

  // Load settings from main process
  const settings = await window.yuZaiAPI.getAllSettings();
  const catSize = (settings.catSize as CatSize) || 'medium';

  // Resize canvas to fill window
  resizeCanvas(canvas);

  // Core modules
  const renderer = new CatRenderer(canvas);
  renderer.setSize(catSize);

  const fsm = new CatStateMachine();
  fsm.setSize(catSize);

  const audio = new AudioManager();
  const interaction = new InteractionManager(canvas, fsm, renderer, audio);

  // Sync initial screen position
  const winPos = await window.yuZaiAPI.getWindowPosition();
  fsm.screenPos = {
    x: winPos.x + canvas.width / 2,
    y: winPos.y + canvas.height / 2,
  };

  // ── Main loop ──

  let lastTime = performance.now();

  function frame(now: number) {
    const rawDt = (now - lastTime) / 1000;
    const dt = Math.min(rawDt, 0.1); // cap to prevent spiral of death
    lastTime = now;

    // Ensure canvas matches window size
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      resizeCanvas(canvas);
    }

    // Get mouse position (screen coords + relative coords)
    const mouseRel = interaction.isMouseInWindow() ? interaction.getLastMouseRel() : null;

    // Async get mouse screen position for chase logic
    window.yuZaiAPI.getMousePosition().then((mouseScreen) => {
      // Update state machine
      const moveDelta = fsm.update(dt, mouseScreen, mouseRel, canvas.width, canvas.height);

      // Apply window movement
      if (moveDelta && (moveDelta.x !== 0 || moveDelta.y !== 0)) {
        const newX = fsm.screenPos.x - canvas.width / 2 + moveDelta.x;
        const newY = fsm.screenPos.y - canvas.height / 2 + moveDelta.y;
        window.yuZaiAPI.moveWindow(newX, newY);
        fsm.screenPos = { x: newX + canvas.width / 2, y: newY + canvas.height / 2 };
      }
    });

    // Render
    renderer.render(fsm.state, fsm.animTimer, dt, fsm.catPixelSize);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  // Handle window resize
  window.addEventListener('resize', () => resizeCanvas(canvas));
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

main().catch(console.error);
