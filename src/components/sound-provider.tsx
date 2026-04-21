"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type SoundKind = "tap" | "correct" | "wrong" | "win";

type SoundCtx = {
  enabled: boolean;
  toggle: () => void;
  play: (kind: SoundKind) => void;
};

const SoundContext = createContext<SoundCtx | null>(null);

const FREQS: Record<SoundKind, { f: number; dur: number; type: OscillatorType; vol: number }> = {
  tap: { f: 620, dur: 0.05, type: "sine", vol: 0.08 },
  correct: { f: 880, dur: 0.18, type: "triangle", vol: 0.14 },
  wrong: { f: 180, dur: 0.25, type: "sawtooth", vol: 0.1 },
  win: { f: 660, dur: 0.45, type: "triangle", vol: 0.16 },
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("nur:sound");
    if (saved !== null) setEnabled(saved === "1");
  }, []);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      localStorage.setItem("nur:sound", next ? "1" : "0");
      return next;
    });
  }, []);

  const play = useCallback(
    (kind: SoundKind) => {
      if (!enabled || typeof window === "undefined") return;
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AC();
        const cfg = FREQS[kind];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = cfg.type;
        osc.frequency.value = cfg.f;
        gain.gain.setValueAtTime(cfg.vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + cfg.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        if (kind === "win") {
          osc.frequency.setValueAtTime(660, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
          osc.frequency.setValueAtTime(990, ctx.currentTime + 0.24);
        }
        osc.stop(ctx.currentTime + cfg.dur);
        osc.onended = () => ctx.close();
      } catch {
        // ignore
      }
    },
    [enabled]
  );

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}
