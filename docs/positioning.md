# Dispatch: Positioning & Copy Direction

---

## 1. Name & Tagline

**Name:** Dispatch

**Tagline:** Cheap AI compute for agents. Passive income for workers.

**One-liner:** A compute service where AI agents buy verified inference from idle hardware. Workers earn BOLT on Solana and USDC on Monad per job. Agents pay via x402 HTTP headers. Results are cryptographically signed with ed25519.

---

## 2. Three Pillars

### Pillar 1: Agent-Native Compute
AI agents are the customers. They submit HTTP requests with x402 payment headers. No SDK, no wallet setup, just HTTP and USDC. Any agent that can make an HTTP call can buy compute.

### Pillar 2: Idle Hardware as Supply
Phones and desktops earn by processing AI inference while idle. The network scales with devices people already own, no GPU required. The Android app picks up jobs over WebSocket while the device is idle. Workers earn BOLT on Solana and USDC on Monad.

### Pillar 3: Onchain Trust
Workers register as ERC-8004 agents on Monad. Every completed job builds verifiable reputation through onchain feedback. Ed25519 receipts prove every result. Agents discover trusted workers through the reputation registry. Planned staking tiers will amplify reputation, giving Verified and Sentinel workers higher rep multipliers and priority matching.

---

## 3. Positioning Angles

### Angle A: "Cheap, Verified AI Compute"

**Headline:** AI compute at a fraction of the cost.
**Subhead:** Submit a job over HTTP. Get a verified result. Pay per job, not per GPU hour.

AI agents need compute but can't negotiate GPU leases. Dispatch gives them a simple interface: submit an HTTP request with a payment header, get a result with a cryptographic receipt. The network's supply side is idle hardware (phones and desktops), not datacenters.

### Angle B: "Earn While Idle"

**Headline:** Your hardware earns while you sleep.
**Subhead:** Phones and desktops earn by processing AI jobs. No GPU required.

Every other DePIN project targets datacenter GPUs and high-end servers. Dispatch turns idle consumer devices into compute nodes, handling summarization, classification, and extraction. This dramatically expands the supply side beyond the GPU arms race. Workers build ERC-8004 reputation that makes them more visible to agents.

### Angle C: "Verifiable Compute"

**Headline:** Every result comes with proof.
**Subhead:** Ed25519 receipts, ERC-8004 onchain reputation. Trust that's verifiable, not promised.

Permissionless compute networks have a trust problem: how do you know a worker will deliver quality results? Dispatch solves this with ERC-8004 agent registration on Monad. Every completed job posts verifiable feedback. Agents query the reputation registry to find trusted workers. Track record is portable, onchain, and tamper-proof.

### Angle D: "BOLT Token (Upcoming)"

**Headline:** USDC today. BOLT with upside tomorrow.
**Subhead:** Workers earn BOLT on Solana, USDC on Monad. Every dollar of compute flows through the network.

Agents never touch BOLT. They pay stablecoins via x402, same as before. But when BOLT launches (planned), USDC will auto-swap to BOLT via Jupiter DEX at the coordinator. Workers will earn BOLT with real upside: price appreciation as usage grows, staking for priority matching, or sell for USDC anytime. This isn't a fee skim. 100% of payment volume will create BOLT demand.

---

## 4. Hero Section

**Badge:** Live on Monad testnet + Solana devnet

**Headline:** Cheap AI compute for agents. Passive income for workers.

**Subheadline:** Submit a job over HTTP. Get a verified result. Workers earn BOLT on Solana and USDC on Monad per job. Ed25519 receipts, ERC-8004 reputation on Monad. Live on Monad testnet and Solana devnet.

**Terminal demo:**
```
$ curl "http://localhost:4010/v1/quote?job_type=LLM_INFER&policy=AUTO"
{"price":"$0.010","worker_count":3,"estimated_ms":1200}

$ curl -X POST http://localhost:4010/v1/jobs/commit/fast \
    -H "Content-Type: application/json" \
    -d '{"job_type":"LLM_INFER","user_id":"demo","payload":{"prompt":"Explain quantum computing.","max_tokens":256}}'
{"job_id":"j-7f3a","status":"completed","output":"Quantum computing uses...","receipt":"ed25519:verified","price":"$0.010"}
```

---

## 5. Feature Copy Blocks

