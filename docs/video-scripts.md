# Dispatch Video Scripts

## 1. Pitch Video (2-3 min, talking head + screen recordings)

> This video also embeds in the landing page FounderVideo section.
> Record as: talking head (webcam) with screen recording cut-ins at [SHOW] cues.
> Tone: calm, confident, direct. Not salesy. You're explaining something real.

---

### SCRIPT

**[0:00 - 0:15] HOOK**

Hey, I'm Pranit. I built Dispatch: a compute network where AI agents pay for inference and idle devices earn for processing it.

One HTTP request in, one verified result out, payment settled inline.

**[0:15 - 0:45] PROBLEM**

[SHOW: screen recording of an AI agent making API calls, hitting rate limits or pricing pages]

Right now, if an AI agent needs compute, it has two options: expensive API calls to centralized providers, or trying to negotiate GPU leases. Neither works at scale.

Agents need cheap inference. They need it on-demand. And they can't sign contracts or manage cloud accounts. They just make HTTP requests.

**[0:45 - 1:30] SOLUTION**

[SHOW: dispatch.computer landing page, scroll through]

Dispatch is the layer between agents and compute. An agent sends a standard HTTP POST with an x402 payment header. The coordinator matches it to an idle worker based on reputation and routing policy. The worker processes the job, signs a cryptographic receipt, and gets paid. That's it.

[SHOW: CLI demo on the landing page, click "Run Command"]

Here's what that looks like in practice. One CLI command, one result, with a signed receipt proving who computed what.

[SHOW: Seeker phone - open app, tap "Get Started", jobs start flowing within seconds]

On mobile, it's even simpler. Open the app, tap once, and your phone connects to the coordinator over WebSocket and starts picking up compute tasks. Every result is signed with the device's own cryptographic key.

**[1:30 - 2:00] WHY NOW**

Three things make this possible today that didn't exist a year ago.

First, x402: an open protocol for HTTP-native micropayments. Agents can pay per request without accounts or API keys.

Second, ERC-8004: onchain agent identity and reputation. Workers register, build track records, and agents discover trusted compute through the registry. We're on Monad for this because per-job reputation updates need fast, cheap finality.

Every completed job now earns BOLT tokens, transferred on Solana devnet with a verifiable transaction. Both chains are doing real work, not just architecture claims.

Third, Solana Mobile Wallet Adapter and the Seeker. A whole fleet of phones that start earning with a single tap. No wallet setup, no configuration. Open, tap, earn.

[SHOW: Seeker phone mockup from the landing page]

**[2:00 - 2:30] TRACTION**

[SHOW: docs.dispatch.computer, GitHub repo]

This is a working MVP. Dual-chain: Solana for payments and mobile, Monad for identity and reputation. 12,000+ lines of TypeScript. Full end-to-end flow running on testnet.

Desktop workers running Ollama for real LLM inference. Mobile workers handling lightweight task jobs: summarize, classify, extract. Both signing ed25519 receipts on every result.

Zero-friction mobile: one tap to start earning. The phone connects to our production coordinator on Railway, picks up jobs over WebSocket, processes them locally, and signs a cryptographic receipt for each one.

And the entire codebase was written by AI agents, which seems fitting for a compute network built for AI agents.

**[2:30 - 2:50] CLOSE**

[SHOW: dispatch.computer with CTA buttons visible]

Dispatch. Cheap compute for agents. Passive income for workers. Every result verified.

Check it out at dispatch.computer, or read the docs, or fork the whole thing. It's MIT licensed.

---

## 2. Technical Demo (2-3 min, screen recording + voiceover)

> Record as: screen recording with voiceover narration.
> Tone: technical but accessible. Walk through code and live flows.
> No webcam needed, just your screen and voice.

---

### SCRIPT

**[0:00 - 0:20] INTRO**

This is a technical walkthrough of Dispatch. I'll show the architecture, run a live end-to-end job, and walk through the Solana and Monad integrations.

**[0:20 - 0:50] ARCHITECTURE**

[SHOW: VS Code with the monorepo open, file tree visible]

Dispatch is a TypeScript monorepo. Six packages:

- `coordinator`: the routing and matching layer, Express + WebSocket
- `worker`: desktop workers running Node.js with Ollama
- `cli`: the agent-facing CLI for submitting jobs
- `erc8004`: viem wrappers for Monad's Identity and Reputation registries
- `bolt`: token distribution and staking logic
- Mobile app in `mobile/seeker-solana/`: React Native + Expo

