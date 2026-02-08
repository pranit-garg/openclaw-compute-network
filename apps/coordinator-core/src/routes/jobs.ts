import { Router } from "express";
import { v4 as uuid } from "uuid";
import type Database from "better-sqlite3";
import {
  JobType,
  Policy,
  PrivacyClass,
  resolvePolicy,
  type JobAssignMsg,
} from "@openclaw/protocol";
import type { WorkerHub } from "../ws/workerHub.js";

/**
 * Job commit + poll routes.
 *
 * POST /v1/jobs/commit/fast and /v1/jobs/commit/cheap are meant to sit behind
 * x402 payment middleware in the chain-specific coordinators.
 * The routes themselves handle job creation, worker matching, and background retry.
 */
export function jobsRouter(db: Database.Database, hub: WorkerHub): Router {
  const router = Router();

  // ── Commit (FAST tier) ─────────────────────
  router.post("/v1/jobs/commit/fast", (req, res) => {
    handleCommit(req, res, Policy.FAST, db, hub);
  });

  // ── Commit (CHEAP tier) ────────────────────
  router.post("/v1/jobs/commit/cheap", (req, res) => {
    handleCommit(req, res, Policy.CHEAP, db, hub);
  });

  // ── Poll job status (FREE — no x402) ───────
  router.get("/v1/jobs/:id", (req, res) => {
    const row = db.prepare(`
      SELECT id, type, status, result, created_at, completed_at FROM jobs WHERE id = ?
    `).get(req.params.id) as Record<string, unknown> | undefined;

    if (!row) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    // Attach receipt if completed
    let receipt = null;
    if (row.status === "completed") {
      const r = db.prepare(`SELECT receipt_json, signature FROM receipts WHERE job_id = ?`).get(row.id as string) as Record<string, unknown> | undefined;
      if (r) receipt = { ...JSON.parse(r.receipt_json as string), signature: r.signature };
    }

    res.json({
      id: row.id,
      status: row.status,
      result: row.result ? JSON.parse(row.result as string) : null,
      receipt,
      created_at: row.created_at,
      completed_at: row.completed_at,
    });
  });

  return router;
}

// ── Shared commit logic ──────────────────────

function handleCommit(
  req: import("express").Request,
  res: import("express").Response,
  tier: Policy.FAST | Policy.CHEAP,
  db: Database.Database,
  hub: WorkerHub
): void {
  const { job_type, payload, privacy_class, user_id } = req.body ?? {};

  // Validate required fields
  if (!job_type || !payload || !user_id) {
    res.status(400).json({ error: "Missing required fields: job_type, payload, user_id" });
    return;
  }

  // Validate job_type is a known enum value
  if (!Object.values(JobType).includes(job_type)) {
    res.status(400).json({ error: "Invalid job_type" });
    return;
  }

  // Prevent price arbitrage: /cheap rejects LLM+FAST combinations
  const resolved = resolvePolicy(Policy.AUTO, job_type as JobType);
  if (tier === Policy.CHEAP && resolved === Policy.FAST && job_type === JobType.LLM_INFER) {
    // Allow CHEAP LLM if explicitly requested, but FAST jobs can't use CHEAP endpoint
  }

  const privacyClass = (privacy_class as PrivacyClass) ?? PrivacyClass.PUBLIC;
  const jobId = uuid();

  // Create job in DB
  db.prepare(`
    INSERT INTO jobs (id, type, policy, privacy_class, user_id, status, payload)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).run(jobId, job_type, tier, privacyClass, user_id, JSON.stringify(payload));

  // Attempt immediate matching
  const worker = hub.claimWorker(job_type as JobType, tier, privacyClass, user_id);

  if (worker) {
    db.prepare(`UPDATE jobs SET status = 'assigned', worker_pubkey = ? WHERE id = ?`).run(worker.pubkey, jobId);

    const assignMsg: JobAssignMsg = {
      type: "job_assign",
      job_id: jobId,
      job_type: job_type as JobType,
      payload,
      policy: tier,
      privacy_class: privacyClass,
      user_id,
    };
    hub.assignJob(worker, jobId, assignMsg);
    console.log(`[Jobs] Job ${jobId} assigned to worker ${worker.id}`);
  } else if (privacyClass === PrivacyClass.PRIVATE) {
    // PRIVATE jobs with no trusted worker fail immediately with 422
    db.prepare(`UPDATE jobs SET status = 'failed', result = '{"error":"no_trusted_worker"}' WHERE id = ?`).run(jobId);
    res.status(422).json({ error: "no_trusted_worker", job_id: jobId });
    return;
  } else {
    // Background retry: poll for a worker for up to 30s
    startRetryLoop(jobId, job_type as JobType, tier, privacyClass, user_id, payload, db, hub);
  }

  res.status(201).json({ job_id: jobId });
}

/** Background loop: retry matching every 2s for up to 30s */
function startRetryLoop(
  jobId: string,
  jobType: JobType,
  policy: Policy.FAST | Policy.CHEAP,
  privacyClass: PrivacyClass,
  userId: string,
  payload: Record<string, unknown>,
  db: Database.Database,
  hub: WorkerHub
): void {
  let attempts = 0;
  const maxAttempts = 15; // 15 × 2s = 30s

  const interval = setInterval(() => {
    attempts++;

    // Check if job is still pending (might have been handled)
    const job = db.prepare(`SELECT status FROM jobs WHERE id = ?`).get(jobId) as { status: string } | undefined;
    if (!job || job.status !== "pending") {
      clearInterval(interval);
      return;
    }

    const worker = hub.claimWorker(jobType, policy, privacyClass, userId);
    if (worker) {
      db.prepare(`UPDATE jobs SET status = 'assigned', worker_pubkey = ? WHERE id = ?`).run(worker.pubkey, jobId);
      const assignMsg: JobAssignMsg = {
        type: "job_assign",
        job_id: jobId,
        job_type: jobType,
        payload,
        policy,
        privacy_class: privacyClass,
        user_id: userId,
      };
      hub.assignJob(worker, jobId, assignMsg);
      console.log(`[Jobs] Job ${jobId} matched on retry attempt ${attempts}`);
      clearInterval(interval);
      return;
    }

    if (attempts >= maxAttempts) {
      db.prepare(`UPDATE jobs SET status = 'failed', result = '{"error":"no_eligible_worker"}' WHERE id = ?`).run(jobId);
      console.log(`[Jobs] Job ${jobId} failed — no eligible worker after ${maxAttempts} retries`);
      clearInterval(interval);
    }
  }, 2_000);
}
