"use client";

import React from "react";
import { useUtsav } from "@/hooks/useUtsavStore";

export function AuroraBackground() {
  const { settings } = useUtsav();
  const shouldReduceMotion = settings.reduceMotion;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background transition-colors duration-500"
    >
      {/* Primary Glow Orbs */}
      <div
        className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] opacity-40 mix-blend-screen bg-gradient-to-br from-plum-700 via-rose-600 to-saffron-500 ${
          shouldReduceMotion ? "" : "animate-aurora"
        }`}
      />
      <div
        style={{ animationDelay: "-5s" }}
        className={`absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full blur-[140px] opacity-35 mix-blend-screen bg-gradient-to-bl from-saffron-500 via-rose-500 to-plum-800 ${
          shouldReduceMotion ? "" : "animate-aurora"
        }`}
      />
      <div
        style={{ animationDelay: "-9s" }}
        className={`absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full blur-[150px] opacity-30 mix-blend-screen bg-gradient-to-tr from-plum-900 via-plum-600 to-rose-700 ${
          shouldReduceMotion ? "" : "animate-aurora"
        }`}
      />

      {/* Subtle Noise / Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,176,0,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
    </div>
  );
}

