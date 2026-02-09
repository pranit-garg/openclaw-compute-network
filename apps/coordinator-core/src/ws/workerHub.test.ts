import { describe, it, expect, beforeEach, afterEach } from "vitest";
import http from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { createDb } from "../db.js";
import { WorkerHub } from "./workerHub.js";
import { JobType, Policy, PrivacyClass } from "@dispatch/protocol";
import fs from "node:fs";
import nacl from "tweetnacl";
import crypto from "node:crypto";

const TEST_DB = "./data/test-hub.db";

function cleanup() {
  try { fs.unlinkSync(TEST_DB); } catch {}
  try { fs.unlinkSync(TEST_DB + "-wal"); } catch {}
  try { fs.unlinkSync(TEST_DB + "-shm"); } catch {}
}

describe("WorkerHub", () => {
  let server: http.Server;
  let hub: WorkerHub;
  let db: ReturnType<typeof createDb>;
  let port: number;

  beforeEach(async () => {
    cleanup();
    db = createDb(TEST_DB);
    server = http.createServer();
    hub = new WorkerHub(server, db);

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        port = (server.address() as { port: number }).port;
        resolve();
      });
    });
  });

  afterEach(() => {
    hub.shutdown();
    server.close();
    db.close();
    cleanup();
  });

  it("registers a worker and increments online count", async () => {
    expect(hub.onlineCount).toBe(0);

    const ws = new WebSocket(`ws://localhost:${port}`);
    await new Promise<void>((resolve) => ws.on("open", resolve));

    // Send register
    ws.send(JSON.stringify({
      type: "register",
      provider_pubkey: "pubkey_test_1",
      provider_type: "DESKTOP",
      capabilities: ["LLM_INFER", "TASK"],
    }));

    // Wait for ack
    const ack = await new Promise<Record<string, unknown>>((resolve) => {
      ws.on("message", (raw) => {
        resolve(JSON.parse(raw.toString()));
      });
    });

    expect(ack.type).toBe("register_ack");
    expect(ack.status).toBe("ok");
    expect(hub.onlineCount).toBe(1);

    ws.close();
    await new Promise((r) => setTimeout(r, 100));
    expect(hub.onlineCount).toBe(0);
  });

  it("claimWorker prefers DESKTOP for FAST policy", async () => {
    // Register two workers
    const wsDesktop = new WebSocket(`ws://localhost:${port}`);
    const wsSeeker = new WebSocket(`ws://localhost:${port}`);

    await Promise.all([
      new Promise<void>((r) => wsDesktop.on("open", r)),
      new Promise<void>((r) => wsSeeker.on("open", r)),
    ]);

    wsDesktop.send(JSON.stringify({
      type: "register", provider_pubkey: "desktop_pub", provider_type: "DESKTOP", capabilities: ["LLM_INFER", "TASK"],
    }));
    wsSeeker.send(JSON.stringify({
      type: "register", provider_pubkey: "seeker_pub", provider_type: "SEEKER", capabilities: ["TASK"],
    }));

    // Wait for both acks
    await new Promise((r) => setTimeout(r, 200));

    // FAST + TASK → should prefer DESKTOP
    const claimed = hub.claimWorker(JobType.TASK, Policy.FAST, PrivacyClass.PUBLIC, "user1");
    expect(claimed).not.toBeNull();
    expect(claimed!.type).toBe("DESKTOP");

    wsDesktop.close();
    wsSeeker.close();
  });

  it("claimWorker prefers SEEKER for CHEAP+TASK", async () => {
    const wsDesktop = new WebSocket(`ws://localhost:${port}`);
    const wsSeeker = new WebSocket(`ws://localhost:${port}`);

    await Promise.all([
      new Promise<void>((r) => wsDesktop.on("open", r)),
      new Promise<void>((r) => wsSeeker.on("open", r)),
    ]);

    wsDesktop.send(JSON.stringify({
      type: "register", provider_pubkey: "desktop_pub", provider_type: "DESKTOP", capabilities: ["LLM_INFER", "TASK"],
    }));
    wsSeeker.send(JSON.stringify({
      type: "register", provider_pubkey: "seeker_pub", provider_type: "SEEKER", capabilities: ["TASK"],
    }));

    await new Promise((r) => setTimeout(r, 200));

    const claimed = hub.claimWorker(JobType.TASK, Policy.CHEAP, PrivacyClass.PUBLIC, "user1");
    expect(claimed).not.toBeNull();
    expect(claimed!.type).toBe("SEEKER");

    wsDesktop.close();
    wsSeeker.close();
  });

  it("privacy filter blocks untrusted workers", async () => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    await new Promise<void>((r) => ws.on("open", r));

    ws.send(JSON.stringify({
      type: "register", provider_pubkey: "untrusted_pub", provider_type: "DESKTOP", capabilities: ["TASK"],
    }));
    await new Promise((r) => setTimeout(r, 200));

    // No trust pairing exists → PRIVATE claim returns null
    const claimed = hub.claimWorker(JobType.TASK, Policy.CHEAP, PrivacyClass.PRIVATE, "user1");
    expect(claimed).toBeNull();

    ws.close();
  });

  it("atomic claim prevents double-claiming", async () => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    await new Promise<void>((r) => ws.on("open", r));

    ws.send(JSON.stringify({
      type: "register", provider_pubkey: "only_worker", provider_type: "DESKTOP", capabilities: ["TASK"],
    }));
    await new Promise((r) => setTimeout(r, 200));

    // First claim succeeds
    const first = hub.claimWorker(JobType.TASK, Policy.FAST, PrivacyClass.PUBLIC, "user1");
    expect(first).not.toBeNull();

    // Second claim fails (worker is busy)
    const second = hub.claimWorker(JobType.TASK, Policy.FAST, PrivacyClass.PUBLIC, "user2");
    expect(second).toBeNull();

    ws.close();
  });

  it("verifies a valid ed25519 receipt signature and stores verified=1", async () => {
    // Generate a real ed25519 keypair
    const keypair = nacl.sign.keyPair();
    const pubkeyHex = Buffer.from(keypair.publicKey).toString("hex");

    const ws = new WebSocket(`ws://localhost:${port}`);
    await new Promise<void>((r) => ws.on("open", r));

    // Register with real pubkey
    ws.send(JSON.stringify({
      type: "register",
      provider_pubkey: pubkeyHex,
      provider_type: "DESKTOP",
      capabilities: ["TASK"],
    }));

    // Wait for register_ack and extract worker_id
    const ack = await new Promise<Record<string, unknown>>((resolve) => {
      ws.on("message", (raw) => resolve(JSON.parse(raw.toString())));
    });
    expect(ack.type).toBe("register_ack");

    // Claim the worker and assign a job
    const jobId = "test-job-sig-valid";
    db.prepare(`
      INSERT INTO jobs (id, type, policy, privacy_class, user_id, status, payload)
      VALUES (?, 'TASK', 'FAST', 'PUBLIC', 'user1', 'running', '{}')
    `).run(jobId);

    const worker = hub.claimWorker(JobType.TASK, Policy.FAST, PrivacyClass.PUBLIC, "user1");
    expect(worker).not.toBeNull();
    hub.assignJob(worker!, jobId, {
      type: "job_assign",
      job_id: jobId,
      job_type: JobType.TASK,
      payload: { input: "test" },
      policy: Policy.FAST,
      privacy_class: PrivacyClass.PUBLIC,
      user_id: "user1",
    });

    // Drain the job_assign message
    await new Promise<void>((resolve) => {
      ws.on("message", () => resolve());
    });

    // Build receipt and sign it (same logic as worker-desktop/receipts.ts)
    const output = { result: "hello" };
    const outputHash = crypto.createHash("sha256").update(JSON.stringify(output)).digest("hex");
    const receipt = {
      job_id: jobId,
      provider_pubkey: pubkeyHex,
      output_hash: outputHash,
      completed_at: new Date().toISOString(),
      payment_ref: null,
    };
    const canonical = JSON.stringify(receipt);
    const signature = nacl.sign.detached(new TextEncoder().encode(canonical), keypair.secretKey);
    const signatureBase64 = Buffer.from(signature).toString("base64");

    // Send job_complete with valid receipt
    ws.send(JSON.stringify({
      type: "job_complete",
      job_id: jobId,
      output,
      output_hash: outputHash,
      receipt,
      receipt_signature: signatureBase64,
    }));

    await new Promise((r) => setTimeout(r, 300));

    // Check receipt is stored with verified=1
    const row = db.prepare(`SELECT verified FROM receipts WHERE job_id = ?`).get(jobId) as { verified: number } | undefined;
    expect(row).toBeDefined();
    expect(row!.verified).toBe(1);

    ws.close();
  });

  it("stores verified=0 for an invalid receipt signature", async () => {
    // Generate two keypairs — register with one, sign with the other
    const realKeypair = nacl.sign.keyPair();
    const realPubkeyHex = Buffer.from(realKeypair.publicKey).toString("hex");
    const wrongKeypair = nacl.sign.keyPair();

    const ws = new WebSocket(`ws://localhost:${port}`);
    await new Promise<void>((r) => ws.on("open", r));

    ws.send(JSON.stringify({
      type: "register",
      provider_pubkey: realPubkeyHex,
      provider_type: "DESKTOP",
      capabilities: ["TASK"],
    }));

    const ack = await new Promise<Record<string, unknown>>((resolve) => {
      ws.on("message", (raw) => resolve(JSON.parse(raw.toString())));
    });
    expect(ack.type).toBe("register_ack");

    const jobId = "test-job-sig-invalid";
    db.prepare(`
      INSERT INTO jobs (id, type, policy, privacy_class, user_id, status, payload)
      VALUES (?, 'TASK', 'FAST', 'PUBLIC', 'user1', 'running', '{}')
    `).run(jobId);

    const worker = hub.claimWorker(JobType.TASK, Policy.FAST, PrivacyClass.PUBLIC, "user1");
    expect(worker).not.toBeNull();
    hub.assignJob(worker!, jobId, {
      type: "job_assign",
      job_id: jobId,
      job_type: JobType.TASK,
      payload: { input: "test" },
      policy: Policy.FAST,
      privacy_class: PrivacyClass.PUBLIC,
      user_id: "user1",
    });

    // Drain the job_assign message
    await new Promise<void>((resolve) => {
      ws.on("message", () => resolve());
    });

    // Build receipt but sign with WRONG key
    const output = { result: "hello" };
    const outputHash = crypto.createHash("sha256").update(JSON.stringify(output)).digest("hex");
    const receipt = {
      job_id: jobId,
      provider_pubkey: realPubkeyHex,
      output_hash: outputHash,
      completed_at: new Date().toISOString(),
      payment_ref: null,
    };
    const canonical = JSON.stringify(receipt);
    const badSignature = nacl.sign.detached(new TextEncoder().encode(canonical), wrongKeypair.secretKey);
    const badSignatureBase64 = Buffer.from(badSignature).toString("base64");

    ws.send(JSON.stringify({
      type: "job_complete",
      job_id: jobId,
      output,
      output_hash: outputHash,
      receipt,
      receipt_signature: badSignatureBase64,
    }));

    await new Promise((r) => setTimeout(r, 300));

    // Check receipt is stored with verified=0
    const row = db.prepare(`SELECT verified FROM receipts WHERE job_id = ?`).get(jobId) as { verified: number } | undefined;
    expect(row).toBeDefined();
    expect(row!.verified).toBe(0);

    ws.close();
  });
});
