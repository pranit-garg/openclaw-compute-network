package com.openclaw.seeker

import java.security.MessageDigest
import java.util.Base64
import org.json.JSONObject

/**
 * STUB — TODO: Real ed25519 signing (use lazysodium-android or similar) — See BACKLOG.md#android-signing
 *
 * For MVP, generates a receipt hash but uses a placeholder signature.
 */
object ReceiptSigner {

    fun buildReceipt(jobId: String, output: JSONObject, pubkey: String): JSONObject {
        val outputHash = sha256(output.toString())

        val receipt = JSONObject().apply {
            put("job_id", jobId)
            put("provider_pubkey", pubkey)
            put("output_hash", outputHash)
            put("completed_at", java.time.Instant.now().toString())
            put("payment_ref", JSONObject.NULL)
        }

        // STUB signature — real implementation would use ed25519
        val canonical = receipt.toString()
        val stubSignature = Base64.getEncoder().encodeToString(sha256(canonical).toByteArray())

        return JSONObject().apply {
            put("type", "receipt_submit")
            put("receipt", receipt)
            put("signature", stubSignature)
        }
    }

    private fun sha256(input: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(input.toByteArray())
        return hash.joinToString("") { "%02x".format(it) }
    }
}
