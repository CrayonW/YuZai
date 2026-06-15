import { spawnSync } from "node:child_process";

const steps = [
  ["validate:all", ["npm", "run", "validate:all"]],
  ["validate:package", ["npm", "run", "validate:package"]]
];

for (const [name, command] of steps) {
  console.log(`\n[validate:release] ${name}`);
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    stdio: "inherit"
  });

  if (result.status !== 0) {
    console.error(`\n[validate:release] failed at ${name}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\n[validate:release] ok");
