"use client";

import { motion } from "framer-motion";

const differentiators = [
  {
    title: "HTTP-native payments",
    dispatch: "x402 turns HTTP 402 into real money. Agents pay in the request header, workers receive USDC instantly. No token to buy, stake, or bridge.",
    others: "Require buying a native token to participate. Staking, slashing, withdrawal delays before you see a cent.",
    tag: "x402 / USDC",
  },
  {
    title: "Portable onchain reputation",
    dispatch: "Workers build ERC-8004 reputation that follows them across apps. Agents verify track record trustlessly — no platform lock-in.",
    others: "No onchain identity. Workers are anonymous, interchangeable, and start from zero on every platform.",
    tag: "ERC-8004",
  },
  {
    title: "100x lower barrier to entry",
    dispatch: "Any phone or laptop earns USDC while idle. ~$0.001 per task on CHEAP tier, $0.010 per LLM job on FAST. No GPU, no datacenter.",
    others: "GPU-only networks need $10k+ hardware. High barrier locks out 99% of potential workers.",
    tag: "Idle devices",
  },
  {
    title: "Dual-chain architecture",
    dispatch: "Monad (EVM) and Solana run as separate coordinators with independent databases, settlement, and worker pools. True redundancy.",
    others: "Single-chain lock-in. Cross-chain support bolted on as an afterthought, if at all.",
    tag: "Monad + Solana",
  },
  {
    title: "Cryptographic receipts",
    dispatch: "Every result includes an ed25519 signature over the output hash. Verifiable, auditable proof of who computed what and when.",
    others: "Trust the platform. No cryptographic proof tying a specific worker to a specific result.",
    tag: "ed25519",
  },
  {
    title: "Fully open source",
    dispatch: "Coordinator, worker SDK, Seeker mobile app — all open source. Fork it, audit it, deploy your own network.",
    others: "Closed-source infrastructure. Vendor lock-in by design. Can't verify what's running.",
    tag: "MIT license",
  },
];

export function WhyDispatch() {
  return (
    <section className="px-6 py-20 md:py-28" id="why">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">
            Why Dispatch?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-muted">
            Every architectural decision is a competitive advantage.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-bg-card p-6 transition-colors hover:border-border-bright hover:bg-bg-card-hover"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-dim">
                  {item.tag}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green/10">
                    <svg className="h-3 w-3 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed text-text-muted">
                    <span className="font-medium text-accent-bright">Dispatch: </span>
                    {item.dispatch}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                    <svg className="h-3 w-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed text-text-dim">
                    <span className="font-medium text-text-muted">Others: </span>
                    {item.others}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
