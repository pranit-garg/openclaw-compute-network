import { ComputeRouter } from "@dispatch/compute-router";
import { loadConfig } from "../../lib/config.js";
import { createSpinner, keyValue, printCommandError } from "../../lib/display.js";
import {
  ERROR_MESSAGES,
  coordinatorUnreachableMessage,
  mapChain,
  mapJobType,
  mapPolicy,
  mapPrivacy,
  mapTaskType,
  validateAgentRunArgs,
  type AgentRunOptions,
  type CliJobType,
} from "../../types.js";

function formatReceipt(receipt: unknown): string {
  if (!receipt || typeof receipt !== "object") return "none";
  const rec = receipt as Record<string, unknown>;
  const hash = String(rec.output_hash ?? "");
  const worker = String(rec.provider_pubkey ?? "");
  if (!hash || !worker) return JSON.stringify(receipt);
  return `hash=${hash.slice(0, 8)}... worker=${worker.slice(0, 8)}...`;
}

function writeResultPayload(output: unknown): void {
  if (typeof output === "string") {
    process.stdout.write(`${output}\n`);
    return;
  }

  if (typeof output === "object" && output !== null && "text" in output) {
    process.stdout.write(`${String((output as Record<string, unknown>).text)}\n`);
    return;
  }

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

function mapRunError(message: string, type: CliJobType, coordinatorUrl: string): string {
  if (message.includes("HTTP 402") || message.includes("x402 payment required")) {
    return ERROR_MESSAGES.PAYMENT_REQUIRED;
  }

  if (message.includes("no_trusted_worker")) {
    return ERROR_MESSAGES.NO_TRUSTED_WORKER;
  }

  if (message.includes("timed out")) {
    return type === "llm" ? ERROR_MESSAGES.JOB_TIMEOUT_60 : ERROR_MESSAGES.JOB_TIMEOUT_30;
  }

  if (message.includes("fetch failed") || message.includes("Cannot reach coordinator")) {
    return coordinatorUnreachableMessage(coordinatorUrl);
  }

  return message;
}

export async function handler(opts: AgentRunOptions): Promise<void> {
  const spinner = createSpinner("Preparing job...").start();

  try {
    const config = loadConfig();
    const type = validateAgentRunArgs({
      type: opts.type,
      prompt: opts.prompt,
      input: opts.input,
      taskType: opts.taskType,
    });

    const chain = mapChain(opts.chain ?? config.agent.defaultChain);
    const policy = mapPolicy(opts.policy ?? String(config.agent.defaultPolicy));
    const privacy = mapPrivacy(opts.privacy ?? String(config.agent.defaultPrivacy));
    const jobType = mapJobType(type);

    spinner.text = `Submitting ${type === "llm" ? "LLM" : "TASK"} job to ${chain} coordinator...`;

    const router = new ComputeRouter({
      coordinatorUrls: config.coordinator,
    });

    const result =
      jobType === "LLM_INFER"
        ? await router.runLLM({
            prompt: opts.prompt!,
            max_tokens: opts.maxTokens ?? 256,
            policy,
            privacy,
            user_id: config.agent.userId,
            chainPreference: chain,
          })
        : await router.runTask({
            task_type: mapTaskType(opts.taskType!),
            input: opts.input!,
            policy,
            privacy,
            user_id: config.agent.userId,
            chainPreference: chain,
          });

    spinner.succeed("Job completed");

    if (opts.json) {
      process.stdout.write(
        `${JSON.stringify(
          {
            result: result.output,
            route: result.route,
            price: result.price,
            latency_ms: result.latency_ms,
            receipt: result.receipt,
          },
          null,
          2
        )}\n`
      );
    } else {
      writeResultPayload(result.output);
    }

    console.error("");
    keyValue("Route:", String(result.route));
    keyValue("Price:", String(result.price ?? "n/a"));
    keyValue("Latency:", `${result.latency_ms}ms`);
    keyValue("Receipt:", formatReceipt(result.receipt));
  } catch (err) {
    spinner.stop();
    const message = err instanceof Error ? err.message : String(err);

    // Resolve defaults before reporting connectivity failures.
    const fallbackChain = opts.chain?.toLowerCase() === "solana" ? "solana" : "monad";
    const fallbackCoordinator =
      fallbackChain === "solana" ? "http://localhost:4020" : "http://localhost:4010";

    const mapped = mapRunError(
      message,
      (opts.type?.toLowerCase() as CliJobType) ?? "llm",
      fallbackCoordinator
    );
    printCommandError(mapped);
  }
}
