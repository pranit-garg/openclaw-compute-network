import { EventEmitter } from "node:events";
import crypto from "node:crypto";
import nacl from "tweetnacl";
import WebSocket from "ws";
import {
  JobType,
  type JobAssignMsg,
  type JobCompleteMsg,
  type RegisterAckMsg,
  type RegisterMsg,
  type HeartbeatMsg,
  type TaskType,
} from "@dispatch/protocol";
import { claimTrustPairing } from "./coordinator-client.js";
import { loadOrCreateKeypair, type Keypair } from "./keys.js";

export interface WorkerRuntimeConfig {
  coordinatorUrl: string;
  capabilities: JobType[];
  ollamaUrl?: string;
  keyPath: string;
  trustPairingCode?: string;
  providerType: "DESKTOP";
}

export interface WorkerStats {
  workerId: string | null;
  pubkeyHex: string;
  jobsCompleted: number;
  jobsFailed: number;
  uptime: number;
  lastJobAt: Date | null;
  status: "connecting" | "registered" | "working" | "disconnected";
}

interface SignedReceipt {
  receipt: {
    job_id: string;
    provider_pubkey: string;
    output_hash: string;
    completed_at: string;
    payment_ref: string | null;
  };
  signature: string;
}

export class WorkerRuntime extends EventEmitter {
  private ws: WebSocket | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private startedAt: number = 0;
  private keypair: Keypair | null = null;
  private stats: WorkerStats = {
    workerId: null,
    pubkeyHex: "",
    jobsCompleted: 0,
    jobsFailed: 0,
    uptime: 0,
    lastJobAt: null,
    status: "disconnected",
  };

  constructor(private config: WorkerRuntimeConfig) {
    super();
  }

  async start(): Promise<void> {
    this.keypair = loadOrCreateKeypair(this.config.keyPath);
    this.startedAt = Date.now();
    this.stats.pubkeyHex = this.keypair.pubkeyHex;
    this.setStatus("connecting");

    const wsUrl = this.config.coordinatorUrl.replace(/^http/, "ws");
    this.ws = await this.connectWebSocket(wsUrl);
    const workerId = await this.registerWorker(this.ws);

    this.stats.workerId = workerId;
    this.setStatus("registered");
    this.emit("registered", workerId);

    this.startHeartbeat();

    if (this.config.trustPairingCode) {
      try {
        const trust = await claimTrustPairing(
          this.config.coordinatorUrl,
          this.config.trustPairingCode,
          this.keypair.pubkeyHex
        );
        this.emit("trust_claimed", trust);
      } catch (err) {
        this.emit("warning", err instanceof Error ? err.message : String(err));
      }
    }

    this.ws.on("message", (raw) => {
      void this.handleMessage(raw);
    });

    this.ws.on("close", () => {
      this.cleanupHeartbeat();
      this.setStatus("disconnected");
      this.emit("disconnected");
    });

    this.ws.on("error", (err) => {
      this.emit("error", err);
    });
  }

  stop(): void {
    this.cleanupHeartbeat();

    if (this.ws) {
      this.ws.removeAllListeners("message");
      this.ws.removeAllListeners("close");
      this.ws.removeAllListeners("error");

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
    }

    this.ws = null;
    this.setStatus("disconnected");
  }

  getStats(): WorkerStats {
    return {
      ...this.stats,
      uptime: this.startedAt ? Date.now() - this.startedAt : 0,
      lastJobAt: this.stats.lastJobAt ? new Date(this.stats.lastJobAt) : null,
    };
  }

  private setStatus(status: WorkerStats["status"]): void {
    this.stats.status = status;
    this.emit("status", this.getStats());
  }

