"use client";

import React, { useState, useRef, useCallback } from "react";
import { useUtsav } from "@/hooks/useUtsavStore";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 7,
  ...props
}: TiltCardProps) {
  const { settings } = useUtsav();
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("");
  const [glossPosition, setGlossPosition] = useState<{ x: number; y: number } | null>(null);

  const isReduced = settings.reduceMotion;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isReduced || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTransform(
        `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      );
      setGlossPosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    },
    [isReduced, maxTilt],
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlossPosition(null);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isReduced ? "none" : transform,
        transition: isReduced ? "none" : "transform 0.15s ease-out",
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-2xl border border-plum-700/40 bg-plum-900/40 backdrop-blur-md overflow-hidden shadow-glass group ${className}`}
      {...props}
    >
      {/* Gloss sweep on hover */}
      {glossPosition && !isReduced && (
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${glossPosition.x}% ${glossPosition.y}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`,
          }}
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
        />
      )}
      <div style={{ transform: isReduced ? "none" : "translateZ(10px)" }}>{children}</div>
    </div>
  );
}

