import {
  JobType,
  Policy,
  resolvePolicy,
  type Quote,
} from "@dispatch/protocol";
import type { ComputeAdapter, ComputeResult, LLMRequest, TaskRequest } from "./types.js";
import { fetchJson, sleep } from "../util.js";

export interface DecentralizedConfig {
  coordinatorUrl: string;
  networkLabel: string; // "monad" | "solana"
  /**
   * Optional x402 client for automatic payment handling.
   * When provided, 402 responses will be handled transparently.
   * When omitted, 402 responses throw an error (testnet mode).
   */
  x402Client?: X402ClientLike;
}

/**
 * Minimal interface for x402 HTTP client — avoids hard dependency on @x402/core.
 * Matches the x402HTTPClient API shape.
 */
export interface X402ClientLike {
  getPaymentRequiredResponse(
    getHeader: (name: string) => string | null | undefined,
    body?: unknown,
  ): unknown; // PaymentRequired
  createPaymentPayload(paymentRequired: unknown): Promise<unknown>; // PaymentPayload
  encodePaymentSignatureHeader(paymentPayload: unknown): Record<string, string>;
}

export class DecentralizedAdapter implements ComputeAdapter {
  name: string;
  private url: string;
  private x402Client?: X402ClientLike;

  constructor(private config: DecentralizedConfig) {
    this.name = `decentralized:${config.networkLabel}`;
    this.url = config.coordinatorUrl;
    this.x402Client = config.x402Client;
  }

  async runLLM(req: LLMRequest): Promise<ComputeResult> {
    const resolved = resolvePolicy(req.policy, JobType.LLM_INFER);
    return this.submit(JobType.LLM_INFER, resolved, req.privacy, req.user_id, {
      job_type: JobType.LLM_INFER,
      prompt: req.prompt,
      max_tokens: req.max_tokens,
    });
  }

  async runTask(req: TaskRequest): Promise<ComputeResult> {
    const resolved = resolvePolicy(req.policy, JobType.TASK);
    return this.submit(JobType.TASK, resolved, req.privacy, req.user_id, {
      job_type: JobType.TASK,
      task_type: req.task_type,
      input: req.input,
    });
  }

  private async submit(
    jobType: JobType,
    policy: Policy.FAST | Policy.CHEAP,
    privacyClass: string,
    userId: string,
    payload: Record<string, unknown>
  ): Promise<ComputeResult> {
    const start = Date.now();

    // 1. Get quote
    const quote = await fetchJson<Quote>(
      `${this.url}/v1/quote?job_type=${jobType}&policy=${policy}`
    );

    // 2. Submit job
    const tier = policy === Policy.FAST ? "fast" : "cheap";
    const commitUrl = `${this.url}/v1/jobs/commit/${tier}`;
    const body = JSON.stringify({
      job_type: jobType,
      payload,
      privacy_class: privacyClass,
      user_id: userId,
    });

    let commitRes = await fetch(commitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    // Handle x402 402 response
    if (commitRes.status === 402) {
      if (!this.x402Client) {
        throw new Error(
          "x402 payment required but no x402Client configured. " +
          "Set TESTNET_MODE=true on coordinator or provide an x402Client."
        );
      }

      // Extract payment requirements from 402 response
      const resBody = await commitRes.json().catch(() => undefined);
      const paymentRequired = this.x402Client.getPaymentRequiredResponse(
        (name) => commitRes.headers.get(name),
        resBody,
      );

      // Create and sign payment payload
      const paymentPayload = await this.x402Client.createPaymentPayload(paymentRequired);
      const paymentHeaders = this.x402Client.encodePaymentSignatureHeader(paymentPayload);

      // Retry with payment header
      commitRes = await fetch(commitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...paymentHeaders,
        },
        body,
      });
    }

    if (commitRes.status === 422) {
      // Privacy enforcement: no trusted worker available
      const err = (await commitRes.json()) as { error: string };
      throw new Error(`Privacy enforcement: ${err.error}`);
    }

    if (!commitRes.ok) {
      const err = await commitRes.text();
      throw new Error(`Commit failed: ${commitRes.status} ${err}`);
    }

    const { job_id } = (await commitRes.json()) as { job_id: string };

    // 3. Poll for result
    const timeout = jobType === JobType.TASK ? 30_000 : 60_000;
    const result = await this.pollResult(job_id, timeout);

    return {
      output: result.result,
      route: this.name,
      price: quote.price,
      latency_ms: Date.now() - start,
      receipt: result.receipt,
    };
  }

  private async pollResult(
    jobId: string,
    timeoutMs: number
  ): Promise<{ result: unknown; receipt: unknown }> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const job = await fetchJson<{
        id: string;
        status: string;
        result: unknown;
        receipt: unknown;
      }>(`${this.url}/v1/jobs/${jobId}`);

      if (job.status === "completed") {
        return { result: job.result, receipt: job.receipt };
      }
      if (job.status === "failed") {
        throw new Error(`Job ${jobId} failed: ${JSON.stringify(job.result)}`);
      }

      await sleep(500);
    }

    throw new Error(`Job ${jobId} timed out after ${timeoutMs}ms`);
  }
}
