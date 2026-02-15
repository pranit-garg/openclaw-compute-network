# Hackathon Submissions

---

## 1. Colosseum Agent Hackathon (Due: Feb 12, 2026)

> Each field below maps 1:1 to the Colosseum submission form.
> Character counts are noted per field. No redundancy between fields.

### name
Dispatch

### description
Dispatch is a compute service where AI agents submit jobs over HTTP and get verified results from idle phones and desktops. Workers earn BOLT on Solana for every completed job. Live on Solana devnet and Monad testnet. Search "Dispatch" on the Solana dApp Store.

### repoLink
https://github.com/pranit-garg/Dispatch

### problemStatement (~950 chars)
Every compute marketplace today requires a human in the loop. AI agents cannot create accounts, negotiate contracts, or manage API keys.

- Centralized providers (OpenAI, Anthropic): demand human-provisioned API keys, enforce opaque rate limits, bill to credit cards.
- GPU rental networks (Akash, Render, Vast.ai): sell per-hour VM leases to developers who manually provision containers.
- Serverless inference (Replicate, Modal): better granularity but stays centralized, still requires API keys, zero verifiable proof of computation.

The granularity is wrong. Agents need per-job compute, not per-hour leases. Agents can do exactly one thing well: make HTTP requests. No compute service lets an agent send one HTTP request with inline payment and receive a cryptographically verified result. Dispatch fills that gap: per-job pricing starting at $0.001, HTTP-native payment via x402, ed25519 signed receipts proving who computed what.

### technicalApproach (~1100 chars)
TypeScript monorepo, 16,000+ lines across 17 packages. Every line written by AI agents. Open source, MIT licensed.

Three steps: Submit, Process, Verify.
1. Agent sends HTTP POST with x402 payment header. No SDK, no API key, no account.
2. Coordinator matches the best worker by device type, ERC-8004 reputation, and routing policy (FAST/CHEAP/PRIVATE).
3. Worker processes the job, signs an ed25519 receipt over the output hash. BOLT settles on Solana.

Dual-chain architecture: Solana handles SPL settlement and x402 payments. Monad handles EVM, ERC-8004 identity, and reputation. Same worker code, same protocol, different settlement rails.

Desktop workers run Node.js + Ollama for real LLM inference. Atomic job claims prevent double-processing. Mobile app: React Native + Expo, MWA authentication, WebSocket job delivery. Approved on the Solana dApp Store.

Working testnet MVP:
- Full E2E flow with real BOLT transfers on Solana devnet
- Real ERC-8004 reputation on Monad testnet
- Three routing policies (FAST/CHEAP/PRIVATE)
- Jupiter DEX integration
- Real-time dashboard with explorer links

### solanaIntegration (~880 chars)
Seven Solana primitives:

1. BOLT SPL Token: Native Solana token (1B supply, 9 decimals). Real SPL transfers on devnet settle every job. Workers receive BOLT immediately on completion.
2. Mobile Wallet Adapter (MWA): Workers on Seeker authenticate via Solana MWA. No new key management.
3. Jupiter DEX: USDC from x402 payments auto-swaps to BOLT atomically during job commit, with fallback to direct distribution.
4. Ed25519 Signatures: Receipts use Solana's native signature scheme. Workers sign SHA-256 output hashes with ed25519 keys.
5. dApp Store: Release NFT minted, APK hosted on Arweave. Search "Dispatch" on the Solana dApp Store.
6. Seeker-Native: The mobile app turns any idle phone into a worker node. Process AI tasks in the background, earn BOLT.
7. Staking Tiers: Open (0 BOLT, standard matching), Verified (100 BOLT, +5 priority, 1.5x rep), Sentinel (1,000 BOLT, 2x rep, revenue share).

5% of every BOLT payment is burned permanently.

### targetAudience (~830 chars)
Two sides of the marketplace:

