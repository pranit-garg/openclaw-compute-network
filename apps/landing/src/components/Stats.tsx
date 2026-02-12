"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Lines of Code", value: "16K+", detail: "TypeScript, end to end" },
  { label: "Source Files", value: "145+", detail: "13 workspaces, 2 chains" },
  { label: "Unit Tests", value: "37", detail: "All green" },
  { label: "E2E Scenarios", value: "2", detail: "Monad + Solana verified" },
];

export function Stats() {
  return (
    <section className="border-y border-border px-6 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-text md:text-4xl">
              {stat.value}
            </div>
            <div className="mt-1 text-sm font-medium text-text-muted">
              {stat.label}
            </div>
            <div className="mt-0.5 text-xs text-text-dim">{stat.detail}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
