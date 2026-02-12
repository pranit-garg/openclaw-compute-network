/**
 * WebSocketService — Core connection manager for the mobile worker.
 *
 * Handles the full lifecycle of talking to an Dispatch coordinator:
 * 1. Connect via WebSocket
 * 2. Register as a SEEKER worker
 * 3. Heartbeat every 10s to stay alive
 * 4. Receive job_assign messages, execute tasks, send job_complete
 * 5. Auto-reconnect with exponential backoff if disconnected
 *
 * Uses an event emitter pattern so the React UI can subscribe to
 * status changes, job completions, errors, etc.
 */
import { getOrCreateKeypair, type MobileKeyPair } from "./KeyManager";
import { executeTask } from "./TaskExecutor";
import { buildJobCompleteWithReceipt, buildJobCompleteWithProvider } from "./ReceiptSigner";
import type { SigningProvider } from "./SigningProvider";
import {
  type RegisterAckMsg,
  type HeartbeatAckMsg,
  type JobAssignMsg,
  type ErrorMsg,
  type FeedbackPostedMsg,
  type PaymentPostedMsg,
  type CoordinatorToWorker,
  JobType,
  createRegisterMsg,
  createHeartbeatMsg,
  createJobRejectMsg,
} from "./protocol";

// ── Types ──────────────────────────────────────

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface CompletedJob {
  jobId: string;
  taskType: string;
  prompt?: string;
  timestamp: number;
  durationMs: number;
  success: boolean;
  error?: string;
  // Monad reputation
  feedbackTxHash?: string;
  feedbackExplorerUrl?: string;
  feedbackNetwork?: string;
  // Solana BOLT payment
  paymentTxHash?: string;
  paymentExplorerUrl?: string;
  paymentAmount?: string;
  feedbackFailed?: boolean;
  paymentFailed?: boolean;
}

type EventMap = {
  statusChange: ConnectionStatus;
  jobCompleted: CompletedJob;
  jobReceived: string; // jobId
  error: string;
  registered: string; // workerId
  earnings: number; // total earnings (mock)
  feedbackPosted: { job_id: string; tx_hash: string; network: string; explorer_url: string };
  paymentPosted: { job_ids: string[]; tx_hash: string; amount: string; explorer_url: string };
};

type EventListener<K extends keyof EventMap> = (data: EventMap[K]) => void;

// ── Pricing constants (mock, matches coordinator pricing) ──

const TASK_PRICE_BOLT = 0.001; // Mock BOLT earnings per TASK job (MVP placeholder)

// ── Service ────────────────────────────────────

class WebSocketService {
  private ws: WebSocket | null = null;
  private keys: MobileKeyPair | null = null;
  private workerId: string | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;

  // Signing provider (pluggable: device key or MWA wallet)
  private _signingProvider: SigningProvider | null = null;

  // Configurable
  private coordinatorUrl = "ws://localhost:4020";
  private maxReconnectDelay = 30_000;
  private heartbeatIntervalMs = 10_000;

  // State
  private _status: ConnectionStatus = "disconnected";
  private _jobHistory: CompletedJob[] = [];
  private _totalEarnings = 0;
  private _shouldReconnect = false;

  // Event listeners (simple typed pub/sub)
  private listeners: {
    [K in keyof EventMap]?: Set<EventListener<K>>;
  } = {};

  // ── Public API ─────────────────────────────

  get status(): ConnectionStatus {
    return this._status;
  }

  get jobHistory(): CompletedJob[] {
    return [...this._jobHistory];
  }

  get totalEarnings(): number {
    return this._totalEarnings;
  }

  get currentWorkerId(): string | null {
    return this.workerId;
  }

  get currentUrl(): string {
    return this.coordinatorUrl;
  }

  setCoordinatorUrl(url: string): void {
    this.coordinatorUrl = url;
  }

  /**
   * Set the signing provider (device key or MWA wallet).
   * Must be set before calling connect(). If not set, falls back to
   * direct keypair loading (legacy behavior).
   */
  setSigningProvider(provider: SigningProvider | null): void {
    this._signingProvider = provider;
  }

  get signingProvider(): SigningProvider | null {
    return this._signingProvider;
  }

  /**
   * Connect to the coordinator and register as a worker.
   * If already connected, disconnects first.
   */
  async connect(): Promise<void> {
    if (this._status === "connected" || this._status === "connecting") {
      return;
    }

    this._shouldReconnect = true;
    this.reconnectAttempts = 0;

    // If a signing provider is set, use it; otherwise fall back to direct keypair
    if (this._signingProvider) {
      try {
        await this._signingProvider.connect();
        const pubkeyHex = await this._signingProvider.getPublicKeyHex();
        // Create a minimal keys object for registration/heartbeat compatibility
        this.keys = {
          publicKey: new Uint8Array(0), // not needed when using provider
          secretKey: new Uint8Array(0), // not needed when using provider
          pubkeyHex,
        };
      } catch (err) {
        this.emit("error", `Signing provider failed: ${(err as Error).message}`);
        return;
      }
    } else {
      try {
        this.keys = await getOrCreateKeypair();
      } catch (err) {
        this.emit("error", `Failed to load keypair: ${(err as Error).message}`);
        return;
      }
    }

    this.doConnect();
  }

