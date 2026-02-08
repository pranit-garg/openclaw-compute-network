import type { CoordinatorConfig } from "./config.js";
import { getPrice, Policy, JobType } from "@openclaw/protocol";

/**
 * Build x402 payment resource config for paymentMiddleware.
 * Each chain-specific coordinator passes its own scheme + facilitator.
 *
 * Returns a config object shaped for @x402/express paymentMiddleware:
 * {
 *   "POST /v1/jobs/commit/fast": { accepts: [...], description, mimeType },
 *   "POST /v1/jobs/commit/cheap": { accepts: [...], description, mimeType }
 * }
 */
export function buildPaymentConfig(
  config: CoordinatorConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scheme: any
): Record<string, unknown> {
  const makeAccept = (price: string) => ({
    scheme: "exact",
    price,
    network: config.network,
    payTo: config.payTo,
    ...(config.asset ? { asset: config.asset } : {}),
  });

  return {
    [`POST /v1/jobs/commit/fast`]: {
      accepts: [makeAccept(getPrice(Policy.FAST, JobType.LLM_INFER))],
      description: "Fast compute job",
      mimeType: "application/json",
    },
    [`POST /v1/jobs/commit/cheap`]: {
      accepts: [makeAccept(getPrice(Policy.CHEAP, JobType.TASK))],
      description: "Cheap compute job",
      mimeType: "application/json",
    },
  };
}
