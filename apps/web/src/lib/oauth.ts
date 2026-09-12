import {
  generateKeyPair,
  exportJWK,
  exportPKCS8,
  exportSPKI,
  importPKCS8,
  importSPKI,
  SignJWT,
  jwtVerify,
} from "jose";
import type { JWK } from "jose";
import { getPool } from "./db";

// --- Signing keys (persisted in Postgres, survive restarts) ---

let privateKey: CryptoKey;
let publicKey: CryptoKey;
let publicJwk: JWK;
let keyId: string;

async function ensureKeys() {
  if (privateKey) return;

  const kid = "quad-signing-key-1";
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT private_key_pem, public_key_pem FROM signing_keys WHERE kid = $1",
    [kid]
  );

  if (rows.length > 0) {
    privateKey = await importPKCS8(rows[0].private_key_pem, "RS256");
    publicKey = await importSPKI(rows[0].public_key_pem, "RS256");
  } else {
    const pair = await generateKeyPair("RS256", { extractable: true });
    privateKey = pair.privateKey;
    publicKey = pair.publicKey;
    const privPem = await exportPKCS8(privateKey);
    const pubPem = await exportSPKI(publicKey);
    await pool.query(
      "INSERT INTO signing_keys (kid, private_key_pem, public_key_pem) VALUES ($1, $2, $3) ON CONFLICT (kid) DO NOTHING",
      [kid, privPem, pubPem]
    );
  }

  keyId = kid;
  publicJwk = {
    ...(await exportJWK(publicKey)),
    kid: keyId,
    alg: "RS256",
    use: "sig",
  };
}

export async function getJwks() {
  await ensureKeys();
  return { keys: [publicJwk] };
}

// --- Shared types ---

export interface OAuthClient {
  clientId: string;
  clientSecret: string;
  name: string;
  redirectUris: string[];
  createdBy: string;
}

interface AuthCode {
  code: string;
  clientId: string;
  redirectUri: string;
  userId: string;
  userEmail: string;
  userName: string;
  scope: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  expiresAt: number;
}

// Auth codes are ephemeral (60s TTL), kept in memory
const g = globalThis as Record<string, unknown>;
if (!g.__quad_codes) g.__quad_codes = new Map<string, AuthCode>();
const authCodes = g.__quad_codes as Map<string, AuthCode>;

// --- Client registration (Postgres-backed) ---

export async function registerClient(opts: {
  name: string;
  redirectUris: string[];
  createdBy: string;
}): Promise<OAuthClient> {
  const clientId = `quad_${crypto.randomUUID().slice(0, 12)}`;
  const clientSecret = crypto.randomUUID();
  const pool = await getPool();
  await pool.query(
    `INSERT INTO oauth_clients (client_id, client_secret, name, redirect_uris, created_by)
     VALUES ($1, $2, $3, $4, $5)`,
    [clientId, clientSecret, opts.name, opts.redirectUris, opts.createdBy]
  );
  return { clientId, clientSecret, ...opts };
}

export async function getClient(clientId: string): Promise<OAuthClient | undefined> {
  const pool = await getPool();
  const { rows } = await pool.query(
    `SELECT client_id, client_secret, name, redirect_uris, created_by
     FROM oauth_clients WHERE client_id = $1`,
    [clientId]
  );
  if (rows.length === 0) return undefined;
  const r = rows[0];
  return {
    clientId: r.client_id,
    clientSecret: r.client_secret,
    name: r.name,
    redirectUris: r.redirect_uris,
    createdBy: r.created_by,
  };
}

export async function listClientsByUser(userId: string): Promise<OAuthClient[]> {
  const pool = await getPool();
  const { rows } = await pool.query(
    `SELECT client_id, client_secret, name, redirect_uris, created_by
     FROM oauth_clients WHERE created_by = $1 ORDER BY created_at`,
    [userId]
  );
  return rows.map((r) => ({
    clientId: r.client_id,
    clientSecret: r.client_secret,
    name: r.name,
    redirectUris: r.redirect_uris,
    createdBy: r.created_by,
  }));
}

// --- Consent grants (Postgres-backed) ---

export async function hasConsent(
  userId: string,
  clientId: string,
  scopes: string[]
): Promise<boolean> {
  const pool = await getPool();
  const { rows } = await pool.query(
    `SELECT 1 FROM consent_grants
     WHERE user_id = $1 AND client_id = $2 AND scopes @> $3`,
    [userId, clientId, scopes]
  );
  return rows.length > 0;
}

export async function saveConsent(
  userId: string,
  clientId: string,
  scopes: string[]
): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `INSERT INTO consent_grants (user_id, client_id, scopes)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, client_id)
     DO UPDATE SET scopes = EXCLUDED.scopes, granted_at = NOW()`,
    [userId, clientId, scopes]
  );
}

// --- Authorization codes (in-memory, 60s TTL) ---

export function createAuthCode(opts: Omit<AuthCode, "code" | "expiresAt">): string {
  const code = crypto.randomUUID();
  authCodes.set(code, { ...opts, code, expiresAt: Date.now() + 60_000 });
  return code;
}

export function consumeAuthCode(code: string): AuthCode | null {
  const entry = authCodes.get(code);
  if (!entry) return null;
  authCodes.delete(code);
  if (Date.now() > entry.expiresAt) return null;
  return entry;
}

// --- PKCE ---

export async function verifyPkce(
  codeVerifier: string,
  codeChallenge: string,
  method: string
): Promise<boolean> {
  if (method === "S256") {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(codeVerifier)
    );
    const expected = Buffer.from(digest).toString("base64url");
    return expected === codeChallenge;
  }
  return codeVerifier === codeChallenge;
}

// --- Token signing ---

export function getIssuer(): string {
  return process.env.QUAD_ISSUER ?? "http://localhost:3000";
}

export async function signTokens(opts: {
  sub: string;
  email: string;
  name: string;
  clientId: string;
  scope: string;
  claims?: Record<string, unknown>;
}) {
  await ensureKeys();
  const issuer = getIssuer();
  const now = Math.floor(Date.now() / 1000);

  const idToken = await new SignJWT({
    sub: opts.sub,
    email: opts.email,
    name: opts.name,
    ...opts.claims,
  })
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setIssuer(issuer)
    .setAudience(opts.clientId)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const accessToken = await new SignJWT({
    sub: opts.sub,
    scope: opts.scope,
  })
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setIssuer(issuer)
    .setAudience(opts.clientId)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  return {
    access_token: accessToken,
    id_token: idToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: opts.scope,
  };
}

export async function verifyAccessToken(token: string) {
  await ensureKeys();
  try {
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: getIssuer(),
    });
    return payload;
  } catch {
    return null;
  }
}
