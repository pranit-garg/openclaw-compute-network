import type { JobType, TaskType, Policy, PrivacyClass } from "./types.js";

// ── Worker → Coordinator ───────────────────────

export interface RegisterMsg {
  type: "register";
  provider_pubkey: string;
  provider_type: "DESKTOP" | "SEEKER";
  capabilities: JobType[];
  pricing_hint?: string;
}

export interface HeartbeatMsg {
  type: "heartbeat";
  provider_pubkey: string;
  metrics?: {
    cpu_pct?: number;
    mem_pct?: number;
    active_jobs?: number;
  };
}

export interface JobCompleteMsg {
  type: "job_complete";
  job_id: string;
  output: unknown;
  output_hash: string;
}

export interface JobRejectMsg {
  type: "job_reject";
  job_id: string;
  reason: string;
}

export interface ReceiptSubmitMsg {
  type: "receipt_submit";
  receipt: {
    job_id: string;
    provider_pubkey: string;
    output_hash: string;
    completed_at: string;
    payment_ref: string | null;
  };
  signature: string; // base64 ed25519
}

// ── Coordinator → Worker ───────────────────────

export interface RegisterAckMsg {
  type: "register_ack";
  status: "ok" | "error";
  worker_id?: string;
  error?: string;
}

export interface HeartbeatAckMsg {
  type: "heartbeat_ack";
  status: "ok";
}

export interface JobAssignMsg {
  type: "job_assign";
  job_id: string;
  job_type: JobType;
  payload: {
    prompt?: string;
    max_tokens?: number;
    task_type?: TaskType;
    input?: string;
  };
  policy: Policy;
  privacy_class: PrivacyClass;
  user_id: string;
}

export interface ErrorMsg {
  type: "error";
  code: string;
  message: string;
}

// ── Union Types ────────────────────────────────

export type WorkerToCoordinator =
  | RegisterMsg
  | HeartbeatMsg
  | JobCompleteMsg
  | JobRejectMsg
  | ReceiptSubmitMsg;

export type CoordinatorToWorker =
  | RegisterAckMsg
  | HeartbeatAckMsg
  | JobAssignMsg
  | ErrorMsg;

export type WSMessage = WorkerToCoordinator | CoordinatorToWorker;
