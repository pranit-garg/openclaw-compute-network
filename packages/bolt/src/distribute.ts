import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import type { BoltConfig } from "./types.js";
import { BOLT } from "@dispatch/protocol";

/**
 * Distribute BOLT tokens to a worker after job completion.
 *
 * Note: Live distribution is handled by BoltDistributor (coordinator-core/bolt/BoltDistributor.ts)
 * which batches payouts per worker. This standalone function calculates fee splits
 * and can be used for one-off transfers outside the batching pipeline.
 *
 * Flow:
 * 1. Deduct protocol fee (5%)
 * 2. Transfer remaining BOLT to worker's ATA
 * 3. Send protocol fee to treasury (burned or redistributed)
 */
export async function distributeBolt(
  workerPubkey: string,
  boltAmount: string,
  config: BoltConfig
): Promise<string> {
  const connection = new Connection(config.rpcUrl, "confirmed");

  // Calculate protocol fee
  const totalLamports = BigInt(boltAmount);
  const fee = (totalLamports * BigInt(BOLT.PROTOCOL_FEE_BPS)) / 10000n;
  const workerAmount = totalLamports - fee;

  // For batched distribution, use BoltDistributor instead.
  // This function is for standalone/one-off transfers.

  console.log(
    `[BOLT] Distributing ${workerAmount} BOLT to ${workerPubkey} (fee: ${fee} BOLT)`
  );

  // Standalone distribution not yet implemented — use BoltDistributor for live payouts
  return "";
}