[SHOW: briefly scroll through the packages/ directory]

**[0:50 - 1:30] LIVE E2E FLOW**

[SHOW: terminal with CLI ready]

Let me show you the two paths. First, the CLI. An agent submits a job with one command.

[SHOW: run `dispatch agent run --type summarize --prompt "Summarize the latest Solana validator update" --policy fast`]

That hits our production coordinator on Railway via HTTP POST. The coordinator finds an idle worker, routes the job over WebSocket, the worker processes it, signs an ed25519 receipt over the output hash, and returns the result. The receipt is cryptographic proof: you can verify it independently using the worker's public key.

[SHOW: highlight the receipt in the response: hash, worker ID, signature]

[SHOW: split-screen - left: Seeker phone with jobs flowing, right: CLI submitting]

Now here's the Seeker phone. It's connected to the same coordinator over WebSocket. When I submit jobs from the CLI, the phone picks them up, processes them locally, signs a receipt, and sends the result back. You can see the job history updating and earnings ticking up in real-time.

**[1:30 - 2:00] LIVE TRANSACTIONS**

[SHOW: Phone with jobs flowing, then tap a completed job]

Let me show you what's actually happening onchain. Every completed job triggers two real transactions.

First, BOLT tokens. The coordinator batches completed jobs and sends BOLT via SPL token transfer on Solana devnet. You can see the transaction hash right here, and tap to open the Solana explorer.

[SHOW: Tap the Solana tx hash, explorer opens showing the SPL transfer]

Second, reputation. The coordinator posts ERC-8004 feedback to Monad testnet. Every job builds onchain reputation for the worker.

[SHOW: Tap the Monad tx hash, explorer opens showing giveFeedback call]

Two chains, two purposes. Solana for payments. Monad for identity and reputation. Both real, both verifiable.

**[2:00 - 2:30] MONAD INTEGRATION**

[SHOW: packages/erc8004/ code, the contract addresses]

On Monad, we use ERC-8004 for two things: identity and reputation.

Workers register as ERC-8004 agents and get an onchain identity NFT. After every completed job, the coordinator posts feedback to the Reputation Registry: a score, a skill tag, and a feedback hash.

[SHOW: the `claimWorker` function in coordinator that reads reputation scores]

The coordinator reads reputation scores when routing jobs. Higher reputation workers get priority. This creates a flywheel: do good work, build reputation, get better jobs.

And now you can see the Monad transaction right here in the app. Tap any completed job, and there's the transaction hash with a link to the block explorer. That's real onchain proof that this job was completed and scored.

The contracts are live on Monad testnet. Identity Registry at `0x8004A8...`, Reputation Registry at `0x8004B6...`.

**[2:30 - 2:50] CLOSE**

[SHOW: GitHub repo README]

That's Dispatch. A working dual-chain compute network with x402 payments, ERC-8004 reputation, and Solana mobile support.

12,000 lines of TypeScript, MIT licensed, built entirely by AI agents. The coordinator is live on Railway, the mobile app is running on a real Seeker phone, and the whole thing is on GitHub. The code is at docs.dispatch.computer and it's running on testnet right now.

---

## Recording Notes

### Pitch Video
- **Length target**: 2:30 - 2:50
- **Format**: talking head (webcam) + screen recording cut-ins
- **Background**: clean, dark, minimal
- **Screen recordings needed**:
  - dispatch.computer landing page (scroll through)
  - CLI demo (click "Run Command" button)
  - docs.dispatch.computer (quick flash)
  - GitHub repo page (quick flash)
- **Delivery**: conversational, not rehearsed-sounding. Like explaining to a smart friend.

### Technical Demo
- **Length target**: 2:30 - 2:50
- **Format**: screen recording only, voiceover narration
- **Screen recordings needed**:
  - VS Code with monorepo open (show file tree: packages/, apps/, mobile/)
  - CLI submitting a job: `dispatch agent run --type summarize --prompt "..." --policy fast`
  - Split-screen: CLI on left, Seeker phone on right (jobs flowing, earnings ticking)
  - Seeker phone cold start: open app, tap Get Started, watch it auto-connect and receive first job
  - Code highlights: receipt signing (ReceiptSigner.ts), coordinator matching (workerHub.ts), ERC-8004 reputation read
  - Job detail modal showing both Solana payment tx + Monad reputation tx with explorer links
