export function selectBatchActionNames(batches, options) {
  const batch = findBatch(batches, options.batch);
  return batch.actions.map((item) => item.action);
}

export function selectBatchActions(plan, batches, options) {
  const actionsByName = new Map(plan.actions.map((action) => [action.action, action]));
  return selectBatchActionNames(batches, options).map((actionName) => {
    const action = actionsByName.get(actionName);
    if (!action) {
      throw new Error(`Action from batch not found in plan: ${actionName}`);
    }
    return action;
  });
}

function findBatch(batches, batchSelector) {
  if (!batchSelector) {
    throw new Error("Pass --batch <number-or-id>");
  }
  if (!Array.isArray(batches?.batches) || batches.batches.length === 0) {
    throw new Error("Batch plan must include batches");
  }

  const numericIndex = Number(batchSelector);
  if (Number.isInteger(numericIndex) && numericIndex >= 1) {
    const batch = batches.batches[numericIndex - 1];
    if (batch) return batch;
  }

  const batch = batches.batches.find((candidate) => candidate.id === batchSelector || candidate.name === batchSelector);
  if (batch) return batch;

  throw new Error(`Batch not found: ${batchSelector}`);
}
