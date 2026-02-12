"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Passive Income, Zero Effort",
    description: "Your phone picks up AI tasks over WebSocket while you sleep. BOLT earnings accumulate automatically, no interaction needed.",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Onchain Reputation That Grows",
    description: "Every completed task builds your ERC-8004 score. Higher reputation means priority matching and better-paying jobs.",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "No GPU Required",
    description: "Summarization, classification, data extraction. All run on your phone's CPU. No special hardware, no setup.",
  },
];

/* ── Faithful recreation of the real Seeker mobile app dashboard ── */

function PhoneMockup() {
  return (
    <div className="relative w-[260px]">
      {/* Side buttons: volume (left) + power (right) */}
      <div className="absolute -left-[3px] top-[70px] h-6 w-[3px] rounded-l-sm bg-[#3a3a4a]" />
      <div className="absolute -left-[3px] top-[100px] h-10 w-[3px] rounded-l-sm bg-[#3a3a4a]" />
      <div className="absolute -right-[3px] top-[90px] h-8 w-[3px] rounded-r-sm bg-[#3a3a4a]" />

      {/* Solana Seeker frame */}
      <div className="rounded-[2.5rem] border-[1.5px] border-[#4a4a5a] bg-gradient-to-b from-[#35353f] to-[#2a2a35] p-[5px] shadow-xl shadow-black/40">
        <div className="rounded-[2rem] overflow-hidden relative">
          <img
            src="/images/app-screenshot.png"
            alt="Dispatch Seeker app dashboard showing earnings and job history"
            className="w-full h-auto block"
          />
        </div>
      </div>
    </div>
  );
}

export function Seeker() {
  return (
    <section className="border-t border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Left: copy & features */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold md:text-4xl"
            >
              Earn from your phone.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1 text-xs text-text-dim"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Live on the Solana dApp Store
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-text-muted leading-relaxed"
            >
              The Seeker app turns any idle phone into a worker node. Connect to
              the network, process AI tasks in the background, and earn BOLT for
              every completed job. All from your pocket.
            </motion.p>

            <div className="mt-8 space-y-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-bright">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="mt-0.5 text-sm text-text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: faithful app mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center order-first md:order-last"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
