import { Policy, PrivacyClass } from "@dispatch/protocol";
import type { ComputeRouter } from "@dispatch/compute-router";
import type { ComputeResult } from "@dispatch/compute-router";

interface ScenarioResult {
  name: string;
  passed: boolean;
  result?: ComputeResult;
  error?: string;
}

/**
 * Run all 3 demo scenarios for a given chain.
 */
export async function runScenarios(
  router: ComputeRouter,
  chain: "monad" | "solana"
): Promise<ScenarioResult[]> {
  const results: ScenarioResult[] = [];

  // ── Scenario 1: PUBLIC + FAST + LLM_INFER ──
  console.log(`\n  [1/3] PUBLIC + FAST + LLM_INFER`);
  try {
    const r = await router.runLLM({
      prompt: "Explain what a decentralized compute network is in one sentence.",
      max_tokens: 100,
      policy: Policy.FAST,
      privacy: PrivacyClass.PUBLIC,
      user_id: "demo-user-1",
      chainPreference: chain,
    });
    results.push({ name: "PUBLIC_FAST_LLM", passed: true, result: r });
    printResult(r);
  } catch (err) {
    results.push({ name: "PUBLIC_FAST_LLM", passed: false, error: (err as Error).message });
    console.log(`    FAIL: ${(err as Error).message}`);
  }

  // ── Scenario 2: PUBLIC + CHEAP + TASK summarize ──
  console.log(`\n  [2/3] PUBLIC + CHEAP + TASK (summarize)`);
  try {
    const r = await router.runTask({
      task_type: "summarize",
      input: "Dispatch is building a decentralized compute network that connects mobile devices (Seekers) and desktop machines (Workers) to process AI inference and data tasks. The network uses x402 payment protocol for micropayments and supports both Monad and Solana blockchains. Privacy controls allow users to route sensitive jobs only to trusted workers they've explicitly paired with.",
      policy: Policy.CHEAP,
      privacy: PrivacyClass.PUBLIC,
      user_id: "demo-user-1",
      chainPreference: chain,
    });
    results.push({ name: "PUBLIC_CHEAP_TASK", passed: true, result: r });
    printResult(r);
  } catch (err) {
    results.push({ name: "PUBLIC_CHEAP_TASK", passed: false, error: (err as Error).message });
    console.log(`    FAIL: ${(err as Error).message}`);
  }

  // ── Scenario 3: PRIVATE + CHEAP + TASK ──
  // This should fall back to hosted BYOK since no trusted worker exists in demo
  console.log(`\n  [3/3] PRIVATE + CHEAP + TASK (summarize) → hosted fallback`);
  try {
    const r = await router.runTask({
      task_type: "summarize",
      input: "This is a private document that should only be processed by trusted workers. It contains sensitive business information about Q4 revenue targets and strategic partnerships.",
      policy: Policy.CHEAP,
      privacy: PrivacyClass.PRIVATE,
      user_id: "demo-user-1",
      chainPreference: chain,
    });
    results.push({ name: "PRIVATE_CHEAP_TASK", passed: true, result: r });
    printResult(r);
  } catch (err) {
    // Expected to fail if no BYOK keys set — that's informative, not a test failure
    const msg = (err as Error).message;
    const isExpected = msg.includes("no_trusted_worker") || msg.includes("API keys");
    results.push({
      name: "PRIVATE_CHEAP_TASK",
      passed: isExpected, // Pass if failure is expected (no trusted worker, no BYOK keys)
      error: msg,
    });
    console.log(`    ${isExpected ? "EXPECTED" : "FAIL"}: ${msg}`);
  }

  return results;
}

function printResult(r: ComputeResult): void {
  console.log(`    Route:   ${r.route}`);
  console.log(`    Price:   ${r.price ?? "N/A (hosted BYOK)"}`);
  console.log(`    Latency: ${r.latency_ms}ms`);
  if (r.receipt) {
    const receipt = r.receipt as Record<string, unknown>;
    const verified = receipt.verified === true ? "VERIFIED" : "unverified";
    console.log(`    Receipt: hash=${String(receipt.output_hash ?? "").slice(0, 16)}... worker=${String(receipt.provider_pubkey ?? "").slice(0, 16)}...`);
    console.log(`    Sig:     ${verified} (ed25519)`);
  } else {
    console.log(`    Receipt: N/A (hosted)`);
  }
}