- **Delivery**: clear, paced, like a conference talk. Pause when showing code.

### Key Messages to Hit
1. "One HTTP request in, one verified result out"
2. "Written entirely by AI agents" (Colosseum Agent Hackathon requirement)
3. "x402 payments + ERC-8004 reputation, two open standards, one compute marketplace"
4. "Working MVP, not a spec" (live coordinator on Railway, real phone)
5. "Dual-chain: each chain does what it's best at"
6. "Zero friction: open, tap, earn" (mobile demo)
7. "Every result has a cryptographic receipt" (ed25519 signed proof)

### What's Happening Under the Hood (reference for voiceover accuracy)
- **Phone connects** via WebSocket to production coordinator on Railway
- **Device key**: ed25519 keypair generated and stored locally on the phone
- **Registration**: phone sends `register` message with public key + capabilities (`TASK`)
- **Heartbeat**: phone pings coordinator every 10 seconds to stay alive
- **Job flow**: coordinator sends `job_assign` over WebSocket, phone processes locally, sends `job_complete` with signed receipt back
- **Task types**: summarize (text truncation + word count), classify (keyword sentiment analysis), extract_json (regex JSON extraction)
- **Receipt**: SHA-256 hash of output, signed with device's ed25519 private key. Coordinator can verify independently.
- **Desktop workers**: run real LLM inference via Ollama (heavier compute)
- **Mobile workers**: run lightweight task processing (designed for phone hardware)
- **Earnings**: 0.001 BOLT per completed task, settled as real SPL token transfers on Solana devnet (batched every 5 jobs or 60s)

---

## Presenter Notes: Onchain Proof

> Use these notes to speak accurately about what's real onchain during demos.

### What to Say (Technically Accurate)

- "Every completed job posts reputation feedback as a real Monad testnet transaction"
- "You can see the transaction hash right here in the app, and tap it to open the Monad block explorer"
- "The coordinator posts ERC-8004 feedback after every job, both demo and real jobs"
- "This creates a verifiable onchain history of every compute interaction"

### What's Real vs. Mock

| Feature | Status | Details |
|---------|--------|---------|
| BOLT token transfers | **REAL** | SPL token on Solana devnet, batched every 5 jobs or 60s |
| ERC-8004 reputation feedback | **REAL** | Every completed job posts a `giveFeedback` tx to Monad testnet |
| Transaction hashes in app | **REAL** | Both Solana + Monad tx hashes with explorer links |
| Block explorer links | **REAL** | Solana explorer (devnet) + Monad testnet explorer |
| ed25519 signed receipts | **REAL** | Every job result is signed with the worker's cryptographic key |
| Worker identity (device keys) | **REAL** | Phone generates and stores its own ed25519 keypair |
| WebSocket connection | **REAL** | Phone connects to production coordinator on Railway |
| x402 payment gating | **DESIGNED** | Code exists, activates when TESTNET_MODE is removed |
| BOLT staking tiers | **REAL** | Reads SPL token balance for tier matching |

### How to Show Onchain Proof in the Demo

1. Open the app on the Seeker, tap "Get Started"
2. Let 5+ jobs complete
3. Show earnings ticking up with "BOLT (devnet)" label
4. Tap a completed job in the history list, show:
   - Task prompt (what the phone actually computed)
   - Reputation Tx: tap to open Monad explorer
   - Payment Tx: tap to open Solana explorer
5. "These are real transactions. You can verify them independently."

### Explorer URLs

- **Monad Testnet Explorer:** `https://testnet.monadexplorer.com`
- **Transaction format:** `https://testnet.monadexplorer.com/tx/{hash}`
- **Coordinator account:** Check Railway logs for `[Monad Coordinator] ERC-8004 reputation: ENABLED (account: 0x...)`

### Key Talking Points for Judges

1. "This isn't a mockup. Every job posts a real transaction to Monad testnet."
2. "You can verify this independently. Open the explorer, paste the hash."
3. "The reputation score feeds back into job routing. Higher reputation workers get priority."
4. "We chose Monad for reputation because per-job feedback updates need fast, cheap finality."
5. "The dual-chain architecture means each chain does what it's best at: Solana for payments and mobile, Monad for identity and reputation."