  private connectWebSocket(url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      const timeout = setTimeout(() => {
        ws.removeAllListeners("open");
        ws.removeAllListeners("error");
        reject(new Error("WebSocket connection timeout"));
      }, 10_000);

      ws.once("open", () => {
        clearTimeout(timeout);
        resolve(ws);
      });

      ws.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  private registerWorker(ws: WebSocket): Promise<string> {
    return new Promise((resolve, reject) => {
      const registerMsg: RegisterMsg = {
        type: "register",
        provider_pubkey: this.keypair!.pubkeyHex,
        provider_type: this.config.providerType,
        capabilities: this.config.capabilities,
      };

      const timeout = setTimeout(() => {
        ws.removeListener("message", onMessage);
        reject(new Error("Registration timeout"));
      }, 10_000);

      const onMessage = (raw: WebSocket.RawData) => {
        try {
          const message = JSON.parse(raw.toString()) as RegisterAckMsg;
          if (message.type !== "register_ack") return;

          ws.removeListener("message", onMessage);
          clearTimeout(timeout);

          if (message.status === "ok" && message.worker_id) {
            resolve(message.worker_id);
          } else {
            reject(new Error(`Registration failed: ${message.error ?? "unknown"}`));
          }
        } catch {
          // Ignore non-registration messages while waiting for ack.
        }
      };

      ws.on("message", onMessage);
      ws.send(JSON.stringify(registerMsg));
    });
  }

  private startHeartbeat(): void {
    this.cleanupHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.keypair) return;
      const heartbeat: HeartbeatMsg = {
        type: "heartbeat",
        provider_pubkey: this.keypair.pubkeyHex,
      };
      this.ws.send(JSON.stringify(heartbeat));
    }, 10_000);
  }

  private cleanupHeartbeat(): void {
    if (!this.heartbeatTimer) return;
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private async handleMessage(raw: WebSocket.RawData): Promise<void> {
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(raw.toString()) as Record<string, unknown>;
    } catch {
      return;
    }

    if (message.type !== "job_assign") return;
    await this.handleJob(message as unknown as JobAssignMsg);
  }

  private async handleJob(job: JobAssignMsg): Promise<void> {
    if (!this.ws || !this.keypair) return;

    this.setStatus("working");
    const started = Date.now();

    let output: unknown;
    let failed = false;

    try {
      if (job.job_type === JobType.TASK && job.payload.task_type && job.payload.input) {
        output = executeTask(job.payload.task_type, job.payload.input);
      } else if (job.job_type === JobType.LLM_INFER && job.payload.prompt) {
        output = await executeLLM(
          job.payload.prompt,
          job.job_id,
          job.payload.max_tokens,
          this.config.ollamaUrl
        );
      } else {
        failed = true;
        output = { error: "Unsupported job payload" };
      }
    } catch (err) {
      failed = true;
      output = { error: err instanceof Error ? err.message : String(err) };
    }

    if (failed) this.stats.jobsFailed += 1;
    else this.stats.jobsCompleted += 1;

    this.stats.lastJobAt = new Date();

    const receipt = buildReceipt(
      job.job_id,
      output,
      this.keypair.pubkeyHex,
      this.keypair.secretKey
    );

    const completeMsg: JobCompleteMsg = {
      type: "job_complete",
      job_id: job.job_id,
      output,
      output_hash: receipt.receipt.output_hash,
      receipt: receipt.receipt,
      receipt_signature: receipt.signature,
    };

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(completeMsg));
    }

    this.emit("job_complete", {
      jobId: job.job_id,
      jobType: job.job_type,
      durationMs: Date.now() - started,
      failed,
      at: new Date(),
    });

    this.setStatus("registered");
  }
}

function buildReceipt(
  jobId: string,
  output: unknown,
  pubkey: string,
  secretKey: Uint8Array
): SignedReceipt {
  const outputHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(output))
    .digest("hex");

  const receipt = {
    job_id: jobId,
    provider_pubkey: pubkey,
    output_hash: outputHash,
    completed_at: new Date().toISOString(),
    payment_ref: null,
  };

  const canonical = JSON.stringify(receipt);
  const signature = nacl.sign.detached(new TextEncoder().encode(canonical), secretKey);

  return {
    receipt,
    signature: Buffer.from(signature).toString("base64"),
  };
}

function executeTask(taskType: TaskType, input: string): unknown {
  switch (taskType) {
    case "summarize": {
      const words = input.trim().split(/\s+/).filter(Boolean);
      const summary = input.length > 200 ? `${input.slice(0, 200)}...` : input;
      return { summary, word_count: words.length };
    }
    case "classify": {
      const lower = input.toLowerCase();
      const positive = ["good", "great", "excellent", "amazing", "love", "happy", "best"];
      const negative = ["bad", "terrible", "awful", "hate", "worst", "horrible", "poor"];
      let score = 0;
      for (const word of positive) if (lower.includes(word)) score += 1;
      for (const word of negative) if (lower.includes(word)) score -= 1;
      const sentiment = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
      const confidence = Math.min(1, Math.abs(score) * 0.2 + 0.3);
      return { sentiment, confidence };
    }
    case "extract_json": {
      const pattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      const matches = input.match(pattern) ?? [];
      const extracted: unknown[] = [];

      for (const candidate of matches) {
        try {
          extracted.push(JSON.parse(candidate));
        } catch {
          // Ignore invalid JSON snippets.
        }
      }

      return { extracted, count: extracted.length };
    }
    default:
      return { error: `Unknown task_type: ${taskType}` };
  }
}

async function ollamaInfer(
  prompt: string,
  maxTokens: number = 256,
  ollamaUrl: string = "http://localhost:11434"
): Promise<{ text: string; model: string }> {
  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      prompt,
      stream: false,
      options: { num_predict: maxTokens },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as { response: string; model: string };
  return { text: payload.response, model: payload.model };
}

function stubInfer(prompt: string, jobId: string): { text: string; model: string; stub: boolean } {
  return {
    text: `[STUB] Received prompt (${prompt.length} chars) for job ${jobId}. In production, this would be processed by a local LLM via Ollama or a GPU worker.`,
    model: "stub-v1",
    stub: true,
  };
}

async function executeLLM(
  prompt: string,
  jobId: string,
  maxTokens?: number,
  ollamaUrl?: string
): Promise<unknown> {
  if (ollamaUrl) {
    try {
      return await ollamaInfer(prompt, maxTokens, ollamaUrl);
    } catch {
      return stubInfer(prompt, jobId);
    }
  }

  return stubInfer(prompt, jobId);
}
