import { request } from "node:https";

const repo = "CrayonW/YuZai";
const args = new Map();

for (let index = 2; index < process.argv.length; index += 1) {
  const key = process.argv[index];
  if (!key.startsWith("--")) continue;
  const next = process.argv[index + 1];
  if (next && !next.startsWith("--")) {
    args.set(key, next);
    index += 1;
  } else {
    args.set(key, true);
  }
}

const workflow = args.get("--workflow") ?? "windows-package.yml";
const defaultRef = "refs/heads/main";
const ref = args.get("--ref") ?? defaultRef;
const dispatchRef = ref.startsWith("refs/") ? ref : `refs/heads/${ref}`;
const confirm = args.has("--confirm");
const token = process.env.GITHUB_TOKEN;

if (!confirm) {
  console.log(JSON.stringify({
    ok: true,
    dryRun: true,
    repo,
    workflow,
    ref: dispatchRef,
    event: "workflow_dispatch",
    message: "Add --confirm with GITHUB_TOKEN to dispatch the workflow."
  }, null, 2));
  process.exit(0);
}

if (!token) {
  console.error(JSON.stringify({
    ok: false,
    error: "Missing GITHUB_TOKEN; refusing to dispatch workflow."
  }, null, 2));
  process.exit(1);
}

const path = `/repos/${repo}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`;
await dispatchWorkflow(path, { ref: dispatchRef });

console.log(JSON.stringify({
  ok: true,
  dryRun: false,
  repo,
  workflow,
  ref: dispatchRef,
  event: "workflow_dispatch",
  apiPath: path,
  message: "Workflow dispatch accepted. Run npm run actions:windows-status to check run and artifact status."
}, null, 2));

function dispatchWorkflow(path, payload) {
  const body = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: "api.github.com",
        path,
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "User-Agent": "yuzai-desktop-pet-actions-dispatch"
        }
      },
      (res) => {
        let responseBody = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          if (res.statusCode === 204) {
            resolve();
            return;
          }
          let json = {};
          try {
            json = responseBody ? JSON.parse(responseBody) : {};
          } catch {
            json = { message: responseBody };
          }
          const message = json.message ?? `HTTP ${res.statusCode}`;
          reject(new Error(`GitHub API request failed for ${path}: ${message}`));
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
