import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const releaseRoot = join(root, "release");

run("package:dir", "npm", ["run", "package:dir"]);

const appAsarPaths = findFiles(releaseRoot, "app.asar");
const failures = [];

if (appAsarPaths.length === 0) {
  failures.push("release 中没有找到 app.asar");
}

for (const appAsarPath of appAsarPaths) {
  const entries = listAsar(appAsarPath);
  const requiredEntries = [
    "/dist/electron/main.js",
    "/dist/electron/preload.js",
    "/dist/renderer/index.html",
    "/dist/renderer/main.js",
    "/dist/assets/runtime/animations/manifest.json"
  ];

  for (const required of requiredEntries) {
    if (!entries.includes(required)) {
      failures.push(`${relative(root, appAsarPath)} 缺少 ${required}`);
    }
  }

  const forbiddenPatterns = [
    /\/dist\/assets\/origin\//,
    /\/assets\/origin\//,
    /generated\/kling/,
    /\.mp4$/i
  ];
  for (const entry of entries) {
    if (forbiddenPatterns.some((pattern) => pattern.test(entry))) {
      failures.push(`${relative(root, appAsarPath)} 不应包含 ${entry}`);
    }
  }
}

const iconFiles = findFiles(releaseRoot, process.platform === "darwin" ? "icon.icns" : "icon.ico");
if (iconFiles.length === 0) {
  failures.push(`release 中没有找到 ${process.platform === "darwin" ? "icon.icns" : "icon.ico"}`);
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  appAsar: appAsarPaths.map((filePath) => relative(root, filePath)),
  icons: iconFiles.map((filePath) => relative(root, filePath))
}, null, 2));

function run(label, command, args) {
  console.log(`\n[validate:package] ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function listAsar(appAsarPath) {
  const asarBin = join(root, "node_modules", ".bin", process.platform === "win32" ? "asar.cmd" : "asar");
  const result = spawnSync(asarBin, ["list", appAsarPath], {
    cwd: root,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(`无法读取 ${appAsarPath}: ${result.stderr || result.stdout}`);
  }

  return result.stdout.split(/\r?\n/).filter(Boolean);
}

function findFiles(startDir, fileName) {
  if (!existsSync(startDir)) return [];
  const matches = [];
  const stack = [startDir];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current)) {
      const fullPath = join(current, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        stack.push(fullPath);
      } else if (entry === fileName) {
        matches.push(fullPath);
      }
    }
  }

  return matches.sort();
}
