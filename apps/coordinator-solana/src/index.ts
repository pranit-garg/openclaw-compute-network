import { createServer, startServer, configFromEnv, buildPaymentConfig, BoltDistributor, type BoltSettlementResult, type ERC8004Config, type StakeConfig } from "@dispatch/coordinator-core";
import { getReputationSummary, giveFeedback, buildJobFeedback, getChainConfig, identityRegistryAbi, monadTestnet } from "@dispatch/erc8004";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// ── Monad tx queue (serialize writes to prevent nonce conflicts) ──
let monadTxQueue: Promise<void> = Promise.resolve();

function queueMonadTx<T>(fn: () => Promise<T>): Promise<T> {
  const result = monadTxQueue.then(fn);
  monadTxQueue = result.then(() => {}, () => {});
  return result;
}

// ── Auto-discover a valid ERC-8004 target agent ──
// Scans the Identity Registry for the first agent NOT owned by the coordinator
// (self-feedback is disallowed on ERC-8004).
async function discoverTargetAgent(coordinatorAddress: string): Promise<bigint> {
  const cfg = getChainConfig();
  const client = createPublicClient({
    chain: monadTestnet,
    transport: http(cfg.rpcUrl),
  });

  for (let i = 0; i <= 30; i++) {
    try {
      const owner = await client.readContract({
        address: cfg.identityRegistry,
        abi: identityRegistryAbi,
        functionName: "ownerOf",
        args: [BigInt(i)],
      });
      if ((owner as string).toLowerCase() !== coordinatorAddress.toLowerCase()) {
        console.log(`[ERC-8004] Discovered target agent ${i} (owner: ${(owner as string).slice(0, 10)}...)`);
        return BigInt(i);
      }
    } catch {
      break; // Sequential IDs — first gap means no more agents
    }
  }

  throw new Error(
    "No target agent found. Need at least one ERC-8004 agent not owned by the coordinator. " +
    "Run: npx tsx apps/coordinator-solana/find-agent.ts"
  );
}

const config = configFromEnv({
  port: parseInt(process.env.PORT ?? "4020", 10),
  dbPath: process.env.DB_PATH ?? "./data/solana.db",
  network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  payTo: process.env.SOLANA_PAY_TO ?? "11111111111111111111111111111111",
  facilitatorUrl: process.env.SOLANA_FACILITATOR ?? "https://www.x402.org/facilitator",
});

const testnetMode = process.env.TESTNET_MODE === "true";

// ── x402 payment middleware (optional) ──────────
let middleware: ReturnType<typeof paymentMiddleware> | undefined;

if (!testnetMode) {
  const network = config.network as `${string}:${string}`;
  const resourceServer = new x402ResourceServer(
    new HTTPFacilitatorClient({ url: config.facilitatorUrl })
  ).register(network, new ExactSvmScheme());

  middleware = paymentMiddleware(buildPaymentConfig(config), resourceServer);
}

// ── ERC-8004 reputation (optional) ──────────────
// Even on Solana coordinator, ERC-8004 feedback is posted cross-chain to Monad.
// Activated when ERC8004_PRIVATE_KEY env var is set.

let erc8004: ERC8004Config | undefined;

const erc8004Key = process.env.ERC8004_PRIVATE_KEY;
if (erc8004Key) {
  const account = privateKeyToAccount(erc8004Key as `0x${string}`);
  const agentId = await discoverTargetAgent(account.address);
  const coordinatorEndpoint = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${config.port}`;

  erc8004 = {
    async getReputationScore(_pubkey: string): Promise<number | null> {
      try {
        const summary = await getReputationSummary(agentId);
        if (summary.count === 0n) return null;
        const raw = Number(summary.summaryValue) / (10 ** summary.summaryValueDecimals);
        return Math.min(100, Math.max(0, raw));
      } catch {
        return null;
      }
    },

    async postFeedback(_workerPubkey: string, jobId: string, success: boolean): Promise<string> {
      const entry = buildJobFeedback({
        agentId,
        score: success ? 80 : 20,
        jobType: "COMPUTE",
        endpoint: coordinatorEndpoint,
      });

      // Retry up to 3 times with 2s/4s backoff before surfacing failure
      let lastError: unknown;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const txHash = await queueMonadTx(() => giveFeedback(entry, account));
          console.log(`[ERC-8004] Feedback tx: ${txHash} for job ${jobId}`);
          return txHash;
        } catch (err) {
          lastError = err;
          if (attempt < 3) {
            const delay = attempt * 2000;
            console.warn(`[ERC-8004] Feedback attempt ${attempt}/3 failed, retrying in ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }

      throw lastError;
    },
  };

  console.log(`[Solana Coordinator] ERC-8004 reputation: ENABLED (agent: ${agentId}, account: ${account.address})`);
} else {
  console.log(`[Solana Coordinator] ERC-8004 reputation: DISABLED (need ERC8004_PRIVATE_KEY)`);
}