Demand: AI Agent Developers. Autonomous agents needing cheap, reliable compute at scale. First users build agents that process text: summarization, classification, extraction, LLM inference. Their agents submit HTTP requests with x402 payment headers. Dispatch routes to the cheapest available worker. Receipts verify every result. No SDK, no wallet setup, no account creation required.

Supply: Hardware Owners. Anyone with an idle phone or laptop earning passive income. Install the Seeker app or the desktop CLI. Connect your Solana wallet via MWA. Your device picks up AI tasks over WebSocket while idle. BOLT earnings accumulate automatically. ERC-8004 reputation builds with every completed job, unlocking priority matching and better-paying work over time. No GPU required.

### businessModel (~810 chars)
5% protocol fee on every job settlement. Agents pay USDC via x402 HTTP headers. The coordinator auto-swaps USDC to BOLT via Jupiter DEX, deducts 5%, and distributes the rest to workers.

Revenue scales linearly with network usage. At 100,000 jobs/day at $0.005 average: $25/day in protocol fees, $500/day in BOLT buy pressure.

Three value accrual mechanisms:
1. Buy pressure: Every job triggers a USDC-to-BOLT swap on Jupiter. More jobs = more BOLT demand.
2. Supply lock: Workers stake BOLT for priority matching. Staked tokens leave circulation.
3. Burn: 5% of every settlement is burned permanently. Total supply is strictly deflationary.

No token required to participate. Workers earn from day one with zero stake. The protocol is open source (MIT). Value capture lives at the coordination layer.

### competitiveLandscape (~940 chars)
Three categories of existing solutions, none built for agents:

1. Centralized Providers (OpenAI, Anthropic, Google): Premium pricing, opaque rate limits, API keys requiring human provisioning. Not agent-accessible.
2. GPU Rental Networks (Akash, Render, Vast.ai): Target developers provisioning VMs/containers. Per-hour pricing, native token staking. Wrong granularity for agents needing per-job compute.
3. Serverless Inference (Replicate, Modal): Better granularity but centralized, still requires API keys, no verifiable proof of computation.

Dispatch differentiates on:
- Granularity: Per-job, not per-hour or per-token
- Payment: USDC via x402 HTTP headers, no API key needed
- Hardware: Idle phones and desktops, not datacenter GPUs
- Verification: Ed25519 signed receipts, not "trust the provider"
- Identity: ERC-8004 onchain reputation on Monad
- Multi-chain: Solana (settlement) + Monad (trust)

Closest analogy: Helium for compute instead of wireless coverage.

### futureVision (~870 chars)
Current: Testnet MVP live on Solana devnet + Monad testnet. Full E2E flow working. dApp Store approved.

Next (Phase 2, BOLT Token Launch):
- BOLT SPL token deployment on Solana mainnet
- Jupiter DEX for automatic USDC-to-BOLT settlement
- Staking program: Open / Verified / Sentinel tiers live
- Protocol fee burn mechanism active
- Worker rewards emission begins

Future (Phase 3, Scale):
- Onchain receipt anchoring on Solana (Anchor) and Monad (Solidity)
- zkML validation: zero-knowledge proofs that a specific model produced a specific output
- Dynamic pricing based on supply/demand
- Confidential compute via TEE for sensitive workloads
- Agent discovery: agents query ERC-8004 registry to find workers by skill and reputation
- GPU worker tier extending beyond consumer hardware
- Governance: BOLT holders vote on protocol parameters

Long-term: the default compute layer for autonomous agents.

### tags
DePIN, AI, Payments

### Optional Fields
- slug: dispatch
- liveAppLink: https://www.dispatch.computer
- presentationLink: https://www.dispatch.computer/colosseum
- twitterHandle: @pranit

### Links
- Source: https://github.com/pranit-garg/Dispatch
- Landing: https://www.dispatch.computer
- Docs: https://docs.dispatch.computer
- Videos (Pitch + Technical Demo): https://www.dispatch.computer/colosseum
- Litepaper (PDF): https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf
- Mobile APK: https://expo.dev/artifacts/eas/pRku9ZWEqdSGS2poEU9VjN.apk

