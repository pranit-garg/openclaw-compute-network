/**
 * Receipt Anchorer — Anchors compute receipt hashes on Solana devnet.
 *
 * This module is optional. If @solana/web3.js or @coral-xyz/anchor are not
 * installed, or if the SOLANA_ANCHOR_KEYPAIR_PATH env var is not set, anchoring
 * is silently skipped. Job flow is never blocked by an anchoring failure.
 */

// IDL fragment — matches the on-chain receipt_anchor program.
// We inline the minimal IDL here so we don't need to import a generated file.
const RECEIPT_ANCHOR_IDL = {
  version: "0.1.0",
  name: "receipt_anchor",
  instructions: [
    {
      name: "anchorReceipt",
      accounts: [
        { name: "receiptRecord", isMut: true, isSigner: false },
        { name: "payer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "jobId", type: "string" },
        { name: "receiptHash", type: "string" },
        { name: "providerPubkey", type: "publicKey" },
        { name: "completedAt", type: "i64" },
      ],
    },
  ],
  accounts: [
    {
      name: "ReceiptRecord",
      type: {
        kind: "struct" as const,
        fields: [
          { name: "jobId", type: "string" },
          { name: "providerPubkey", type: "publicKey" },
          { name: "receiptHash", type: "string" },
          { name: "completedAt", type: "i64" },
          { name: "anchor", type: "publicKey" },
        ],
      },
    },
  ],
};

// Program ID — must match declare_id! in lib.rs and Anchor.toml.
// Replace with the real program ID after `anchor deploy`.
const PROGRAM_ID_STR = "11111111111111111111111111111111";

export interface AnchorReceiptParams {
  jobId: string;
  providerPubkey: string;
  receiptHash: string;
  completedAt: number;
}

/**
 * Anchor a receipt hash on Solana devnet. Returns the transaction signature
 * on success, or null if anchoring was skipped / failed (logged as warning).
 */
export async function anchorReceipt(
  params: AnchorReceiptParams,
): Promise<string | null> {
  try {
    // Dynamic imports — these packages are optional
    const { Connection, Keypair, PublicKey } = await import("@solana/web3.js");
    const anchor = await import("@coral-xyz/anchor");
    const fs = await import("node:fs");

    const keypairPath = process.env.SOLANA_ANCHOR_KEYPAIR_PATH;
    if (!keypairPath) {
      console.warn("[receipt-anchor] SOLANA_ANCHOR_KEYPAIR_PATH not set — skipping anchoring");
      return null;
    }

    // Load payer keypair from file
    const secretKey = Uint8Array.from(
      JSON.parse(fs.readFileSync(keypairPath, "utf-8")) as number[],
    );
    const payer = Keypair.fromSecretKey(secretKey);

    // Connect to devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const wallet = new anchor.Wallet(payer);
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    const programId = new PublicKey(PROGRAM_ID_STR);

    // Build the program interface from the inline IDL (Anchor v0.30.x constructor)
    const program = new anchor.Program(
      RECEIPT_ANCHOR_IDL as any,
      programId as any,
      provider as any,
    ) as any;

    // Derive the PDA
    const [receiptPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("receipt"), Buffer.from(params.jobId)],
      programId,
    );

    const providerPk = new PublicKey(params.providerPubkey);

    // Send the transaction
    const txSig = await (program.methods as any)
      .anchorReceipt(
        params.jobId,
        params.receiptHash,
        providerPk,
        new anchor.BN(params.completedAt),
      )
      .accounts({
        receiptRecord: receiptPda,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    console.log(`[receipt-anchor] Anchored receipt for job ${params.jobId} — tx: ${txSig}`);
    return txSig as string;
  } catch (err: unknown) {
    // Anchoring failure must never break job flow
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[receipt-anchor] Failed to anchor receipt for job ${params.jobId}: ${msg}`);
    return null;
  }
}
