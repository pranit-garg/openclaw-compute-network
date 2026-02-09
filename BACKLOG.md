# Dispatch Compute Network — Backlog
<!-- Updated: 2026-02-09 — Removed completed items, added new ones -->

## Post-MVP Features

### og-image
Generate Open Graph image for social sharing on the landing page.

### custom-domain
Set up custom domain (dispatch.network or similar) on Vercel for the landing page.

### api-documentation
Generate OpenAPI/Swagger documentation for the coordinator REST API endpoints.

### worker-dashboard
Simple web dashboard showing connected workers, job counts, average latency, and receipt verification rates.

### load-testing
Run load tests against coordinators to identify bottlenecks and document capacity limits.

### receipt-anchoring
Wire receipt anchor contracts (Monad + Solana) into coordinator post-execution flow. Deploy contracts to testnets.

### android-signing
Replace stub ed25519 signing in Android seeker with real implementation (lazysodium-android or similar).

### android-receipts
Send receipt_submit messages from Android seeker via WebSocket.

### on-device-ml
Real on-device ML on Seeker using ONNX Runtime or TFLite for TASK execution.

### dynamic-pricing
Dynamic per-job pricing with x402 (price varies by worker load, job complexity).

### deposits-slashing
Deposits, slashing, and staking for worker accountability.

### confidential-compute
Confidential compute support using TEE enclaves for PRIVATE jobs.

### ws-streaming
WebSocket streaming from worker → client for real-time LLM output.

### worker-reputation
Worker reputation scoring based on job completion rate, latency, receipt verification.

### multi-provider-lb
Multi-provider load balancing across coordinators and hosted providers.

### payment-refunds
Refund x402 payments when no worker is available within timeout.
