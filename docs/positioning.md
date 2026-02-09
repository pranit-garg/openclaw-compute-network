# Dispatch — Positioning & Copy Direction

---

## 1. Name & Tagline

**Name:** Dispatch

**Tagline:** Dispatch idle compute to AI agents.

**One-liner:** The dispatch layer where AI agents buy compute from idle hardware — paid in USDC over x402, verified with ERC-8004 reputation on Monad and Solana.

---

## 2. Three Pillars

### Pillar 1: Agent-Native Compute
AI agents are the customers. They submit HTTP requests with x402 payment headers. No SDK, no wallet setup, just HTTP and USDC. Any agent that can make an HTTP call can buy compute.

### Pillar 2: Idle Hardware as Supply
Phones and desktops earn USDC by processing AI inference while idle. The network scales with devices people already own — no GPU required. The Android app picks up jobs over WebSocket while the device is idle.

### Pillar 3: On-Chain Trust
Workers register as ERC-8004 agents on Monad. Every completed job builds verifiable reputation through on-chain feedback. Ed25519 receipts prove every result. Agents discover trusted workers through the reputation registry.

---

## 3. Positioning Angles

### Angle A: "The Agent Compute Layer"

**Headline:** Dispatch idle compute to AI agents.
**Subhead:** AI agents submit jobs over HTTP. Workers process them while idle. Reputation lives on-chain.

AI agents need compute but can't negotiate GPU leases. Dispatch gives them a simple interface: submit an HTTP request with a payment header, get a result with a cryptographic receipt. The network's supply side is idle hardware — phones and desktops — not datacenters.

### Angle B: "Earn While Idle"

**Headline:** Your hardware earns USDC while you sleep.
**Subhead:** Phones and desktops become dispatch nodes for AI inference.

Every other DePIN project targets datacenter GPUs and high-end servers. Dispatch turns idle consumer devices into compute nodes — handling summarization, classification, and extraction. This dramatically expands the supply side beyond the GPU arms race. Workers build ERC-8004 reputation that makes them more visible to agents.

### Angle C: "On-Chain Compute Reputation"

**Headline:** Verifiable workers, trusted results.
**Subhead:** ERC-8004 reputation on Monad. Every job builds track record.

Permissionless compute networks have a trust problem — how do you know a worker will deliver quality results? Dispatch solves this with ERC-8004 agent registration on Monad. Every completed job posts verifiable feedback. Agents query the reputation registry to find trusted workers. Track record is portable, on-chain, and tamper-proof.

---

## 4. Hero Section

**Badge:** Live on Monad + Solana testnet

**Headline:** Dispatch idle compute to AI agents.

**Subheadline:** Your hardware processes AI jobs while idle. Agents pay in USDC over x402. Workers build on-chain reputation via ERC-8004. Live on Monad and Solana testnet.

**Terminal demo:**
```
$ dispatch submit --task summarize --chain monad
→ Worker: node-7f3a (reputation: 4.8★)
→ Payment: 0.001 USDC via x402
→ Processing: summarization (1.2s)
→ Receipt: ed25519 verified ✓
→ Reputation: feedback posted to Monad
```

---

## 5. Feature Copy Blocks

### x402 Micropayments
**Headline:** Pay workers in stablecoins, per job.
Every job includes an x402 payment header. Workers receive USDC automatically on completion. No custom token, no staking — just HTTP and stablecoins.

### ERC-8004 Reputation
**Headline:** Workers with verifiable track records.
Workers register as ERC-8004 agents on Monad. Every completed job builds verifiable on-chain reputation. Agents discover trusted workers through the reputation registry.

### Mobile Dispatch Nodes
**Headline:** Phones become compute nodes.
Phones process lightweight AI tasks — summarization, classification, extraction — while idle. The Android app picks up jobs over WebSocket. Workers earn USDC for every completed job.

### Dual-Chain Architecture
**Headline:** Monad and Solana, running in parallel.
Two coordinators, two chains, one protocol. Monad handles EVM settlements, Solana handles SPL. Same worker code, different payment rails.

