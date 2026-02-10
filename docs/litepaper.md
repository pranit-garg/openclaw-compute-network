# Dispatch: Agent-Native Compute via x402 Payment, ERC-8004 Reputation, and BOLT Token Settlement

**Pranit Garg, February 2026**

---

## Abstract

AI agents are becoming autonomous economic actors, but they lack infrastructure to purchase compute on their own terms. They cannot negotiate GPU leases, sign enterprise contracts, or evaluate provider quality. They need compute that is purchasable via HTTP, priced per job, and backed by verifiable trust signals.

Dispatch is a protocol that routes AI inference jobs from agents to idle consumer hardware (phones and desktops) using x402 micropayments for settlement and ERC-8004 on-chain reputation for trust. Agents pay in USDC via standard HTTP headers. Workers process jobs and sign ed25519 receipts over their outputs. Coordinators match jobs to workers based on device type, routing policy, and on-chain reputation scores. The system runs on a dual-chain architecture: Solana as the economic layer (BOLT token, staking, USDC payments, Seeker device support) and Monad as the trust layer (ERC-8004 identity and reputation, governance, receipt anchoring).

Dispatch is the first protocol to combine x402 payments with ERC-8004 reputation, both co-authored by the same team at Coinbase, into a working compute marketplace built on idle consumer devices. BOLT is the settlement token that aligns network incentives: agents pay USDC, coordinators auto-swap to BOLT, workers earn BOLT, and a 5% burn on every job creates deflationary pressure. The testnet MVP is live on Monad and Solana with 12,000+ lines of TypeScript, dual-chain coordinators, mobile and desktop workers, and end-to-end cryptographic verification.

---

**[Read the full litepaper (PDF)](https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf)**
