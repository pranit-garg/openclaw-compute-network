"use client";

import { motion } from "framer-motion";

const solanaBullets = [
  "$BOLT token economy",
  "Worker staking & priority matching",
  "USDC payments via x402",
  "Solana Seeker mobile support",
  "Jupiter DEX integration",
];

const monadBullets = [
  "ERC-8004 reputation registries",
  "wBOLT (ERC-20) distribution",
  "Per-job onchain feedback",
  "Fast finality for reputation updates",
];

export function DualChain() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32" id="dual-chain">
      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">Two chains. One protocol.</h2>
          <p className="mx-auto mt-4 max-w-xl text-text-muted">
            Each chain does what it&apos;s best at.
          </p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 items-stretch">
          {/* Solana Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="card-hover flex-1 rounded-2xl border border-border bg-bg-card/50 p-6 md:p-8 hover:border-green/40"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green">
                <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
                  <defs>
                    <linearGradient id="sol-grad-dc" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#9945FF"/>
                      <stop offset="1" stopColor="#14F195"/>
                    </linearGradient>
                  </defs>
                  <path d="M6 22l3-3h17l-3 3H6z" fill="url(#sol-grad-dc)"/>
                  <path d="M6 13l3 3h17l-3-3H6z" fill="url(#sol-grad-dc)"/>
                  <path d="M6 10l3-3h17l-3 3H6z" fill="url(#sol-grad-dc)"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green">Economic Layer</h3>
            </div>
            <ul className="space-y-3">
              {solanaBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-text-muted">
                  <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green" />
                  {bullet}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Animated bridge, visible on md+ between cards */}
          <div className="hidden md:flex flex-col items-center justify-center gap-1 px-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                className="h-px w-8 bg-accent"
              />
            ))}
          </div>

          {/* Animated bridge, visible on mobile between cards */}
          <div className="flex md:hidden items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                className="h-px w-6 bg-accent"
              />
            ))}
          </div>

          {/* Monad Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="card-hover flex-1 rounded-2xl border border-border bg-bg-card/50 p-6 md:p-8 hover:border-accent/40"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                  <path d="M12 3C9.40096 3 3 9.40082 3 12C3 14.5991 9.40096 21 12 21C14.5989 21 21 14.599 21 12C21 9.40093 14.599 3 12 3ZM10.5975 17.1464C9.5015 16.8478 6.55489 11.6934 6.85359 10.5974C7.15229 9.50142 12.3065 6.55489 13.4025 6.85357C14.4985 7.15223 17.4451 12.3065 17.1464 13.4025C16.8477 14.4985 11.6934 17.4451 10.5975 17.1464Z" fill="#6E54FF"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-accent">Trust Layer</h3>
            </div>
            <ul className="space-y-3">
              {monadBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-text-muted">
                  <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                  {bullet}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