---

## 2. Monad Moltiverse (Due: Feb 15, 2026)

### Project Name
Dispatch

### Tagline
Dispatch idle compute to AI agents.

### Short Description (1-2 sentences)
Dispatch is the first compute marketplace on Monad with ERC-8004 agent reputation. Workers register onchain, build verifiable track records per job, and earn BOLT tokens for processing AI inference. Agents discover trusted workers through the reputation registry.

### What It Does
Dispatch is a decentralized compute network where AI agents buy inference from idle hardware (phones and desktops). What makes it unique on Monad: every worker registers as an ERC-8004 agent with onchain identity, and every completed job posts verifiable reputation feedback to the ERC-8004 Reputation Registry. Monad's high-throughput finality makes per-job reputation updates practical at scale.

### ERC-8004 Integration (Identity + Reputation)
This is the core Monad-native feature:

**Worker Identity (Identity Registry)**
- Workers register as ERC-8004 agents on Monad testnet → receive an agent NFT (agentId)
- Registration file (off-chain JSON) advertises capabilities: skills, endpoint, x402 support
- Contract: `0x8004A818BFB912233c491871b3d84c89A494BD9e` on Monad Testnet

**Reputation (Reputation Registry)**
- After every completed job, the coordinator posts onchain feedback: score, skill tag, endpoint, feedback hash
- Agents query reputation before routing, and higher-reputation workers get preferred
- Tags enable per-skill reputation (e.g., "llm-inference" vs "summarization")
- Contract: `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Monad Testnet

**BOLT staking amplifies ERC-8004 reputation:**
Workers who stake BOLT earn higher reputation multipliers. Verified (100 BOLT) gets 1.5x, Sentinel (1,000 BOLT) gets 2x. Staking creates skin-in-the-game alignment: workers with economic stake are incentivized to maintain high-quality output, and the reputation system reflects that commitment. Wrapped BOLT (wBOLT, ERC-20) is live on Monad testnet. The coordinator mints wBOLT to workers after each completed job via the WrappedBoltDistributor.

**Why ERC-8004 + Dispatch is a natural pairing:**
ERC-8004 is an open standard for onchain agent identity and reputation. Dispatch already uses x402 for payments. Adding ERC-8004 for trust completes the stack: x402 handles the economic layer and ERC-8004 handles the trust layer. Dispatch is the first project to combine them into a working compute marketplace.

### How It Works
1. **Worker registers onchain.** Mints an ERC-8004 agent NFT on Monad. Sets agent URI pointing to a registration file with capabilities.
2. **Worker connects to coordinator.** WebSocket connection. Coordinator reads reputation score (async, non-blocking).
3. **Agent submits a job.** HTTP POST with x402 payment header. Coordinator routes to the best available worker, preferring higher reputation.
4. **Worker processes + signs receipt.** ed25519 signature over output hash.
5. **Coordinator posts feedback.** Onchain feedback to ERC-8004 Reputation Registry. Score, skill tag, job type recorded.
6. **Reputation accumulates.** Over time, reliable workers build visible track records. Agents can query the registry to find trusted workers.

### Monad-Specific Advantages
- **Fast finality.** Per-job reputation updates are practical because Monad settles quickly. On slower chains, posting feedback per job would be too expensive.
- **EVM compatibility.** ERC-8004 contracts deploy identically to Base/Ethereum. Workers register once on Monad but the standard is portable.
- **Low gas.** Monad's throughput means reputation feedback costs fraction of a cent per job.

### Tech Stack
- **ERC-8004 package**: `packages/erc8004/`, viem wrappers for Identity + Reputation registries
- **Coordinator**: Express + WebSocket, reputation-aware routing in `claimWorker()`
- **Protocol**: TypeScript monorepo, 12K+ lines, dual-chain (Monad + Solana)
- **Payments**: x402 USDC micropayments (EVM ExactEvmScheme on Monad)
- **Workers**: Desktop (Node.js + Ollama) + Mobile (React Native)

### What's Working (Testnet MVP)
- ERC-8004 worker registration on Monad Testnet
- Reputation-aware job routing (higher score = priority)
- Post-job feedback to Reputation Registry
- Full E2E: agent → coordinator → worker → receipt → reputation update
- Dual-chain coordinators (Monad EVM + Solana SPL)
- Mobile + desktop workers processing real AI inference
- Dashboard showing completed jobs with reputation data

### What's on the Roadmap
- ERC-8004 Validation Registry (re-execution, zkML proofs)
- Agent discovery via onchain registry (find workers without coordinator)
- Cross-chain reputation bridging (Monad ↔ Solana)
- Client agent registration (agents also get reputation)

### Links
- Source: https://github.com/pranit-garg/Dispatch
- Landing: https://www.dispatch.computer
- Docs: https://docs.dispatch.computer
- ERC-8004 Contracts: https://github.com/erc-8004/erc-8004-contracts
- Litepaper (PDF): https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf
- Demo video: [TBD]

---

## 3. Solana Mobile / dApp Store

### Project Name
Dispatch

### Status
Submitted to Solana dApp Store. Pending review.

### Tagline
Turn your Seeker into a compute node.

### Short Description (1-2 sentences)
Dispatch routes AI jobs to your phone while it's idle: summarization, classification, inference. Earn BOLT tokens per job. Cryptographic receipts prove every result.

### What It Does
Dispatch turns Solana Seeker devices into compute nodes for AI agents. The Android app connects to the Dispatch coordinator over WebSocket and picks up inference jobs while the device is idle. Workers authenticate via Mobile Wallet Adapter, process lightweight AI tasks, sign ed25519 receipts over results, and earn BOLT per completed job via x402 micropayments.

### Why Seeker?
The Seeker is a massive untapped compute fleet. These devices sit idle 90%+ of the time. Dispatch lets owners earn passive income by processing AI inference (summarization, classification, JSON extraction) during idle periods. The jobs are lightweight enough for mobile hardware. Seeker's MWA integration means workers authenticate with their existing Solana wallet, no new keys needed.

### User Experience
1. **Install Dispatch** from dApp Store
2. **Connect wallet.** MWA handshake with your Solana wallet
3. **Set coordinator URL.** Defaults to production coordinator
4. **Tap "Start Worker".** Device goes online, picks up jobs automatically
5. **Earn BOLT.** Per-job payments, visible in dashboard tab
6. **Build reputation.** ERC-8004 track record on Monad makes your device more visible to agents

### Job Types Supported on Mobile
- **Summarization.** Condense articles, documents, emails
- **Classification.** Categorize text into predefined labels
- **Extraction.** Pull structured data from unstructured text
- **JSON transformation.** Clean and restructure data

### Technical Details
- React Native + Expo, EAS cloud builds
- Solana MWA for wallet authentication
- WebSocket connection to coordinator (persistent, auto-reconnect)
- Device-key signing (tweetnacl) for receipts when MWA unavailable
- Background job processing (foreground service)
- USDC settlement via x402 on Solana

### What's Built
- Android APK installed and tested on emulator
- Full E2E flow: connect → pick up job → process → sign receipt → earn
- Dashboard showing completed jobs and earnings
- Settings for coordinator URL, wallet mode toggle
- Dual signing: MWA (Solana wallet) or device key

### Privacy
- Trust pairing system: create a pairing code, share with your phone. Private jobs route exclusively to paired workers. Enforced at coordinator level.
- Workers only see job inputs for jobs they're assigned. No data leaks to other workers.

### Links
- Source: https://github.com/pranit-garg/Dispatch
- Landing: https://www.dispatch.computer
- Docs: https://docs.dispatch.computer
- APK: https://expo.dev/artifacts/eas/pRku9ZWEqdSGS2poEU9VjN.apk
- Litepaper (PDF): https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf
