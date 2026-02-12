# Solana dApp Store Submission (Dispatch)

This doc records the exact commands, outputs, and gotchas for submitting the
Dispatch mobile worker app (`mobile/seeker-solana/`) to the Solana dApp Store.

## Summary

- App name: Dispatch
- Android package: `com.dispatch.seeker`
- Publisher keypair (local path): `~/dispatch-publisher.json`
- Publishing docs: `https://docs.solanamobile.com/dapp-publishing/intro`
- Discord review channel: `#dev-answers` in Solana Mobile Community
- Review contact email: `publishersupport@dappstore.solanamobile.com`
- Positioning: "Earn BOLT from idle compute" (service-first, not protocol-first)

## App Store Description Copy

Use this copy for all app store listings (Solana dApp Store, future Google Play/Apple App Store):

**Short description** (30 chars max): "Earn BOLT from idle compute"

**Long description:**
Dispatch turns your phone into a compute worker for AI agents. Process lightweight AI tasks (summarization, classification, data extraction) while your device is idle and earn BOLT tokens for every completed job.

How it works:
1. Open the app and connect your Solana wallet
2. Tap "Go Live" to join the network
3. Your phone picks up AI jobs automatically over WebSocket
4. Earn BOLT for every completed task

Features:
- Passive income from idle hardware (no interaction needed)
- No GPU required (runs on your phone's CPU)
- Build onchain reputation via ERC-8004 on Monad testnet
- Ed25519 signed receipts for every job
- Real-time earnings dashboard
- One-tap on/off toggle
- Works with any Solana wallet via Mobile Wallet Adapter

Currently live on Solana devnet and Monad testnet. BOLT token with staking tiers coming soon.

**Keywords:** DePIN, compute, AI, inference, passive income, Solana, Monad, idle hardware, BOLT

**Category:** DeFi / Infrastructure

## Mainnet Submission (Submitted Feb 10, 2026)

Initial mainnet submission (v1.1.0).

- App NFT (mainnet): `8S8ErMDFh9q18L9BVPQYsNM5vYczug3g6k4zfz5CfG3j`
- Release NFT (v1.1.0): `Au9YeSiiVgt1gG261AwHxHp95pWhe7KpGcD661M5kbhn`
- Git commit that recorded mainnet addresses in config: `6a9942c`

## Update Submission (Submitted Feb 12, 2026)

v1.2.0 update with copy quality audit: wallet-generic language, accurate dual-chain
terminology, fresh screenshots, updated About section.

- Release NFT (v1.2.0): `7dN3wn6CEvXjNfDAZCjjcTTFMkWN75dui3w84mmKg69p`
- [Explorer link](https://explorer.solana.com/address/7dN3wn6CEvXjNfDAZCjjcTTFMkWN75dui3w84mmKg69p?cluster=mainnet)
- APK built via EAS cloud (preview profile)
- Screenshots: 1080x2424 from emulator (dashboard earning, dashboard offline, onboarding, settings)
- Review ETA: 1-2 business days

## Commands (Mainnet)

Run from `mobile/seeker-solana/publishing/` (the CLI expects this).

### 0) Pre-check: wallet has SOL

```bash
solana balance ~/dispatch-publisher.json --url https://api.mainnet-beta.solana.com
```

### 1) Clear devnet state (before mainnet)

Edit `mobile/seeker-solana/publishing/config.yaml`:

- Set `app.address: ''`
- Set `release.address: ''`
- Delete any `lastSubmittedVersionOnChain` block if present

Delete cached asset manifest(s):

```bash
rm -f .asset-manifest-devnet.json
```

Note: the CLI will create/update `.asset-manifest.json` during uploads.

### 2) Mint app NFT (mainnet)

```bash
npx @solana-mobile/dapp-store-cli create app \
  -k ~/dispatch-publisher.json \
  -u https://api.mainnet-beta.solana.com
```

### 3) Mint release NFT (mainnet)

This uploads the APK + media to Arweave and can take a few minutes.

```bash
npx @solana-mobile/dapp-store-cli create release \
  -k ~/dispatch-publisher.json \
  -u https://api.mainnet-beta.solana.com
```

### 4) Submit for review (mainnet)

```bash
npx @solana-mobile/dapp-store-cli publish submit \
  -k ~/dispatch-publisher.json \
  -u https://api.mainnet-beta.solana.com \
  --complies-with-solana-dapp-store-policies \
  --requestor-is-authorized
```

If `publish submit` fails immediately with a message like "Release NFT fetch failed",
wait ~30 seconds and retry. This can happen due to RPC/indexing propagation.

## Gotchas

- The CLI expects to be run from `mobile/seeker-solana/publishing/`.
- `ANDROID_TOOLS_DIR` must be set (see `mobile/seeker-solana/publishing/.env`).
- `catalog` must be nested under `release` (not top-level).
- `short_description` has a strict max length (30 chars).
- `publish submit` requires `mainnet-beta` even if devnet works end-to-end.

## Review Follow-up Process

After successful submission:

- Expected response window: 3-5 business days by email.
- If no response after 5 business days, post an "App Review Inquiry" in the
  Solana Mobile Community `#dev-answers` channel.
- For publishing portal issues, post in `#dev-answers` with:
  - app package (`com.dispatch.seeker`)
  - app NFT + release NFT addresses
  - exact CLI command and error output
