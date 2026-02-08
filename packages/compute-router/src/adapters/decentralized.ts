import {
  JobType,
  Policy,
  resolvePolicy,
  type Quote,
} from "@openclaw/protocol";
import type { ComputeAdapter, ComputeResult, LLMRequest, TaskRequest } from "./types.js";
import { fetchJson, sleep } from "../util.js";

export interface DecentralizedConfig {
  coordinatorUrl: string;
  networkLabel: string; // "monad" | "solana"
}

export class DecentralizedAdapter implements ComputeAdapter {
  name: string;
  private url: string;

  constructor(private config: DecentralizedConfig) {
    this.name = `decentralized:${config.networkLabel}`;
    this.url = config.coordinatorUrl;
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

    // 2. Submit job (in MVP mode without x402, the commit endpoint works directly)
    // When x402 is enabled, we'd get a 402 → sign payment → retry
    const tier = policy === Policy.FAST ? "fast" : "cheap";
    const commitUrl = `${this.url}/v1/jobs/commit/${tier}`;

    let commitRes = await fetch(commitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_type: jobType,
        payload,
        privacy_class: privacyClass,
        user_id: userId,
      }),
    });

    // Handle x402 402 response (for future: sign and retry)
    if (commitRes.status === 402) {
      // STUB — TODO: Implement x402 client-side payment signing — See BACKLOG.md#x402-client-payments
      // For now, this means x402 is enabled but we can't pay. Throw clear error.
      throw new Error("x402 payment required but client-side signing not implemented yet. Disable x402 on coordinator for testing.");
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
