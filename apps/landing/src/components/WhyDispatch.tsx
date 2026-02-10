"use client";

import { motion } from "framer-motion";

/* ─────────────── Illustration Components ─────────────── */

function PaymentIllustration() {
  return (
    <div className="flex h-56 w-full items-center justify-center">
      <div className="flex items-center gap-3 md:gap-5">
        {/* USDC node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10"
            style={{ boxShadow: "0 0 24px rgba(52,211,153,0.15)" }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" fill="#2775CA" />
              <path d="M20.5 18.5c0-2.1-1.3-2.8-3.8-3.1-1.8-.3-2.2-.7-2.2-1.5s.6-1.3 1.8-1.3c1.1 0 1.6.4 1.9 1.2.1.1.2.2.3.2h.7c.2 0 .3-.1.3-.3v-.1c-.3-1.1-1.1-1.9-2.3-2.1v-1.3c0-.2-.1-.3-.3-.3h-.6c-.2 0-.3.1-.3.3v1.2c-1.6.2-2.6 1.2-2.6 2.5 0 2 1.2 2.7 3.7 3 1.7.3 2.3.7 2.3 1.6 0 .9-.8 1.5-1.9 1.5-1.5 0-2-.6-2.2-1.4-.1-.2-.2-.2-.3-.2h-.8c-.2 0-.3.1-.3.3v.1c.3 1.2 1.1 2.1 2.7 2.4v1.3c0 .2.1.3.3.3h.6c.2 0 .3-.1.3-.3v-1.3c1.6-.3 2.7-1.3 2.7-2.6z" fill="white"/>
            </svg>
          </div>
        </motion.div>

        {/* Connector 1 */}
        <div className="relative h-px w-10 md:w-16">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-accent/30 to-border" />
          <motion.div
            initial={{ left: "-10%" }}
            animate={{ left: "110%" }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent"
            style={{ boxShadow: "0 0 8px rgba(212,162,70,0.6)" }}
          />
        </div>

        {/* Swap node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-bg-card"
          style={{ boxShadow: "0 0 20px rgba(212,162,70,0.1)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a246" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16l-4-4 4-4" />
            <path d="M17 8l4 4-4 4" />
            <path d="M3 12h18" />
          </svg>
        </motion.div>

        {/* Connector 2 */}
        <div className="relative h-px w-10 md:w-16">
          <div className="absolute inset-0 bg-gradient-to-r from-border via-accent/30 to-accent/40" />
          <motion.div
            initial={{ left: "-10%" }}
            animate={{ left: "110%" }}
            transition={{ duration: 1.8, delay: 0.6, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent"
            style={{ boxShadow: "0 0 8px rgba(212,162,70,0.6)" }}
          />
        </div>

        {/* BOLT node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ boxShadow: ["0 0 20px rgba(212,162,70,0.15)", "0 0 35px rgba(212,162,70,0.3)", "0 0 20px rgba(212,162,70,0.15)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-accent/50 bg-accent/10 rotate-45"
          >
            <span className="text-[10px] font-bold text-accent-bright -rotate-45">$BOLT</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ReputationIllustration() {
  const tiers = [
    { name: "Open", height: "h-[88px]", border: "border-border/50", glow: "", text: "text-text-dim", iconOpacity: "opacity-30" },
    { name: "Verified", height: "h-[120px]", border: "border-accent-bright/50", glow: "", text: "text-accent-bright", iconOpacity: "opacity-60" },
    { name: "Sentinel", height: "h-[152px]", border: "border-accent/60", glow: "glow-accent", text: "text-accent", iconOpacity: "opacity-100" },
  ];

  return (
    <div className="flex h-56 w-full items-end justify-center gap-4 pb-4">
      {/* Progression bar behind */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-12 h-px w-48 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      {tiers.map((tier, i) => (
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, scaleY: 0 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15, duration: 0.5 }}
          style={{ transformOrigin: "bottom" }}
          className={`${tier.height} w-20 rounded-xl border ${tier.border} bg-bg-card/60 flex flex-col items-center justify-center gap-2 relative ${tier.glow}`}
        >
          {/* Shield icon */}
          <svg className={`h-5 w-5 ${tier.iconOpacity}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className={`text-[10px] font-semibold ${tier.text}`}>{tier.name}</span>
          {tier.name === "Sentinel" && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{ boxShadow: ["0 0 15px rgba(212,162,70,0.1)", "0 0 30px rgba(212,162,70,0.25)", "0 0 15px rgba(212,162,70,0.1)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function DeviceIllustration() {
  const devices = [
    {
      label: "Phone",
      // Phone icon paths
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4a246" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
        </svg>
      ),
    },
    {
      label: "Laptop",
      icon: (
        <svg width="32" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4a246" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M2 17h20" />
          <path d="M6 21h12" />
        </svg>
      ),
    },
    {
      label: "Tablet",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4a246" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-56 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        {/* Devices row */}
        <div className="flex items-end gap-6 md:gap-10">
          {devices.map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center gap-2"
            >
              {/* Floating $BOLT indicator */}
              <motion.div
                animate={{ y: [-2, -8, -2], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                className="rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5"
              >
                <span className="text-[9px] font-bold text-accent">$BOLT</span>
              </motion.div>

              {/* Device with glow */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 12px rgba(212,162,70,0.1)",
                    "0 0 24px rgba(212,162,70,0.25)",
                    "0 0 12px rgba(212,162,70,0.1)",
                  ],
                }}
                transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
                className="flex h-14 w-14 items-center justify-center rounded-xl border border-accent/30 bg-bg-card/60"
              >
                {d.icon}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* "No GPU required" line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 text-xs text-text-dim"
        >
          <div className="h-px w-8 bg-accent/20" />
          <span>No <span className="line-through opacity-50">GPU</span> required</span>
          <div className="h-px w-8 bg-accent/20" />
        </motion.div>
      </div>
    </div>
  );
}

function DualChainIllustration() {
  return (
    <div className="flex h-56 w-full items-center justify-center">
      <div className="flex items-center gap-4 md:gap-8">
        {/* Solana orb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          animate={{ rotate: [0, 3, 0, -3, 0] }}
          transition={{ rotate: { duration: 4, repeat: Infinity }, opacity: { duration: 0.5 } }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40"
          style={{ boxShadow: "0 0 30px rgba(52,211,153,0.12)" }}
        >
          {/* Solana logo */}
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="sol-grad-wd" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9945FF" />
                <stop offset="1" stopColor="#14F195" />
              </linearGradient>
            </defs>
            <path d="M6 22l3-3h17l-3 3H6z" fill="url(#sol-grad-wd)" />
            <path d="M6 13l3 3h17l-3-3H6z" fill="url(#sol-grad-wd)" />
            <path d="M6 10l3-3h17l-3 3H6z" fill="url(#sol-grad-wd)" />
          </svg>
        </motion.div>

        {/* Bridge connectors — 3 parallel animated lines */}
        <div className="flex flex-col gap-2">
          {[0, 0.4, 0.8].map((delay, i) => (
            <div key={i} className="relative h-px w-14 md:w-24">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-accent/20 to-accent/30" />
              <motion.div
                initial={{ left: "-10%" }}
                animate={{ left: "110%" }}
                transition={{ duration: 2, delay, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-accent"
                style={{ boxShadow: "0 0 6px rgba(212,162,70,0.5)" }}
              />
            </div>
          ))}
        </div>

        {/* Monad orb */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          animate={{ rotate: [0, -3, 0, 3, 0] }}
          transition={{ rotate: { duration: 4, repeat: Infinity }, opacity: { duration: 0.5 } }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40"
          style={{ boxShadow: "0 0 30px rgba(212,162,70,0.12)" }}
        >
          {/* Monad logo */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 3C9.40096 3 3 9.40082 3 12C3 14.5991 9.40096 21 12 21C14.5989 21 21 14.599 21 12C21 9.40093 14.599 3 12 3ZM10.5975 17.1464C9.5015 16.8478 6.55489 11.6934 6.85359 10.5974C7.15229 9.50142 12.3065 6.55489 13.4025 6.85357C14.4985 7.15223 17.4451 12.3065 17.1464 13.4025C16.8477 14.4985 11.6934 17.4451 10.5975 17.1464Z" fill="#6E54FF"/>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

function ReceiptIllustration() {
  const barWidths = ["w-3/4", "w-full", "w-2/3", "w-5/6", "w-1/2"];

  return (
    <div className="flex h-56 w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative w-44 rounded-xl border border-border/60 bg-bg-card/80 p-4"
      >
        {/* Data bars */}
        <div className="space-y-2.5 mb-4">
          {barWidths.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={`h-1.5 ${w} rounded-full bg-white/[0.06]`}
            />
          ))}
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-accent/30 mb-3" />

        {/* Signature area */}
        <div className="font-mono text-[8px] text-text-dim/40 leading-relaxed">
          <div>ed25519: 6fa2f...</div>
          <div>hash: a3b1c9e...</div>
        </div>

        {/* Animated checkmark overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/10"
          style={{ boxShadow: "0 0 16px rgba(52,211,153,0.2)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.5 }}
            />
          </svg>
        </motion.div>

        {/* Gold seal */}
        <motion.div
          animate={{ boxShadow: ["0 0 8px rgba(212,162,70,0.1)", "0 0 16px rgba(212,162,70,0.25)", "0 0 8px rgba(212,162,70,0.1)"] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -bottom-2 right-4 flex h-6 w-6 items-center justify-center rounded-full border border-accent/40 bg-accent/10"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#d4a246">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

function OpenSourceIllustration() {
  return (
    <div className="flex h-56 w-full items-center justify-center">
      <div className="w-56 flex flex-col items-center gap-3">
        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full rounded-lg border border-border/60 bg-bg-card/80 overflow-hidden"
        >
          {/* Title bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30">
            <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <div className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <div className="h-2 w-2 rounded-full bg-[#28c840]" />
          </div>
          {/* Terminal content */}
          <div className="p-3 font-mono text-[11px] leading-relaxed">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-text-muted"
            >
              <span className="text-accent">$</span> git clone dispatch-protocol
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ml-0.5 inline-block w-1.5 h-3.5 bg-accent/70 align-middle"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-1 text-emerald-400/80"
            >
              ✓ Cloned successfully
            </motion.div>
          </div>
        </motion.div>

        {/* MIT badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-3 py-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#d4a246">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
          <span className="text-[10px] font-semibold text-accent">MIT Licensed</span>
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────── Block Data ─────────────── */

const blocks = [
  {
    title: "HTTP-native payments",
    description: "Agents pay USDC via x402 headers. The coordinator auto-swaps to $BOLT via Jupiter DEX. Workers earn $BOLT with real upside — hold, stake for priority, or sell.",
    tag: "x402 / $BOLT",
    illustration: PaymentIllustration,
  },
  {
    title: "Portable onchain reputation",
    description: "Workers build ERC-8004 reputation that follows them across apps. $BOLT staking amplifies your score — Verified workers get 1.5x, Sentinels get 2x reputation multiplier.",
    tag: "ERC-8004",
    illustration: ReputationIllustration,
  },
  {
    title: "100x lower barrier to entry",
    description: "Any phone or laptop earns $BOLT while idle. No GPU, no datacenter. Optional staking starts at just 100 $BOLT for priority matching.",
    tag: "Idle devices",
    illustration: DeviceIllustration,
  },
  {
    title: "Solana for economics, Monad for trust",
    description: "$BOLT lives on Solana — where 150K+ Seeker phones have wallets. ERC-8004 reputation lives on Monad — where smart contract programmability enables verifiable identity. Each chain does what it's best at.",
    tag: "Dual-chain",
    illustration: DualChainIllustration,
  },
  {
    title: "Cryptographic receipts",
    description: "Every result includes an ed25519 signature over the output hash. Verifiable proof of who computed what — designed for onchain anchoring.",
    tag: "ed25519",
    illustration: ReceiptIllustration,
  },
  {
    title: "Fully open source",
    description: "Coordinator, worker SDK, Seeker app, $BOLT contracts — all MIT licensed. Fork it, audit it, deploy your own network.",
    tag: "MIT license",
    illustration: OpenSourceIllustration,
  },
];

/* ─────────────── Main Section ─────────────── */

export function WhyDispatch() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32" id="why">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[600px] rounded-full opacity-[0.06]"
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
            Different tradeoffs than every other compute network.
          </p>
        </motion.div>

        <div className="space-y-6">
          {blocks.map((block, i) => {
            const isEven = i % 2 === 1;
            const Illus = block.illustration;
            return (
              <div key={block.title}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-2xl border border-border/50 bg-bg-card/30 p-6 md:p-8 flex flex-col gap-8 ${
                    isEven ? "md:flex-row-reverse" : "md:flex-row"
                  } md:items-center md:gap-16`}
                >
                  {/* Text */}
                  <div className="flex-1">
                    <span className="mb-3 inline-block rounded-full border border-border px-3 py-1 text-xs text-text-dim">
                      {block.tag}
                    </span>
                    <h3 className="text-2xl font-bold md:text-3xl">{block.title}</h3>
                    <p className="mt-4 text-text-muted leading-relaxed">{block.description}</p>
                  </div>
                  {/* Illustration */}
                  <motion.div
                    className="flex-1 relative"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <Illus />
                  </motion.div>
                </motion.div>
                {i < blocks.length - 1 && (
                  <div className="mx-auto h-px w-16 bg-accent/20 mt-6" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
