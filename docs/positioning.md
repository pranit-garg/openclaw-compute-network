# Dispatch: Positioning & Copy Direction

---

## 1. Name & Tagline

**Name:** Dispatch

**Tagline:** Dispatch idle compute to AI agents.

**One-liner:** The dispatch layer where AI agents buy compute from idle hardware, paid in USDC over x402, verified with ERC-8004 reputation on Monad and Solana.

---

## 2. Three Pillars

### Pillar 1: Agent-Native Compute
AI agents are the customers. They submit HTTP requests with x402 payment headers. No SDK, no wallet setup, just HTTP and USDC. At the coordinator, USDC auto-swaps to BOLT via Jupiter DEX for settlement. Any agent that can make an HTTP call can buy compute.

### Pillar 2: Idle Hardware as Supply
Phones and desktops earn BOLT by processing AI inference while idle. The network scales with devices people already own, no GPU required. The Android app picks up jobs over WebSocket while the device is idle. Workers hold BOLT for upside, stake for priority matching, or sell for USDC anytime.

### Pillar 3: Onchain Trust
Workers register as ERC-8004 agents on Monad. Every completed job builds verifiable reputation through onchain feedback. Ed25519 receipts prove every result. Agents discover trusted workers through the reputation registry. Staking tiers amplify reputation. Verified and Sentinel workers earn higher rep multipliers and priority matching.

---

## 3. Positioning Angles

### Angle A: "The Agent Compute Layer"

**Headline:** Dispatch idle compute to AI agents.
**Subhead:** AI agents submit jobs over HTTP. Workers process them while idle. Reputation lives onchain.

AI agents need compute but can't negotiate GPU leases. Dispatch gives them a simple interface: submit an HTTP request with a payment header, get a result with a cryptographic receipt. The network's supply side is idle hardware (phones and desktops), not datacenters.

### Angle B: "Earn While Idle"

**Headline:** Your hardware earns BOLT while you sleep.
**Subhead:** Phones and desktops become dispatch nodes for AI inference.

Every other DePIN project targets datacenter GPUs and high-end servers. Dispatch turns idle consumer devices into compute nodes, handling summarization, classification, and extraction. This dramatically expands the supply side beyond the GPU arms race. Workers build ERC-8004 reputation that makes them more visible to agents.

### Angle C: "Onchain Compute Reputation"

**Headline:** Verifiable workers, trusted results.
**Subhead:** ERC-8004 reputation on Monad. Every job builds track record.

Permissionless compute networks have a trust problem: how do you know a worker will deliver quality results? Dispatch solves this with ERC-8004 agent registration on Monad. Every completed job posts verifiable feedback. Agents query the reputation registry to find trusted workers. Track record is portable, onchain, and tamper-proof.

### Angle D: "BOLT-as-Settlement"

**Headline:** Pay in USDC. Earn in BOLT.
**Subhead:** Every dollar of compute flows through BOLT, creating buy pressure, supply lock, and burns.

Agents never touch BOLT. They pay stablecoins via x402, same as before. But under the hood, USDC auto-swaps to BOLT via Jupiter DEX. Workers earn BOLT with real upside: price appreciation as usage grows, staking for priority matching, or sell for USDC anytime. This isn't a fee skim. 100% of payment volume creates BOLT demand.

---

## 4. Hero Section

**Badge:** Live on Monad + Solana testnet

**Headline:** Dispatch idle compute to AI agents.

**Subheadline:** Agents pay USDC. Workers earn BOLT. Every job builds onchain reputation via ERC-8004. Live on Monad and Solana testnet.

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
**Headline:** Pay in USDC. Settle in BOLT.
Every job includes an x402 payment header. USDC auto-swaps to BOLT via Jupiter DEX at the coordinator. Workers receive BOLT per job: hold for upside, stake for priority, or sell. 5% protocol fee burned per job.

### ERC-8004 Reputation
**Headline:** Workers with verifiable track records.
Workers register as ERC-8004 agents on Monad. Every completed job builds verifiable onchain reputation. Agents discover trusted workers through the reputation registry.

