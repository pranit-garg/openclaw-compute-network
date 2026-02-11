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

## Mainnet Submission (Submitted Feb 10, 2026)

Mainnet NFTs minted and submission completed.

- App NFT (mainnet): `8S8ErMDFh9q18L9BVPQYsNM5vYczug3g6k4zfz5CfG3j`
- Release NFT (mainnet): `Au9YeSiiVgt1gG261AwHxHp95pWhe7KpGcD661M5kbhn`
- Git commit that recorded mainnet addresses in config: `6a9942c`

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
