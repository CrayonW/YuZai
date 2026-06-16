export function buildKlingAuthDiagnostics({
  accessKey,
  secretKey,
  baseUrl,
  probePath,
  status,
  kind,
  message,
  serverDate,
  nowMs = Date.now()
}) {
  const nowSeconds = Math.floor(nowMs / 1000);
  const tokenNotBeforeSeconds = nowSeconds - 5;
  const tokenExpiresSeconds = nowSeconds + 1800;
  const serverMs = serverDate ? Date.parse(serverDate) : NaN;
  const serverClockSkewSeconds = Number.isFinite(serverMs) ? Math.round((serverMs - nowMs) / 1000) : null;

  return {
    accessKeyConfigured: !!accessKey,
    secretKeyConfigured: !!secretKey,
    accessKeyLength: accessKey?.length ?? 0,
    secretKeyLength: secretKey?.length ?? 0,
    baseUrl,
    probePath,
    probeUrl: `${baseUrl}${probePath}`,
    status,
    kind,
    message,
    serverDate,
    serverClockSkewSeconds,
    jwt: {
      algorithm: "HS256",
      ttlSeconds: tokenExpiresSeconds - nowSeconds,
      notBeforeOffsetSeconds: tokenNotBeforeSeconds - nowSeconds,
      issuedAtIso: new Date(nowSeconds * 1000).toISOString(),
      notBeforeIso: new Date(tokenNotBeforeSeconds * 1000).toISOString(),
      expiresAtIso: new Date(tokenExpiresSeconds * 1000).toISOString()
    },
    recommendations: recommendationsFor({ status, kind, serverClockSkewSeconds })
  };
}

function recommendationsFor({ status, kind, serverClockSkewSeconds }) {
  if (status === 401 || kind === "auth_failed") {
    const items = [
      "确认 Access Key 与 Secret Key 来自同一组可灵开放平台 API Key，Secret Key 复制完整，并确认该 Key 已开通开放平台 API 权限。",
      "确认该 Key 不是仅能用于网页端或其他产品入口的账号凭据。",
      "确认 KLING_API_BASE_URL 和 image2video query path 与当前可灵开放平台文档一致。"
    ];
    if (typeof serverClockSkewSeconds === "number" && Math.abs(serverClockSkewSeconds) > 60) {
      items.push("本机时间与可灵服务端时间差超过 60 秒，请先校准系统时间后重试。");
    }
    return items;
  }

  if (kind === "network_error") {
    return [
      "检查当前网络是否可以访问可灵开放平台 API。",
      "如果在受限环境中运行，确认命令拥有网络访问权限后重试。"
    ];
  }

  return [
    "鉴权已被服务端接受，可以继续执行 `npm run kling:preflight -- --batch 1` 或第一批生成命令。"
  ];
}
