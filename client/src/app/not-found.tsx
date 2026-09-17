"use client";

import React from "react";
import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      {/* Platform Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#84d64f]/18 via-[#84d64f]/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute -bottom-[20%] right-[-10%] w-[500px] h-[350px] bg-[#84d64f]/10 blur-3xl rounded-full" />
      </div>

      {/* Top Status Bar */}
      <div className="relative z-10 w-full max-w-3xl mx-auto flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#55615b]">
        <span className="inline-flex items-center gap-1.5 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#84d64f] animate-ping" />
          HTTP 404
        </span>
        <span className="font-semibold text-[#14281a]/60">PAGE MISSING</span>
      </div>

      {/* Main Center Content */}
      <main className="relative z-10 w-full max-w-3xl mx-auto text-center py-12">
        {/* Giant Bold 404 with Platform Typography */}
        <div className="font-heading s__code font-black text-[#14281a] tracking-tight leading-none mb-2">
          404
        </div>

        {/* Bold Punchy Headline */}
        <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14281a] leading-[1.1] mb-5">
          This page is a ghost listing.
        </h1>

        {/* Sarcastic Copy */}
        <p className="text-base sm:text-xl font-medium text-[#55615b] max-w-xl mx-auto leading-relaxed mb-10">
          This page doesn&apos;t exist. Stop wasting your time here like you do hunting down dead apply links on broken career portals.
        </p>

        {/* High-Contrast Bold Platform Button */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#14281a] hover:bg-[#1a3422] text-[#84d64f] hover:text-[#95e660] px-8 py-4 text-sm font-heading font-bold tracking-tight transition-all active:scale-[0.98] shadow-lg shadow-[#14281a]/15 cursor-pointer"
          >
            <MoveLeft className="w-4 h-4 text-[#84d64f]" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="relative z-10 w-full max-w-3xl mx-auto text-center text-xs font-mono text-[#79857f] pt-6 border-t border-[#e5e2db]">
        <span>404 // DEAD END</span>
      </footer>
    </div>
  );
}