### Cryptographic Receipts
**Headline:** Proof for every job.
Workers sign ed25519 receipts over the job output hash. Receipts are verified server-side and designed for on-chain anchoring — proof that a specific worker produced a specific result.

### Desktop Workers
**Headline:** Full LLM inference on desktop.
Desktop nodes handle LLM inference via Ollama and all task types. Atomic job claims prevent race conditions. FAST policy prefers desktops, CHEAP prefers mobile.

---

## 6. Competitive Differentiation

| | Dispatch | GPU Rental (Akash, Render) | Centralized (OpenAI, Anthropic) |
|---|---|---|---|
| **Granularity** | Per-job | Per-VM/container | Per-token |
| **Payment** | USDC via x402 | Native tokens | Credit card |
| **Hardware** | Idle phones + desktops | Datacenter GPUs | Proprietary clusters |
| **Identity** | ERC-8004 on Monad | None | None |
| **Reputation** | On-chain, verifiable | None | Opaque SLAs |
| **Verification** | Ed25519 receipts | None | Trust the provider |
| **Multi-chain** | Monad + Solana | Single chain | N/A |

---

## 7. Target Audiences

### AI Agent Developers
**Need:** Cheap, reliable compute for autonomous agents.
**Message:** Your agents submit HTTP requests with payment headers. Dispatch routes them to the cheapest available worker. Receipts verify every result. No SDK, no wallet setup.

### Hardware Owners
**Need:** Passive income from idle devices.
**Message:** Install the app, connect your wallet. Your phone or desktop earns USDC while idle by processing AI inference jobs. ERC-8004 reputation makes you more visible to agents over time.

---

## 8. Hackathon-Specific Messaging

### Colosseum (Solana)
**Angle:** Agent-native compute on Solana. Dispatch turns Solana Mobile devices into AI inference nodes. Workers authenticate via Mobile Wallet Adapter, earn USDC via x402, and deliver ed25519-signed receipts. Compatible with Solana Seeker's 150K+ devices.

### Monad Moltiverse
**Angle:** ERC-8004 agent reputation on Monad. Workers register as ERC-8004 agents with verifiable on-chain reputation. Every completed job posts feedback to the reputation contract. Monad's fast finality makes per-job reputation updates practical.

### Solana Mobile
**Angle:** Turn every Seeker into a dispatch node. The Android app connects to the coordinator over WebSocket and picks up AI inference jobs while idle. Workers earn USDC for summarization, classification, and extraction tasks. Designed for the Seeker hardware.

---

## 9. Social Bio Copy

### Twitter/X Bio (160 chars max)
Dispatch idle compute to AI agents. x402 payments, ERC-8004 reputation on Monad, dual-chain on Solana. Testnet MVP live. Open source.

*(135 characters)*

### GitHub Tagline
The dispatch layer where AI agents buy compute from idle hardware — paid in USDC over x402, verified with ERC-8004 reputation.

---

## 10. Copy Usage Notes

**Tone:** Technical-confident. Builders reading this know what a coordinator is, understand WebSocket connections, have deployed contracts. Write to that level.

**Words to use:** dispatch, workers, agents, coordinators, receipts, reputation, micropayments, stablecoins, idle hardware, on-chain trust

**Words to avoid:** revolutionary, game-changing, web3, next-generation, paradigm, ecosystem (as filler), AI-powered (everything here involves AI, be specific), decentralize everything

**What we CAN claim:**
- Working testnet MVP with Monad + Solana dual-chain
- Mobile + desktop workers processing real AI inference
- Ed25519 signed receipts for every completed job
- x402 payment architecture built in (testnet mode)
- ERC-8004 worker identity + reputation on Monad
- Open source, 8K+ lines TypeScript

**What we say CAREFULLY:**
- "Designed to lower inference costs" (not "lowers costs by X%")
- "Compatible with Solana Seeker's 150K+ devices" (not "has 150K workers")
- "x402 payment rails built in, testnet mode" (not "payments flowing")
- "Testnet MVP" (not "production ready")
