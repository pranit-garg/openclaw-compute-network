"use client";

import { motion } from "framer-motion";

/* ─────────────── Card Data ─────────────── */

const agentCards = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Per-job pricing, no contracts",
    description:
      "Pay for exactly the compute you use. Start at $0.001 per task. No GPU leases, no minimum commitments.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "One HTTP request, verified result",
    description:
      "Submit a job, get an Ed25519 signed receipt. Cryptographic proof of who computed what, when.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Three routing policies",
    description:
      "FAST for speed, CHEAP for cost, PRIVATE for sensitive data. The coordinator matches the right worker automatically.",
  },
];

const workerCards = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: "Earn from any device",
    description:
      "Phones, laptops, desktops. Desktop workers run Node.js + Ollama, mobile workers use the Seeker app. No GPU required.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: "Build onchain reputation",
    description:
      "Every completed job builds your ERC-8004 score on Monad. Higher reputation unlocks priority matching and better-paying jobs.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    title: "Zero barrier to entry",
    description:
      "Download the Seeker app or install the CLI. Connect in minutes, earn BOLT per completed job. Trust pairing available for private workloads.",
  },
];

const liveItems = [
  "LLM inference",
  "Summarization",
  "Classification",
  "Data extraction",
  "Desktop + mobile workers",
  "SDK + CLI",
  "Trust pairing",
];

/* ─────────────── Main Section ─────────────── */

export function WhyDispatch() {
  return (
    <section
      className="relative overflow-hidden section-divider px-6 py-20 md:py-28"
      id="why"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[500px] w-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(ellipse, #d4a246, transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">Why Dispatch?</h2>
          <p className="mx-auto mt-4 max-w-xl text-text-muted">
            A compute service with clear benefits for both sides.
          </p>
        </motion.div>

        {/* ── For AI Agents ── */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex items-center gap-3"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/30" />
            <h3 className="text-lg font-semibold text-accent">For AI Agents</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/30" />
          </motion.div>

          {/* Featured first card + 2-col for remaining — breaks the generic 3-col pattern */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card-hover rounded-xl border border-accent/30 bg-gradient-to-br from-accent/[0.08] to-transparent p-8 md:flex md:items-start md:gap-6 hover:border-accent/50"
            >
              <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent md:mb-0">
                {agentCards[0].icon}
              </div>
              <div>
                <h4 className="text-lg font-semibold">{agentCards[0].title}</h4>
                <p className="mt-2 text-text-muted leading-relaxed">
                  {agentCards[0].description}
                </p>
              </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {agentCards.slice(1).map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i + 1) * 0.1 }}
                  className="card-hover rounded-xl border border-accent/20 bg-bg-card/40 p-6 hover:border-accent/40"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                    {card.icon}
                  </div>
                  <h4 className="text-base font-semibold">{card.title}</h4>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── For Workers ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex items-center gap-3"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-green/30" />
            <h3 className="text-lg font-semibold text-green">For Workers</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-green/30" />
          </motion.div>

          {/* Workers: 2-col left + tall right — visual contrast with agents section */}
          <div className="grid gap-6 md:grid-cols-5">
            <div className="space-y-6 md:col-span-3">
              {workerCards.slice(0, 2).map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card-hover rounded-xl border border-green/20 bg-bg-card/40 p-6 hover:border-green/40"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-green/30 bg-green/10 text-green">
                    {card.icon}
                  </div>
                  <h4 className="text-base font-semibold">{card.title}</h4>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card-hover rounded-xl border border-green/30 bg-gradient-to-b from-green/[0.06] to-transparent p-6 md:col-span-2 md:flex md:flex-col md:justify-center hover:border-green/50"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-green/30 bg-green/10 text-green">
                {workerCards[2].icon}
              </div>
              <h4 className="text-base font-semibold">{workerCards[2].title}</h4>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">
                {workerCards[2].description}
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Live today strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-text-dim">
            Live today
          </span>
          {liveItems.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-bg-card px-3 py-1 text-xs text-text-muted"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
