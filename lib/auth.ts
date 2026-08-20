import { cookies } from "next/headers";

export const SESSION_COOKIE = "mpm_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET no está definida. Añádela en .env.local (ver .env.example)."
    );
  }
  return secret;
}

// ---------------------------------------------------------------------------
// Sign/verify the session token with Web Crypto (HMAC-SHA256).
// Token format: `${payload}.${signatureHex}` where payload = "1:<issuedAt>".
// Works in both the Edge runtime (proxy) and Node (server actions).
// ---------------------------------------------------------------------------

async function hmac(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function createSessionToken(): Promise<string> {
  const payload = `1:${Date.now()}`;
  const sig = await hmac(payload, getSecret());
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx === -1) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (!payload.startsWith("1:")) return false;
  try {
    const issuedAt = Number(payload.slice(2));
    const now = Date.now();
    if (
      !Number.isSafeInteger(issuedAt) ||
      issuedAt > now + 60_000 ||
      now - issuedAt > SESSION_MAX_AGE_SECONDS * 1000
    ) {
      return false;
    }
    const expected = await hmac(payload, getSecret());
    return timingSafeEqual(sig, expected);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.AUTH_USERNAME ?? "admin";
  const expectedPass = process.env.AUTH_PASSWORD ?? "";
  if (!expectedPass) return false;
  return (
    timingSafeEqual(username, expectedUser) &&
    timingSafeEqual(password, expectedPass)
  );
}

// ---------------------------------------------------------------------------
// Session helpers (server-side, Node runtime)
// ---------------------------------------------------------------------------

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireAuthenticated() {
  if (!(await isAuthenticated())) {
    throw new Error("No autenticado");
  }
}
