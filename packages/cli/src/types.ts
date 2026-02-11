import {
  JobType,
  Policy,
  PrivacyClass,
  type TaskType,
} from "@dispatch/protocol";

export type DispatchMode = "worker" | "agent" | "both";
export type DispatchChain = "monad" | "solana";
export type CliJobType = "llm" | "task";

export interface DispatchConfig {
  mode: DispatchMode;
  coordinator: {
    monad: string;
    solana: string;
  };
  worker: {
    keyPath: string;
    capabilities: JobType[];
    ollamaUrl: string;
    providerType: "DESKTOP";
  };
  agent: {
    defaultChain: DispatchChain;
    defaultPolicy: Policy;
    defaultPrivacy: PrivacyClass;
    userId: string;
  };
}

export interface AgentRunOptions {
  type: string;
  prompt?: string;
  input?: string;
  taskType?: string;
  policy?: string;
  privacy?: string;
  chain?: string;
  maxTokens?: number;
  json?: boolean;
}

export interface AgentQuoteOptions {
  type: string;
  policy?: string;
  chain?: string;
  json?: boolean;
  coordinator?: string;
}

export interface AgentStatusOptions {
  coordinator?: string;
  chain?: string;
  json?: boolean;
  poll?: boolean;
}

export interface WorkerStartOptions {
  coordinator?: string;
  capabilities?: string;
  ollamaUrl?: string;
  trustCode?: string;
  keyPath?: string;
}

export interface WorkerStatusOptions {
  coordinator?: string;
  pubkey?: string;
}

export interface WorkerRegisterOptions {
  name?: string;
  endpoint?: string;
  skills?: string;
  privateKey?: string;
}

export const ERROR_MESSAGES = {
  NO_CONFIG: "No .dispatchrc found. Run 'dispatch init' to set up.",
  PAYMENT_REQUIRED:
    "Payment required (x402). Set TESTNET_MODE=1 on the coordinator for free usage.",
  NO_TRUSTED_WORKER:
    "No trusted worker available for PRIVATE job. Run 'dispatch worker start --trust-code <code>' to pair a worker first.",
  JOB_TIMEOUT_30: "Job timed out after 30s. The worker may be overloaded.",
  JOB_TIMEOUT_60: "Job timed out after 60s. The worker may be overloaded.",
  MISSING_PRIVATE_KEY:
    "Error: Private key required. Use --private-key or set WORKER_PRIVATE_KEY env var.",
  PROMPT_FOR_TASK:
    "Error: --prompt is for LLM jobs. Use --input for task jobs.",
  INPUT_FOR_LLM:
    "Error: --input is for task jobs. Use --prompt for LLM jobs.",
  TASK_TYPE_REQUIRED:
    "Error: --task-type is required for task jobs. Options: summarize, classify, extract_json",
  PROMPT_REQUIRED: "Error: --prompt is required for LLM jobs.",
  INPUT_REQUIRED: "Error: --input is required for task jobs.",
} as const;

export function coordinatorUnreachableMessage(url: string): string {
  return `Cannot reach coordinator at ${url}. Is it running?`;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function mapJobType(value: string): JobType {
  const normalized = normalize(value);
  if (normalized === "llm" || normalized === "llm_infer") return JobType.LLM_INFER;
  if (normalized === "task") return JobType.TASK;
  throw new Error(`Unsupported job type: ${value}`);
}

export function mapPolicy(value: string): Policy {
  const normalized = normalize(value);
  if (normalized === "fast") return Policy.FAST;
  if (normalized === "cheap") return Policy.CHEAP;
  if (normalized === "auto") return Policy.AUTO;
  throw new Error(`Unsupported policy: ${value}`);
}

export function mapPrivacy(value: string): PrivacyClass {
  const normalized = normalize(value);
  if (normalized === "public") return PrivacyClass.PUBLIC;
  if (normalized === "private") return PrivacyClass.PRIVATE;
  throw new Error(`Unsupported privacy: ${value}`);
}

export function mapTaskType(value: string): TaskType {
  const normalized = normalize(value);
  if (normalized === "summarize") return "summarize";
  if (normalized === "classify") return "classify";
  if (normalized === "extract_json") return "extract_json";
  throw new Error(`Unsupported task type: ${value}`);
}

export function mapChain(value: string): DispatchChain {
  const normalized = normalize(value);
  if (normalized === "monad") return "monad";
  if (normalized === "solana") return "solana";
  throw new Error(`Unsupported chain: ${value}`);
}

export function mapCapabilities(list: string): JobType[] {
  const mapped = list
    .split(",")
    .map((item) => normalize(item))
    .filter(Boolean)
    .map((item) => {
      if (item === "llm" || item === "llm_infer") return JobType.LLM_INFER;
      if (item === "task") return JobType.TASK;
      throw new Error(`Unsupported capability: ${item}`);
    });

  return mapped.length > 0 ? mapped : [JobType.LLM_INFER, JobType.TASK];
}

export function validateAgentRunArgs(opts: {
  type: string;
  prompt?: string;
  input?: string;
  taskType?: string;
}): CliJobType {
  const type = normalize(opts.type) as CliJobType;

  if (type === "task" && opts.prompt) throw new Error(ERROR_MESSAGES.PROMPT_FOR_TASK);
  if (type === "llm" && opts.input) throw new Error(ERROR_MESSAGES.INPUT_FOR_LLM);
  if (type === "task" && !opts.taskType) throw new Error(ERROR_MESSAGES.TASK_TYPE_REQUIRED);
  if (type === "llm" && !opts.prompt) throw new Error(ERROR_MESSAGES.PROMPT_REQUIRED);
  if (type === "task" && !opts.input) throw new Error(ERROR_MESSAGES.INPUT_REQUIRED);

  if (type !== "llm" && type !== "task") {
    throw new Error("Error: --type must be llm or task.");
  }

  return type;
}
