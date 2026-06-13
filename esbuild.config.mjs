import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname } from "node:path";

const isWatch = process.argv.includes("--watch");

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/electron", { recursive: true });
mkdirSync("dist/renderer", { recursive: true });

const common = {
  bundle: true,
  sourcemap: true,
  logLevel: "info"
};

await build({
  ...common,
  entryPoints: ["electron/main.ts"],
  outfile: "dist/electron/main.js",
  platform: "node",
  target: "node20",
  external: ["electron"]
});

await build({
  ...common,
  entryPoints: ["electron/preload.ts"],
  outfile: "dist/electron/preload.js",
  platform: "node",
  target: "node20",
  external: ["electron"]
});

await build({
  ...common,
  entryPoints: ["src/renderer/main.ts"],
  outfile: "dist/renderer/main.js",
  platform: "browser",
  target: "chrome120",
  format: "iife"
});

cpSync("src/renderer/index.html", "dist/renderer/index.html");
cpSync("src/renderer/styles.css", "dist/renderer/styles.css");
cpSync("assets", "dist/assets", { recursive: true });

if (isWatch) {
  console.log("Watch mode is not implemented yet. Run npm run dev after edits.");
}
