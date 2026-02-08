import WebSocket from "ws";
import { JobType, type RegisterMsg, type RegisterAckMsg } from "@openclaw/protocol";

/**
 * Send RegisterMsg and wait for RegisterAckMsg.
 * Resolves with worker_id on success, rejects on error.
 */
export function registerWorker(
  ws: WebSocket,
  pubkey: string,
  providerType: "DESKTOP" | "SEEKER" = "DESKTOP",
  capabilities: JobType[] = [JobType.LLM_INFER, JobType.TASK]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const msg: RegisterMsg = {
      type: "register",
      provider_pubkey: pubkey,
      provider_type: providerType,
      capabilities,
    };

    const onMessage = (raw: WebSocket.RawData) => {
      try {
        const data = JSON.parse(raw.toString()) as RegisterAckMsg;
        if (data.type === "register_ack") {
          ws.removeListener("message", onMessage);
          if (data.status === "ok" && data.worker_id) {
            resolve(data.worker_id);
          } else {
            reject(new Error(`Registration failed: ${data.error ?? "unknown"}`));
          }
        }
      } catch {
        // ignore non-JSON during registration
      }
    };

    ws.on("message", onMessage);
    ws.send(JSON.stringify(msg));

    // Timeout after 10s
    setTimeout(() => {
      ws.removeListener("message", onMessage);
      reject(new Error("Registration timeout"));
    }, 10_000);
  });
}
