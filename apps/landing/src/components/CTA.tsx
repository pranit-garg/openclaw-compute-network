"use client";

import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="relative overflow-hidden section-divider px-6 py-20 md:py-28">
      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/3 bg-gradient-to-r from-transparent via-[#d4a246]/50 to-transparent" />

      {/* Warm ambient glow, CSS only */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(212, 162, 70, 0.10) 0%, rgba(212, 162, 70, 0.03) 50%, transparent 80%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-full max-w-2xl"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(212, 162, 70, 0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold md:text-4xl"
        >
          Start in 5 minutes.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-text-muted"
        >
          Open source, MIT licensed. Install the CLI, download the app, or fork
          the whole thing.
        </motion.p>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-dim"
        >
          <span className="font-mono">2 chains</span>
          <span className="text-border">&middot;</span>
          <span className="font-mono">&lt;500ms latency</span>
          <span className="text-border">&middot;</span>
          <span className="font-mono">12K+ lines</span>
          <span className="text-border">&middot;</span>
          <span className="font-mono">MIT licensed</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <a
            href="https://docs.dispatch.computer/docs/getting-started/quickstart"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-[#0a0a0e] transition-colors hover:bg-accent-bright"
          >
            {/* Terminal icon */}
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Install the CLI
          </a>
        </motion.div>
      </div>
    </section>
  );
}
