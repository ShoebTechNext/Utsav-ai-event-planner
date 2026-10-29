"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Heart,
  Cake,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { HeroFallback } from "@/components/three/HeroFallback";
import { TiltCard } from "@/components/effects/TiltCard";

// Dynamic import for Three.js 3D Hero scene with ssr: false
const Hero3DScene = dynamic(() => import("@/components/three/Hero3DScene"), {
  ssr: false,
  loading: () => <HeroFallback />,
});

interface LandingHeroProps {
  onStartPlanning: () => void;
  onExploreDashboard: () => void;
}

export function LandingHero({ onStartPlanning, onExploreDashboard }: LandingHeroProps) {
  const { resetToDemoData, addToast } = useUtsav();

  const handleTryDemoEvent = () => {
    resetToDemoData();
    onExploreDashboard();
    addToast({
      type: "success",
      title: "Royal Jaipur Wedding Loaded",
      message: "Exploring sample wedding plan with complete budget, vendors, and timeline.",
    });
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Header & 3D Scene */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Headline & Action Buttons (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-500/10 border border-saffron-500/30 text-saffron-300 text-xs font-semibold uppercase tracking-wider shadow-glass">
            <Sparkles className="w-3.5 h-3.5 fill-saffron-400" />
            <span>GenAI Powered Celebration Planner</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold text-ivory-100 tracking-tight leading-[1.12]">
            Celebrate with Grandeur,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-400 via-rose-400 to-plum-300">
              Planned with Precision.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-ivory-200/90 leading-relaxed max-w-xl">
            From majestic palace weddings to vibrant milestone birthdays and grand community melas —
            Utsav harmonizes budgets in ₹, phased timelines, verified vendor checklists, and bespoke
            cultural inspirations in seconds.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onStartPlanning}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-saffron-500 hover:brightness-110 active:scale-95 text-plum-950 font-bold text-sm tracking-wide shadow-glass-glow flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-400"
            >
              <Sparkles className="w-4 h-4 fill-plum-950" />
              <span>Start Planning with AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTryDemoEvent}
              className="px-6 py-3.5 rounded-2xl bg-plum-900/60 hover:bg-plum-800 text-ivory-100 border border-plum-700/60 font-semibold text-sm flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-400"
            >
              <span>Explore Demo Wedding</span>
            </button>
          </div>

          {/* Zero Config Trust Signals */}
          <div className="flex items-center gap-6 pt-4 text-xs text-ivory-400/90 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Config (Works without API key)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-saffron-400 shrink-0" />
              <span>Private &amp; Strict Prompt Guard</span>
            </div>
          </div>
        </div>

        {/* Right 3D R3F Scene / Fallback (5 Cols) */}
        <div className="lg:col-span-5">
          <Hero3DScene />
        </div>
      </div>

      {/* 3 Event-Type Cards Section */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100">
            Tailored for Every Auspicious Occasion
          </h2>
          <p className="text-xs sm:text-sm text-ivory-300">
            Pre-configured with authentic Indian customs, authentic pricing ranges, and ceremony checklists
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Weddings */}
          <TiltCard className="p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4 shadow-glass">
                <Heart className="w-6 h-6 fill-rose-500/20" />
              </div>
              <h3 className="font-display text-xl font-bold text-ivory-100">
                Royal &amp; Intimate Weddings
              </h3>
              <p className="text-xs text-ivory-300/85 leading-relaxed mt-2">
                Mehendi, Haldi with phoolon ki holi, high-energy Sangeet, royal Baraat, and auspicious
                Mandap pheras. Auto-sync vendor contracts to avoid budget leaks.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-plum-800/60 flex items-center justify-between">
              <span className="text-[11px] text-saffron-400 font-medium">Custom ceremonies</span>
              <button
                type="button"
                onClick={onStartPlanning}
                className="text-xs font-bold text-ivory-100 hover:text-saffron-300 flex items-center gap-1"
              >
                <span>Plan Wedding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </TiltCard>

          {/* Card 2: Birthdays */}
          <TiltCard className="p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-saffron-500/20 text-saffron-400 border border-saffron-500/30 flex items-center justify-center mb-4 shadow-glass">
                <Cake className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-ivory-100">
                Milestone Birthdays
              </h3>
              <p className="text-xs text-ivory-300/85 leading-relaxed mt-2">
                1st birthdays, Sweet 16s, and Silver/Golden Jubilees. Sculpted artisan cakes, interactive
                games, food stalls, and eco-friendly seed-paper goodie bags.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-plum-800/60 flex items-center justify-between">
              <span className="text-[11px] text-saffron-400 font-medium">Memorable themes</span>
              <button
                type="button"
                onClick={onStartPlanning}
                className="text-xs font-bold text-ivory-100 hover:text-saffron-300 flex items-center gap-1"
              >
                <span>Plan Birthday</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </TiltCard>

          {/* Card 3: Community */}
          <TiltCard className="p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-plum-500/30 text-plum-300 border border-plum-400/40 flex items-center justify-center mb-4 shadow-glass">
                <Flame className="w-6 h-6 fill-plum-400/20" />
              </div>
              <h3 className="font-display text-xl font-bold text-ivory-100">
                Community &amp; Festivals
              </h3>
              <p className="text-xs text-ivory-300/85 leading-relaxed mt-2">
                Diwali Melas, Dandiya Nights, and Society Galas. Stage permits, crowd logistics,
                satvik prasadam distribution, and volunteer management.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-plum-800/60 flex items-center justify-between">
              <span className="text-[11px] text-saffron-400 font-medium">Large-scale logistics</span>
              <button
                type="button"
                onClick={onStartPlanning}
                className="text-xs font-bold text-ivory-100 hover:text-saffron-300 flex items-center gap-1"
              >
                <span>Plan Festival</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}

