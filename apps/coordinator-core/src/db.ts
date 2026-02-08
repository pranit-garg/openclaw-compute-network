import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

export function createDb(dbPath: string): Database.Database {
  // Ensure parent directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // ── Schema ─────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id            TEXT PRIMARY KEY,
      type          TEXT NOT NULL,
      policy        TEXT NOT NULL,
      privacy_class TEXT NOT NULL DEFAULT 'PUBLIC',
      user_id       TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      payload       TEXT NOT NULL,
      result        TEXT,
      worker_pubkey TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at  TEXT
    );

    CREATE TABLE IF NOT EXISTS trust_pairings (
      id              TEXT PRIMARY KEY,
      user_id         TEXT NOT NULL,
      provider_pubkey TEXT,
      pairing_code    TEXT NOT NULL UNIQUE,
      claimed         INTEGER NOT NULL DEFAULT 0,
      expires_at      TEXT NOT NULL,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id              TEXT PRIMARY KEY,
      job_id          TEXT NOT NULL REFERENCES jobs(id),
      provider_pubkey TEXT NOT NULL,
      receipt_json    TEXT NOT NULL,
      signature       TEXT NOT NULL,
      verified        INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}
