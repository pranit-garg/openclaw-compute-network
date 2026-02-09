import WebSocket from "ws";
import { JobType, type JobAssignMsg, type JobCompleteMsg } from "@dispatch/protocol";
import { loadOrCreateKeypair } from "./keys.js";
import { registerWorker } from "./register.js";
import { startHeartbeat } from "./heartbeat.js";
import { executeTask } from "./executors/taskExecutor.js";
import { executeLLM } from "./executors/llmExecutor.js";
import { buildReceipt } from "./receipts.js";
import crypto from "node:crypto";

const COORDINATOR_URL = process.env.COORDINATOR_URL ?? "http://localhost:4010";
// Derive WS URL from HTTP URL
const wsUrl = COORDINATOR_URL.replace(/^http/, "ws");

async function main() {
  const keys = loadOrCreateKeypair();
  console.log(`[Desktop Worker] Public key: ${keys.pubkeyHex.slice(0, 16)}...`);
  console.log(`[Desktop Worker] Connecting to ${wsUrl}`);

  const ws = new WebSocket(wsUrl);

  ws.on("error", (err) => {
    console.error("[Desktop Worker] WS error:", err.message);
    process.exit(1);
  });

  ws.on("open", async () => {
    try {
      // 1. Register
      const workerId = await registerWorker(ws, keys.pubkeyHex, "DESKTOP", [
        JobType.LLM_INFER,
        JobType.TASK,
      ]);
      console.log(`[Desktop Worker] Registered as ${workerId}`);

      // 2. Start heartbeat
      const stopHeartbeat = startHeartbeat(ws, keys.pubkeyHex);

      // 3. Claim trust pairing if code provided
      if (process.env.TRUST_PAIRING_CODE) {
        await claimTrust(keys.pubkeyHex);
      }

      // 4. Listen for job assignments
      ws.on("message", async (raw) => {
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (msg.type === "job_assign") {
          await handleJob(ws, msg as unknown as JobAssignMsg, keys);
        }
      });

      ws.on("close", () => {
        stopHeartbeat();
        console.log("[Desktop Worker] Disconnected");
        process.exit(0);
      });
    } catch (err) {
      console.error("[Desktop Worker] Registration failed:", (err as Error).message);
      process.exit(1);
    }
  });
}

async function handleJob(
  ws: WebSocket,
  job: JobAssignMsg,
  keys: { pubkeyHex: string; secretKey: Uint8Array }
): Promise<void> {
  console.log(`[Desktop Worker] Executing ${job.job_type} job ${job.job_id}`);
  const start = Date.now();

  let output: unknown;
  try {
    if (job.job_type === JobType.TASK && job.payload.task_type && job.payload.input) {
      output = executeTask(job.payload.task_type, job.payload.input);
    } else if (job.job_type === JobType.LLM_INFER && job.payload.prompt) {
      output = await executeLLM(job.payload.prompt, job.job_id, job.payload.max_tokens);
    } else {
      output = { error: "Unsupported job payload" };
    }
  } catch (err) {
    output = { error: (err as Error).message };
  }

  const elapsed = Date.now() - start;
  console.log(`[Desktop Worker] Job ${job.job_id} completed in ${elapsed}ms`);

  // Build receipt, then send job_complete with receipt bundled (atomic storage on coordinator)
  const receipt = buildReceipt(job.job_id, output, keys.pubkeyHex, keys.secretKey);
  const outputHash = crypto.createHash("sha256").update(JSON.stringify(output)).digest("hex");
  const completeMsg: JobCompleteMsg = {
    type: "job_complete",
    job_id: job.job_id,
    output,
    output_hash: outputHash,
    receipt: receipt.receipt,
    receipt_signature: receipt.signature,
  };
  ws.send(JSON.stringify(completeMsg));
}

async function claimTrust(pubkey: string): Promise<void> {
  const code = process.env.TRUST_PAIRING_CODE;
  const httpUrl = process.env.COORDINATOR_URL ?? "http://localhost:4010";
  try {
    const res = await fetch(`${httpUrl}/v1/trust/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pairing_code: code, provider_pubkey: pubkey }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`[Desktop Worker] Trust paired with user: ${(data as Record<string, string>).user_id}`);
    } else {
      const err = await res.json();
      console.warn(`[Desktop Worker] Trust claim failed: ${(err as Record<string, string>).error}`);
    }
  } catch (err) {
    console.warn(`[Desktop Worker] Trust claim error:`, (err as Error).message);
  }
}

main().catch((err) => {
  console.error("[Desktop Worker] Fatal:", err);
  process.exit(1);
});
