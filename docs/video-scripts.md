# Dispatch Video Scripts

## 1. Pitch Video (2:40 target, max 3:00, talking head + screen recordings)

> This video also embeds in the landing page FounderVideo section.
> Record as: talking head (webcam) with screen recording cut-ins at [SHOW] cues.
> Tone: calm, confident, direct. Not salesy. You're explaining something real to a smart friend.

---

### SCRIPT

**[0:00 - 0:20] HOOK**

[SHOW: Talking head, clean dark background]

Hey, I'm Pranit. I built Dispatch: a compute network where AI agents pay for inference and idle devices earn for processing it.

And here's the thing. I can't write a single line of code. This entire project was built by AI agents. Which feels right, for a network built to serve them.

**[0:20 - 0:50] BACKGROUND**

[SHOW: Deck slide with timeline]

Quick background. I ran a marketing agency called Optimotive, which was acquired in 2022. After that I was CMO at Irys, a programmable data chain, and then at Fermah, a ZK proof marketplace. Both early-stage crypto companies. I went through the a16z CSX accelerator in New York, Fall 2024.

The Fermah experience is actually what led to Dispatch. Fermah matches supply and demand for ZK proofs. Dispatch does the same thing, but for AI compute. Same marketplace structure, different resource.

**[0:50 - 1:15] PROBLEM**

[SHOW: Deck slide with problem cards]

So here's the core problem. AI agents are becoming autonomous economic actors, but they can't buy compute on their own.

Look at the options today. Centralized APIs are expensive and require API keys. GPU leases are manual, billed by the hour, and need human setup. Serverless platforms are still centralized and locked behind accounts.

None of these work for agents. Agents don't manage accounts or sign contracts. They just make HTTP requests.

This is built for autonomous AI agents that need cheap compute, and for device owners who want passive income from idle hardware.

**[1:15 - 1:55] SOLUTION**

[SHOW: dispatch.computer landing page, scroll through]

Dispatch sits between agents and compute. The payment layer uses x402, an open protocol created by Coinbase for HTTP-native micropayments. An agent sends a standard HTTP POST with a payment header. One HTTP request in, one verified result out.

We run a dual-chain architecture. Solana is the economic layer: BOLT token payments, Solana Mobile Wallet Adapter for the Seeker phone, and all transaction settlement. Monad is the trust layer: ERC-8004 for onchain worker identity and reputation scoring. Each chain does what it's best at.

[SHOW: Seeker phone, open the app, tap once, jobs start flowing]

On mobile, it's zero friction. Open the app, tap once, your phone starts picking up jobs and earning BOLT per task. No wallet setup, no configuration.

**[1:55 - 2:30] TRACTION + VISION**

[SHOW: GitHub repo, docs site, quick flash]

This is a working MVP, not a spec. 64,000+ lines of TypeScript, all built by AI agents. We're dApp Store approved, with real Seeker users running jobs on their phones. The coordinator is live, the mobile app is running on a real Seeker phone, and it's approved on the Solana dApp Store.

[SHOW: Back to talking head]

For go-to-market, we start with the Seeker fleet. Thousands of phones that can start earning compute income with a single tap. Then we expand to desktops and dedicated hardware.

The bigger picture: Render and io.net were the previous generation. They built GPU marketplaces for humans. Dispatch reimagines this for AI agents, where the buyers and sellers are both machines, and every transaction is programmatic.

I won't go into the technical details here. That's a separate video.

**[2:30 - 2:40] CLOSE**

[SHOW: Closing deck slide with dispatch.computer]

Dispatch. Cheap compute for agents. Passive income for workers. Every result verified.

One HTTP request in, one verified result out. Check it out at dispatch.computer. Thanks.

---

## 2. Technical Demo (2:10 target, max 3:00, deck slides + voiceover)

> Record as: technical deck slides with voiceover narration.
> The deck (`docs/tech-deck.html`) is the ONLY visual. Advance slides at each `[SLIDE X]` cue.
> Tone: technical but accessible. Walk through each slide's content clearly.
> No webcam, no screen recording. Just the deck and your voice.

---

### SCRIPT

**[0:00-0:15] TITLE**

[SLIDE 0: Title]

This is a technical walkthrough of Dispatch, a compute protocol where AI agents buy inference from idle hardware. Agents can't create accounts or manage API keys. They make HTTP requests. So we built a compute marketplace where one HTTP request with payment is all it takes. 64,000 lines of TypeScript, every line written by AI agents.

**[0:15-0:30] SYSTEM OVERVIEW**

[SLIDE 1: System Overview]

Here's the full flow. An agent sends a standard HTTP POST with an x402 payment header. The coordinator validates the payment and routes the job to the best available worker. The worker executes the task, signs an ed25519 receipt over the result, and the coordinator anchors settlement onchain. One request in, one verified result out.

