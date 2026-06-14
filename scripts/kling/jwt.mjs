import { createHmac } from "node:crypto";

export function createKlingJwt(accessKey, secretKey, nowSeconds = Math.floor(Date.now() / 1000)) {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  const payload = {
    iss: accessKey,
    exp: nowSeconds + 1800,
    nbf: nowSeconds - 5
  };

  const encodedHeader = base64UrlJson(header);
  const encodedPayload = base64UrlJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secretKey).update(signingInput).digest("base64url");
  return `${signingInput}.${signature}`;
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
