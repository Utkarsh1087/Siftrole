"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface SiftroleLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "massive" | number;
  variant?: "mark-only" | "with-text" | "wordmark-o" | "footer-emblem";
  className?: string;
  priority?: boolean;
}

export function SiftroleLogoMark({
  size = 32,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 select-none inline-flex items-center justify-center transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <Image
        src="/images/siftrole-logo.png"
        alt="Siftrole Logo"
        width={size * 2}
        height={size * 2}
        priority={priority}
        className="w-full h-full object-contain drop-shadow-xs"
        unoptimized
      />
    </div>
  );
}

export function SiftroleWordmark({
  className = "",
  uppercase = true,
}: {
  className?: string;
  uppercase?: boolean;
}) {
  if (uppercase) {
    return (
      <span className={`inline-flex items-center select-none font-black tracking-[-0.04em] uppercase leading-none ${className}`}>
        <span>SIFTR</span>
        <span className="inline-flex items-center justify-center w-[0.98em] h-[0.98em] mx-[0.02em] relative shrink-0">
          <Image
            src="/images/siftrole-logo.png"
            alt="O"
            width={380}
            height={380}
            className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(132,214,79,0.35)]"
            unoptimized
          />
        </span>
        <span>LE</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center select-none font-black tracking-[-0.04em] leading-none ${className}`}>
      <span>Siftr</span>
      <span className="inline-flex items-center justify-center w-[0.96em] h-[0.96em] mx-[0.02em] relative shrink-0">
        <Image
          src="/images/siftrole-logo.png"
          alt="o"
          width={128}
          height={128}
          className="w-full h-full object-contain drop-shadow-xs"
          unoptimized
        />
      </span>
      <span>le</span>
    </span>
  );
}

export function SiftroleLogo({
  size = "md",
  variant = "with-text",
  className = "",
  priority = false,
}: SiftroleLogoProps) {
  let pixelSize = 32;
  if (typeof size === "number") pixelSize = size;
  else if (size === "sm") pixelSize = 24;
  else if (size === "md") pixelSize = 32;
  else if (size === "lg") pixelSize = 44;
  else if (size === "xl") pixelSize = 64;
  else if (size === "massive") pixelSize = 140;

  if (variant === "mark-only") {
    return <SiftroleLogoMark size={pixelSize} className={className} priority={priority} />;
  }

  if (variant === "wordmark-o") {
    return (
      <Link href="/" className={`inline-flex items-center group ${className}`}>
        <SiftroleWordmark className="text-xl sm:text-2xl text-[#121816]" uppercase={false} />
      </Link>
    );
  }

  if (variant === "footer-emblem") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <SiftroleWordmark className="text-[12vw] sm:text-[13vw] text-[#14281a]" uppercase={true} />
      </div>
    );
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <SiftroleLogoMark size={pixelSize} priority={priority} />
      <span className="text-xl sm:text-2xl font-black tracking-[-0.04em] text-[#121816]">
        Sift<span className="text-[#58a826] transition-colors group-hover:text-[#4a911e]">role</span>
      </span>
    </Link>
  );
}
