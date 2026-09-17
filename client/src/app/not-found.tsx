"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#111827] font-sans antialiased flex flex-col justify-between p-6 sm:p-12 select-none">
      {/* Top minimal status bar */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between text-xs font-mono uppercase tracking-widest text-neutral-400">
        <span>Error 404</span>
        <span>Page Missing</span>
      </div>

      {/* Main Content: Normal, Clean & Bold */}
      <main className="w-full max-w-2xl mx-auto text-center py-12">
        {/* Giant Bold 404 */}
        <div className="text-8xl sm:text-9xl font-black tracking-tighter text-[#111827] leading-none mb-4 select-none">
          404
        </div>

        {/* Bold Headline */}
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#111827] uppercase mb-4">
          Oops! Page Not Found.
        </h1>

        {/* Sarcastic Copy */}
        <p className="text-base sm:text-lg text-[#4b5563] font-medium leading-relaxed max-w-lg mx-auto mb-8">
          This page doesn&apos;t exist. Stop wasting your time here like you do hunting down dead apply links across broken career portals.
        </p>

        {/* Normal Bold Pill Button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111827] hover:bg-[#1f2937] text-white px-8 py-3.5 text-sm font-bold tracking-tight transition-all active:scale-[0.98] shadow-md shadow-neutral-900/10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>

      {/* Bottom minimal note */}
      <footer className="w-full max-w-2xl mx-auto text-center text-xs font-mono text-neutral-400 pt-6 border-t border-neutral-200">
        404 // DEAD END
      </footer>
    </div>
  );
}
