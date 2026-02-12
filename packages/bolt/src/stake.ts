import { Connection, PublicKey } from "@solana/web3.js";
import { StakeTier, STAKE_REQUIREMENTS } from "@dispatch/protocol";
import type { BoltConfig } from "./types.js";

/**
 * Read the BOLT stake level for a worker pubkey.
 * Checks the worker's BOLT token account balance and maps to a tier.
 *
 * Currently reads SPL token balance as stake proxy.
 * Future: dedicated staking program with lockup + delegation.
 */
export async function readStakeLevel(
  workerPubkey: string,
  config: BoltConfig
): Promise<StakeTier> {
  try {
    const connection = new Connection(config.rpcUrl, "confirmed");
    const mint = new PublicKey(config.boltMint);
    const owner = new PublicKey(workerPubkey);

    // Find the associated token account
    const { getAssociatedTokenAddress } = await import("@solana/spl-token");
    const ata = await getAssociatedTokenAddress(mint, owner);

    const accountInfo = await connection.getTokenAccountBalance(ata);
    const balance = Number(accountInfo.value.uiAmount ?? 0);

    if (balance >= STAKE_REQUIREMENTS[StakeTier.SENTINEL]) return StakeTier.SENTINEL;
    if (balance >= STAKE_REQUIREMENTS[StakeTier.VERIFIED]) return StakeTier.VERIFIED;
    return StakeTier.OPEN;
  } catch {
    // Account doesn't exist or RPC error — default to OPEN
    return StakeTier.OPEN;
  }
}
