import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  defineChain,
  type Hash,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// ── Monad testnet chain definition ────────────────
const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
});

// ── Types ─────────────────────────────────────────

interface WrappedBoltConfig {
  contractAddress: string;
  privateKey: string;
  rpcUrl: string;
  chainId: number;
  amountPerJob: number;
  onSettled?: (result: WrappedBoltSettlementResult) => void;
  onFailed?: (workerPubkey: string, jobIds: string[], error: string) => void;
}

interface PendingPayout {
  workerPubkey: string;
  jobIds: string[];
  totalWBolt: number;
}

export interface WrappedBoltSettlementResult {
  workerPubkey: string;
  jobIds: string[];
  txHash: string;
  amount: number;
}

// ── wBOLT ERC-20 ABI (mint only) ─────────────────
const wBoltAbi = parseAbi(["function mint(address to, uint256 amount) external"]);

// ── WrappedBoltDistributor ────────────────────────

export class WrappedBoltDistributor {
  private pendingPayouts = new Map<string, PendingPayout>();
  private workerBalances = new Map<string, number>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private onSettled?: (result: WrappedBoltSettlementResult) => void;
  private onFailed?: (workerPubkey: string, jobIds: string[], error: string) => void;

  private readonly contractAddress: `0x${string}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly walletClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly publicClient: any;
  private readonly coordinatorAddress: `0x${string}`;
  private readonly chain: Chain;

  // Settlement thresholds (matching BoltDistributor)
  private readonly JOBS_THRESHOLD = 5;
  private readonly SETTLE_INTERVAL_MS = 60_000;

  constructor(opts: WrappedBoltConfig) {
    this.contractAddress = opts.contractAddress as `0x${string}`;
    this.onSettled = opts.onSettled;
    this.onFailed = opts.onFailed;

    const account = privateKeyToAccount(opts.privateKey as `0x${string}`);
    this.coordinatorAddress = account.address;

    this.chain = opts.chainId === 10143
      ? monadTestnet
      : defineChain({
          id: opts.chainId,
          name: `Chain ${opts.chainId}`,
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: { default: { http: [opts.rpcUrl] } },
        });

    this.walletClient = createWalletClient({
      account,
      chain: this.chain,
      transport: http(opts.rpcUrl),
    });

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(opts.rpcUrl),
    });

    // Start periodic settlement timer
    this.timer = setInterval(() => {
      void this.settleAll();
    }, this.SETTLE_INTERVAL_MS);
  }

  /** Queue a payout for batched settlement */
  queuePayout(workerPubkey: string, jobId: string, amount: number): void {
    const existing = this.pendingPayouts.get(workerPubkey);
    if (existing) {
      existing.jobIds.push(jobId);
      existing.totalWBolt += amount;
      // Check if threshold reached for this worker
      if (existing.jobIds.length >= this.JOBS_THRESHOLD) {
        void this.settleWorker(workerPubkey);
      }
    } else {
      this.pendingPayouts.set(workerPubkey, {
        workerPubkey,
        jobIds: [jobId],
        totalWBolt: amount,
      });
    }
  }

  /** Get accumulated wBOLT balance for a worker (custodial) */
  getWorkerBalance(pubkey: string): number {
    return this.workerBalances.get(pubkey) ?? 0;
  }

  /** Settle all pending payouts */
  private async settleAll(): Promise<void> {
    const workers = [...this.pendingPayouts.keys()];
    console.log("[wBOLT] Periodic settle check:", workers.length, "pending workers");
    for (const workerPubkey of workers) {
      await this.settleWorker(workerPubkey);
    }
  }

  /** Settle a single worker's accumulated payouts */
  private async settleWorker(workerPubkey: string): Promise<void> {
    const payout = this.pendingPayouts.get(workerPubkey);
    if (!payout || payout.jobIds.length === 0) return;

    // Remove from pending immediately to prevent double-settlement
    this.pendingPayouts.delete(workerPubkey);

    try {
      // Convert wBOLT amount to raw units (9 decimals, matching BOLT SPL)
      const rawAmount = BigInt(Math.round(payout.totalWBolt * 1e9));

      // Mint wBOLT to coordinator's own address (custodial model)
      const txHash: Hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: wBoltAbi,
        functionName: "mint",
        args: [this.coordinatorAddress, rawAmount],
        chain: this.chain,
      });

      // Wait for confirmation (timeout after 60s to avoid hanging on testnet)
      await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 60_000,
      });

      // Track per-worker custodial balance
      const prevBalance = this.workerBalances.get(workerPubkey) ?? 0;
      this.workerBalances.set(workerPubkey, prevBalance + payout.totalWBolt);

      console.log(
        `[wBOLT] Settled batch: ${payout.jobIds.length} jobs, ${payout.totalWBolt} wBOLT for ${workerPubkey.slice(0, 8)}..., tx: ${txHash}`
      );

      // Notify via callback
      this.onSettled?.({
        workerPubkey: payout.workerPubkey,
        jobIds: payout.jobIds,
        txHash,
        amount: payout.totalWBolt,
      });
    } catch (err) {
      console.error(
        `[wBOLT] Settlement FAILED for ${workerPubkey.slice(0, 8)}... (${payout.jobIds.length} jobs, ${payout.totalWBolt} wBOLT):`,
        err instanceof Error ? err.message : err
      );
      // Re-queue the failed payout so it can be retried next cycle
      const current = this.pendingPayouts.get(workerPubkey);
      if (current) {
        current.jobIds.unshift(...payout.jobIds);
        current.totalWBolt += payout.totalWBolt;
      } else {
        this.pendingPayouts.set(workerPubkey, payout);
      }
      this.onFailed?.(workerPubkey, payout.jobIds, err instanceof Error ? err.message : "Settlement failed");
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
