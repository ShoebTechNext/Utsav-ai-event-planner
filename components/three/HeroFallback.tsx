import React from "react";
import { Sparkles, Gift, Flame, PartyPopper } from "lucide-react";

export function HeroFallback() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full h-[380px] sm:h-[460px] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-plum-950 via-plum-900 to-rose-950/70 border border-plum-700/50 shadow-glass"
    >
      {/* Background Radiance */}
      <div className="absolute w-72 h-72 rounded-full bg-saffron-500/20 blur-[90px] animate-pulse-glow" />
      <div className="absolute w-60 h-60 rounded-full bg-rose-500/25 blur-[80px]" />

      {/* Layered CSS 3D Celebratory Objects */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Floating Golden Diya / Lantern Centerpiece */}
        <div className="relative mb-4 animate-float">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-saffron-600 via-rose-500 to-amber-300 p-1 shadow-glass-glow flex items-center justify-center">
            <div className="w-full h-full bg-plum-950 rounded-full flex items-center justify-center">
              <Flame className="w-12 h-12 text-saffron-400 fill-saffron-400" />
            </div>
          </div>
          {/* Flame Halo */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-saffron-400/40 blur-md" />
        </div>

        {/* Orbiting Elements */}
        <div className="flex items-center gap-6 text-ivory-200">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-plum-900/80 border border-saffron-500/30 shadow-glass backdrop-blur-md">
            <Gift className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold">Bespoke Plans</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-plum-900/80 border border-saffron-500/30 shadow-glass backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-saffron-400" />
            <span className="text-xs font-semibold">AI Curated Vibes</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-plum-900/80 border border-saffron-500/30 shadow-glass backdrop-blur-md">
            <PartyPopper className="w-4 h-4 text-rose-300" />
            <span className="text-xs font-semibold">Zero Stress</span>
          </div>
        </div>
      </div>
    </div>
  );
}