### Mobile Dispatch Nodes
**Headline:** Phones become compute nodes.
Phones process lightweight AI tasks (summarization, classification, extraction) while idle. The Android app picks up jobs over WebSocket. Workers earn BOLT for every completed job.

### Dual-Chain Architecture
**Headline:** Monad and Solana, running in parallel.
Two coordinators, two chains, one protocol. Monad handles EVM settlements, Solana handles SPL. Same worker code, different payment rails.

### Cryptographic Receipts
**Headline:** Proof for every job.
Workers sign ed25519 receipts over the job output hash. Receipts are verified server-side and designed for onchain anchoring. Proof that a specific worker produced a specific result.

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
| **Reputation** | Onchain, verifiable | None | Opaque SLAs |
| **Verification** | Ed25519 receipts | None | Trust the provider |
| **Token** | BOLT (100% settlement) | Native tokens (staking/gas) | None |
| **Multi-chain** | Monad + Solana | Single chain | N/A |

---

## 7. Target Audiences

### AI Agent Developers
**Need:** Cheap, reliable compute for autonomous agents.
**Message:** Your agents submit HTTP requests with payment headers. Dispatch routes them to the cheapest available worker. Receipts verify every result. No SDK, no wallet setup.

### Hardware Owners
**Need:** Passive income from idle devices.
**Message:** Install the app, connect your wallet. Your phone or desktop earns BOLT while idle by processing AI inference jobs. ERC-8004 reputation makes you more visible to agents over time. Stake BOLT for priority matching and higher earnings.

---

## 8. Hackathon-Specific Messaging

### Colosseum (Solana)
**Angle:** Agent-native compute on Solana. Dispatch turns Solana Mobile devices into AI inference nodes. Workers authenticate via Mobile Wallet Adapter, earn BOLT via x402 settlement, and deliver ed25519-signed receipts. Compatible with Solana Seeker devices.

### Monad Moltiverse
**Angle:** ERC-8004 agent reputation on Monad. Workers register as ERC-8004 agents with verifiable onchain reputation. Every completed job posts feedback to the reputation contract. Monad's fast finality makes per-job reputation updates practical.

### Solana Mobile
**Angle:** Turn every Seeker into a dispatch node. The Android app connects to the coordinator over WebSocket and picks up AI inference jobs while idle. Workers earn BOLT for summarization, classification, and extraction tasks. Designed for the Seeker hardware.

---

## 9. Social Bio Copy

### Twitter/X Bio (160 chars max)
Dispatch idle compute to AI agents. x402 payments, ERC-8004 reputation on Monad, dual-chain on Solana. Testnet MVP live. Open source.

*(135 characters)*

### GitHub Tagline
The dispatch layer where AI agents buy compute from idle hardware, paid in USDC over x402, verified with ERC-8004 reputation.

---

## 10. Copy Usage Notes

**Tone:** Technical-confident. Builders reading this know what a coordinator is, understand WebSocket connections, have deployed contracts. Write to that level.

**Words to use:** dispatch, workers, agents, coordinators, receipts, reputation, micropayments, stablecoins, idle hardware, onchain trust

**Words to avoid:** revolutionary, game-changing, web3, next-generation, paradigm, ecosystem (as filler), AI-powered (everything here involves AI, be specific), decentralize everything

**What we CAN claim:**
- Working testnet MVP with Monad + Solana dual-chain
- Mobile + desktop workers processing real AI inference
- Ed25519 signed receipts for every completed job
- x402 payment architecture built in (testnet mode)
- ERC-8004 worker identity + reputation on Monad
- BOLT token design with 100% flow-through settlement
- Staking tiers (Open/Verified/Sentinel) for priority matching
- Jupiter DEX integration for atomic USDC→BOLT swap
- Open source, 12K+ lines TypeScript

**What we say CAREFULLY:**
- "Designed to lower inference costs" (not "lowers costs by X%")
- "Compatible with Solana Seeker devices" (not "has 150K workers")
- "x402 payment rails built in, testnet mode" (not "payments flowing")
- "Testnet MVP" (not "production ready")
