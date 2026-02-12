import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import type { Server } from "node:http";
import type Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import nacl from "tweetnacl";
import {
  JobType,
  Policy,
  PrivacyClass,
  StakeTier,
  STAKE_PRIORITY,
  type RegisterMsg,
  type HeartbeatMsg,
  type JobCompleteMsg,
  type JobRejectMsg,
  type ReceiptSubmitMsg,
  type RegisterAckMsg,
  type HeartbeatAckMsg,
  type JobAssignMsg,
  type ErrorMsg,
} from "@dispatch/protocol";
import type { BoltDistributor } from "../bolt/BoltDistributor.js";
import type { WrappedBoltDistributor } from "../bolt/WrappedBoltDistributor.js";

// ── ERC-8004 integration (optional) ─────────────

export interface ERC8004Config {
  /** Fetch reputation score for a worker pubkey. Returns 0-100 or null if unknown. */
  getReputationScore: (pubkey: string) => Promise<number | null>;
  /** Post feedback after job completion. Fire-and-forget. */
  postFeedback?: (workerPubkey: string, jobId: string, success: boolean) => Promise<string | void>;
}

// ── Worker state ───────────────────────────────

interface TrackedWorker {
  id: string;
  ws: WebSocket;
  pubkey: string;
  type: "DESKTOP" | "SEEKER";
  capabilities: JobType[];
  status: "idle" | "busy";
  lastHeartbeat: number;
  activeJobId: string | null;
  reputationScore?: number; // cached ERC-8004 score (0-100)
  stakeLevel?: StakeTier; // cached BOLT stake tier
}

/** Optional config for reading BOLT stake levels */
export interface StakeConfig {
  readStakeLevel: (pubkey: string) => Promise<StakeTier>;
}

const HEARTBEAT_TIMEOUT_MS = 30_000;

export class WorkerHub {
  private wss: WebSocketServer;
  private workers = new Map<string, TrackedWorker>();
  private heartbeatCheck: ReturnType<typeof setInterval>;
  private db: Database.Database;
  private erc8004?: ERC8004Config;
  private stakeConfig?: StakeConfig;
  private boltDistributor?: BoltDistributor;
  private wrappedBoltDistributor?: WrappedBoltDistributor;

  constructor(server: Server, db: Database.Database, erc8004?: ERC8004Config, stakeConfig?: StakeConfig, boltDistributor?: BoltDistributor, wrappedBoltDistributor?: WrappedBoltDistributor) {
    this.db = db;
    this.erc8004 = erc8004;
    this.stakeConfig = stakeConfig;
    this.boltDistributor = boltDistributor;
    this.wrappedBoltDistributor = wrappedBoltDistributor;

    // Upgrade HTTP → WebSocket on the same port
    this.wss = new WebSocketServer({ noServer: true });
    server.on("upgrade", (req: IncomingMessage, socket, head) => {
      this.wss.handleUpgrade(req, socket, head, (ws) => {
        this.wss.emit("connection", ws, req);
      });
    });

    this.wss.on("connection", (ws) => this.handleConnection(ws));

    // Prune stale workers every 10s
    this.heartbeatCheck = setInterval(() => this.pruneStale(), 10_000);
  }

  // ── Connection handling ────────────────────

  private handleConnection(ws: WebSocket): void {
    let workerId: string | null = null;

    ws.on("message", (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        this.send(ws, { type: "error", code: "PARSE_ERROR", message: "Invalid JSON" });
        return;
      }

      switch (msg.type) {
        case "register":
          workerId = this.handleRegister(ws, msg as unknown as RegisterMsg);
          break;
        case "heartbeat":
          this.handleHeartbeat(msg as unknown as HeartbeatMsg);
          break;
        case "job_complete":
          this.handleJobComplete(msg as unknown as JobCompleteMsg);
          break;
        case "job_reject":
          this.handleJobReject(msg as unknown as JobRejectMsg);
          break;
        case "receipt_submit":
          this.handleReceiptSubmit(msg as unknown as ReceiptSubmitMsg);
          break;
        default:
          this.send(ws, { type: "error", code: "UNKNOWN_MSG", message: `Unknown type: ${String(msg.type)}` });
      }
    });

