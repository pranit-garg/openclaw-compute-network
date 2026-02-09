"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    label: "Quote",
    detail: "Agent requests price for job type and policy tier",
    sub: "GET /v1/quote → CHEAP ~$0.001 | FAST ~$0.010",
  },
  {
    num: "02",
    label: "Pay",
    detail: "x402 embeds USDC payment directly in the HTTP header",
    sub: "HTTP 402 → sign USDC tx → retry with X-PAYMENT",
  },
  {
    num: "03",
    label: "Match",
    detail: "Coordinator atomically claims the best worker by reputation and tier",
    sub: "FAST → desktop workers | CHEAP → Seeker mobile nodes",
  },
  {
    num: "04",
    label: "Execute",
    detail: "Worker processes the task and signs the output",
    sub: "LLM inference, summarization, classification → ed25519 sig",
  },
  {
    num: "05",
    label: "Verify",
    detail: "Signed receipt stored, reputation feedback posted onchain",
    sub: "ed25519 over output hash → ERC-8004 score update",
  },
];

export function Architecture() {
  return (
    <section className="border-t border-border px-6 py-20 md:py-28" id="architecture">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">
            Job lifecycle
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-muted">
            Five steps from request to cryptographically verified result.
            Same protocol on Monad and Solana.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-start gap-6 md:gap-0 ${
                  i % 2 === 0
                    ? "md:flex-row"
                    : "md:flex-row-reverse"
                }`}
              >
                {/* Number badge */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-bg-card font-mono text-sm font-bold text-accent-bright md:absolute md:left-1/2 md:-translate-x-1/2">
                  {step.num}
                </div>

                {/* Content card */}
                <div
                  className={`flex-1 rounded-xl border border-border bg-bg-card p-5 md:w-[calc(50%-40px)] ${
                    i % 2 === 0
                      ? "md:mr-auto md:pr-8"
                      : "md:ml-auto md:pl-8"
                  }`}
                >
                  <h3 className="text-lg font-semibold">{step.label}</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    {step.detail}
                  </p>
                  <p className="mt-2 font-mono text-xs text-text-dim">
                    {step.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
