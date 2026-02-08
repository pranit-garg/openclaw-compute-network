package com.openclaw.seeker

import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.security.MessageDigest
import java.util.Timer
import java.util.TimerTask

/**
 * Main activity — start/stop the Seeker worker service.
 * Connects to coordinator and processes TASK jobs.
 */
class MainActivity : AppCompatActivity() {

    private var wsManager: WebSocketManager? = null
    private var heartbeatTimer: Timer? = null

    // STUB — TODO: Generate real ed25519 keypair — See BACKLOG.md#android-signing
    private val stubPubkey = "android_seeker_" + System.currentTimeMillis().toString(16)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val coordinatorUrl = "http://10.0.2.2:4010" // Android emulator → host localhost
        Log.i("Seeker", "Starting Seeker worker, connecting to $coordinatorUrl")

        wsManager = WebSocketManager(
            coordinatorUrl = coordinatorUrl,
            pubkey = stubPubkey,
            onJobAssign = { handleJob(it) }
        )

        wsManager?.connect()

        // Heartbeat every 10s
        heartbeatTimer = Timer().apply {
            schedule(object : TimerTask() {
                override fun run() {
                    wsManager?.sendHeartbeat()
                }
            }, 10_000, 10_000)
        }
    }

    private fun handleJob(msg: JSONObject) {
        val jobId = msg.getString("job_id")
        val payload = msg.getJSONObject("payload")
        val taskType = payload.optString("task_type", "")
        val input = payload.optString("input", "")

        Log.i("Seeker", "Processing TASK job $jobId: $taskType")

        val output = TaskExecutor.execute(taskType, input)
        val outputHash = sha256(output.toString())

        wsManager?.sendJobComplete(jobId, output, outputHash)

        // Send receipt
        val receipt = ReceiptSigner.buildReceipt(jobId, output, stubPubkey)
        // TODO: send receipt via WebSocket — See BACKLOG.md#android-receipts

        Log.i("Seeker", "Job $jobId completed")
    }

    private fun sha256(input: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(input.toByteArray())
        return hash.joinToString("") { "%02x".format(it) }
    }

    override fun onDestroy() {
        super.onDestroy()
        heartbeatTimer?.cancel()
        wsManager?.disconnect()
    }
}
