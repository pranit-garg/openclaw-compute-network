import nacl from "tweetnacl";
import crypto from "node:crypto";
import type { ReceiptSubmitMsg } from "@openclaw/protocol";

/**
 * Build a receipt and sign it with ed25519.
 * Returns the complete ReceiptSubmitMsg ready to send over WS.
 */
export function buildReceipt(
  jobId: string,
  output: unknown,
  pubkey: string,
  secretKey: Uint8Array
): ReceiptSubmitMsg {
  // Hash the output deterministically
  const outputHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(output))
    .digest("hex");

  const receipt = {
    job_id: jobId,
    provider_pubkey: pubkey,
    output_hash: outputHash,
    completed_at: new Date().toISOString(),
    payment_ref: null, // MVP — no payment ref tracking yet
  };

  // Canonical JSON for signing
  const canonical = JSON.stringify(receipt);
  const signature = nacl.sign.detached(
    new TextEncoder().encode(canonical),
    secretKey
  );

  return {
    type: "receipt_submit",
    receipt,
    signature: Buffer.from(signature).toString("base64"),
  };
}
