"use client";

import { motion } from "framer-motion";
import { JobFlowDiagram } from "./hero/JobFlowDiagram";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-16 md:pt-32 md:pb-24">
      {/* Ambient glow, CSS only */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #d4a246, transparent 70%)" }}
        />
        <div className="absolute -top-20 -left-40 h-[400px] w-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #d4a246, transparent 70%)" }}
        />
        <div className="absolute -top-20 -right-40 h-[400px] w-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #d4a246, transparent 70%)" }}
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

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
        >
          <span className="bg-gradient-to-r from-[#d4a246] to-[#f0c674] bg-clip-text text-transparent">
            Dispatch
          </span>{" "}
          turns idle devices into an AI compute network.
        </motion.h1>

        {/* Subheadline, updated for BOLT */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl"
        >
          Agents pay USDC. Workers earn $BOLT. Every job builds onchain
          reputation via ERC-8004.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <a
            href="https://docs.dispatch.computer/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-[#0a0a0e] transition-colors hover:bg-accent-bright"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Read the Docs
          </a>
          <a
            href="https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-text-muted transition-colors hover:border-border-bright hover:text-text"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Litepaper
          </a>
        </motion.div>

        {/* Animated job flow diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <JobFlowDiagram />
        </motion.div>
      </div>
    </section>
  );
}
