/**
 * ReceiptSigner — Creates and signs job completion receipts.
 *
 * When the worker finishes a job, it creates a "receipt" — a signed
 * proof that this worker produced that output. The coordinator can
 * verify the signature to prevent spoofing.
 *
 * Flow: hash the output -> build receipt object -> sign canonical JSON -> base64 encode
 */
import * as Crypto from "expo-crypto";
import { Buffer } from "buffer";
import { signData } from "./KeyManager";
import type { JobCompleteMsg } from "./protocol";

interface Receipt {
  job_id: string;
  provider_pubkey: string;
  output_hash: string;
  completed_at: string;
  payment_ref: string | null;
}

interface SignedReceipt {
  receipt: Receipt;
  signature: string; // base64-encoded ed25519 signature
}

/**
 * Build a signed receipt for a completed job.
 *
 * @param jobId - The job ID from the coordinator
 * @param output - The job result (will be SHA-256 hashed)
 * @param pubkeyHex - This worker's public key in hex
 * @param secretKey - This worker's secret key for signing
 */
export async function buildSignedReceipt(
  jobId: string,
  output: unknown,
  pubkeyHex: string,
  secretKey: Uint8Array
): Promise<SignedReceipt> {
  // Hash the output deterministically using expo-crypto (works in RN)
  const outputJson = JSON.stringify(output);
  const outputHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    outputJson
  );

  const receipt: Receipt = {
    job_id: jobId,
    provider_pubkey: pubkeyHex,
    output_hash: outputHash,
    completed_at: new Date().toISOString(),
    payment_ref: null, // MVP — no payment tracking yet
  };

  // Sign the canonical JSON representation of the receipt
  const canonical = JSON.stringify(receipt);
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(canonical);
  const signatureBytes = signData(messageBytes, secretKey);

  return {
    receipt,
    signature: Buffer.from(signatureBytes).toString("base64"),
  };
}

/**
 * Hash the job output using SHA-256.
 * Used both in receipt building and in the job_complete message.
 */
export async function hashOutput(output: unknown): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    JSON.stringify(output)
  );
}

/**
 * Build the full JobCompleteMsg with receipt bundled in.
 * This is what gets sent to the coordinator over WebSocket.
 */
export async function buildJobCompleteWithReceipt(
  jobId: string,
  output: unknown,
  pubkeyHex: string,
  secretKey: Uint8Array
): Promise<JobCompleteMsg> {
  const [outputHash, signedReceipt] = await Promise.all([
    hashOutput(output),
    buildSignedReceipt(jobId, output, pubkeyHex, secretKey),
  ]);

  return {
    type: "job_complete",
    job_id: jobId,
    output,
    output_hash: outputHash,
    receipt: signedReceipt.receipt,
    receipt_signature: signedReceipt.signature,
  };
}
