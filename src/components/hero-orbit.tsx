"use client";

import { motion } from "framer-motion";

export function HeroOrbit() {
  return (
    <div className="relative aspect-square w-full max-w-lg mx-auto">
      <motion.div
        className="absolute inset-0 rounded-full border border-brand-200/60 dark:border-brand-800/60"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-6 rounded-full border border-brand-300/40 dark:border-brand-700/40"
        animate={{ rotate: -360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-14 rounded-full border border-gold-300/50 dark:border-gold-800/40"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute inset-0 grid place-items-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="h-44 w-44 rounded-full bg-gradient-to-br from-brand-400 via-brand-600 to-brand-800 shadow-glow grid place-items-center">
            <svg viewBox="0 0 120 120" className="h-28 w-28 text-white/90">
              <g fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="60" cy="60" r="50" />
                <path d="M60 10 L110 60 L60 110 L10 60 Z" />
                <path d="M60 25 L95 60 L60 95 L25 60 Z" />
                <path d="M60 40 L80 60 L60 80 L40 60 Z" />
                <circle cx="60" cy="60" r="6" fill="currentColor" />
              </g>
            </svg>
          </div>
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-brand-400/50"
          />
        </motion.div>
      </div>

      {["📖", "🕌", "⭐", "✨"].map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl"
          style={{
            top: ["5%", "40%", "80%", "20%"][i],
            insetInlineEnd: ["10%", "-2%", "15%", "75%"][i],
          }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        >
          {e}
        </motion.div>
      ))}
    </div>
  );
}
