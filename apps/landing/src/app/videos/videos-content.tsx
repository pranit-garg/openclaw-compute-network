"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const LOOM_PITCH_URL =
  "https://www.loom.com/embed/d8be9ef8f930423badb6a062e9d2b0cb";
const LOOM_TECH_URL =
  "https://www.loom.com/embed/2078978227934fdfa18955d4b2974478";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

function PitchVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-accent/30"
      style={{ boxShadow: "0 0 40px rgba(212,162,70,0.08)" }}
    >
      <div className="relative aspect-video bg-[#0d0d12]">
        {playing ? (
          <iframe
            src={`${LOOM_PITCH_URL}?autoplay=1`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4"
          >
            {/* Thumbnail */}
            <img
              src="/images/video-thumbnail.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-80"
            />
            {/* Play button */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-accent/10 backdrop-blur-sm transition-all group-hover:bg-accent/20 group-hover:scale-110">
              <svg
                className="h-6 w-6 text-accent ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="relative text-sm font-medium text-text-muted group-hover:text-accent transition-colors">
              Click to play
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function TechDemoVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-accent/30"
      style={{ boxShadow: "0 0 40px rgba(212,162,70,0.08)" }}
    >
      <div className="relative aspect-video bg-[#0d0d12]">
        {playing ? (
          <iframe
            src={`${LOOM_TECH_URL}?autoplay=1`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4"
          >
            {/* Thumbnail */}
            <img
              src="/images/tech-demo-thumbnail.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-80"
            />
            {/* Play button */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-accent/10 backdrop-blur-sm transition-all group-hover:bg-accent/20 group-hover:scale-110">
              <svg
                className="h-6 w-6 text-accent ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="relative text-sm font-medium text-text-muted group-hover:text-accent transition-colors">
              Click to play
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function VideosContent() {
  return (
    <main className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-24">
      {/* ── Header ── */}
      <motion.header
        className="text-center mb-16 md:mb-20"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium tracking-wide text-accent uppercase">
            Video Walkthroughs
          </span>
        </div>
        <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight mb-4">
          Dispatch
        </h1>
        <p className="text-text-muted max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          Cheap compute for AI agents. Passive income for workers.
          <br className="hidden sm:block" />
          Every result verified with a cryptographic receipt.
        </p>
      </motion.header>

      {/* ── Video 1: Pitch ── */}
      <motion.section
        className="mb-16 md:mb-20"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="flex-none flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold">
            01
          </span>
          <div>
            <h2 className="text-xl font-semibold md:text-2xl">
              Pitch Video
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              Problem, solution, traction, and vision
            </p>
          </div>
        </div>
        <PitchVideo />
      </motion.section>

      {/* ── Video 2: Technical Demo ── */}
      <motion.section
        className="mb-16 md:mb-20"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={2}
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="flex-none flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold">
            02
          </span>
          <div>
            <h2 className="text-xl font-semibold md:text-2xl">
              Technical Demo
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              Architecture walkthrough and live E2E flow
            </p>
          </div>
        </div>

        <TechDemoVideo />
      </motion.section>

      {/* ── Footer link ── */}
      <motion.div
        className="text-center pt-8 border-t border-border/50"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={3}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-dim hover:text-accent transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to dispatch.computer
        </Link>
      </motion.div>
    </main>
  );
}
