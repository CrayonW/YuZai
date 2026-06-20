import { request } from "node:https";

const repo = "CrayonW/YuZai";
const args = new Map();

for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const workflow = args.get("--workflow") ?? "windows-package.yml";
const artifactName = args.get("--artifact") ?? "yuzai-windows-package";
const token = process.env.GITHUB_TOKEN;

function requestJson(path) {
  const headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "yuzai-desktop-pet-actions-status"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: "api.github.com",
        path,
        method: "GET",
        headers
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          let json;
          try {
            json = body ? JSON.parse(body) : {};
          } catch (error) {
            reject(new Error(`GitHub API returned invalid JSON for ${path}: ${error.message}`));
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const message = json.message ?? `HTTP ${res.statusCode}`;
            reject(new Error(`GitHub API request failed for ${path}: ${message}`));
            return;
          }
          resolve(json);
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

const runsPath = `/repos/${repo}/actions/workflows/${encodeURIComponent(workflow)}/runs?per_page=5`;
const runs = await requestJson(runsPath);
const latestRun = runs.workflow_runs?.[0] ?? null;
let artifacts = [];

if (latestRun) {
  const artifactsPath = `/repos/${repo}/actions/runs/${latestRun.id}/artifacts?per_page=20`;
  const artifactResponse = await requestJson(artifactsPath);
  artifacts = (artifactResponse.artifacts ?? []).filter((artifact) => artifact.name === artifactName);
}

console.log(JSON.stringify({
  ok: true,
  repo,
  workflow,
  artifactName,
  authenticated: Boolean(token),
  latestRun: latestRun
    ? {
        id: latestRun.id,
        name: latestRun.name,
        status: latestRun.status,
        conclusion: latestRun.conclusion,
        event: latestRun.event,
        headBranch: latestRun.head_branch,
        headSha: latestRun.head_sha,
        htmlUrl: latestRun.html_url,
        createdAt: latestRun.created_at,
        updatedAt: latestRun.updated_at
      }
    : null,
  artifacts: artifacts.map((artifact) => ({
    id: artifact.id,
    name: artifact.name,
    sizeInBytes: artifact.size_in_bytes,
    expired: artifact.expired,
    createdAt: artifact.created_at,
    expiresAt: artifact.expires_at,
    archiveDownloadUrl: artifact.archive_download_url
  }))
}, null, 2));
