import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

// Ensure local data directory exists for dev mode
const dbUrl = process.env.TURSO_DATABASE_URL ?? 'file:data/memescope.db';
if (dbUrl.startsWith('file:')) {
  const filePath = dbUrl.replace('file:', '');
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const client = createClient({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

// Initialize tables
const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS coins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ticker TEXT NOT NULL,
    chain TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    website_url TEXT,
    twitter_url TEXT,
    telegram_url TEXT,
    pump_fun_url TEXT,
    dex_screener_url TEXT,
    category TEXT NOT NULL,
    market_cap_at_submission TEXT,
    submitter_email TEXT,
    submitter_user_id TEXT REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    featured INTEGER NOT NULL DEFAULT 0,
    trending INTEGER NOT NULL DEFAULT 0,
    coin_type TEXT NOT NULL DEFAULT 'existing',
    launch_date TEXT,
    paid_expedited INTEGER NOT NULL DEFAULT 0,
    paid_trending INTEGER NOT NULL DEFAULT 0,
    slug TEXT NOT NULL UNIQUE,
    week_label TEXT NOT NULL,
    submitted_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    coin_id TEXT NOT NULL REFERENCES coins(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS watchlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    coin_id TEXT NOT NULL REFERENCES coins(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    coin_id TEXT NOT NULL REFERENCES coins(id),
    user_id TEXT REFERENCES users(id),
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
`;

const INDEX_SQL = `
  CREATE UNIQUE INDEX IF NOT EXISTS votes_user_coin_idx ON votes(user_id, coin_id);
  CREATE UNIQUE INDEX IF NOT EXISTS watchlist_user_coin_idx ON watchlist(user_id, coin_id);
  CREATE INDEX IF NOT EXISTS idx_coins_chain ON coins(chain);
  CREATE INDEX IF NOT EXISTS idx_coins_status ON coins(status);
  CREATE INDEX IF NOT EXISTS idx_coins_slug ON coins(slug);
  CREATE INDEX IF NOT EXISTS idx_coins_name ON coins(name);
  CREATE INDEX IF NOT EXISTS idx_coins_ticker ON coins(ticker);
  CREATE INDEX IF NOT EXISTS idx_coins_coin_type ON coins(coin_type);
  CREATE INDEX IF NOT EXISTS idx_chat_coin_id ON chat_messages(coin_id);
  CREATE INDEX IF NOT EXISTS idx_votes_coin_id ON votes(coin_id);
  CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
`;

// Run initialization
let initialized = false;
export async function initDb() {
  if (initialized) return;
  // libsql executeMultiple doesn't support multiple statements cleanly,
  // so we run them one at a time
  const statements = INIT_SQL.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await client.execute(stmt + ';');
  }
  const indexStatements = INDEX_SQL.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of indexStatements) {
    await client.execute(stmt + ';');
  }
  initialized = true;
}

export { schema };
