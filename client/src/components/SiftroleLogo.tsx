"use client";

import React from "react";
import Link from "next/link";

interface SiftroleLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "massive" | number;
  variant?: "mark-only" | "with-text" | "footer-emblem";
  className?: string;
  themeColor?: "emerald" | "light" | "dark" | "gradient";
  showDot?: boolean;
}

export function SiftroleLogoMark({
  size = 32,
  className = "",
  themeColor = "gradient",
}: {
  size?: number;
  className?: string;
  themeColor?: "emerald" | "light" | "dark" | "gradient";
}) {
  const gradId = `siftrole-logo-grad-${Math.random().toString(36).substring(2, 7)}`;
  const accentGradId = `siftrole-logo-acc-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="Siftrole Logo Mark"
    >
      <defs>
        {themeColor === "light" ? (
          <>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id={accentGradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </>
        ) : themeColor === "dark" ? (
          <>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14281a" />
              <stop offset="100%" stopColor="#083327" />
            </linearGradient>
            <linearGradient id={accentGradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#083327" />
              <stop offset="100%" stopColor="#14281a" />
            </linearGradient>
          </>
        ) : (
          <>
            <linearGradient id={gradId} x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#9df065" />
              <stop offset="50%" stopColor="#84d64f" />
              <stop offset="100%" stopColor="#489e1b" />
            </linearGradient>
            <linearGradient id={accentGradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3c7818" />
              <stop offset="100%" stopColor="#84d64f" />
            </linearGradient>
          </>
        )}
      </defs>

      {/* Top / Left Sweeping Wing Curve */}
      <path
        d="M 58 12 C 34 12 18 30 18 52 C 18 64 24 74 34 81 C 30 72 31 59 40 51 C 49 42 66 43 83 29 C 87 25 89 20 89 19 C 80 14 70 12 58 12 Z"
        fill={`url(#${gradId})`}
      />

      {/* Bottom Sweeping Crescent Wing */}
      <path
        d="M 36 61 C 42 67 52 71 65 71 C 78 71 89 63 94 54 C 95 62 92 73 83 81 C 71 91 53 93 38 88 C 28 85 22 79 19 72 C 24 70 31 66 36 61 Z"
        fill={`url(#${accentGradId})`}
      />

      {/* Center Dynamic Sweep Link */}
      <path
        d="M 37 62 C 48 70 68 70 88 56 C 89 55 86 63 79 70 C 68 81 50 82 37 76 C 32 73 28 68 26 62 C 30 63 33 63 37 62 Z"
        fill={`url(#${gradId})`}
        opacity="0.9"
      />
    </svg>
  );
}

export function SiftroleLogo({
  size = "md",
  variant = "with-text",
  className = "",
  themeColor = "gradient",
}: SiftroleLogoProps) {
  let pixelSize = 32;
  if (typeof size === "number") pixelSize = size;
  else if (size === "sm") pixelSize = 24;
  else if (size === "md") pixelSize = 32;
  else if (size === "lg") pixelSize = 44;
  else if (size === "xl") pixelSize = 64;
  else if (size === "massive") pixelSize = 140;

  if (variant === "mark-only") {
    return <SiftroleLogoMark size={pixelSize} className={className} themeColor={themeColor} />;
  }

  if (variant === "footer-emblem") {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <SiftroleLogoMark size={pixelSize} themeColor={themeColor} />
        <span className="text-[2.2rem] sm:text-[2.8rem] font-black tracking-[-0.04em] uppercase text-[#14281a]">
          SIFT<span className="text-[#58a826]">ROLE</span>
        </span>
      </div>
    );
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <SiftroleLogoMark size={pixelSize} themeColor={themeColor} />
      <span className="text-xl sm:text-2xl font-black tracking-[-0.04em] text-[#121816]">
        Sift<span className="text-[#58a826] transition-colors group-hover:text-[#4a911e]">role</span>
      </span>
    </Link>
  );
}
