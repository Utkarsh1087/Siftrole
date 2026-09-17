"use client";

import React from "react";
import Link from "next/link";

interface SiftroleLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | number;
  variant?: "mark-only" | "with-text";
  className?: string;
  themeColor?: "emerald" | "light" | "dark" | "gradient";
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
  const gradId = `siftrole-admin-logo-${Math.random().toString(36).substring(2, 7)}`;
  const accentGradId = `siftrole-admin-acc-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="Siftrole Admin Logo"
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

export function SiftroleAdminLogo({
  size = "md",
  variant = "with-text",
  className = "",
}: SiftroleLogoProps) {
  let pixelSize = 28;
  if (typeof size === "number") pixelSize = size;
  else if (size === "sm") pixelSize = 22;
  else if (size === "md") pixelSize = 28;
  else if (size === "lg") pixelSize = 36;
  else if (size === "xl") pixelSize = 48;

  if (variant === "mark-only") {
    return <SiftroleLogoMark size={pixelSize} className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <SiftroleLogoMark size={pixelSize} />
      <span className="text-lg font-black tracking-[-0.03em] text-[#083327]">
        Sift<span className="text-[#58a826]">role</span>
      </span>
    </div>
  );
}
