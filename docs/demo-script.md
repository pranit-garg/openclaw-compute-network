# Dispatch: Hackathon Demo Script

## Intro (30s)

**What is Dispatch?** The dispatch layer where AI agents buy compute from idle hardware. Agents submit jobs over HTTP, pay in USDC via x402, and workers build onchain reputation through ERC-8004 on Monad. Live on Monad and Solana testnet.

**The problem:** AI inference is centralized, expensive, and opaque. You pay OpenAI and trust they ran your model. Dispatch makes compute verifiable, permissionless, and multi-chain, with AI agents as first-class customers.

---

## Demo Flow

### Step 1: Coordinator Dashboard (15s)

Open `http://localhost:4400/dashboard` in browser.

**Show:**
- Worker count (registered + online)
- Jobs completed so far
- Receipt verification rate (100% = every result is cryptographically signed)

**Say:** "This is the coordinator. It matches jobs to workers and verifies receipts. Think of it as a dispatch layer between agents and idle hardware."

---

### Step 2: Mobile App, Wallet Connection (20s)

Open the Dispatch app on the Android device.

**Show:**
- Tap "Connect Wallet". Solana wallet opens, approve connection
- Wallet address appears in the app
- Toggle between "Wallet Signing" and "Device Key" modes

**Say:** "Workers authenticate with their Solana wallet. The app supports any Solana wallet via Mobile Wallet Adapter, or a local device key for background operation."

---

### Step 3: Start Mobile Worker (10s)

Tap "Start Worker" in the app.

**Show:**
- Status changes to "Online, waiting for jobs"
- Dashboard updates to show +1 worker online

**Say:** "This phone is now a dispatch node on the network. It registered its capabilities and public key over WebSocket. While idle, it picks up AI jobs and earns USDC."

---

### Step 4: Submit a Compute Job (15s)

Run the dispatch-demo CLI:

```bash
pnpm --filter dispatch-demo start -- --chain solana
```

**Show:**
- Job submission output: job ID, policy tier, privacy class
- Polling for result...

**Say:** "An AI agent is submitting an inference job with an x402 payment header. The coordinator dispatches it to the best available worker, in this case, our phone."

---

### Step 5: Watch the Job Complete (15s)

**Show (split screen if possible):**
- Mobile app: "Processing job..." indicator
- CLI: Result appears with latency timing

**Say:** "The worker ran the inference, signed an ed25519 receipt over the output hash, and returned the result. End to end in under 2 seconds."

---

### Step 6: Receipt Verification (15s)

**Show in CLI output:**
- Receipt hash (output_hash)
- Worker public key
- Signature verification: `VERIFIED (ed25519)`

**Show on dashboard:**
- Receipt verification rate updated
- Job appears in recent jobs table as "completed"

**Say:** "Every result comes with a cryptographic receipt. The worker signs a hash of the output with their ed25519 key. The coordinator verifies this signature independently. This is verifiable compute."

---

### Step 7: Check Worker Reputation on Monad (15s)

**Show:**
- Worker's ERC-8004 agent registration on Monad explorer
- Reputation score from completed jobs
- Feedback record posted onchain

**Say:** "Workers register as ERC-8004 agents on Monad. Every completed job posts feedback to the reputation contract. Agents can discover trusted workers through the onchain registry. The more jobs you complete, the more visible and trusted you become."

---

### Step 8: (Optional) Onchain Receipt

If Solana anchoring is enabled, show the transaction on Solana Explorer.

**Say:** "Receipts can be anchored onchain for permanent, tamper-proof audit trails. This transaction proves this specific worker produced this specific output at this specific time."

---

## Technical Highlights to Mention

- **Agent-native:** AI agents submit jobs over plain HTTP with x402 payment headers. No SDK required, no wallet setup. Just HTTP and USDC.
- **Multi-chain:** Same coordinator protocol works on Monad (EVM) and Solana (SVM). Workers register on either chain.
- **x402 payments:** Jobs are paid via the x402 HTTP payment protocol. The fee is embedded in the HTTP request itself. No token approvals, no separate payment step.
- **ERC-8004 reputation:** Workers register as agents on Monad with verifiable onchain reputation. Every job builds track record.
- **Idle hardware:** The Dispatch app runs on Solana Mobile Stack. Any Android phone becomes a compute node while idle, earning USDC for processing AI tasks.
- **Atomic matching:** The coordinator uses a synchronous claim-and-assign pattern. No race conditions, no double-booking workers.

---

## Q&A Prep

**"How is this different from Akash/Render?"**
Those are GPU rental marketplaces. Dispatch is an agent-to-compute dispatch layer. It's task-level, not VM-level. An AI agent submits a prompt, gets a result with a receipt. No containers, no SSH. Workers are idle devices, not datacenters.

**"How do you prevent workers from returning garbage?"**
Receipts and reputation. The worker signs a hash of the output. If the output doesn't match the hash, the receipt is invalid. ERC-8004 reputation means bad workers lose track record. Future: stake slashing for invalid receipts.

**"Why ERC-8004?"**
It gives workers a portable, onchain identity. Agents can query the reputation registry to find trusted workers before submitting jobs. It's the trust layer that makes a permissionless compute network practical.

**"What's the business model?"**
The coordinator takes a fee on each job via x402. Workers set their own prices. Market-driven pricing with onchain reputation as the quality signal.

**"Is this mainnet-ready?"**
This is a testnet MVP. The protocol design is production-grade, but we're on devnet/testnet. Next steps: mainnet deployment, multi-coordinator federation, GPU worker support.