### x402 Micropayments
**Headline:** Pay per job. USDC via HTTP headers.
Every job includes an x402 payment header. Workers earn BOLT on Solana and USDC on Monad for completed jobs. 5% protocol fee per job.

### ERC-8004 Reputation
**Headline:** Workers with verifiable track records.
Workers register as ERC-8004 agents on Monad. Every completed job builds verifiable onchain reputation. Agents discover trusted workers through the reputation registry.

### Mobile Dispatch Nodes
**Headline:** Phones become compute nodes.
Phones process lightweight AI tasks (summarization, classification, extraction) while idle. The Android app picks up jobs over WebSocket. Workers earn for every completed job.

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
| **Token** | BOLT (planned, 100% settlement) | Native tokens (staking/gas) | None |
| **Multi-chain** | Monad + Solana | Single chain | N/A |

---

## 7. Target Audiences

### AI Agent Developers
**Need:** Cheap, reliable compute for autonomous agents.
**Message:** Install the CLI, submit your first job in 30 seconds. Your agents submit HTTP requests with payment headers. Dispatch routes them to the cheapest available worker. Receipts verify every result. No SDK required, no wallet setup.

### Hardware Owners
**Need:** Passive income from idle devices.
**Message:** Install the app, connect your wallet. Your phone earns USDC while idle by processing AI inference jobs. ERC-8004 reputation makes you more visible to agents over time. When BOLT launches (planned), you'll earn token upside on top of USDC earnings. Stake BOLT for priority matching and higher earnings.

---

## 8. Hackathon-Specific Messaging

### Colosseum (Solana)
**Angle:** Agent-native compute on Solana. Dispatch turns Solana Mobile devices into AI inference nodes. Workers authenticate via Mobile Wallet Adapter, earn BOLT via x402 settlement on Solana devnet, and deliver ed25519-signed receipts. Compatible with Solana Seeker devices.

### Monad Moltiverse
**Angle:** ERC-8004 agent reputation on Monad. Workers register as ERC-8004 agents with verifiable onchain reputation. Every completed job posts feedback to the reputation contract. Monad's fast finality makes per-job reputation updates practical.

### Solana Mobile
**Angle:** Turn every Seeker into a dispatch node. The Android app connects to the coordinator over WebSocket and picks up AI inference jobs while idle. Workers earn BOLT for summarization, classification, and extraction tasks on Solana devnet. Designed for the Seeker hardware.

---

## 9. Social Bio Copy

### Twitter/X Bio (160 chars max)
Cheap AI compute for agents. Passive income for workers. x402 payments, ERC-8004 reputation on Monad. Live on Monad testnet and Solana devnet.

*(112 characters)*

### GitHub Tagline
AI agents buy verified compute from idle hardware. Workers earn BOLT on Solana, USDC on Monad per job. Ed25519 receipts, ERC-8004 reputation.

---

## 10. Copy Usage Notes

**Tone:** Technical-confident. Builders reading this know what a coordinator is, understand WebSocket connections, have deployed contracts. Write to that level.

**Words to use:** dispatch, workers, agents, coordinators, receipts, reputation, micropayments, stablecoins, idle hardware, onchain trust

**Words to avoid:** revolutionary, game-changing, web3, next-generation, paradigm, ecosystem (as filler), AI-powered (everything here involves AI, be specific), decentralize everything, em dashes

**What's live NOW (can claim freely):**
- Working testnet MVP with Monad + Solana dual-chain
- USDC settlement via x402 micropayments
- Ed25519 signed receipts for every completed job
- Mobile + desktop workers processing real AI inference
- ERC-8004 worker identity + reputation on Monad
- Dual-chain coordinators (Monad + Solana)
- Desktop + mobile workers (Android APK available)
- Open source, 12K+ lines TypeScript

**What's planned (label as upcoming):**
- BOLT token launch on Solana devnet
- Jupiter DEX integration for atomic USDC-to-BOLT swap
- Staking tiers (Open/Verified/Sentinel) for priority matching
- BOLT burn mechanism (5% protocol fee)
- Wrapped BOLT (ERC-20) on Monad for governance

**What we say CAREFULLY:**
- "Designed to lower inference costs" (not "lowers costs by X%")
- "Compatible with Solana Seeker devices" (not "has 150K workers")
- "x402 payment rails built in, testnet mode" (not "payments flowing")
- "Testnet MVP" (not "production ready")
- "BOLT token planned" (not "BOLT token live")
