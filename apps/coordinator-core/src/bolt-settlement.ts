import { BOLT, type BoltPayment } from "@dispatch/protocol";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import type { Keypair } from "@solana/web3.js";

/**
 * Configuration for BOLT settlement.
 * Used by the Solana coordinator to auto-swap USDC -> BOLT after x402 payment.
 */
export interface BoltSettlementConfig {
  /** BOLT SPL token mint address */
  boltMint: string;
  /** USDC SPL token mint address */
  usdcMint: string;
  /** Solana RPC URL */
  rpcUrl: string;
  /** Protocol treasury wallet for fee collection + burns */
  treasuryPubkey: string;
  /** Jupiter API base URL (defaults to mainnet) */
  jupiterApiUrl?: string;
  /** Coordinator authority keypair for signing swap transactions */
  authorityKeypair?: Keypair;
}

/**
 * Settle a job payment in BOLT tokens.
 *
 * Called by the coordinator after x402 USDC payment is verified.
 *
 * Flow:
 * 1. USDC received via x402 -> coordinator holds it
 * 2. Swap USDC -> BOLT via Jupiter DEX
 * 3. Deduct 5% protocol fee (burned)
 * 4. Transfer remaining BOLT to worker
 *
 * If the swap execution fails (no pool, no keypair, network error),
 * falls back to returning a quote-only result so upstream callers
 * can still record the expected BOLT amounts.
 */
export async function settleBolt(
  jobId: string,
  usdcAmount: string,
  workerPubkey: string,
  config: BoltSettlementConfig
): Promise<BoltPayment> {
  const jupiterApi = config.jupiterApiUrl ?? "https://quote-api.jup.ag/v6";

  // Step 1: Get Jupiter quote (USDC -> BOLT)
  let boltAmount = "0";
  let txSignature = "";
  let quoteData: Record<string, unknown> | null = null;

  try {
    const quoteUrl = new URL(`${jupiterApi}/quote`);
    quoteUrl.searchParams.set("inputMint", config.usdcMint);
    quoteUrl.searchParams.set("outputMint", config.boltMint);
    quoteUrl.searchParams.set("amount", usdcAmount);
    quoteUrl.searchParams.set("slippageBps", "50");

    const quoteRes = await fetch(quoteUrl.toString());
    if (!quoteRes.ok) {
      throw new Error(`Jupiter quote failed: ${quoteRes.statusText}`);
    }
    quoteData = await quoteRes.json();
    boltAmount = (quoteData as Record<string, string>).outAmount ?? "0";
  } catch (err) {
    console.warn(`[BOLT] Jupiter quote failed for job ${jobId}:`, err);
  }

  // Step 2: Try to execute the swap on-chain if we have a keypair and a quote
  if (config.authorityKeypair && quoteData) {
    try {
      const swapRes = await fetch(`${jupiterApi}/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: config.authorityKeypair.publicKey.toBase58(),
          wrapAndUnwrapSol: true,
        }),
      });

      if (!swapRes.ok) {
        throw new Error(`Jupiter swap API failed: ${swapRes.statusText}`);
      }

      const swapData = await swapRes.json();
      const swapTransactionBuf = Buffer.from(swapData.swapTransaction, "base64");

      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      transaction.sign([config.authorityKeypair]);

      const connection = new Connection(config.rpcUrl, "confirmed");
      const rawTransaction = transaction.serialize();
      txSignature = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: false,
        maxRetries: 2,
      });

      await connection.confirmTransaction(txSignature, "confirmed");

      console.log(
        `[BOLT] Swap executed for job ${jobId}: ${usdcAmount} USDC -> ${boltAmount} BOLT, tx: ${txSignature}`
      );
    } catch (err) {
      console.warn(
        `[BOLT] Swap execution failed for job ${jobId}, falling back to quote-only:`,
        err instanceof Error ? err.message : err
      );
      txSignature = "";
    }
  } else if (!config.authorityKeypair) {
    console.warn(
      `[BOLT] No authorityKeypair provided for job ${jobId}, returning quote-only result`
    );
  }

  // Step 3: Calculate protocol fee (5% of BOLT received)
  const totalBolt = BigInt(boltAmount || "0");
  const protocolFee = (totalBolt * BigInt(BOLT.PROTOCOL_FEE_BPS)) / 10000n;
  const workerBolt = totalBolt - protocolFee;

  console.log(
    `[BOLT] Settlement for job ${jobId}: ${usdcAmount} USDC -> ${boltAmount} BOLT ` +
    `(worker: ${workerBolt}, fee: ${protocolFee})`
  );

  return {
    job_id: jobId,
    usdc_amount: usdcAmount,
    bolt_amount: workerBolt.toString(),
    worker_pubkey: workerPubkey,
    protocol_fee: protocolFee.toString(),
    tx_signature: txSignature,
  };
}
