import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const spriteRoot = join(root, "assets", "sprites");
const frameCount = 16;

const aliases = [
  { target: "walking", source: "walk" }
];

for (const alias of aliases) {
  const sourceDir = join(spriteRoot, alias.source);
  const targetDir = join(spriteRoot, alias.target);
  if (!existsSync(sourceDir)) throw new Error(`Missing source sprite folder: ${sourceDir}`);

  mkdirSync(targetDir, { recursive: true });
  for (const file of readdirSync(targetDir)) {
    if (file.endsWith(".png")) rmSync(join(targetDir, file));
  }

  for (let index = 1; index <= frameCount; index += 1) {
    const suffix = String(index).padStart(4, "0");
    copyFileSync(
      join(sourceDir, `${alias.source}_${suffix}.png`),
      join(targetDir, `${alias.target}_${suffix}.png`)
    );
  }
}
