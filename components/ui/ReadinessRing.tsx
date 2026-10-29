import React from "react";

interface ReadinessRingProps {
  percentage: number;
  completedTasks: number;
  totalTasks: number;
  size?: number;
  strokeWidth?: number;
}

export function ReadinessRing({
  percentage,
  completedTasks,
  totalTasks,
  size = 140,
  strokeWidth = 12,
}: ReadinessRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Readiness: ${percentage}% (${completedTasks} of ${totalTasks} tasks completed)`}
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB000" />
            <stop offset="50%" stopColor="#E8457C" />
            <stop offset="100%" stopColor="#B875D3" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(77, 17, 100, 0.4)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#readinessGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold text-ivory-100">
          {percentage}%
        </span>
        <span className="text-[10px] uppercase font-semibold text-saffron-400 tracking-wider">
          Ready
        </span>
      </div>
    </div>
  );
}

