import type { CoordinatorConfig } from "./config.js";
import { getPrice, Policy, JobType } from "@dispatch/protocol";

/**
 * Build x402 payment resource config for paymentMiddleware.
 *
 * Returns a config object shaped for @x402/express paymentMiddleware:
 * {
 *   "POST /v1/jobs/commit/fast": { accepts: [...], description, mimeType },
 *   "POST /v1/jobs/commit/cheap": { accepts: [...], description, mimeType }
 * }
 *
 * The return type uses `as const` style network strings so it's compatible
 * with @x402/express RoutesConfig without coordinator-core depending on @x402/core.
 */
export function buildPaymentConfig(config: CoordinatorConfig) {
  const network = config.network as `${string}:${string}`;

  const makeAccept = (price: string) => ({
    scheme: "exact" as const,
    price,
    network,
    payTo: config.payTo,
    ...(config.asset ? { asset: config.asset } : {}),
  });

  return {
    "POST /v1/jobs/commit/fast": {
      accepts: [makeAccept(getPrice(Policy.FAST, JobType.LLM_INFER))],
      description: "Fast compute job",
      mimeType: "application/json",
    },
    "POST /v1/jobs/commit/cheap": {
      accepts: [makeAccept(getPrice(Policy.CHEAP, JobType.TASK))],
      description: "Cheap compute job",
      mimeType: "application/json",
    },
  };
}
