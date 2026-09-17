"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  // Allow pressing Escape key to return to home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      {/* Background Micro Dot Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#14281a_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035]" />

      {/* Ambient Gradient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-[#84d64f]/25 via-[#84d64f]/8 to-transparent blur-3xl opacity-80" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[550px] h-[400px] bg-[#84d64f]/15 blur-3xl rounded-full" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-3xl mx-auto flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#55615b]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-neutral-200/80 shadow-2xs backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#84d64f] animate-ping" />
          <span className="font-bold text-[#14281a]">HTTP 404</span>
        </div>
        <span className="text-[0.7rem] font-semibold tracking-wider text-neutral-400">ROUTE UNRESOLVED</span>
      </header>

      {/* Main Center Card: Glassmorphic & Ultra Stylish */}
      <main className="relative z-10 w-full max-w-2xl mx-auto my-auto py-6">
        <div className="relative rounded-3xl border border-neutral-200/90 bg-white/75 backdrop-blur-xl shadow-2xl shadow-[#14281a]/5 p-8 sm:p-14 text-center overflow-hidden">
          
          {/* Subtle Top Decorative Accent Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#84d64f] to-transparent rounded-full" />

          {/* Giant Stylish 404 Display */}
          <div className="relative inline-block mb-3">
            <span className="font-heading s__code font-black bg-gradient-to-b from-[#14281a] via-[#1a3422] to-[#2e5939] bg-clip-text text-transparent drop-shadow-xs leading-none select-none block">
              404
            </span>
            <div className="absolute -inset-4 bg-[#84d64f]/15 blur-2xl rounded-full -z-10" />
          </div>

          {/* Bold Punchy Headline */}
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-[#14281a] leading-tight mb-4">
            This page is a ghost listing.
          </h1>

          {/* Sarcastic Copy */}
          <p className="text-sm sm:text-base text-[#55615b] font-medium leading-relaxed max-w-lg mx-auto mb-8">
            This page doesn&apos;t exist. Stop wasting your time here like you do hunting down dead apply links on broken career portals.
          </p>

          {/* High-Contrast Bold Action Button */}
          <div className="flex flex-col items-center justify-center gap-3">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#14281a] hover:bg-[#1a3422] text-[#84d64f] hover:text-white px-8 py-3.5 text-sm font-heading font-bold tracking-tight shadow-xl shadow-[#14281a]/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <MoveLeft className="w-4 h-4 text-[#84d64f] group-hover:text-white group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>

            <span className="text-[0.7rem] font-mono text-neutral-400">
              or press <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-300/80 text-neutral-600 font-semibold text-[0.65rem] shadow-2xs">ESC</kbd> to return
            </span>
          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full max-w-3xl mx-auto flex items-center justify-between text-xs font-mono text-[#79857f] pt-4">
        <span>404 // DEAD END</span>
        <span className="text-[0.7rem]">STATUS CODE OK</span>
      </footer>
    </div>
  );
}
