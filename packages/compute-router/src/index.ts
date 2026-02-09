import {
  JobType,
  Policy,
  PrivacyClass,
  resolvePolicy,
} from "@dispatch/protocol";
import type { ComputeAdapter, ComputeResult, LLMRequest, TaskRequest } from "./adapters/types.js";
import { DecentralizedAdapter, type X402ClientLike } from "./adapters/decentralized.js";
import { OpenAIAdapter } from "./adapters/openai.js";
import { AnthropicAdapter } from "./adapters/anthropic.js";

export type { ComputeResult, LLMRequest, TaskRequest, X402ClientLike };

export interface ComputeRouterConfig {
  coordinatorUrls: {
    monad: string;
    solana: string;
  };
  preferredHosted?: "openai" | "anthropic";
  /** Optional x402 HTTP clients for automatic payment handling per chain */
  x402Clients?: {
    monad?: X402ClientLike;
    solana?: X402ClientLike;
  };
}

/**
 * ComputeRouter — main SDK entry point.
 *
 * Routes jobs to decentralized workers or hosted BYOK providers
 * based on policy, privacy, and chain preference.
 */
export class ComputeRouter {
  private decentralized: Record<string, DecentralizedAdapter>;
  private hostedAdapters: ComputeAdapter[];

  constructor(private config: ComputeRouterConfig) {
    this.decentralized = {
      monad: new DecentralizedAdapter({
        coordinatorUrl: config.coordinatorUrls.monad,
        networkLabel: "monad",
        x402Client: config.x402Clients?.monad,
      }),
      solana: new DecentralizedAdapter({
        coordinatorUrl: config.coordinatorUrls.solana,
        networkLabel: "solana",
        x402Client: config.x402Clients?.solana,
      }),
    };

    // Order hosted adapters by preference
    const preferred = config.preferredHosted ?? "openai";
    const openai = new OpenAIAdapter();
    const anthropic = new AnthropicAdapter();
    this.hostedAdapters = preferred === "openai" ? [openai, anthropic] : [anthropic, openai];
  }

  /**
   * Run an LLM inference job.
   * Chain preference selects which coordinator to use for decentralized routing.
   */
  async runLLM(opts: {
    prompt: string;
    max_tokens?: number;
    policy?: Policy;
    privacy?: PrivacyClass;
    user_id: string;
    chainPreference?: "monad" | "solana";
  }): Promise<ComputeResult> {
    const policy = opts.policy ?? Policy.AUTO;
    const privacy = opts.privacy ?? PrivacyClass.PUBLIC;
    const chain = opts.chainPreference ?? "monad";

    const req: LLMRequest = {
      prompt: opts.prompt,
      max_tokens: opts.max_tokens,
      policy,
      privacy,
      user_id: opts.user_id,
    };

    // Try decentralized first
    try {
      return await this.decentralized[chain]!.runLLM(req);
    } catch (err) {
      console.warn(`[ComputeRouter] Decentralized (${chain}) failed: ${(err as Error).message}`);
    }

    // Fall back to hosted BYOK if PRIVATE job failed on decentralized
    return this.hostedFallback("runLLM", req);
  }

  /**
   * Run a TASK job (summarize, classify, extract_json).
   */
  async runTask(opts: {
    task_type: "summarize" | "classify" | "extract_json";
    input: string;
    policy?: Policy;
    privacy?: PrivacyClass;
    user_id: string;
    chainPreference?: "monad" | "solana";
  }): Promise<ComputeResult> {
    const policy = opts.policy ?? Policy.AUTO;
    const privacy = opts.privacy ?? PrivacyClass.PUBLIC;
    const chain = opts.chainPreference ?? "monad";

    const req: TaskRequest = {
      task_type: opts.task_type,
      input: opts.input,
      policy,
      privacy,
      user_id: opts.user_id,
    };

    try {
      return await this.decentralized[chain]!.runTask(req);
    } catch (err) {
      console.warn(`[ComputeRouter] Decentralized (${chain}) failed: ${(err as Error).message}`);
    }

    return this.hostedFallback("runTask", req);
  }

  private async hostedFallback(
    method: "runLLM" | "runTask",
    req: LLMRequest | TaskRequest
  ): Promise<ComputeResult> {
    for (const adapter of this.hostedAdapters) {
      try {
        if (method === "runLLM") {
          return await adapter.runLLM(req as LLMRequest);
        } else {
          return await adapter.runTask(req as TaskRequest);
        }
      } catch (err) {
        console.warn(`[ComputeRouter] ${adapter.name} failed: ${(err as Error).message}`);
      }
    }
    throw new Error("All compute adapters failed. Ensure workers are running or BYOK API keys are set.");
  }
}
