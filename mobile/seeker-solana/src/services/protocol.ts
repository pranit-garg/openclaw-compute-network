/**
 * Standalone protocol types for the Dispatch WebSocket protocol.
 * Copied/adapted from @dispatch/protocol — NOT imported from monorepo.
 *
 * This defines every message type the mobile worker sends/receives
 * when talking to a coordinator node.
 */

// ── Enums ──────────────────────────────────────

export enum JobType {
  LLM_INFER = "LLM_INFER",
  TASK = "TASK",
}

export type TaskType = "summarize" | "classify" | "extract_json";

export enum Policy {
  FAST = "FAST",
  CHEAP = "CHEAP",
  AUTO = "AUTO",
}

export enum PrivacyClass {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum JobStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

// ── Worker → Coordinator Messages ─────────────

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
  /** Bundled receipt — coordinator stores atomically with job completion */
  receipt?: {
    job_id: string;
    provider_pubkey: string;
    output_hash: string;
    completed_at: string;
    payment_ref: string | null;
  };
  /** ed25519 signature over canonical JSON of receipt (base64) */
  receipt_signature?: string;
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

// ── Coordinator → Worker Messages ─────────────

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

export interface FeedbackPostedMsg {
  type: "feedback_posted";
  job_id: string;
  tx_hash: string;
  network: string;
  explorer_url: string;
}

export interface PaymentPostedMsg {
  type: "payment_posted";
  job_ids: string[];
  tx_hash: string;
  amount: string;
  token?: "BOLT" | "wBOLT";
  network: "solana-devnet" | "monad-testnet";
  explorer_url: string;
}

export interface FeedbackFailedMsg {
  type: "feedback_failed";
  job_id: string;
  error: string;
}

export interface PaymentFailedMsg {
  type: "payment_failed";
  job_ids: string[];
  error: string;
}

// ── Union Types ───────────────────────────────

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
  | ErrorMsg
  | FeedbackPostedMsg
  | PaymentPostedMsg
  | FeedbackFailedMsg
  | PaymentFailedMsg;

export type WSMessage = WorkerToCoordinator | CoordinatorToWorker;

// ── Message Creators ──────────────────────────

/**
 * Helper functions to create properly-typed WS messages.
 * Prevents typos in the `type` field.
 */

export function createRegisterMsg(
  pubkey: string,
  capabilities: JobType[] = [JobType.TASK]
): RegisterMsg {
  return {
    type: "register",
    provider_pubkey: pubkey,
    provider_type: "SEEKER",
    capabilities,
  };
}

export function createHeartbeatMsg(pubkey: string): HeartbeatMsg {
  return {
    type: "heartbeat",
    provider_pubkey: pubkey,
  };
}

export function createJobCompleteMsg(
  jobId: string,
  output: unknown,
  outputHash: string,
  receipt?: JobCompleteMsg["receipt"],
  receiptSignature?: string
): JobCompleteMsg {
  return {
    type: "job_complete",
    job_id: jobId,
    output,
    output_hash: outputHash,
    receipt,
    receipt_signature: receiptSignature,
  };
}

export function createJobRejectMsg(
  jobId: string,
  reason: string
): JobRejectMsg {
  return {
    type: "job_reject",
    job_id: jobId,
    reason,
  };
}
