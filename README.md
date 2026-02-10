# Dispatch Compute Network

Decentralized compute network where **Seekers** (mobile/simulated) and **Desktop Workers** handle TASK and LLM jobs. Two blockchain tracks: **Monad testnet** (EVM) and **Solana devnet** for x402 payment gating.

**Landing page:** [dispatch.computer](https://dispatch.computer) | **API Docs:** [docs.dispatch.computer](https://docs.dispatch.computer)

## Architecture

```
CloudBot CLI → ComputeRouter SDK → Coordinator (x402-gated) → Worker (WS)
                    ↓ fallback                                      ↓
              Hosted BYOK (OpenAI/Anthropic)              Receipt (ed25519)
```

**Data flow:** Quote (free) → Commit with x402 payment → Coordinator matches worker → Worker executes → Job stored in SQLite → Client polls result + receipt

## Quick Start

```bash
pnpm install
pnpm build
```

### Run Monad E2E

```bash
# Terminal 1: Start Monad coordinator
pnpm dev:monad

# Terminal 2: Start desktop worker
COORDINATOR_URL=http://localhost:4010 pnpm worker:desktop

# Terminal 3: Start seeker simulator
COORDINATOR_URL=http://localhost:4010 pnpm worker:seeker

# Terminal 4: Run demo
pnpm demo:monad
```

### Run Solana E2E

```bash
# Terminal 1: Start Solana coordinator
pnpm dev:solana

# Terminal 2: Start worker (connect to Solana)
COORDINATOR_URL=http://localhost:4020 pnpm worker:desktop

# Terminal 3: Run demo
pnpm demo:solana
```

### Automated E2E

```bash
pnpm e2e
```

Spawns both coordinators + workers, runs demo scenarios, cleans up.

## Tests

```bash
pnpm test
```

## Project Structure

```
packages/
  protocol/        — Shared types, enums, WS message definitions, pricing
  compute-router/  — Client SDK (decentralized + hosted adapters)
apps/
  coordinator-core/   — Express server, SQLite DB, WorkerHub (WS), routes
  coordinator-monad/  — Monad-specific x402 configuration (port 4010)
  coordinator-solana/ — Solana-specific x402 configuration (port 4020)
  worker-desktop/     — Desktop worker (LLM + TASK execution)
  seeker-simulator/   — Mobile seeker simulator (TASK only)
  cloudbot-demo/      — CLI demo running 3 scenarios
  landing/            — Next.js landing page (Vercel)
chain/
  monad/contracts/    — Solidity receipt anchor (STUB)
  solana/receipt-anchor/ — Anchor program receipt anchor (STUB)
mobile/
  seeker-worker-android/ — Android seeker app skeleton (Kotlin)
```

## x402 Payment Configuration

x402 payment gating is **disabled by default** (testnet mode). The coordinators run without payment middleware, accepting all job submissions directly.

To enable x402:
1. Install x402 packages: `pnpm add @x402/express @x402/evm @x402/core` (in coordinator-monad)
2. Uncomment the x402 setup in `apps/coordinator-monad/src/index.ts`
3. Set env vars: `MONAD_PAY_TO`, `MONAD_FACILITATOR`, `MONAD_USDC`
4. Testnet tokens: Use Monad testnet faucet for test USDC

## Trust Pairing

Private jobs require trusted workers. Flow:
1. Create pairing code: `POST /v1/trust/create { user_id: "..." }` → `{ pairing_code: "ABC123" }`
2. Worker claims code: Set `TRUST_PAIRING_CODE=ABC123` env var on worker startup
3. Submit PRIVATE job: Include `privacy_class: "PRIVATE"` in job payload
4. Only paired workers can execute PRIVATE jobs

## Known Limitations (MVP)

- Payment not refunded if no worker available
- No streaming (polling only — 500ms interval)
- Fixed pricing (no dynamic per-job pricing)
- On-chain receipt anchoring contracts are stubs (not wired into coordinator)
- Android seeker uses stub ed25519 signing
- x402 client-side payment signing not implemented (testnet mode bypasses)