  /**
   * Disconnect from the coordinator. Stops heartbeat and reconnection.
   */
  disconnect(): void {
    this._shouldReconnect = false;
    this.cleanup();
    this.setStatus("disconnected");
  }

  /**
   * Set total earnings (for restoring persisted state).
   */
  setEarnings(amount: number): void {
    this._totalEarnings = amount;
  }

  /**
   * Set job history (for restoring persisted state).
   */
  setJobHistory(history: CompletedJob[]): void {
    this._jobHistory = history;
  }

  // ── Event Emitter ──────────────────────────

  on<K extends keyof EventMap>(event: K, listener: EventListener<K>): () => void {
    if (!this.listeners[event]) {
      (this.listeners as Record<string, Set<unknown>>)[event as string] = new Set();
    }
    (this.listeners[event] as Set<EventListener<K>>).add(listener);

    // Return unsubscribe function
    return () => {
      (this.listeners[event] as Set<EventListener<K>>).delete(listener);
    };
  }

  private emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const set = this.listeners[event] as Set<EventListener<K>> | undefined;
    if (set) {
      for (const listener of set) {
        try {
          listener(data);
        } catch (err) {
          console.warn(`[WS] Listener error on ${event}:`, err);
        }
      }
    }
  }

  // ── Internal Connection Logic ──────────────

  private doConnect(): void {
    if (!this.keys) return;

    this.setStatus("connecting");

    try {
      this.ws = new WebSocket(this.coordinatorUrl);
    } catch (err) {
      this.emit("error", `WebSocket creation failed: ${(err as Error).message}`);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log("[WS] Connected to coordinator");
      this.reconnectAttempts = 0;
      this.sendRegister();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data as string);
    };

    this.ws.onerror = (event) => {
      // React Native WebSocket error events don't always have useful info
      console.warn("[WS] Connection error", event);
      this.emit("error", "WebSocket connection error");
    };

    this.ws.onclose = () => {
      console.log("[WS] Connection closed");
      this.stopHeartbeat();

      if (this._shouldReconnect) {
        this.setStatus("reconnecting");
        this.scheduleReconnect();
      } else {
        this.setStatus("disconnected");
      }
    };
  }

  private sendRegister(): void {
    if (!this.keys || !this.ws) return;

    const msg = createRegisterMsg(this.keys.pubkeyHex, [JobType.TASK]);
    this.send(msg);
  }

  private handleMessage(raw: string): void {
    let msg: CoordinatorToWorker;
    try {
      msg = JSON.parse(raw) as CoordinatorToWorker;
    } catch {
      console.warn("[WS] Failed to parse message:", raw);
      return;
    }

    switch (msg.type) {
      case "register_ack":
        this.handleRegisterAck(msg);
        break;
      case "heartbeat_ack":
        this.handleHeartbeatAck(msg);
        break;
      case "job_assign":
        void this.handleJobAssign(msg);
        break;
      case "error":
        this.handleError(msg);
        break;
      case "feedback_posted":
        this.handleFeedbackPosted(msg as unknown as FeedbackPostedMsg);
        break;
      case "payment_posted":
        this.handlePaymentPosted(msg as unknown as PaymentPostedMsg);
        break;
      case "feedback_failed":
        this.handleFeedbackFailed(msg as any);
        break;
      case "payment_failed":
        this.handlePaymentFailed(msg as any);
        break;
      default:
        console.warn("[WS] Unknown message type:", (msg as Record<string, unknown>).type);
    }
  }

  private handleRegisterAck(msg: RegisterAckMsg): void {
    if (msg.status === "ok" && msg.worker_id) {
      this.workerId = msg.worker_id;
      this.setStatus("connected");
      this.startHeartbeat();
      this.emit("registered", msg.worker_id);
      console.log(`[WS] Registered as ${msg.worker_id}`);
    } else {
      this.emit("error", `Registration failed: ${msg.error ?? "unknown"}`);
      this.ws?.close();
    }
  }

  private handleHeartbeatAck(_msg: HeartbeatAckMsg): void {
    // Heartbeat acknowledged — connection is healthy
    // Could track latency here in the future
  }

  private async handleJobAssign(msg: JobAssignMsg): Promise<void> {
    if (!this.keys) return;

    console.log(`[WS] Job assigned: ${msg.job_type} ${msg.job_id}`);
    this.emit("jobReceived", msg.job_id);

    const start = Date.now();
    let output: unknown;
    let success = true;
    let errorMsg: string | undefined;

    try {
      if (
        msg.job_type === JobType.TASK &&
        msg.payload.task_type &&
        msg.payload.input
      ) {
        output = executeTask(msg.payload.task_type, msg.payload.input);
      } else {
        // Mobile worker only handles TASK jobs for MVP
        const rejectMsg = createJobRejectMsg(
          msg.job_id,
          "SEEKER worker does not support LLM_INFER jobs"
        );
        this.send(rejectMsg);
        return;
      }
    } catch (err) {
      success = false;
      errorMsg = (err as Error).message;
      output = { error: errorMsg };
    }

    const durationMs = Date.now() - start;

    // Build signed receipt and send job_complete
    try {
      let completeMsg;
      if (this._signingProvider) {
        // New path: use pluggable signing provider
        completeMsg = await buildJobCompleteWithProvider(
          msg.job_id,
          output,
          this._signingProvider
        );
      } else {
        // Legacy path: direct keypair signing
        completeMsg = await buildJobCompleteWithReceipt(
          msg.job_id,
          output,
          this.keys.pubkeyHex,
          this.keys.secretKey
        );
      }
      this.send(completeMsg);
    } catch (err) {
      console.error("[WS] Failed to build receipt:", err);
      success = false;
      errorMsg = `Receipt signing failed: ${(err as Error).message}`;
    }

    // Track in history
    const completedJob: CompletedJob = {
      jobId: msg.job_id,
      taskType: msg.payload.task_type ?? msg.job_type,
      prompt: msg.payload.input,
      timestamp: Date.now(),
      durationMs,
      success,
      error: errorMsg,
    };

    this._jobHistory.unshift(completedJob);
    // Keep last 50 jobs
    if (this._jobHistory.length > 50) {
      this._jobHistory = this._jobHistory.slice(0, 50);
    }

    if (success) {
      this._totalEarnings += TASK_PRICE_BOLT;
      this.emit("earnings", this._totalEarnings);
    }

    this.emit("jobCompleted", completedJob);
    console.log(`[WS] Job ${msg.job_id} completed in ${durationMs}ms (${success ? "ok" : "fail"})`);
  }

  private handleError(msg: ErrorMsg): void {
    console.error(`[WS] Coordinator error [${msg.code}]: ${msg.message}`);
    this.emit("error", `[${msg.code}] ${msg.message}`);
  }

  private handleFeedbackPosted(msg: FeedbackPostedMsg): void {
    const job = this._jobHistory.find(j => j.jobId === msg.job_id);
    if (job) {
      job.feedbackTxHash = msg.tx_hash;
      job.feedbackExplorerUrl = msg.explorer_url;
      job.feedbackNetwork = msg.network;
      job.feedbackFailed = false;
      this.emit("jobCompleted", job);
      this.emit("feedbackPosted", msg);
    }
  }

  private handlePaymentPosted(msg: PaymentPostedMsg): void {
    for (const jobId of msg.job_ids) {
      const job = this._jobHistory.find(j => j.jobId === jobId);
      if (job) {
        job.paymentTxHash = msg.tx_hash;
        job.paymentExplorerUrl = msg.explorer_url;
        job.paymentAmount = msg.amount + " " + (msg.token ?? "BOLT");
        job.paymentFailed = false;
        this.emit("jobCompleted", job);
      }
    }
    this.emit("paymentPosted", {
      job_ids: msg.job_ids,
      tx_hash: msg.tx_hash,
      amount: msg.amount,
      explorer_url: msg.explorer_url,
    });
  }

  private handleFeedbackFailed(msg: { job_id: string; error: string }): void {
    const job = this._jobHistory.find(j => j.jobId === msg.job_id);
    if (job) {
      job.feedbackFailed = true;
      // Re-emit so UI updates
      this.emit("jobCompleted", job);
    }
  }

  private handlePaymentFailed(msg: { job_ids: string[]; error: string }): void {
    for (const jobId of msg.job_ids) {
      const job = this._jobHistory.find(j => j.jobId === jobId);
      if (job) {
        job.paymentFailed = true;
        this.emit("jobCompleted", job);
      }
    }
  }

  // ── Heartbeat ──────────────────────────────

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (!this.keys || this.ws?.readyState !== WebSocket.OPEN) return;
      const msg = createHeartbeatMsg(this.keys.pubkeyHex);
      this.send(msg);
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // ── Reconnection ───────────────────────────

  private scheduleReconnect(): void {
    if (!this._shouldReconnect) return;

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s max
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );
    this.reconnectAttempts++;

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      if (this._shouldReconnect) {
        this.doConnect();
      }
    }, delay);
  }

  // ── Helpers ────────────────────────────────

  private send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("[WS] Tried to send but socket not open");
    }
  }

  private setStatus(status: ConnectionStatus): void {
    if (this._status !== status) {
      this._status = status;
      this.emit("statusChange", status);
    }
  }

  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close();
      }
      this.ws = null;
    }

    this.workerId = null;
  }
}

// Singleton instance — shared across the app
export const wsService = new WebSocketService();
