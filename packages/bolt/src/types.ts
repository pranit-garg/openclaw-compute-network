import type { StakeTier } from "@dispatch/protocol";
import type { Keypair } from "@solana/web3.js";

export interface BoltConfig {
  /** BOLT SPL token mint address */
  boltMint: string;
  /** USDC SPL token mint (devnet or mainnet) */
  usdcMint: string;
  /** Solana RPC URL */
  rpcUrl: string;
  /** Protocol treasury wallet for fee collection */
  treasuryPubkey: string;
  /** Jupiter API base URL */
  jupiterApiUrl?: string;
  /** Coordinator authority keypair for signing swap transactions */
  authorityKeypair?: Keypair;
}

export interface StakeAccount {
  pubkey: string;
  tier: StakeTier;
  amount: bigint;
  stakedAt: number;
}
