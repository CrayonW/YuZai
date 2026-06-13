import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const candidates = [
  "assets/hyperframes",
  "assets/references/action-sheets",
  "assets/references/cat-sprite-backups",
  "assets/references/cat-sprite-preview",
  "assets/references/cat-sprite-work",
  "assets/references/video-reference",
  "assets/sprites/dragging",
  "assets/sprites/idle",
  "assets/sprites/shy",
  "assets/sprites/sleep",
  "assets/sprites/sleeping",
  "assets/sprites/sleepy",
  "assets/sprites/surprised",
  "assets/sprites/teaser",
  "assets/sprites/waking",
  "assets/sprites/walk",
  "assets/sprites/walk_left",
  "assets/sprites/walking",
  "assets/sprites/waving",
];

const existing = candidates
  .map((relativePath) => {
    const absolutePath = join(root, relativePath);
    if (!existsSync(absolutePath)) return null;

    const stats = statSync(absolutePath);
    return {
      relativePath,
      type: stats.isDirectory() ? "directory" : "file",
    };
  })
  .filter(Boolean);

console.log(
  JSON.stringify(
    {
      dryRun: true,
      keep: [
        "assets/origin",
        "assets/runtime/animations",
        "docs",
        "src",
        "electron",
        "scripts",
      ],
      candidates: existing,
    },
    null,
    2,
  ),
);
