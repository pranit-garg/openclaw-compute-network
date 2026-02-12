import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Buffer } from "buffer";

interface PendingPayout {
  workerPubkey: string;
  jobIds: string[];
  totalBolt: number;
  retryCount: number;
}

export interface BoltSettlementResult {
  workerPubkey: string;
  jobIds: string[];
  txHash: string;
  amount: number;
}

/** Settlement mode: how BOLT tokens are sourced for worker payouts */
export type BoltSettlementMode = "authority" | "jupiter";

export class BoltDistributor {
  private pendingPayouts = new Map<string, PendingPayout>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private connection: Connection;
  private authority: Keypair;
  private boltMint: PublicKey;
  private decimals: number;
  private mode: BoltSettlementMode;
  private onSettled?: (result: BoltSettlementResult) => void;
  private onFailed?: (workerPubkey: string, jobIds: string[], error: string) => void;
  private settling = false;

  // Settlement thresholds
  private readonly JOBS_THRESHOLD = 5;
  private readonly SETTLE_INTERVAL_MS = 60_000;

  constructor(opts: {
    connection: Connection;
    authority: Keypair;
    boltMint: PublicKey;
    decimals?: number;
    /**
     * Settlement mode:
     * - "authority" (default): transfer BOLT from pre-minted coordinator balance
     * - "jupiter": try Jupiter USDC->BOLT swap first, fall back to authority on failure
     */
    mode?: BoltSettlementMode;
    onSettled?: (result: BoltSettlementResult) => void;
    onFailed?: (workerPubkey: string, jobIds: string[], error: string) => void;
  }) {
    this.connection = opts.connection;
    this.authority = opts.authority;
    this.boltMint = opts.boltMint;
    this.decimals = opts.decimals ?? 9;
    this.mode = opts.mode ?? "authority";
    this.onSettled = opts.onSettled;
    this.onFailed = opts.onFailed;

    console.log(`[BOLT] BoltDistributor initialized in "${this.mode}" mode`);

    // Start periodic settlement timer
    this.timer = setInterval(() => {
      void this.settleAll();
    }, this.SETTLE_INTERVAL_MS);
  }

  /** Get the current settlement mode */
  getMode(): BoltSettlementMode {
    return this.mode;
  }

  /** Queue a payout for batched settlement */
  queuePayout(workerPubkey: string, jobId: string, boltAmount: number): void {
    const existing = this.pendingPayouts.get(workerPubkey);
    if (existing) {
      existing.jobIds.push(jobId);
      existing.totalBolt += boltAmount;
      // Check if threshold reached for this worker
      if (existing.jobIds.length >= this.JOBS_THRESHOLD) {
        void this.settleWorker(workerPubkey);
      }
    } else {
      this.pendingPayouts.set(workerPubkey, {
        workerPubkey,
        jobIds: [jobId],
        totalBolt: boltAmount,
        retryCount: 0,
      });
    }
  }

  /** Settle all pending payouts */
  private async settleAll(): Promise<void> {
    if (this.settling) return;
    this.settling = true;
    try {
      const workers = [...this.pendingPayouts.keys()];
      console.log("[BOLT] Periodic settle check:", workers.length, "pending workers");
      for (const workerPubkey of workers) {
        await this.settleWorker(workerPubkey);
      }
    } finally {
      this.settling = false;
    }
  }

  /** Settle a single worker's accumulated payouts */
  private async settleWorker(workerPubkey: string): Promise<void> {
    const payout = this.pendingPayouts.get(workerPubkey);
    if (!payout || payout.jobIds.length === 0) return;

    // Remove from pending immediately to prevent double-settlement
    this.pendingPayouts.delete(workerPubkey);

    try {
      const isHex = /^[0-9a-f]{64}$/i.test(workerPubkey);
      const workerPk = isHex
        ? new PublicKey(Buffer.from(workerPubkey, "hex"))
        : new PublicKey(workerPubkey);

      // Get or create the worker's associated token account
      const workerAta = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.authority, // payer
        this.boltMint,
        workerPk,
      );

      // Get the coordinator's (authority's) token account
      const authorityAta = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.authority,
        this.boltMint,
        this.authority.publicKey,
      );

      // Convert BOLT amount to raw units (with decimals)
      const rawAmount = BigInt(Math.round(payout.totalBolt * (10 ** this.decimals)));

      // Build transfer instruction
      const transferIx = createTransferInstruction(
        authorityAta.address,
        workerAta.address,
        this.authority.publicKey,
        rawAmount,
        [],
        TOKEN_PROGRAM_ID,
      );

      const tx = new Transaction().add(transferIx);
      const txHash = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.authority],
        { commitment: "confirmed", maxRetries: 3, skipPreflight: true },
      );

      console.log(
        `[BOLT] Settled batch: ${payout.jobIds.length} jobs, ${payout.totalBolt} BOLT to ${workerPubkey.slice(0, 8)}..., tx: ${txHash}`
      );

      // Notify via callback
      this.onSettled?.({
        workerPubkey: payout.workerPubkey,
        jobIds: payout.jobIds,
        txHash,
        amount: payout.totalBolt,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Settlement failed";
      console.error(
        `[BOLT] Settlement FAILED for ${workerPubkey.slice(0, 8)}... (${payout.jobIds.length} jobs, ${payout.totalBolt} BOLT):`,
        errMsg
      );

      payout.retryCount++;
      if (payout.retryCount < 3) {
        // Re-queue for silent retry; don't notify the app yet
        const current = this.pendingPayouts.get(workerPubkey);
        if (current) {
          current.jobIds.unshift(...payout.jobIds);
          current.totalBolt += payout.totalBolt;
        } else {
          this.pendingPayouts.set(workerPubkey, payout);
        }
        console.log(`[BOLT] Will retry (${payout.retryCount}/3) for ${workerPubkey.slice(0, 8)}...`);
      } else {
        // Max retries exhausted — notify app of failure
        this.onFailed?.(workerPubkey, payout.jobIds, errMsg);
      }
    }
  }

  /** Shut down the distributor */
  shutdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
