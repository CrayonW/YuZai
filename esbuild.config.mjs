import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync } from 'fs';

// Ensure output directories exist
mkdirSync('dist/main', { recursive: true });
mkdirSync('dist/preload', { recursive: true });
mkdirSync('dist/renderer', { recursive: true });

// ── Main process ──
await esbuild.build({
  entryPoints: ['src/main/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: 'dist/main/index.js',
  external: ['electron'],
  sourcemap: true,
});

// ── Preload script ──
await esbuild.build({
  entryPoints: ['src/preload/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/preload/index.js',
  external: ['electron'],
  sourcemap: true,
});

// ── Renderer (browser) ──
await esbuild.build({
  entryPoints: ['src/renderer/app.ts'],
  bundle: true,
  platform: 'browser',
  target: 'chrome120',
  outfile: 'dist/renderer/app.js',
  sourcemap: true,
});

// ── Copy static renderer files ──
copyFileSync('src/renderer/index.html', 'dist/renderer/index.html');
copyFileSync('src/renderer/style.css', 'dist/renderer/style.css');

console.log('✅ Build complete!');
