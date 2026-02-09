"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const terminalLines = [
  { text: "$ dispatch submit --task summarize --chain monad", color: "text-text" },
  { text: "→ Worker: node-7f3a (reputation: 4.8★)", color: "text-green" },
  { text: "→ Payment: 0.001 USDC via x402", color: "text-green" },
  { text: "→ Processing: summarization (1.2s)", color: "text-green" },
  { text: "→ Receipt: ed25519 verified ✓", color: "text-green" },
  { text: "→ Reputation: feedback posted to Monad", color: "text-green font-bold" },
];

export function Hero() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= terminalLines.length) return;
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= terminalLines.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(timer);
  }, [visibleLines]);

  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-16 md:pt-32 md:pb-24">
      {/* Radial grid glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-3xl"
          style={{
            background: "radial-gradient(ellipse at center top, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.02) 50%, transparent 80%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-4 py-1.5 text-sm text-text-muted"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-green animate-pulse" />
          Live on Monad + Solana testnet
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
        >
          Dispatch idle compute{" "}
          <span className="bg-gradient-to-r from-[#0ea5e9] to-[#22c55e] bg-clip-text text-transparent">
            to AI agents.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl"
        >
          Turn idle phones and desktops into an AI compute fleet. Workers get
          paid in USDC. Every completed job builds verifiable reputation
          on-chain.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <a
            href="https://docs-theta-mocha.vercel.app/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-bright"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Read the Docs
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-text-muted transition-colors hover:border-border-bright hover:text-text"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            See How It Works
          </a>
        </motion.div>

        {/* Animated terminal demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-12 max-w-[500px]"
        >
          <div className="rounded-xl border border-border bg-[#0d0d14] overflow-hidden">
            {/* Terminal top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            {/* Terminal body */}
            <div className="p-4 font-mono text-sm text-left min-h-[180px]">
              {terminalLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i < visibleLines ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${line.color} ${i > 0 ? "mt-1" : ""}`}
                >
                  {line.text}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
