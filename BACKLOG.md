# OpenClaw Compute Network — Backlog

## Post-MVP Features

### x402-monad
Enable real x402 payment gating on Monad coordinator with ExactEvmScheme.

### x402-solana
Enable real x402 payment gating on Solana coordinator with ExactSvmScheme.

### x402-client-payments
Implement client-side x402 payment signing in ComputeRouter SDK. Handle 402 → decode PAYMENT-REQUIRED → sign with wallet → retry with PAYMENT-SIGNATURE.

### receipt-verification
Verify ed25519 receipt signatures server-side in coordinator (currently stored as unverified).

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
