/**
 * Create a BOLT/USDC liquidity pool on Solana devnet.
 *
 * Purpose: Jupiter needs a DEX pool to route USDC→BOLT swaps.
 * Without a pool, the coordinator falls back to direct authority distribution.
 *
 * Status: STUB — Devnet pool creation requires either:
 *   1. Raydium CLMM SDK (complex, Jupiter indexes Raydium on devnet)
 *   2. Orca Whirlpools SDK (complex, Jupiter indexes Orca on devnet)
 *   3. SPL Token Swap program (simpler, but Jupiter may not aggregate it)
 *
 * For mainnet launch, use Raydium or Orca to create a proper CLMM pool.
 * For now, the fallback in bolt-settlement.ts handles the no-pool case:
 *   Jupiter swap fails → coordinator distributes BOLT directly from authority.
 *
 * When ready to create:
 *   1. Install Raydium SDK: pnpm add @raydium-io/raydium-sdk-v2
 *   2. Fund the pool with initial liquidity:
 *      - BOLT: Mint from authority (e.g., 100,000 BOLT)
 *      - USDC: Transfer devnet USDC (e.g., 100 USDC)
 *      - Initial price: ~1000 BOLT per USDC
 *   3. Verify Jupiter indexes it: GET https://quote-api.jup.ag/v6/quote?inputMint=USDC&outputMint=BOLT
 *
 * Usage:
 *   npx tsx scripts/create-bolt-pool.ts
 *
 * Required env:
 *   BOLT_MINT — BOLT SPL token mint address
 *   BOLT_AUTHORITY_KEYPAIR — Base58 encoded keypair (pool creator + liquidity provider)
 *   SOLANA_RPC — Solana devnet RPC URL
 */

import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const DEVNET_USDC = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"; // Circle devnet USDC

async function main() {
  const boltMint = process.env.BOLT_MINT;
  const authorityKey = process.env.BOLT_AUTHORITY_KEYPAIR;
  const rpcUrl = process.env.SOLANA_RPC ?? "https://api.devnet.solana.com";

  if (!boltMint || !authorityKey) {
    console.error("Required env vars: BOLT_MINT, BOLT_AUTHORITY_KEYPAIR");
    process.exit(1);
  }

  const connection = new Connection(rpcUrl, "confirmed");

  // Dynamic import to avoid requiring bs58 at top level
  const bs58Module = "bs58";
  const { default: bs58 } = await import(bs58Module);
  const authority = Keypair.fromSecretKey(bs58.decode(authorityKey));

  console.log("Pool Creation Config:");
  console.log(`  BOLT Mint:  ${boltMint}`);
  console.log(`  USDC Mint:  ${DEVNET_USDC}`);
  console.log(`  Authority:  ${authority.publicKey.toBase58()}`);
  console.log(`  RPC:        ${rpcUrl}`);
  console.log();

  // Check authority BOLT balance
  const { getAssociatedTokenAddress } = await import("@solana/spl-token");
  const boltAta = await getAssociatedTokenAddress(
    new PublicKey(boltMint),
    authority.publicKey
  );
  try {
    const boltBalance = await connection.getTokenAccountBalance(boltAta);
    console.log(`  BOLT balance: ${boltBalance.value.uiAmountString}`);
  } catch {
    console.log("  BOLT balance: 0 (no ATA)");
  }

  // Check authority SOL balance
  const solBalance = await connection.getBalance(authority.publicKey);
  console.log(`  SOL balance:  ${(solBalance / 1e9).toFixed(4)} SOL`);
  console.log();

  console.log("─────────────────────────────────────────────");
  console.log("Pool creation is not yet automated.");
  console.log("To create a pool manually:");
  console.log("  1. Go to https://raydium.io/clmm/create-pool/ (switch to devnet)");
  console.log("  2. Select BOLT and USDC as token pair");
  console.log("  3. Set initial price (~0.001 USDC per BOLT)");
  console.log("  4. Add initial liquidity");
  console.log("  5. Verify: curl 'https://quote-api.jup.ag/v6/quote?inputMint=" + DEVNET_USDC + "&outputMint=" + boltMint + "&amount=1000000'");
  console.log();
  console.log("The coordinator's fallback (direct authority distribution) is active");
  console.log("until a Jupiter-indexed pool exists.");
  console.log("─────────────────────────────────────────────");
}

main().catch(console.error);
