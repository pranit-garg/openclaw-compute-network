import WebSocket from "ws";
import crypto from "node:crypto";
import nacl from "tweetnacl";
import fs from "node:fs";
import path from "node:path";
import {
  JobType,
  type JobAssignMsg,
  type JobCompleteMsg,
  type HeartbeatMsg,
  type RegisterMsg,
  type RegisterAckMsg,
  type ReceiptSubmitMsg,
  type TaskType,
} from "@openclaw/protocol";

const COORDINATOR_URL = process.env.COORDINATOR_URL ?? "http://localhost:4010";
const wsUrl = COORDINATOR_URL.replace(/^http/, "ws");

// ── Task execution (same logic as desktop worker) ──

function executeTask(taskType: TaskType, input: string): unknown {
  switch (taskType) {
    case "summarize": {
      const words = input.trim().split(/\s+/);
      const truncated = input.length > 200 ? input.slice(0, 200) + "..." : input;
      return { summary: truncated, word_count: words.length };
    }
    case "classify": {
      const lower = input.toLowerCase();
      const pos = ["good", "great", "excellent", "amazing", "love", "happy"];
      const neg = ["bad", "terrible", "awful", "hate", "worst", "horrible"];
      let score = 0;
      for (const w of pos) if (lower.includes(w)) score++;
      for (const w of neg) if (lower.includes(w)) score--;
      const sentiment = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
      return { sentiment, confidence: Math.min(1, Math.abs(score) * 0.2 + 0.3) };
    }
    case "extract_json": {
      const pattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      const matches = input.match(pattern) ?? [];
      const parsed: unknown[] = [];
      for (const m of matches) {
        try { parsed.push(JSON.parse(m)); } catch { /* skip */ }
      }
      return { extracted: parsed, count: parsed.length };
    }
    default:
      return { error: `Unknown task_type: ${taskType as string}` };
  }
}

// ── Keys ───────────────────────────────────────

function loadOrCreateKeypair() {
  const keyFile = path.resolve("./data/seeker-key.json");
  const dir = path.dirname(keyFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(keyFile)) {
    const data = JSON.parse(fs.readFileSync(keyFile, "utf-8"));
    const secretKey = Uint8Array.from(data.secretKey);
    const publicKey = Uint8Array.from(data.publicKey);
    return { publicKey, secretKey, pubkeyHex: Buffer.from(publicKey).toString("hex") };
  }

  const pair = nacl.sign.keyPair();
  fs.writeFileSync(keyFile, JSON.stringify({
    publicKey: Array.from(pair.publicKey),
    secretKey: Array.from(pair.secretKey),
  }));
  return { publicKey: pair.publicKey, secretKey: pair.secretKey, pubkeyHex: Buffer.from(pair.publicKey).toString("hex") };
}

// ── Main ───────────────────────────────────────

async function main() {
  const keys = loadOrCreateKeypair();
  console.log(`[Seeker Sim] Public key: ${keys.pubkeyHex.slice(0, 16)}...`);
  console.log(`[Seeker Sim] Connecting to ${wsUrl}`);

  const ws = new WebSocket(wsUrl);

  ws.on("error", (err) => {
    console.error("[Seeker Sim] WS error:", err.message);
    process.exit(1);
  });

  ws.on("open", () => {
    // Register as SEEKER with TASK capability only
    const regMsg: RegisterMsg = {
      type: "register",
      provider_pubkey: keys.pubkeyHex,
      provider_type: "SEEKER",
      capabilities: [JobType.TASK],
    };
    ws.send(JSON.stringify(regMsg));

    // Wait for ack
    const onAck = (raw: WebSocket.RawData) => {
      const msg = JSON.parse(raw.toString()) as RegisterAckMsg;
      if (msg.type === "register_ack") {
        ws.removeListener("message", onAck);
        if (msg.status === "ok") {
          console.log(`[Seeker Sim] Registered as ${msg.worker_id}`);
        } else {
          console.error(`[Seeker Sim] Registration failed`);
          process.exit(1);
        }
      }
    };
    ws.on("message", onAck);

    // Heartbeat every 10s
    setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const hb: HeartbeatMsg = { type: "heartbeat", provider_pubkey: keys.pubkeyHex };
      ws.send(JSON.stringify(hb));
    }, 10_000);

    // Listen for jobs
    ws.on("message", (raw) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      if (msg.type === "job_assign") handleJob(ws, msg as unknown as JobAssignMsg, keys);
    });
  });

  ws.on("close", () => {
    console.log("[Seeker Sim] Disconnected");
    process.exit(0);
  });
}

function handleJob(
  ws: WebSocket,
  job: JobAssignMsg,
  keys: { pubkeyHex: string; secretKey: Uint8Array }
): void {
  console.log(`[Seeker Sim] Executing TASK job ${job.job_id}`);
  const start = Date.now();

  const output = job.payload.task_type && job.payload.input
    ? executeTask(job.payload.task_type, job.payload.input)
    : { error: "Missing task_type or input" };

  const elapsed = Date.now() - start;
  console.log(`[Seeker Sim] Job ${job.job_id} completed in ${elapsed}ms`);

  // Send job complete
  const outputHash = crypto.createHash("sha256").update(JSON.stringify(output)).digest("hex");
  const completeMsg: JobCompleteMsg = { type: "job_complete", job_id: job.job_id, output, output_hash: outputHash };
  ws.send(JSON.stringify(completeMsg));

  // Send receipt
  const receipt = {
    job_id: job.job_id,
    provider_pubkey: keys.pubkeyHex,
    output_hash: outputHash,
    completed_at: new Date().toISOString(),
    payment_ref: null,
  };
  const canonical = JSON.stringify(receipt);
  const sig = nacl.sign.detached(new TextEncoder().encode(canonical), keys.secretKey);
  const receiptMsg: ReceiptSubmitMsg = {
    type: "receipt_submit",
    receipt,
    signature: Buffer.from(sig).toString("base64"),
  };
  ws.send(JSON.stringify(receiptMsg));
}

main().catch((err) => {
  console.error("[Seeker Sim] Fatal:", err);
  process.exit(1);
});
