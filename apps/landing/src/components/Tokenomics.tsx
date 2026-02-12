"use client";

import { motion } from "framer-motion";

const tiers = [
  {
    name: "Open",
    stake: "0 $BOLT",
    benefits: "CHEAP tier jobs, standard matching",
    color: "text-text-muted",
  },
  {
    name: "Verified",
    stake: "100 $BOLT",
    benefits: "All tiers, +5 priority, 1.5x rep multiplier",
    color: "text-accent-bright",
  },
  {
    name: "Sentinel",
    stake: "1,000 $BOLT",
    benefits: "Priority matching, +10 bonus, 2x rep, revenue share (planned)",
    color: "text-accent",
  },
];

const flywheelSteps = [
  "More jobs",
  "USDC → $BOLT",
  "Buy pressure",
  "Workers stake",
  "Supply locks",
  "5% protocol fee",
];

function AnimatedChevron({ delay }: { delay: number }) {
  return (
    <motion.div
      className="hidden shrink-0 md:flex items-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <motion.svg
        className="h-5 w-5 text-accent/60"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </motion.svg>
    </motion.div>
  );
}

function MobileChevron({ delay }: { delay: number }) {
  return (
    <motion.div
      className="flex shrink-0 items-center justify-center md:hidden py-1"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <motion.svg
        className="h-4 w-4 text-accent/50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </motion.svg>
    </motion.div>
  );
}

export function Tokenomics() {
  return (
    <section
      className="relative overflow-hidden section-divider px-6 py-20 md:py-28"
      id="bolt"
    >
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          {/* Live badge */}
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Live on Testnet
          </span>
          <h2 className="text-3xl font-bold md:text-4xl">
            BOLT on Solana. wBOLT on Monad. Earn on both chains.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted">
            Workers earn BOLT (SPL) on Solana devnet and wBOLT (ERC-20) on
            Monad testnet. Every job creates buy pressure and supply lock.
            No token required to participate.
          </p>
        </motion.div>

        {/* Current Status callout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-2xl rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center"
        >
          <p className="text-sm font-semibold text-emerald-400">
            Current Status
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Workers earn BOLT on Solana devnet and wBOLT on Monad testnet.
            Agents pay USDC via x402. Jupiter auto-swap activates when
            BOLT/USDC pool is created. No token required to participate.
          </p>
        </motion.div>

        {/* Value Accrual Flywheel — horizontal connected flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="mb-8 flex items-center justify-center gap-3">
            <h3 className="text-lg font-semibold">Value Accrual Flywheel</h3>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              Testnet
            </span>
          </div>

          {/* Desktop: horizontal strip */}
          <div className="hidden md:flex items-center justify-center gap-2">
            {flywheelSteps.map((step, i) => (
              <div key={step} className="contents">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3 hover:border-accent/30 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {step}
                  </span>
                </motion.div>
                {i < flywheelSteps.length - 1 && (
                  <AnimatedChevron delay={i * 0.1} />
                )}
              </div>
            ))}
            {/* Loop-back indicator */}
            <motion.div
              className="flex shrink-0 items-center gap-1.5 pl-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              <motion.svg
                className="h-5 w-5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                animate={{ rotate: [0, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </motion.svg>
              <span className="text-xs font-medium text-accent/70">
                Repeats
              </span>
            </motion.div>
          </div>

          {/* Mobile: vertical compact list */}
          <div className="flex flex-col items-center md:hidden">
            {flywheelSteps.map((step, i) => (
              <div key={step} className="contents">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex w-full max-w-xs items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium">{step}</span>
                </motion.div>
                {i < flywheelSteps.length - 1 && (
                  <MobileChevron delay={i * 0.08} />
                )}
              </div>
            ))}
            {/* Loop-back indicator mobile */}
            <motion.div
              className="mt-3 flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <motion.svg
                className="h-4 w-4 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                animate={{ rotate: [0, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </motion.svg>
              <span className="text-xs font-medium text-accent/70">
                Repeats
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Staking Tiers — solid border, no redundant callout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl rounded-2xl border border-border bg-bg-card/30 p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <h3 className="text-lg font-semibold">Staking Tiers</h3>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              Planned
            </span>
          </div>
          <p className="mb-6 text-sm text-text-muted">
            Staking is optional. Anyone can earn with zero stake. Higher tiers
            unlock priority matching and reputation multipliers.
          </p>
          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover rounded-xl border border-border bg-bg-card p-4 hover:border-accent/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold ${tier.color}`}>
                    {tier.name}
                  </span>
                  <span className="font-mono text-sm text-text-dim">
                    {tier.stake}
                  </span>
                </div>
                <p className="text-sm text-text-muted">{tier.benefits}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
