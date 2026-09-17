"use client";

import React from "react";
import Image from "next/image";

interface SiftroleLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | number;
  variant?: "mark-only" | "with-text";
  className?: string;
}

export function SiftroleLogoMark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 select-none inline-flex items-center justify-center transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <Image
        src="/images/siftrole-logo.png"
        alt="Siftrole Admin Logo"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-contain drop-shadow-xs"
        unoptimized
      />
    </div>
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