// ── BOLT staking (optional) ────────────────────
// Solana coordinator reads BOLT stake levels natively (SPL token balance).
// Activated when BOLT_MINT env var is set.

let stakeConfig: StakeConfig | undefined;

const boltMint = process.env.BOLT_MINT;
if (boltMint) {
  const { StakeTier, STAKE_REQUIREMENTS } = await import("@dispatch/protocol");
  const solanaWeb3Module = "@solana/web3.js";
  const splTokenModule = "@solana/spl-token";

  stakeConfig = {
    async readStakeLevel(pubkey: string) {
      try {
        // Read BOLT SPL token balance as stake proxy
        // Future: read dedicated staking program accounts with lockup
        const { Connection, PublicKey } = await import(solanaWeb3Module);
        const { getAssociatedTokenAddress } = await import(splTokenModule);
        const connection = new Connection(
          process.env.SOLANA_RPC ?? "https://api.devnet.solana.com",
          "confirmed"
        );
        const mint = new PublicKey(boltMint);
        const owner = new PublicKey(pubkey);
        const ata = await getAssociatedTokenAddress(mint, owner);
        const info = await connection.getTokenAccountBalance(ata);
        const balance = Number(info.value.uiAmount ?? 0);

        if (balance >= STAKE_REQUIREMENTS[StakeTier.SENTINEL]) return StakeTier.SENTINEL;
        if (balance >= STAKE_REQUIREMENTS[StakeTier.VERIFIED]) return StakeTier.VERIFIED;
        return StakeTier.OPEN;
      } catch {
        return StakeTier.OPEN;
      }
    },
  };

  console.log(`[Solana Coordinator] BOLT staking: ENABLED (mint: ${boltMint})`);
} else {
  console.log(`[Solana Coordinator] BOLT staking: DISABLED (no BOLT_MINT)`);
}

// ── BOLT distribution (optional) ─────────────────
// Batched SPL token payouts to workers after job completion.
// Activated when BOLT_MINT and BOLT_AUTHORITY_KEYPAIR env vars are set.

let boltDistributor: BoltDistributor | undefined;

// Late-bound reference — set after server creation so onSettled can access hub
let serverRef: ReturnType<typeof createServer> | null = null;

const boltAuthorityKey = process.env.BOLT_AUTHORITY_KEYPAIR;
if (boltMint && boltAuthorityKey) {
  const { Connection, Keypair, PublicKey } = await import("@solana/web3.js");
  const bs58Module = "bs58";
  const { default: bs58 } = await import(bs58Module);

  const connection = new Connection(
    process.env.SOLANA_RPC ?? "https://api.devnet.solana.com",
    "confirmed"
  );
  const authority = Keypair.fromSecretKey(bs58.decode(boltAuthorityKey));

  boltDistributor = new BoltDistributor({
    connection,
    authority,
    boltMint: new PublicKey(boltMint),
    onSettled(result: BoltSettlementResult) {
      // Send payment_posted WS message to the worker via the hub
      serverRef?.hub.sendToWorker(result.workerPubkey, {
        type: "payment_posted",
        job_ids: result.jobIds,
        tx_hash: result.txHash,
        amount: String(result.amount),
        network: "solana-devnet",
        explorer_url: `https://explorer.solana.com/tx/${result.txHash}?cluster=devnet`,
      });
    },
    onFailed(workerPubkey: string, jobIds: string[], error: string) {
      serverRef?.hub.sendToWorker(workerPubkey, {
        type: "payment_failed",
        job_ids: jobIds,
        error,
      });
    },
  });

  console.log(`[Solana Coordinator] BOLT distribution: ENABLED (authority: ${authority.publicKey.toBase58().slice(0, 8)}...)`);
} else {
  console.log(`[Solana Coordinator] BOLT distribution: DISABLED (need BOLT_MINT + BOLT_AUTHORITY_KEYPAIR)`);
}

// ── Start server ────────────────────────────────
const server = createServer(config, {
  ...(middleware && { paymentMiddleware: middleware }),
  ...(erc8004 && { erc8004 }),
  ...(stakeConfig && { stakeConfig }),
  ...(boltDistributor && { boltDistributor }),
});
serverRef = server; // Wire up late-bound reference for onSettled callback
startServer(config, server);

console.log(`[Solana Coordinator] x402 payment gating: ${testnetMode ? "DISABLED (testnet mode)" : "ENABLED"}`);
