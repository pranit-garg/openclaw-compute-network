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

export enum ProviderType {
  DESKTOP = "DESKTOP",
  SEEKER = "SEEKER",
}

export enum JobStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

// ── Core Interfaces ────────────────────────────

export interface Job {
  id: string;
  type: JobType;
  policy: Policy;
  privacy_class: PrivacyClass;
  user_id: string;
  status: JobStatus;
  payload: JobPayload;
  result: unknown | null;
  worker_pubkey: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface LLMPayload {
  job_type: JobType.LLM_INFER;
  prompt: string;
  max_tokens?: number;
}

export interface TaskPayload {
  job_type: JobType.TASK;
  task_type: TaskType;
  input: string;
}

export type JobPayload = LLMPayload | TaskPayload;

export interface Quote {
  price: string;
  endpoint: string;
  policy_resolved: Policy.FAST | Policy.CHEAP;
  network: string;
  expires_at: null; // reserved for future dynamic pricing
}

export interface Receipt {
  job_id: string;
  provider_pubkey: string;
  output_hash: string;
  completed_at: string;
  payment_ref: string | null;
}

export interface TrustPairing {
  id: string;
  user_id: string;
  provider_pubkey: string;
  pairing_code: string;
  claimed: boolean;
  expires_at: string;
  created_at: string;
}

// ── Pricing ────────────────────────────────────

/** Prices in USD as strings (used for x402 exact pricing) */
export const PRICING_MAP: Record<string, string> = {
  FAST_LLM_INFER: "$0.010",
  FAST_TASK: "$0.003",
  CHEAP_LLM_INFER: "$0.005",
  CHEAP_TASK: "$0.001",
};

/** Resolve AUTO policy: LLM → FAST, TASK → CHEAP */
export function resolvePolicy(
  policy: Policy,
  jobType: JobType
): Policy.FAST | Policy.CHEAP {
  if (policy !== Policy.AUTO) return policy as Policy.FAST | Policy.CHEAP;
  return jobType === JobType.LLM_INFER ? Policy.FAST : Policy.CHEAP;
}

export function getPrice(policy: Policy.FAST | Policy.CHEAP, jobType: JobType): string {
  const key = `${policy}_${jobType}`;
  return PRICING_MAP[key] ?? "$0.001";
}
