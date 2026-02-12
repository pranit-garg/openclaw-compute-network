import { Connection, VersionedTransaction } from "@solana/web3.js";
import type { BoltConfig } from "./types.js";

export interface SwapResult {
  inputAmount: string;
  outputAmount: string;
  txSignature: string;
  protocolFee: string;
}

/**
 * Swap USDC to BOLT via Jupiter DEX.
 *
 * Fetches a Jupiter quote, builds the swap transaction, signs with the
 * coordinator's authority keypair, and sends it on-chain. If no keypair
 * is provided, returns a quote-only result with an empty txSignature.
 *
 * Flow:
 * 1. GET Jupiter /quote (USDC -> BOLT)
 * 2. POST Jupiter /swap to get serialized transaction
 * 3. Deserialize, sign, send, confirm
 * 4. Return swap result with amounts + real tx signature
 */
export async function swapUsdcToBolt(
  usdcAmount: string,
  config: BoltConfig
): Promise<SwapResult> {
  const jupiterApi = config.jupiterApiUrl ?? "https://quote-api.jup.ag/v6";

  // Step 1: Get quote from Jupiter
  const quoteUrl = new URL(`${jupiterApi}/quote`);
  quoteUrl.searchParams.set("inputMint", config.usdcMint);
  quoteUrl.searchParams.set("outputMint", config.boltMint);
  quoteUrl.searchParams.set("amount", usdcAmount);
  quoteUrl.searchParams.set("slippageBps", "50"); // 0.5% slippage

  const quoteRes = await fetch(quoteUrl.toString());
  if (!quoteRes.ok) {
    throw new Error(`Jupiter quote failed: ${quoteRes.statusText}`);
  }
  const quote = await quoteRes.json();

  const outputAmount = quote.outAmount ?? "0";
  const protocolFee = String(Math.floor(Number(outputAmount) * 0.05)); // 5%

  // If no authority keypair, return quote-only result
  if (!config.authorityKeypair) {
    return {
      inputAmount: usdcAmount,
      outputAmount,
      txSignature: "",
      protocolFee,
    };
  }

  // Step 2: Get serialized swap transaction from Jupiter
  const swapRes = await fetch(`${jupiterApi}/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: config.authorityKeypair.publicKey.toBase58(),
      wrapAndUnwrapSol: true,
    }),
  });

  if (!swapRes.ok) {
    throw new Error(`Jupiter swap API failed: ${swapRes.statusText}`);
  }

  const swapData = await swapRes.json();
  const swapTransactionBuf = Buffer.from(swapData.swapTransaction, "base64");

  // Step 3: Deserialize and sign the versioned transaction
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
  transaction.sign([config.authorityKeypair]);

  // Step 4: Send and confirm
  const connection = new Connection(config.rpcUrl, "confirmed");
  const rawTransaction = transaction.serialize();
  const txSignature = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: false,
    maxRetries: 2,
  });

  await connection.confirmTransaction(txSignature, "confirmed");

  return {
    inputAmount: usdcAmount,
    outputAmount,
    txSignature,
    protocolFee,
  };
}
