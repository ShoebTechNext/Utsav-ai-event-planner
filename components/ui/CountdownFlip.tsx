"use client";

import React, { useState, useEffect } from "react";
import { getEventCountdown } from "@/lib/utils/date";

interface CountdownFlipProps {
  eventDate: string;
}

export function CountdownFlip({ eventDate }: CountdownFlipProps) {
  const [countdown, setCountdown] = useState(() => getEventCountdown(eventDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getEventCountdown(eventDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  if (countdown.isPast) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-saffron-500/10 border border-saffron-500/30 text-saffron-300 font-semibold text-center justify-center">
        <span>✨ The celebration has arrived! Shubh Utsav! ✨</span>
      </div>
    );
  }

  const digits = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Mins", value: countdown.minutes },
    { label: "Secs", value: countdown.seconds },
  ];

  return (
    <div
      role="timer"
      aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes and ${countdown.seconds} seconds until celebration`}
      className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4"
    >
      {digits.map((digit) => (
        <div key={digit.label} className="flex flex-col items-center">
          <div className="relative w-16 h-18 sm:w-20 sm:h-22 rounded-xl bg-gradient-to-b from-plum-900 to-plum-950 border border-plum-700/60 shadow-elevation-2 flex items-center justify-center overflow-hidden">
            {/* Center Split Line */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 h-[1px] bg-plum-950/90 z-10"
            />
            {/* Number Display */}
            <span className="font-display text-2xl sm:text-3xl font-bold text-saffron-300 tracking-tight">
              {String(digit.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[11px] font-medium text-ivory-300/80 mt-1 uppercase tracking-wider">
            {digit.label}
          </span>
        </div>
      ))}
    </div>
  );
}

