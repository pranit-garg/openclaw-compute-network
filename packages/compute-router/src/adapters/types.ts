import type { JobType, Policy, PrivacyClass, TaskType } from "@openclaw/protocol";

export interface LLMRequest {
  prompt: string;
  max_tokens?: number;
  policy: Policy;
  privacy: PrivacyClass;
  user_id: string;
}

export interface TaskRequest {
  task_type: TaskType;
  input: string;
  policy: Policy;
  privacy: PrivacyClass;
  user_id: string;
}

export interface ComputeResult {
  output: unknown;
  route: string; // "decentralized:monad" | "decentralized:solana" | "hosted:openai" | "hosted:anthropic"
  price: string | null;
  latency_ms: number;
  receipt: unknown | null;
}

export interface ComputeAdapter {
  name: string;
  runLLM(req: LLMRequest): Promise<ComputeResult>;
  runTask(req: TaskRequest): Promise<ComputeResult>;
}
