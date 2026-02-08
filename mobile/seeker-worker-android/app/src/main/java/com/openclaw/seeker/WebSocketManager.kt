package com.openclaw.seeker

import okhttp3.*
import org.json.JSONArray
import org.json.JSONObject

/**
 * Manages WebSocket connection to the coordinator.
 * Registers as a SEEKER worker with TASK capabilities.
 */
class WebSocketManager(
    private val coordinatorUrl: String,
    private val pubkey: String,
    private val onJobAssign: (JSONObject) -> Unit
) {
    private var ws: WebSocket? = null
    private val client = OkHttpClient()

    fun connect() {
        val wsUrl = coordinatorUrl.replace("http", "ws")
        val request = Request.Builder().url(wsUrl).build()

        ws = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                // Register as SEEKER
                val registerMsg = JSONObject().apply {
                    put("type", "register")
                    put("provider_pubkey", pubkey)
                    put("provider_type", "SEEKER")
                    put("capabilities", JSONArray().put("TASK"))
                }
                webSocket.send(registerMsg.toString())
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                val msg = JSONObject(text)
                when (msg.getString("type")) {
                    "register_ack" -> {
                        if (msg.getString("status") == "ok") {
                            println("[Seeker] Registered as ${msg.getString("worker_id")}")
                        }
                    }
                    "job_assign" -> onJobAssign(msg)
                    "heartbeat_ack" -> { /* ok */ }
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                println("[Seeker] WS error: ${t.message}")
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                println("[Seeker] Disconnected: $reason")
            }
        })
    }

    fun sendHeartbeat() {
        val msg = JSONObject().apply {
            put("type", "heartbeat")
            put("provider_pubkey", pubkey)
        }
        ws?.send(msg.toString())
    }

    fun sendJobComplete(jobId: String, output: JSONObject, outputHash: String) {
        val msg = JSONObject().apply {
            put("type", "job_complete")
            put("job_id", jobId)
            put("output", output)
            put("output_hash", outputHash)
        }
        ws?.send(msg.toString())
    }

    fun disconnect() {
        ws?.close(1000, "Shutdown")
    }
}
