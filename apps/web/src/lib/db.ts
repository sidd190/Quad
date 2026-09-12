import { Pool } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://keycloak:keycloak_dev@localhost:5432/quad";

const g = globalThis as Record<string, unknown>;

async function ensureDatabase() {
  const adminUrl = DATABASE_URL.replace(/\/quad(\?.*)?$/, "/postgres$1");
  const adminPool = new Pool({ connectionString: adminUrl });
  try {
    await adminPool.query("CREATE DATABASE quad");
  } catch (e: unknown) {
    if ((e as { code?: string }).code !== "42P04") throw e;
  } finally {
    await adminPool.end();
  }
}

async function ensureSchema(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS oauth_clients (
      client_id TEXT PRIMARY KEY,
      client_secret TEXT NOT NULL,
      name TEXT NOT NULL,
      redirect_uris TEXT[] NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS consent_grants (
      user_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      scopes TEXT[] NOT NULL,
      granted_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, client_id)
    );
    CREATE TABLE IF NOT EXISTS signing_keys (
      kid TEXT PRIMARY KEY,
      private_key_pem TEXT NOT NULL,
      public_key_pem TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export async function getPool(): Promise<Pool> {
  if (g.__quad_pool && g.__quad_db_ready) return g.__quad_pool as Pool;

  await ensureDatabase();
  const pool = new Pool({ connectionString: DATABASE_URL });
  await ensureSchema(pool);
  g.__quad_pool = pool;
  g.__quad_db_ready = true;
  return pool;
}
