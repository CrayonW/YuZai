import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KlingClient } from "./client.mjs";
import { loadDotEnv } from "./env.mjs";
import { loadActionPlan, selectActions } from "./prompt-plan.mjs";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

async function main() {
  loadDotEnv(root);
  const options = parseArgs(process.argv.slice(2));
  const plan = loadActionPlan(root, options.plan);
  const actions = selectActions(plan, options);

  if (options.dryRun) {
    printDryRun(plan, actions);
    return;
  }

  const client = new KlingClient(root);
  for (const action of actions) {
    console.log(`[kling] generating ${action.action} -> ${action.output}`);
    const result = await client.generate(action, plan, { force: options.force });
    if (result.skipped) {
      console.log(`[kling] skipped existing output ${action.output}`);
    } else {
      console.log(`[kling] completed ${action.action}: ${action.output} (${result.size} bytes)`);
    }
  }
}

function parseArgs(args) {
  const options = {
    action: null,
    all: false,
    dryRun: false,
    force: false,
    plan: "docs/kling-action-generation-plan.json"
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--action") {
      options.action = args[++index];
    } else if (arg === "--all") {
      options.all = true;
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

  if (options.all && options.action) {
    throw new Error("Use either --all or --action, not both");
  }
  return options;
}

function printDryRun(plan, actions) {
  console.log(JSON.stringify({
    ok: true,
    referenceImage: plan.referenceImage,
    referenceExists: existsSync(join(root, plan.referenceImage)),
    outputRoot: plan.outputRoot,
    actionCount: actions.length,
    actions: actions.map((action) => ({
      action: action.action,
      category: action.category,
      loop: action.loop,
      output: action.output,
      promptPreview: action.fullPrompt.slice(0, 180),
      negativePromptPreview: action.negativePrompt.slice(0, 120)
    }))
  }, null, 2));
}

main().catch((error) => {
  console.error(`[kling:error] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
