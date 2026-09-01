let sql: any = null;
let initPromise: Promise<void> | null = null;

function getConnStr() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || '';
}

export function isNeonEnabled() {
  return !!getConnStr();
}

async function getSql() {
  if (sql) return sql;
  const conn = getConnStr();
  if (!conn) return null;
  const { neon } = await import('@neondatabase/serverless');
  sql = neon(conn);
  return sql;
}

async function ensureTable() {
  const s = await getSql();
  if (!s) return;
  await s`CREATE TABLE IF NOT EXISTS app_storage (key TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW())`;
}

export async function neonGet<T>(key: string, defaultValue: T): Promise<T> {
  const s = await getSql();
  if (!s) return defaultValue;
  if (!initPromise) initPromise = ensureTable();
  await initPromise;
  try {
    const rows = await s`SELECT data FROM app_storage WHERE key = ${key} LIMIT 1`;
    if (rows.length) return rows[0].data as T;
  } catch (e) {
    console.error('neonGet error', e);
  }
  return defaultValue;
}

export async function neonSet(key: string, data: unknown) {
  const s = await getSql();
  if (!s) return;
  if (!initPromise) initPromise = ensureTable();
  await initPromise;
  try {
    await s`INSERT INTO app_storage (key, data, updated_at) VALUES (${key}, ${JSON.stringify(data)}::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
  } catch (e) {
    console.error('neonSet error', e);
  }
}
