import { Router } from "express";
import {
  JobType,
  Policy,
  resolvePolicy,
  getPrice,
  type Quote,
} from "@dispatch/protocol";

export function quoteRouter(network: string): Router {
  const router = Router();

  router.get("/v1/quote", (req, res) => {
    const jobTypeRaw = req.query.job_type as string | undefined;
    const policyRaw = req.query.policy as string | undefined;

    if (!jobTypeRaw || !Object.values(JobType).includes(jobTypeRaw as JobType)) {
      res.status(400).json({ error: "Invalid job_type. Use LLM_INFER or TASK" });
      return;
    }
    const jobType = jobTypeRaw as JobType;
    const policy = (policyRaw as Policy) ?? Policy.AUTO;
    const resolved = resolvePolicy(policy, jobType);
    const price = getPrice(resolved, jobType);

    // Determine commit endpoint from resolved policy
    const tier = resolved === Policy.FAST ? "fast" : "cheap";

    const quote: Quote = {
      price,
      endpoint: `/v1/jobs/commit/${tier}`,
      policy_resolved: resolved,
      network,
      expires_at: null,
    };

    res.json(quote);
  });

  return router;
}