    ws.on("close", () => {
      if (workerId) this.handleDisconnect(workerId);
    });
  }

  // ── Message handlers ───────────────────────

  private handleRegister(ws: WebSocket, msg: RegisterMsg): string {
    const id = uuid();
    const worker: TrackedWorker = {
      id,
      ws,
      pubkey: msg.provider_pubkey,
      type: msg.provider_type,
      capabilities: msg.capabilities,
      status: "idle",
      lastHeartbeat: Date.now(),
      activeJobId: null,
    };
    this.workers.set(id, worker);

    // Async: fetch ERC-8004 reputation (non-blocking, best-effort)
    if (this.erc8004) {
      this.erc8004.getReputationScore(msg.provider_pubkey).then((score) => {
        if (score !== null && this.workers.has(id)) {
          worker.reputationScore = score;
          console.log(`[WorkerHub] ERC-8004 reputation for ${id}: ${score}`);
        }
      }).catch(() => { /* ERC-8004 unavailable — ignore */ });
    }

    // Async: fetch BOLT stake level (non-blocking, best-effort)
    if (this.stakeConfig) {
      this.stakeConfig.readStakeLevel(msg.provider_pubkey).then((tier) => {
        if (this.workers.has(id)) {
          worker.stakeLevel = tier;
          console.log(`[WorkerHub] BOLT stake tier for ${id}: ${tier}`);
        }
      }).catch(() => { /* BOLT stake read failed — default to OPEN */ });
    }

    const ack: RegisterAckMsg = { type: "register_ack", status: "ok", worker_id: id };
    this.send(ws, ack);
    console.log(`[WorkerHub] Registered ${msg.provider_type} worker ${id} (pubkey: ${msg.provider_pubkey.slice(0, 8)}...)`);
    return id;
  }

  private handleHeartbeat(msg: HeartbeatMsg): void {
    const worker = this.findByPubkey(msg.provider_pubkey);
    if (worker) {
      worker.lastHeartbeat = Date.now();
      const ack: HeartbeatAckMsg = { type: "heartbeat_ack", status: "ok" };
      this.send(worker.ws, ack);
    }
  }

  private handleJobComplete(msg: JobCompleteMsg): void {
    const worker = this.findByActiveJob(msg.job_id);
    if (!worker) return;

    const isDemoJob = msg.job_id.startsWith("demo-");

    if (isDemoJob) {
      worker.status = "idle";
      worker.activeJobId = null;
      // Post ERC-8004 feedback even for demo jobs
      if (this.erc8004?.postFeedback) {
        this.erc8004.postFeedback(worker.pubkey, msg.job_id, true).then((txHash) => {
          if (txHash && worker.ws.readyState === WebSocket.OPEN) {
            this.send(worker.ws, {
              type: "feedback_posted",
              job_id: msg.job_id,
              tx_hash: txHash,
              network: "monad-testnet",
              explorer_url: `https://testnet.monadexplorer.com/tx/${txHash}`,
            });
          }
        }).catch((err) => {
          console.error(`[ERC-8004] Feedback tx FAILED for demo job ${msg.job_id}:`, err instanceof Error ? err.message : err);
          if (worker.ws.readyState === WebSocket.OPEN) {
            this.send(worker.ws, {
              type: "feedback_failed",
              job_id: msg.job_id,
              error: err instanceof Error ? err.message : "Transaction failed",
            });
          }
        });
      }
      // Queue BOLT payout for demo job
      this.boltDistributor?.queuePayout(worker.pubkey, msg.job_id, 0.001);
      this.wrappedBoltDistributor?.queuePayout(worker.pubkey, msg.job_id, 0.001);

      console.log(`[WorkerHub] Demo job ${msg.job_id} completed by worker ${worker.id}`);
      return;
    }

    // Atomic: store job result + receipt in a single transaction
    const txn = this.db.transaction(() => {
      this.db.prepare(`
        UPDATE jobs SET status = 'completed', result = ?, completed_at = datetime('now')
        WHERE id = ?
      `).run(JSON.stringify(msg.output), msg.job_id);

      if (msg.receipt && msg.receipt_signature) {
        const verified = this.verifyReceiptSignature(
          msg.receipt,
          msg.receipt_signature,
          worker.pubkey
        );
        this.db.prepare(`
          INSERT INTO receipts (id, job_id, provider_pubkey, receipt_json, signature, verified)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uuid(), msg.receipt.job_id, msg.receipt.provider_pubkey, JSON.stringify(msg.receipt), msg.receipt_signature, verified ? 1 : 0);
      }
    });
    txn();

    // ERC-8004: post positive feedback (fire-and-forget)
    if (this.erc8004?.postFeedback) {
      this.erc8004.postFeedback(worker.pubkey, msg.job_id, true).then((txHash) => {
        if (txHash && worker.ws.readyState === WebSocket.OPEN) {
          this.send(worker.ws, {
            type: "feedback_posted",
            job_id: msg.job_id,
            tx_hash: txHash,
            network: "monad-testnet",
            explorer_url: `https://testnet.monadexplorer.com/tx/${txHash}`,
          });
        }
      }).catch((err) => {
        console.error(`[ERC-8004] Feedback tx FAILED for job ${msg.job_id}:`, err instanceof Error ? err.message : err);
        if (worker.ws.readyState === WebSocket.OPEN) {
          this.send(worker.ws, {
            type: "feedback_failed",
            job_id: msg.job_id,
            error: err instanceof Error ? err.message : "Transaction failed",
          });
        }
      });
    }

    // Queue BOLT payout
    this.boltDistributor?.queuePayout(worker.pubkey, msg.job_id, 0.001);
    this.wrappedBoltDistributor?.queuePayout(worker.pubkey, msg.job_id, 0.001);

    worker.status = "idle";
    worker.activeJobId = null;
    console.log(`[WorkerHub] Job ${msg.job_id} completed by worker ${worker.id}`);
  }

  private handleJobReject(msg: JobRejectMsg): void {
    const worker = this.findByActiveJob(msg.job_id);
    if (!worker) return;

    // Demo jobs have no DB row — just reset worker state
    if (!msg.job_id.startsWith("demo-")) {
      this.db.prepare(`
        UPDATE jobs SET status = 'pending', worker_pubkey = NULL WHERE id = ?
      `).run(msg.job_id);
    }

    worker.status = "idle";
    worker.activeJobId = null;
    console.log(`[WorkerHub] Job ${msg.job_id} rejected by worker ${worker.id}: ${msg.reason}`);
  }

  private handleReceiptSubmit(msg: ReceiptSubmitMsg): void {
    const worker = this.findByPubkey(msg.receipt.provider_pubkey);
    const pubkey = worker?.pubkey ?? msg.receipt.provider_pubkey;
    const verified = this.verifyReceiptSignature(msg.receipt, msg.signature, pubkey);
    this.db.prepare(`
      INSERT INTO receipts (id, job_id, provider_pubkey, receipt_json, signature, verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuid(), msg.receipt.job_id, msg.receipt.provider_pubkey, JSON.stringify(msg.receipt), msg.signature, verified ? 1 : 0);
  }

  private handleDisconnect(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    // Fail any active job (skip DB update for demo jobs)
    if (worker.activeJobId) {
      if (worker.activeJobId.startsWith("demo-")) {
        console.log(`[WorkerHub] Worker ${workerId} disconnected with active demo job ${worker.activeJobId} — skipped`);
      } else {
        this.db.prepare(`
          UPDATE jobs SET status = 'failed', result = '{"error":"worker_disconnected"}' WHERE id = ?
        `).run(worker.activeJobId);
        console.log(`[WorkerHub] Worker ${workerId} disconnected with active job ${worker.activeJobId} — marked failed`);
      }
    }

    this.workers.delete(workerId);
    console.log(`[WorkerHub] Worker ${workerId} disconnected`);
  }

  // ── Job matching ───────────────────────────

  /**
   * Atomic claim: find best worker + mark busy in one synchronous tick.
   * Prevents TOCTOU race where two jobs claim the same worker.
   */
  claimWorker(
    jobType: JobType,
    policy: Policy.FAST | Policy.CHEAP,
    privacyClass: PrivacyClass,
    userId: string
  ): TrackedWorker | null {
    let trustedPubkeys: Set<string> | null = null;
    if (privacyClass === PrivacyClass.PRIVATE) {
      const rows = this.db.prepare(
        `SELECT provider_pubkey FROM trust_pairings WHERE user_id = ? AND claimed = 1`
      ).all(userId) as Array<{ provider_pubkey: string }>;
      trustedPubkeys = new Set(rows.map((r) => r.provider_pubkey));
      if (trustedPubkeys.size === 0) return null;
    }

    // Filter eligible workers
    const candidates: TrackedWorker[] = [];
    for (const w of this.workers.values()) {
      if (w.status !== "idle") continue;
      if (!w.capabilities.includes(jobType)) continue;
      if (trustedPubkeys && !trustedPubkeys.has(w.pubkey)) continue;
      candidates.push(w);
    }

    if (candidates.length === 0) return null;

    // Score: FAST prefers DESKTOP, CHEAP+TASK prefers SEEKER
    candidates.sort((a, b) => {
      const scoreA = this.workerScore(a, policy, jobType);
      const scoreB = this.workerScore(b, policy, jobType);
      return scoreB - scoreA;
    });

    // Atomic: claim in same tick (no await between check and claim)
    const best = candidates[0]!;
    best.status = "busy";
    return best;
  }

  private workerScore(w: TrackedWorker, policy: Policy.FAST | Policy.CHEAP, jobType: JobType): number {
    let score = 0;
    if (policy === Policy.FAST) {
      score += w.type === "DESKTOP" ? 10 : 0;
    } else {
      score += jobType === JobType.TASK && w.type === "SEEKER" ? 10 : 0;
    }
    // Prefer fresher heartbeats
    score += Math.max(0, 5 - (Date.now() - w.lastHeartbeat) / 10_000);

    // BOLT staking: tier-based priority bonus + reputation multiplier
    const stakeBonus = STAKE_PRIORITY[w.stakeLevel ?? StakeTier.OPEN];

    // ERC-8004: boost by reputation score (0-100 mapped to 0-10 bonus)
    // Multiplied by stake tier reputation multiplier
    if (w.reputationScore !== undefined) {
      score += (w.reputationScore / 100) * 10 * stakeBonus.repMultiplier;
    }

    // Add stake tier priority bonus
    score += stakeBonus.bonus;

    return score;
  }

  /** Assign a job to a specific worker via WebSocket */
  assignJob(worker: TrackedWorker, jobId: string, msg: JobAssignMsg): void {
    worker.activeJobId = jobId;
    this.send(worker.ws, msg);
  }

  // ── Demo mode helpers ───────────────────────

  /** Return all workers currently idle */
  getIdleWorkers(): TrackedWorker[] {
    const idle: TrackedWorker[] = [];
    for (const w of this.workers.values()) {
      if (w.status === "idle") idle.push(w);
    }
    return idle;
  }

  /** Inject a demo job directly to a specific worker. Returns true if sent. */
  injectDemoJob(workerId: string, msg: JobAssignMsg): boolean {
    const worker = this.workers.get(workerId);
    if (!worker || worker.status !== "idle") return false;

    worker.status = "busy";
    worker.activeJobId = msg.job_id;
    this.send(worker.ws, msg);
    return true;
  }

  /** Send a message to a worker identified by pubkey (used for payment_posted notifications) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendToWorker(pubkey: string, msg: any): void {
    const worker = this.findByPubkey(pubkey);
    if (worker) {
      this.send(worker.ws, msg);
    }
  }

  // ── Stats ──────────────────────────────────

  get onlineCount(): number {
    return this.workers.size;
  }

  // ── Helpers ────────────────────────────────

  /** Verify ed25519 signature over canonical JSON of a receipt. */
  private verifyReceiptSignature(
    receipt: { job_id: string; provider_pubkey: string; output_hash: string; completed_at: string; payment_ref: string | null },
    signatureBase64: string,
    pubkeyHex: string
  ): boolean {
    try {
      const canonical = JSON.stringify(receipt);
      const message = new TextEncoder().encode(canonical);
      const signature = Uint8Array.from(Buffer.from(signatureBase64, "base64"));
      const publicKey = Uint8Array.from(Buffer.from(pubkeyHex, "hex"));
      const valid = nacl.sign.detached.verify(message, signature, publicKey);
      if (!valid) {
        console.warn(`[WorkerHub] Receipt signature verification FAILED for job ${receipt.job_id}`);
      }
      return valid;
    } catch (err) {
      console.warn(`[WorkerHub] Receipt signature verification error for job ${receipt.job_id}:`, err);
      return false;
    }
  }

  private findByPubkey(pubkey: string): TrackedWorker | undefined {
    for (const w of this.workers.values()) {
      if (w.pubkey === pubkey) return w;
    }
    return undefined;
  }

  private findByActiveJob(jobId: string): TrackedWorker | undefined {
    for (const w of this.workers.values()) {
      if (w.activeJobId === jobId) return w;
    }
    return undefined;
  }

  private pruneStale(): void {
    const now = Date.now();
    for (const [id, w] of this.workers) {
      if (now - w.lastHeartbeat > HEARTBEAT_TIMEOUT_MS) {
        console.log(`[WorkerHub] Pruning stale worker ${id}`);
        w.ws.close();
        this.handleDisconnect(id);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private send(ws: WebSocket, msg: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  shutdown(): void {
    clearInterval(this.heartbeatCheck);
    this.wss.close();
  }
}
