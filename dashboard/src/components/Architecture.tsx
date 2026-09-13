"use client";

import { motion } from "framer-motion";

const steps = [
  { label: "Your machine", detail: "Python + Streamlit control panel" },
  { label: "Chrome via Selenium", detail: "Joins the Meet, mutes mic & camera" },
  { label: "Local capture", detail: "sounddevice + ffmpeg record audio & screen" },
  { label: "Whisper / AssemblyAI", detail: "Speech turned into text" },
  { label: "Transcript", detail: "Text + PDF, downloaded locally" },
];

export default function Architecture() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mb-14 max-w-2xl"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Why this runs on your machine, not in the cloud
        </h2>
        <p className="mt-3 text-muted">
          Joining a live call and recording your microphone and screen both need a real
          desktop environment. A serverless host like Vercel can&apos;t launch a browser
          for you or reach your hardware — so the bot itself always runs locally, while
          this page just showcases and documents it.
        </p>
      </motion.div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-1 items-center gap-2"
          >
            <div className="card-surface flex-1 rounded-xl p-4">
              <div className="text-sm font-medium">{step.label}</div>
              <div className="mt-1 text-xs text-muted">{step.detail}</div>
            </div>
            {i < steps.length - 1 && (
              <span className="hidden text-muted sm:block">→</span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
