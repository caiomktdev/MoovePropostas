"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

export function ScoreRing({
  value,
  size = 132,
  label,
  className,
}: {
  value: number;
  size?: number;
  label: string;
  className?: string;
}) {
  const gradientId = useId();
  const [shown, setShown] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, shown));

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const duration = 1100;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 132 132" className="-rotate-90">
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId.replace(/:/g, "")})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
        />
        <defs>
          <linearGradient id={gradientId.replace(/:/g, "")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="50%" stopColor="#5E2BFF" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex rotate-0 flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold tracking-tight">{shown}</span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted">/ 100</span>
      </div>
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{label}</p>
    </div>
  );
}
