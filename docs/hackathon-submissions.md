# Hackathon Submissions

---

## 1. Colosseum Agent Hackathon (Due: Feb 12, 2026)

### Project Name
Dispatch

### Tagline
Dispatch idle compute to AI agents.

### Short Description (1-2 sentences)
Dispatch is the compute layer AI agents pay into. Agents submit HTTP requests with x402 payment headers, idle phones and desktops process the work. Workers earn BOLT tokens via Jupiter DEX settlement. Built on Solana with MWA for Seeker integration.

### What It Does
Dispatch routes AI inference jobs from autonomous agents to a distributed network of idle hardware (phones and desktops). The protocol is agent-native: any agent that can make an HTTP request can buy compute. Workers authenticate via Solana Mobile Wallet Adapter, process jobs (summarization, classification, LLM inference), sign ed25519 receipts over results, and earn BOLT tokens. Agents pay USDC via x402, and every dollar auto-converts to BOLT and flows to workers.

### How It Works
1. **Agent submits a job.** HTTP POST to the coordinator with an x402 payment header. No SDK required.
2. **Coordinator matches a worker.** Routes to the best available worker based on device type, reputation, and pricing policy (FAST prefers desktops, CHEAP prefers mobile).
3. **Worker processes the job.** Summarization, classification, extraction, or LLM inference via Ollama.
4. **Worker signs a receipt.** ed25519 signature over the output hash. Cryptographic proof of who computed what.
5. **Settlement.** x402 USDC micropayment settles on Solana. Worker gets paid per job.

### Why Agents?
AI agents are the natural customers for decentralized compute. They need cheap inference at scale, they operate autonomously, and they can't negotiate GPU leases. Dispatch gives them a simple interface: HTTP request in, verified result out, payment handled inline.

### Tech Stack
- **Protocol**: TypeScript monorepo, 12K+ lines
- **Coordinators**: Dual-chain, Solana (SPL/x402) + Monad (EVM/x402)
- **Workers**: Desktop (Node.js + Ollama) + Mobile (React Native)
- **Mobile**: Solana MWA authentication, WebSocket job delivery
- **Payments**: x402 stablecoin micropayments (Coinbase protocol)
- **Verification**: ed25519 signed receipts, onchain anchoring ready
- **Reputation**: ERC-8004 agent identity + reputation on Monad

### What's Working (Testnet MVP)
- Full E2E flow: agent → coordinator → worker → receipt → settlement
- Mobile Android app (APK) picking up jobs via WebSocket
- Desktop workers with Ollama LLM inference
- Ed25519 receipt signing and verification
- Dual-chain coordinators (Monad + Solana)
- Real-time dashboard showing completed jobs
- Three routing policies: FAST, CHEAP, PRIVATE
- Trust pairing for private job routing

### Solana-Specific
- Mobile Wallet Adapter for worker authentication
- SPL USDC settlement via x402 ExactSvmScheme
- Compatible with Solana Seeker devices
- Ed25519 receipts use Solana's native signature scheme

### BOLT on Solana
- **BOLT** is a native SPL token on Solana, the settlement token for every Dispatch job
- **Jupiter DEX integration.** USDC from x402 payments auto-swaps to BOLT atomically during job commit
- **Staking tiers.** Workers optionally stake BOLT for priority matching:
  - Open (0 BOLT): CHEAP tier jobs, standard matching
  - Verified (100 BOLT): All tiers, +5 priority, 1.5x rep multiplier
  - Sentinel (1,000 BOLT): Priority matching, +10 bonus, 2x rep, revenue share
- **5% burn.** Protocol fee permanently burned per job, creating deflationary pressure

### Links
- Source: https://github.com/pranit-garg/Dispatch
- Landing: https://www.dispatch.computer
- Docs: https://docs.dispatch.computer
- Litepaper (PDF): https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf
- Demo video: [TBD]

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
Workers who stake BOLT earn higher reputation multipliers. Verified (100 BOLT) gets 1.5x, Sentinel (1,000 BOLT) gets 2x. Staking creates skin-in-the-game alignment: workers with economic stake are incentivized to maintain high-quality output, and the reputation system reflects that commitment. Wrapped BOLT (ERC-20) on Monad enables governance votes and proposals.

**Why ERC-8004 + Dispatch is a natural pairing:**
ERC-8004 was co-authored by Erik Reppel (Coinbase, x402 creator). Dispatch already uses x402 for payments. Adding ERC-8004 for trust completes the stack: the same team at Coinbase designed both the payment layer and the trust layer. Dispatch is the first project to combine them.

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
Dispatch turns Solana Seeker devices into compute nodes for AI agents. The Android app connects to the Dispatch coordinator over WebSocket and picks up inference jobs while the device is idle. Workers authenticate via Mobile Wallet Adapter (Phantom), process lightweight AI tasks, sign ed25519 receipts over results, and earn BOLT per completed job via x402 micropayments.

### Why Seeker?
The Seeker is a massive untapped compute fleet. These devices sit idle 90%+ of the time. Dispatch lets owners earn passive income by processing AI inference (summarization, classification, JSON extraction) during idle periods. The jobs are lightweight enough for mobile hardware. Seeker's MWA integration means workers authenticate with their existing Phantom wallet, no new keys needed.

### User Experience
1. **Install Dispatch** from dApp Store
2. **Connect wallet.** MWA handshake with Phantom
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
- Dual signing: MWA (Phantom) or device key

### Privacy
- Trust pairing system: create a pairing code, share with your phone. Private jobs route exclusively to paired workers. Enforced at coordinator level.
- Workers only see job inputs for jobs they're assigned. No data leaks to other workers.

### Links
- Source: https://github.com/pranit-garg/Dispatch
- Landing: https://www.dispatch.computer
- Docs: https://docs.dispatch.computer
- APK: https://expo.dev/artifacts/eas/pRku9ZWEqdSGS2poEU9VjN.apk
- Litepaper (PDF): https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf
