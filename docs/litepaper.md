# Dispatch: Agent-Native Compute via x402 Payment, ERC-8004 Reputation, and BOLT Token Settlement

**Pranit Garg, February 2026**

---

## Abstract

AI agents are becoming autonomous economic actors that need compute on their own terms. They cannot negotiate GPU leases, sign enterprise contracts, or evaluate provider quality. They need compute that is purchasable via HTTP, priced per job, and backed by verifiable trust signals.

Dispatch is a compute service that routes AI inference jobs from agents to idle consumer hardware (phones and desktops). Agents pay USDC per job via x402 HTTP payment headers. Workers process jobs and return ed25519 signed receipts over their outputs. Coordinators match jobs to workers based on device type, routing policy, and onchain reputation scores. The system runs on a dual-chain architecture: Solana for economics (USDC payments, Seeker device support) and Monad for trust (ERC-8004 identity and reputation, receipt anchoring).

Dispatch combines x402 HTTP payments with ERC-8004 onchain reputation into a working compute marketplace built on idle consumer devices. BOLT is the settlement token that aligns network incentives: agents pay USDC, coordinators auto-swap to BOLT via Jupiter DEX, workers earn BOLT (Solana) and wBOLT (Monad) with token upside, and a 5% protocol fee on every job funds the treasury. The testnet MVP is live on Monad and Solana with 16,000+ lines of TypeScript, dual-chain coordinators, mobile and desktop workers, and end-to-end cryptographic verification.

---

## Current Status

| Component | Status |
|-----------|--------|
| Coordinator (Monad + Solana) | Live on testnet |
| Desktop workers (Node.js + Ollama) | Live |
| Mobile workers (React Native) | Live on Solana dApp Store |
| x402 USDC payments | Implemented (testnet mode) |
| Ed25519 receipt signing | Implemented |
| ERC-8004 worker identity | Live on Monad testnet |
| ERC-8004 per-job reputation | Live on Monad testnet |
| ComputeRouter SDK | Implemented |
| CLI (`@dispatch/cli`) | Built, pre-release (v0.1.0) |
| BOLT token (SPL) | Live on Solana devnet |
| Wrapped BOLT (ERC-20) | Live on Monad testnet |
| Jupiter DEX integration | Built with fallback (pool pending) |
| BOLT staking tiers | Implemented (balance-based, lockup pending) |

**What's working today:** Full end-to-end flow from agent to coordinator to worker, with USDC settlement, ed25519 receipts, ERC-8004 reputation, and BOLT token distribution on both chains. Desktop and mobile workers processing real AI inference (summarization, classification, extraction, LLM via Ollama).

**What's next:** BOLT/USDC liquidity pool on devnet (enables Jupiter auto-swap), CLI release, staking lockup program.

---

**[Read the full litepaper (PDF)](https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf)**

If GitHub's in-browser PDF preview fails, use the raw link above to download/open directly.
