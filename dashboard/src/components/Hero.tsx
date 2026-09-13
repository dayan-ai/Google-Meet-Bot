"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="glow pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Open source · MIT licensed
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Your Google Meet,
            <br />
            <span className="text-gradient">joined, recorded, transcribed.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted">
            A local automation bot that joins your meetings, records audio and screen
            video, and turns the conversation into clean text and PDF transcripts —
            powered by Whisper and Selenium.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/dayan-ai/Google-Meet-Bot"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              View on GitHub
            </a>
            <a
              href="#prototype"
              className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-card"
            >
              Try the live prototype
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs text-muted">
            <span>Selenium</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Whisper / AssemblyAI</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Streamlit</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>FFmpeg</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
          className="relative h-[380px] sm:h-[460px]"
        >
          <Scene3D />
        </motion.div>
      </div>
    </section>
  );
}
