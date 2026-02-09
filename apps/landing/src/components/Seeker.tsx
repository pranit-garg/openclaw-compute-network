"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Idle Earnings",
    description: "Your phone picks up tasks over WebSocket while you sleep. Earnings accumulate in the background.",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "On-chain Reputation",
    description: "Every completed task adds to your ERC-8004 score on Monad. Higher reputation, better jobs.",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Lightweight Tasks",
    description: "Text classification, summarization, data extraction. No GPU — just your phone.",
  },
];

/* ── Faithful recreation of the real Seeker mobile app dashboard ── */

function PhoneMockup() {
  return (
    <div className="relative w-[280px]">
      {/* Phone frame — matches the real app's #0a0a0f background */}
      <div className="rounded-[2rem] border-2 border-border bg-[#0a0a0f] p-3 shadow-lg shadow-accent/5">
        {/* Dynamic Island / Notch */}
        <div className="mx-auto mb-3 h-5 w-24 rounded-full bg-[#1a1a2e]" />

        {/* Screen */}
        <div className="rounded-[1.25rem] bg-[#0a0a0f] px-3 pb-3">
          {/* Status bar */}
          <div className="mb-3 flex items-center justify-between text-[10px] text-[#64748b]">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Signal bars */}
              <svg className="h-2.5 w-2.5" fill="#64748b" viewBox="0 0 24 24"><path d="M2 22h4V12H2v10zm6 0h4V7H8v15zm6 0h4V2h-4v20z" /></svg>
              {/* WiFi */}
              <svg className="h-2.5 w-2.5" fill="#64748b" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
              {/* Battery */}
              <div className="flex items-center gap-0.5">
                <div className="h-2 w-4 rounded-sm border border-[#64748b] p-px">
                  <div className="h-full w-3/4 rounded-[1px] bg-[#22c55e]" />
                </div>
              </div>
            </div>
          </div>

          {/* App header — "Dispatch" + "COMPUTE NODE" */}
          <div className="mb-3 text-center">
            <div className="text-sm font-extrabold tracking-wide text-[#f8fafc]">Dispatch</div>
            <div className="text-[8px] font-semibold uppercase tracking-[2px] text-[#818cf8]">Compute Node</div>
          </div>

          {/* StatusCard */}
          <div className="mb-2 rounded-xl border border-[#2a2a45] bg-[#1a1a2e] p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[10px] font-semibold text-[#22c55e]">Online</span>
              </div>
              <span className="rounded bg-[#252540] px-1.5 py-0.5 text-[7px] font-bold tracking-wide text-[#6366f1]">DEVICE KEY</span>
            </div>
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-[#64748b]">Network</span>
              <span className="font-mono text-[#94a3b8]">ws://coordinator:4010</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[9px]">
              <span className="text-[#64748b]">Node ID</span>
              <span className="font-mono text-[#94a3b8]">7f3a92c1...d4e8b0f2</span>
            </div>
          </div>

          {/* EarningsCard */}
          <div className="mb-2 flex items-center rounded-xl border border-[#6366f1] bg-[#1a1a2e] p-2.5">
            <div className="flex-1">
              <div className="text-[7px] font-semibold uppercase tracking-wide text-[#64748b]">Earnings</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg font-bold text-[#f8fafc]">0.0847</span>
                <span className="text-[10px] font-semibold text-[#818cf8]">SOL</span>
              </div>
            </div>
            <div className="mx-3 h-8 w-px bg-[#2a2a45]" />
            <div className="text-center">
              <div className="text-[7px] font-semibold uppercase tracking-wide text-[#64748b]">Completed</div>
              <span className="font-mono text-lg font-bold text-[#f8fafc]">42</span>
            </div>
          </div>

          {/* WorkerToggle — big circular "EARNING" button */}
          <div className="my-3 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-[2px] border-[#818cf8] bg-[#6366f1]">
              {/* Inner glow ring */}
              <div className="absolute inset-1.5 rounded-full border border-[#818cf840]" />
              <div className="text-center">
                <div className="text-[10px] font-extrabold tracking-[2px] text-[#f8fafc]">EARNING</div>
                <div className="text-[7px] text-[#f8fafc99]">Tap to go offline</div>
              </div>
            </div>
          </div>

          {/* JobHistory — show 2 sample rows */}
          <div>
            <div className="mb-1.5 text-[8px] font-semibold uppercase tracking-wide text-[#64748b]">Job History</div>
            {/* Job row 1 */}
            <div className="mb-1 flex items-center justify-between rounded-lg bg-[#1a1a2e] px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-[#6366f120] px-1 py-0.5 text-[7px] font-bold text-[#6366f1]">SUMMARIZE</span>
                <span className="text-[8px] text-[#64748b]">2m ago</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[8px] text-[#94a3b8]">340ms</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              </div>
            </div>
            {/* Job row 2 */}
            <div className="flex items-center justify-between rounded-lg bg-[#1a1a2e] px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-[#8b5cf620] px-1 py-0.5 text-[7px] font-bold text-[#8b5cf6]">CLASSIFY</span>
                <span className="text-[8px] text-[#64748b]">5m ago</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[8px] text-[#94a3b8]">128ms</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              </div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#1a1a2e]" />
      </div>
    </div>
  );
}

export function Seeker() {
  return (
    <section className="border-t border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Left — copy & features */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold md:text-4xl"
            >
              Your phone is a compute node.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-text-muted leading-relaxed"
            >
              Dispatch Seeker turns idle screen time into USDC. Connect, execute
              lightweight AI tasks, build on-chain reputation — from your pocket.
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

          {/* Right — faithful app mockup */}
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
