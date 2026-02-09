"use client";

import { motion } from "framer-motion";

const differentiators = [
  {
    title: "No custom token",
    dispatch: "Workers get paid in USDC via x402. No token to buy, stake, or bridge.",
    others: "Require buying a native token to participate. Staking, slashing, withdrawal delays.",
    tag: "x402 / USDC",
  },
  {
    title: "On-chain reputation",
    dispatch: "Workers build ERC-8004 reputation on Monad. Every job adds verifiable feedback. Agents pick workers by track record.",
    others: "No on-chain identity or reputation. Workers are anonymous and interchangeable.",
    tag: "ERC-8004",
  },
  {
    title: "Idle hardware as supply",
    dispatch: "Phones and desktops earn USDC while idle. The network scales with devices people already own — no GPU required.",
    others: "GPU-only networks that require datacenter hardware. High barrier to entry.",
    tag: "Idle devices",
  },
  {
    title: "Dual-chain from day one",
    dispatch: "Monad (EVM) and Solana run as parallel coordinators with separate databases and settlement rails.",
    others: "Single-chain lock-in. Cross-chain support bolted on later, if at all.",
    tag: "Monad + Solana",
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
            Different decisions from the ground up.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
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
                    <span className="font-medium text-text">Dispatch: </span>
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