**[0:30-0:50] DUAL-CHAIN**

[SLIDE 2: Dual-Chain]

We chose two chains, each for a specific reason. Solana for the economic layer: sub-second finality for per-job micropayments, native mobile wallet support on Seeker, and the SPL token standard for BOLT. Monad for the trust layer: fast, cheap finality makes per-job reputation updates practical, and EVM compatibility means the ERC-8004 identity standard deploys natively. Each chain does what it's best at.

**[0:50-1:10] SOLANA DEEP DIVE**

[SLIDE 3: Solana Components]

Six Solana components. BOLT is an SPL token, one billion supply, nine decimals. The coordinator runs Express and WebSocket for real-time task routing and settlement. Workers register onchain with stake tracking. Staking tiers control job access and priority matching. Every execution result gets an Ed25519 signed receipt. And we're approved on the Solana dApp Store, with a release NFT stored on Arweave.

**[1:10-1:25] WORKERS**

[SLIDE 4: Worker Architecture]

Two worker types. Mobile workers run React Native on Seeker phones: lightweight task processing, background execution, battery-aware scheduling. Desktop workers run Node.js with Ollama for real LLM inference, heavier compute, persistent connections.

**[1:25-1:40] PAYMENT FLOW**

[SLIDE 5: x402 Payment Flow]

Six steps, one HTTP request. The agent sends a request with an x402 payment header. The coordinator validates the payment and extracts the task. The task is routed to the optimal worker based on policy. The worker executes and generates a signed receipt. The coordinator verifies the receipt and anchors it onchain. The result is returned to the agent with cryptographic proof. No API key, no account, no SDK. The agent just makes a standard HTTP POST.

**[1:40-1:55] VERIFICATION**

[SLIDE 6: Trust Without Intermediaries]

Three layers of trust without intermediaries. Ed25519 signatures on every result, so agents can verify independently without trusting the coordinator. ERC-8004 onchain identity and reputation on Monad, where workers build verifiable track records. And receipt anchoring to Solana or Monad for permanent, auditable, immutable proof.

**[1:55-2:00] ROUTING**

[SLIDE 7: Smart Task Routing]

Three routing policies. FAST minimizes latency, routing to the nearest available worker for real-time agent decisions. CHEAP routes to the lowest-cost worker, batching when possible for background processing. PRIVATE routes to TEE-enabled workers with encrypted execution for sensitive data.

**[2:00-2:15] TOKENOMICS**

[SLIDE 8: BOLT Token]

BOLT token: one billion supply, across two chains, three staking tiers. The revenue model is a five percent protocol fee on every job. That five percent is burned permanently, making BOLT strictly deflationary. Every job also triggers a USDC-to-BOLT swap on Jupiter, creating constant buy pressure. Workers stake BOLT for priority matching and reputation multipliers. Open tier is free, CHEAP jobs only. Verified at 100 BOLT unlocks all job tiers with a 1.5x reputation boost. Sentinel at 1,000 BOLT gets maximum priority, 2x reputation, and revenue share.

**[2:15-2:25] CLOSE**

[SLIDE 9: Close]

That's Dispatch. 64,000 lines of TypeScript, built entirely by AI agents. Working MVP on Solana devnet and Monad testnet. Approved on the Solana dApp Store. One HTTP request in, one verified result out. dispatch.computer.

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
- **Length target**: 2:25 - 2:35
- **Format**: deck slides (`docs/tech-deck.html`) with voiceover narration
- **Visual**: the deck is the ONLY visual. No screen recordings, no VS Code, no phone demos.
- **Slides to advance**: 0 (Title) through 9 (Close), one advance per `[SLIDE X]` cue in the script
- **Delivery**: clear, paced, like a conference talk. Let each slide breathe before narrating.

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
- **Earnings**: 0.001 BOLT per completed task, settled as real SPL token transfers on Solana devnet (settled per job)

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
| BOLT token transfers | **REAL** | SPL token on Solana devnet, settled per job |
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

- **Monad Testnet Explorer:** `https://testnet.monadvision.com`
- **Transaction format:** `https://testnet.monadvision.com/tx/{hash}`
- **Coordinator account:** Check Railway logs for `[Monad Coordinator] ERC-8004 reputation: ENABLED (account: 0x...)`

### Key Talking Points for Judges

1. "This isn't a mockup. Every job posts a real transaction to Monad testnet."
2. "You can verify this independently. Open the explorer, paste the hash."
3. "The reputation score feeds back into job routing. Higher reputation workers get priority."
4. "We chose Monad for reputation because per-job feedback updates need fast, cheap finality."
5. "The dual-chain architecture means each chain does what it's best at: Solana for payments and mobile, Monad for identity and reputation."
