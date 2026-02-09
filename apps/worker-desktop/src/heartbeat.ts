import WebSocket from "ws";
import type { HeartbeatMsg } from "@dispatch/protocol";

/** Start sending heartbeat every 10s. Returns cleanup function. */
export function startHeartbeat(ws: WebSocket, pubkey: string): () => void {
  const interval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return;
    const msg: HeartbeatMsg = {
      type: "heartbeat",
      provider_pubkey: pubkey,
    };
    ws.send(JSON.stringify(msg));
  }, 10_000);

  return () => clearInterval(interval);
}
