# Dispatch

**Cheap AI compute for agents. Passive income for workers.**

Dispatch is a compute service where AI agents submit jobs over HTTP and get verified results from idle hardware. Workers earn BOLT on Solana and USDC on Monad for every completed job. Every result includes an ed25519 cryptographic receipt.

[dispatch.computer](https://www.dispatch.computer) · [Docs](https://docs.dispatch.computer) · [Android APK](https://expo.dev/artifacts/eas/pRku9ZWEqdSGS2poEU9VjN.apk)

---

## Quick Start: Agents

Submit a compute job with one HTTP request:

```bash
# Get a price quote
curl "http://localhost:4010/v1/quote?job_type=LLM_INFER&policy=AUTO"

# Submit an LLM job
curl -X POST http://localhost:4010/v1/jobs/commit/fast \
  -H "Content-Type: application/json" \
  -d '{
    "job_type": "LLM_INFER",
    "user_id": "quickstart-user",
    "privacy_class": "PUBLIC",
    "payload": {
      "job_type": "LLM_INFER",
      "prompt": "Explain quantum computing in one paragraph.",
      "max_tokens": 256
    }
  }'
```

Or use the SDK:

```typescript
import { ComputeRouter } from "@dispatch/compute-router";

const router = new ComputeRouter({
  coordinatorUrls: { monad: "http://localhost:4010" },
});

const result = await router.runLLM({
  prompt: "Explain quantum computing in one paragraph.",
  max_tokens: 256,
  user_id: "demo",
  chainPreference: "monad",
});

console.log(result.output);  // The response text
console.log(result.price);   // "$0.010"
console.log(result.receipt);  // ed25519 signed receipt
```

## Quick Start: Workers

Earn by processing AI jobs on your idle hardware:

```bash
# Install and build
git clone https://github.com/pranit-garg/Dispatch.git
cd Dispatch && pnpm install && pnpm build

# Start a coordinator (testnet mode, no payments)
TESTNET_MODE=true pnpm --filter coordinator-monad start

# Start your worker
COORDINATOR_URL=http://localhost:4010 pnpm --filter worker-desktop start
```

Your worker generates an ed25519 keypair, connects via WebSocket, and starts picking up jobs automatically.

For mobile: download the [Android APK](https://expo.dev/artifacts/eas/pRku9ZWEqdSGS2poEU9VjN.apk) and start earning from your phone.

---

## Why Agents?

AI agents need cheap inference at scale. They operate autonomously and can't negotiate GPU leases. Dispatch gives them a simple interface: HTTP request in, verified result out, payment handled inline.

---

## How It Works

```
Agent (HTTP + x402)  →  Coordinator  →  Worker (phone/desktop)
                            ↓                    ↓
                     Route by reputation    Process job
                     + device type          Sign ed25519 receipt
                            ↓                    ↓
                     Payment settles  ←──────── Result returned
```

1. **Agent submits a job.** HTTP POST with an x402 payment header. No SDK required.
2. **Coordinator routes it.** Matches to the best worker by device type, reputation score, and routing policy (FAST / CHEAP / PRIVATE).
3. **Worker processes.** Summarization, classification, extraction, or LLM inference via Ollama.
4. **Worker signs a receipt.** ed25519 signature over the output hash. Cryptographic proof of who computed what.
5. **Payment settles.** Worker receives BOLT (Solana) or wBOLT (Monad) for completed job. 5% protocol fee collected.

## What's Working (Testnet)

- Full end-to-end flow: agent → coordinator → worker → receipt → BOLT settlement
- BOLT distribution on Solana devnet via BoltDistributor (batched SPL payouts)
- wBOLT distribution on Monad testnet via WrappedBoltDistributor (ERC-20 minting)
- Jupiter DEX swap integration (USDC→BOLT, with fallback to direct distribution)
- Android app picking up jobs via WebSocket ([APK](https://expo.dev/artifacts/eas/pRku9ZWEqdSGS2poEU9VjN.apk))
- Desktop workers with Ollama LLM inference
- Ed25519 receipt signing and verification
- Dual-chain coordinators (Monad + Solana)
- Real-time dashboard showing completed jobs and earnings
- Three routing policies: FAST, CHEAP, PRIVATE
- Trust pairing for private job routing
- ERC-8004 worker registration and per-job reputation on Monad

## BOLT Token

BOLT is the settlement token for the Dispatch network. Agents pay USDC via x402 micropayments. The coordinator auto-swaps USDC to BOLT via Jupiter DEX (with fallback to direct authority distribution when no DEX pool exists). Workers earn BOLT on Solana devnet and wBOLT (ERC-20) on Monad testnet.

**How it works:** Agents pay USDC (unchanged UX). On Solana, the coordinator swaps USDC to BOLT via Jupiter, then transfers BOLT to workers. On Monad, the coordinator mints wBOLT (Wrapped BOLT) to workers after each job. Both chains distribute tokens via batched settlement (threshold or interval-based).

**Value accrual:**
1. **Buy pressure.** Every job converts USDC to BOLT on Jupiter (when pool exists)
2. **Supply lock.** Workers stake BOLT for priority matching
3. **Protocol fee.** 5% collected per job, funding treasury and future buybacks

**Staking tiers** (zero stake required to earn):

| Tier | Stake | Benefits |
|------|-------|----------|
| Open | 0 BOLT | CHEAP tier jobs, standard matching |
| Verified | 100 BOLT | All tiers, +5 priority, 1.5x rep multiplier |
| Sentinel | 1,000 BOLT | Priority matching, +10 bonus, 2x rep, revenue share |

**Token status:**
- BOLT (SPL): Live on Solana devnet, distributed via BoltDistributor
- wBOLT (ERC-20): Live on Monad testnet, minted via WrappedBoltDistributor (custodial)
- Jupiter swap: Built with fallback (activates when BOLT/USDC pool is created)
- Staking: Designed, reads balance for tier assignment (no lockup program yet)

---

## Litepaper

> AI agents are becoming autonomous economic actors, but they lack infrastructure to purchase compute on their own terms. They cannot negotiate GPU leases, sign enterprise contracts, or evaluate provider quality. They need compute that is purchasable via HTTP, priced per job, and backed by verifiable trust signals.
>
> Dispatch is a protocol that routes AI inference jobs from agents to idle consumer hardware (phones and desktops) using x402 micropayments for settlement and ERC-8004 onchain reputation for trust. Agents pay in USDC via standard HTTP headers. Workers process jobs and sign ed25519 receipts over their outputs. Coordinators match jobs to workers based on device type, routing policy, and onchain reputation scores. The system runs on a dual-chain architecture: Solana as the economic layer (BOLT token, staking, USDC payments, Seeker device support) and Monad as the trust layer (ERC-8004 identity and reputation, governance, receipt anchoring).
>
> Dispatch is the first protocol to combine x402 HTTP payments with ERC-8004 onchain reputation into a working compute marketplace built on idle consumer devices.

**[Read the full litepaper (PDF)](docs/Dispatch_Litepaper.pdf)** · *Pranit Garg, February 2026*

---

## Solana + Seeker

- **Mobile Wallet Adapter** for worker authentication
- **SPL BOLT** settlement on Solana devnet
- **Seeker support**, each device is a potential compute node
- **Ed25519 receipts** use Solana's native signature scheme
- Seeker app live on the [Solana dApp Store](https://docs.solanamobile.com/dapp-publishing/intro)

## Monad + ERC-8004

Dispatch is the first project to combine [x402](https://www.x402.org/) payments with [ERC-8004](https://github.com/erc-8004/erc-8004-contracts) onchain reputation into a working compute marketplace.

- **Worker identity.** Workers register as ERC-8004 agents on Monad and receive an agent NFT
- **Per-job reputation.** After every completed job, the coordinator posts onchain feedback: score, skill tag, feedback hash
- **Reputation-aware routing.** Higher-reputation workers get priority in job matching
- **Monad's fast finality** makes per-job reputation updates practical at scale

Contracts on Monad Testnet:
- Identity Registry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Reputation Registry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`

## Architecture

```
packages/
  protocol/          # Shared types, enums, WS messages, pricing
  compute-router/    # Client SDK (decentralized + hosted adapters)
  bolt/              # BOLT token types, staking tiers, Jupiter swap utils
  erc8004/           # ERC-8004 viem wrappers (identity + reputation)
  cli/               # CLI tool (@dispatch/cli)
apps/
  coordinator-core/     # Express + SQLite + WebSocket hub
  coordinator-monad/    # Monad x402 config (port 4010)
  coordinator-solana/   # Solana x402 config (port 4020)
  worker-desktop/       # Desktop worker (Node.js + Ollama)
  seeker-simulator/     # Mobile seeker simulator
  dispatch-demo/        # CLI demo (3 scenarios)
  landing/              # Next.js landing page
  docs/                 # Fumadocs API documentation
mobile/
  seeker-solana/           # React Native Seeker app (Expo + MWA)
  seeker-worker-android/   # Native Android worker (Kotlin)
chain/
  monad/contracts/      # Solidity receipt anchor
  solana/receipt-anchor/ # Anchor program receipt anchor
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Protocol | TypeScript monorepo, 16K+ lines |
| Coordinators | Express, SQLite, WebSocket |
| Payments | x402 USDC micropayments |
| Verification | ed25519 signed receipts |
| Reputation | ERC-8004 on Monad (viem) |
| Mobile | React Native, Expo, Solana MWA |
| Desktop Workers | Node.js + Ollama |
| Landing + Docs | Next.js 15, Tailwind, Fumadocs |
| Chains | Solana devnet + Monad testnet |

## Full E2E Setup

### Run Monad E2E

```bash
pnpm install && pnpm build

# Terminal 1: Coordinator
pnpm dev:monad

# Terminal 2: Desktop worker
COORDINATOR_URL=http://localhost:4010 pnpm worker:desktop

# Terminal 3: Seeker simulator
COORDINATOR_URL=http://localhost:4010 pnpm worker:seeker

# Terminal 4: Run demo
pnpm demo:monad
```

### Run Solana E2E

```bash
# Terminal 1: Coordinator
pnpm dev:solana

# Terminal 2: Worker
COORDINATOR_URL=http://localhost:4020 pnpm worker:desktop

# Terminal 3: Run demo
pnpm demo:solana
```

### Automated E2E

```bash
pnpm e2e    # Spawns coordinators + workers, runs demo scenarios, cleans up
pnpm test   # Unit tests
```

### Quality Gates

```bash
pnpm quality:check   # Build + tests + app builds
pnpm quality:links   # Strict external link correctness check
pnpm quality:public  # Verify live landing/docs/search/litepaper/dApp links
```

Detailed checklist: [`docs/quality-playbook.md`](docs/quality-playbook.md)

## Links

| | |
|-|-|
| Landing page | [dispatch.computer](https://www.dispatch.computer) |
| Documentation | [docs.dispatch.computer](https://docs.dispatch.computer) |
| Android APK | [Download](https://expo.dev/artifacts/eas/pRku9ZWEqdSGS2poEU9VjN.apk) |
| ERC-8004 Contracts | [erc-8004/erc-8004-contracts](https://github.com/erc-8004/erc-8004-contracts) |
| x402 Protocol | [x402.org](https://www.x402.org/) |
| Litepaper | [Dispatch_Litepaper.pdf](docs/Dispatch_Litepaper.pdf) |

## License

MIT. See [LICENSE](LICENSE).
