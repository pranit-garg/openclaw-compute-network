"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const cliCommand = `$ dispatch agent run \\
    --type llm \\
    --prompt "Summarize quantum computing in one paragraph" \\
    --policy fast`;

const cliResponse = `Quantum computing leverages quantum mechanical phenomena
like superposition and entanglement to perform computations
that would be impractical for classical computers...

  Route:   monad-testnet
  Price:   $0.010
  Latency: 342ms
  Receipt: hash=6fa2faf... worker=7f3a92c1...`;

export function LiveDemo() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);

  const handleSubmit = () => {
    setSubmitted(false);
    setLoading(true);
    setVisibleChars(0);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  useEffect(() => {
    if (!submitted) return;
    if (visibleChars >= cliResponse.length) return;
    const timer = setTimeout(() => {
      setVisibleChars((prev) => Math.min(prev + 8, cliResponse.length));
    }, 10);
    return () => clearTimeout(timer);
  }, [submitted, visibleChars]);

  return (
    <section className="section-divider px-6 py-20 md:py-28" id="demo">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">Try the CLI</h2>
          <p className="mx-auto mt-4 max-w-xl text-text-muted">
            Submit a job, get a verified result. One command is all it takes.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Request side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded bg-[#333] px-2 py-0.5 text-xs font-bold font-mono text-emerald-400">
                CLI
              </span>
              <span className="font-mono text-sm text-text-muted">
                dispatch agent run
              </span>
            </div>
            <div className="code-block relative p-5 overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                <code className="text-text-muted">{cliCommand}</code>
              </pre>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-accent px-6 py-3 font-medium text-[#0a0a0e] transition-all hover:bg-accent-bright disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="30 70"
                    />
                  </svg>
                  Matching worker...
                </span>
              ) : (
                "Run Command"
              )}
            </button>
          </motion.div>

          {/* Response side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${
                  submitted
                    ? "bg-green/20 text-green"
                    : "bg-bg-card text-text-dim"
                }`}
              >
                {submitted ? "200 OK" : "Waiting..."}
              </span>
              <span className="font-mono text-sm text-text-muted">Output</span>
            </div>
            <div className="code-block relative p-5 overflow-x-auto min-h-[200px] md:min-h-[300px]">
              {submitted ? (
                <pre className="text-xs leading-relaxed whitespace-pre-wrap">
                  <code className="text-green">
                    {cliResponse.slice(0, visibleChars)}
                  </code>
                  {visibleChars < cliResponse.length && (
                    <span className="animate-pulse text-accent">&#9612;</span>
                  )}
                </pre>
              ) : (
                <div className="flex h-full min-h-[160px] md:min-h-[260px] items-center justify-center text-text-dim text-sm">
                  Click &ldquo;Run Command&rdquo; to see the output
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Chain badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M12 3C9.40096 3 3 9.40082 3 12C3 14.5991 9.40096 21 12 21C14.5989 21 21 14.599 21 12C21 9.40093 14.599 3 12 3ZM10.5975 17.1464C9.5015 16.8478 6.55489 11.6934 6.85359 10.5974C7.15229 9.50142 12.3065 6.55489 13.4025 6.85357C14.4985 7.15223 17.4451 12.3065 17.1464 13.4025C16.8477 14.4985 11.6934 17.4451 10.5975 17.1464Z"
                fill="#836EF9"
              />
            </svg>
            <span className="text-sm text-text-muted">Monad</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
            <svg viewBox="0 0 32 32" className="h-4 w-4" fill="none">
              <defs>
                <linearGradient
                  id="sol-g"
                  x1="0"
                  y1="0"
                  x2="32"
                  y2="32"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#9945FF" />
                  <stop offset="1" stopColor="#14F195" />
                </linearGradient>
              </defs>
              <path d="M6 22l3-3h17l-3 3H6z" fill="url(#sol-g)" />
              <path d="M6 13l3 3h17l-3-3H6z" fill="url(#sol-g)" />
              <path d="M6 10l3-3h17l-3 3H6z" fill="url(#sol-g)" />
            </svg>
            <span className="text-sm text-text-muted">Solana</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
