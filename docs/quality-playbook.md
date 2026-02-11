# Dispatch Quality Playbook

This is the canonical pre-release checklist to improve quality without changing
core behavior.

## 1) Local regression gates

Run from repo root:

```bash
pnpm quality:check
```

This runs:

- TypeScript build (`pnpm build`)
- Unit tests (`pnpm test`)
- Landing production build (`pnpm -C apps/landing build`)
- Docs production build (`pnpm -C apps/docs build`)

Run network link correctness checks separately:

```bash
pnpm quality:links
```

## 2) Public surface checks

Validate live URLs and key behavior:

```bash
pnpm quality:public
```

Checks include:

- Landing and docs pages are reachable and contain expected content markers
- Docs search API responds with a valid result payload
- Litepaper raw PDF URL is downloadable
- Solana dApp Store publishing docs URL resolves to the expected page

## 3) dApp Store status copy

Keep all outward-facing copy consistent:

- Landing Seeker section: "Submitted to Solana dApp Store. Pending review."
- Canonical dApp Store docs link:
  `https://docs.solanamobile.com/dapp-publishing/intro`

## 4) Litepaper link policy

Use raw PDF links for outward-facing pages to avoid GitHub blob preview issues:

- Preferred:
  `https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf`
- Avoid as primary UX:
  `.../blob/main/docs/Dispatch_Litepaper.pdf`

## 5) Production verification (after deploy)

After deploying `apps/landing` and `apps/docs`, run:

```bash
pnpm quality:public
pnpm quality:links
```

If either fails, treat deployment as incomplete and fix before sharing.
