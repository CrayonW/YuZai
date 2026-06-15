import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KlingClient } from "./client.mjs";
import { loadDotEnv } from "./env.mjs";
import { selectBatchActions } from "./batch-plan.mjs";
import { loadActionPlan } from "./prompt-plan.mjs";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

async function main() {
  loadDotEnv(root);
  const options = parseArgs(process.argv.slice(2));
  const plan = loadActionPlan(root, options.plan);
  const batches = JSON.parse(readFileSync(join(root, options.batches), "utf8"));
  const actions = selectBatchActions(plan, batches, options);

  if (options.dryRun) {
    printDryRun(plan, batches, options, actions);
    return;
  }

  const client = new KlingClient(root);
  for (const action of actions) {
    console.log(`[kling:batch] generating ${action.action} -> ${action.output}`);
    const result = await client.generate(action, plan, { force: options.force });
    if (result.skipped) {
      console.log(`[kling:batch] skipped existing output ${action.output}`);
    } else {
      console.log(`[kling:batch] completed ${action.action}: ${action.output} (${result.size} bytes)`);
    }
  }
}

function parseArgs(args) {
  const options = {
    batch: "",
    batches: "docs/kling-generation-batches.json",
    dryRun: false,
    force: false,
    plan: "docs/kling-action-generation-plan.json"
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--batch") {
      options.batch = args[++index];
    } else if (arg === "--batches") {
      options.batches = args[++index];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--plan") {
      options.plan = args[++index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.batch) throw new Error("Pass --batch <number-or-id>");
  return options;
}

function printDryRun(plan, batches, options, actions) {
  const batch = batches.batches.find((candidate, index) => String(index + 1) === options.batch || candidate.id === options.batch || candidate.name === options.batch);
  console.log(JSON.stringify({
    ok: true,
    batch: batch ? { id: batch.id, name: batch.name, reason: batch.reason } : options.batch,
    referenceImage: plan.referenceImage,
    referenceExists: existsSync(join(root, plan.referenceImage)),
    actionCount: actions.length,
    actions: actions.map((action) => ({
      action: action.action,
      category: action.category,
      durationSeconds: action.durationSeconds,
      output: action.output,
      command: `npm run kling:generate -- --action ${action.action}`,
      promptPreview: action.fullPrompt.slice(0, 180)
    }))
  }, null, 2));
}

main().catch((error) => {
  console.error(`[kling:batch:error] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
