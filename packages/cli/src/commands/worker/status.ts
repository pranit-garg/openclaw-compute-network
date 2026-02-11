import path from "node:path";
import { loadConfig } from "../../lib/config.js";
import { getHealth } from "../../lib/coordinator-client.js";
import { header, keyValue, printCommandError } from "../../lib/display.js";
import { loadOrCreateKeypair } from "../../lib/keys.js";
import type { WorkerStatusOptions } from "../../types.js";

export async function handler(opts: WorkerStatusOptions): Promise<void> {
  try {
    const config = loadConfig();
    const keyPath = config.worker.keyPath;
    const pubkey = opts.pubkey ?? loadOrCreateKeypair(keyPath).pubkeyHex;

    const coordinator = opts.coordinator ?? config.coordinator.monad;
    const health = await getHealth(coordinator);

    header("Worker Identity");
    keyValue("Public key:", `${pubkey.slice(0, 16)}...`);
    keyValue("Key file:", keyPath);

    console.error("");
    keyValue("Coordinator:", coordinator);
    keyValue("Network:", `${health.status} (${health.workers_online} workers)`);
    keyValue("Resolved key:", path.resolve(keyPath));
  } catch (err) {
    printCommandError(err);
  }
}
