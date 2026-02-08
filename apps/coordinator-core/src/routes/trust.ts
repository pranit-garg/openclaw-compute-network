import { Router } from "express";
import { v4 as uuid } from "uuid";
import crypto from "node:crypto";
import type Database from "better-sqlite3";

export function trustRouter(db: Database.Database): Router {
  const router = Router();

  // ── Create pairing code ────────────────────
  router.post("/v1/trust/create", (req, res) => {
    const { user_id } = req.body ?? {};
    if (!user_id) {
      res.status(400).json({ error: "Missing user_id" });
      return;
    }

    const pairingCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char code
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    db.prepare(`
      INSERT INTO trust_pairings (id, user_id, pairing_code, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(uuid(), user_id, pairingCode, expiresAt);

    res.status(201).json({ pairing_code: pairingCode, expires_at: expiresAt });
  });

  // ── Claim pairing code ─────────────────────
  router.post("/v1/trust/claim", (req, res) => {
    const { pairing_code, provider_pubkey } = req.body ?? {};
    if (!pairing_code || !provider_pubkey) {
      res.status(400).json({ error: "Missing pairing_code or provider_pubkey" });
      return;
    }

    const row = db.prepare(
      `SELECT id, user_id, claimed, expires_at FROM trust_pairings WHERE pairing_code = ?`
    ).get(pairing_code) as { id: string; user_id: string; claimed: number; expires_at: string } | undefined;

    if (!row) {
      res.status(400).json({ error: "invalid_code" });
      return;
    }
    if (row.claimed) {
      res.status(400).json({ error: "already_claimed" });
      return;
    }
    if (new Date(row.expires_at) < new Date()) {
      res.status(400).json({ error: "expired" });
      return;
    }

    db.prepare(`
      UPDATE trust_pairings SET claimed = 1, provider_pubkey = ? WHERE id = ?
    `).run(provider_pubkey, row.id);

    res.json({ user_id: row.user_id, paired_at: new Date().toISOString() });
  });

  // ── List trusted providers ─────────────────
  router.get("/v1/trust/list", (req, res) => {
    const userId = req.query.user_id as string | undefined;
    if (!userId) {
      res.status(400).json({ error: "Missing user_id query param" });
      return;
    }

    const rows = db.prepare(
      `SELECT provider_pubkey, created_at as paired_at FROM trust_pairings WHERE user_id = ? AND claimed = 1`
    ).all(userId) as Array<{ provider_pubkey: string; paired_at: string }>;

    res.json({ providers: rows });
  });

  return router;
}
