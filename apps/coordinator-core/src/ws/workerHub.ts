import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import type { Server } from "node:http";
import type Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import {
  JobType,
  Policy,
  PrivacyClass,
  type RegisterMsg,
  type HeartbeatMsg,
  type JobCompleteMsg,
  type JobRejectMsg,
  type ReceiptSubmitMsg,
  type RegisterAckMsg,
  type HeartbeatAckMsg,
  type JobAssignMsg,
  type ErrorMsg,
} from "@openclaw/protocol";

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
}

const HEARTBEAT_TIMEOUT_MS = 30_000;

export class WorkerHub {
  private wss: WebSocketServer;
  private workers = new Map<string, TrackedWorker>();
  private heartbeatCheck: ReturnType<typeof setInterval>;
  private db: Database.Database;

  constructor(server: Server, db: Database.Database) {
    this.db = db;

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

    // Update DB
    this.db.prepare(`
      UPDATE jobs SET status = 'completed', result = ?, completed_at = datetime('now')
      WHERE id = ?
    `).run(JSON.stringify(msg.output), msg.job_id);

    worker.status = "idle";
    worker.activeJobId = null;
    console.log(`[WorkerHub] Job ${msg.job_id} completed by worker ${worker.id}`);
  }

  private handleJobReject(msg: JobRejectMsg): void {
    const worker = this.findByActiveJob(msg.job_id);
    if (!worker) return;

    // Put job back in pending state for re-matching
    this.db.prepare(`
      UPDATE jobs SET status = 'pending', worker_pubkey = NULL WHERE id = ?
    `).run(msg.job_id);

    worker.status = "idle";
    worker.activeJobId = null;
    console.log(`[WorkerHub] Job ${msg.job_id} rejected by worker ${worker.id}: ${msg.reason}`);
  }

  private handleReceiptSubmit(msg: ReceiptSubmitMsg): void {
    // Store receipt (verified=false for MVP — TODO: verify ed25519 sig — See BACKLOG.md#receipt-verification)
    this.db.prepare(`
      INSERT INTO receipts (id, job_id, provider_pubkey, receipt_json, signature, verified)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(uuid(), msg.receipt.job_id, msg.receipt.provider_pubkey, JSON.stringify(msg.receipt), msg.signature);
  }

  private handleDisconnect(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    // Fail any active job
    if (worker.activeJobId) {
      this.db.prepare(`
        UPDATE jobs SET status = 'failed', result = '{"error":"worker_disconnected"}' WHERE id = ?
      `).run(worker.activeJobId);
      console.log(`[WorkerHub] Worker ${workerId} disconnected with active job ${worker.activeJobId} — marked failed`);
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
    return score;
  }

  /** Assign a job to a specific worker via WebSocket */
  assignJob(worker: TrackedWorker, jobId: string, msg: JobAssignMsg): void {
    worker.activeJobId = jobId;
    this.send(worker.ws, msg);
  }

  // ── Stats ──────────────────────────────────

  get onlineCount(): number {
    return this.workers.size;
  }

  // ── Helpers ────────────────────────────────

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
