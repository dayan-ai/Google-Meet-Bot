"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Automatic Meeting Join",
    description:
      "Give it a Meet link and it opens Chrome, mutes mic and camera, and joins on its own via Selenium.",
    icon: "🔗",
  },
  {
    title: "Audio + Screen Recording",
    description:
      "Captures microphone audio and a screen recording of the whole session in parallel, via ffmpeg.",
    icon: "🎥",
  },
  {
    title: "AI Transcription",
    description:
      "Transcribes locally with OpenAI Whisper, or in the cloud with AssemblyAI if you add an API key.",
    icon: "🧠",
  },
  {
    title: "Text + PDF Export",
    description:
      "Every session becomes a downloadable transcript, in both plain text and formatted PDF.",
    icon: "📄",
  },
  {
    title: "Dedicated Chrome Profile",
    description:
      "Runs in its own automation profile, so it never touches or locks your everyday browser session.",
    icon: "🛡️",
  },
  {
    title: "Simple Local UI",
    description:
      "A clean Streamlit control panel to start, monitor, and stop recordings — no cloud account needed.",
    icon: "🖥️",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mb-14 max-w-2xl"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything the bot does, in one pass
        </h2>
        <p className="mt-3 text-muted">
          One Python process, running on your machine, handles the whole pipeline end to end.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="card-surface rounded-2xl p-6"
          >
            <div className="mb-4 text-2xl">{feature.icon}</div>
            <h3 className="text-base font-medium">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
