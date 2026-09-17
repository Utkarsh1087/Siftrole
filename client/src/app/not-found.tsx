"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MoveLeft } from "lucide-react";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#14281a] font-sans antialiased flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Minimal Top Bar without branding */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#14281a]/50">
        <span>HTTP 404</span>
        <span>NOT FOUND</span>
      </div>

      {/* Hero Content: Bold, Minimal, Punchy */}
      <main className="w-full max-w-3xl mx-auto text-center py-12">
        {/* Animated Minimalist Doodle */}
        <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 mb-8 flex items-center justify-center">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full drop-shadow-sm"
            style={{
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
              transition: "transform 0.12s ease-out",
            }}
          >
            {/* Magnifying Glass Frame */}
            <circle
              cx="75"
              cy="70"
              r="50"
              fill="#ffffff"
              stroke="#14281a"
              strokeWidth="5"
            />
            {/* Green Tint Lens */}
            <circle cx="75" cy="70" r="42" fill="#84d64f" fillOpacity="0.18" />

            {/* Eyes looking around */}
            <g
              style={{
                transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
                transition: "transform 0.08s ease-out",
              }}
            >
              <circle cx="62" cy="66" r="6" fill="#14281a" />
              <circle cx="60.5" cy="64" r="2" fill="#ffffff" />
              <circle cx="88" cy="66" r="6" fill="#14281a" />
              <circle cx="86.5" cy="64" r="2" fill="#ffffff" />
            </g>

            {/* Confused Doodle Mouth */}
            <path
              d="M 67 85 Q 75 79 83 85"
              fill="none"
              stroke="#14281a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Minimal Handle */}
            <path
              d="M 112 107 L 142 137"
              stroke="#14281a"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 112 107 L 134 129"
              stroke="#84d64f"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          {/* Bold 404 Stamp */}
          <div className="absolute -top-1 -right-2 bg-[#14281a] text-[#84d64f] font-mono text-xs font-black px-2.5 py-1 rounded-md tracking-wider">
            404
          </div>
        </div>

        {/* Bold Typography */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#14281a] leading-none mb-5">
          This page doesn&apos;t exist.
        </h1>

        <p className="text-base sm:text-xl font-medium text-[#4a5550] max-w-xl mx-auto leading-relaxed mb-8">
          Stop wasting time here like you do hunting down dead apply buttons on broken career portals.
        </p>

        {/* Minimal Bold Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <Link
            href="/jobs"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#14281a] text-[#84d64f] hover:bg-[#1a3422] px-6 py-3.5 text-sm font-bold tracking-tight transition-all active:scale-[0.98]"
          >
            <span>Find Real Openings</span>
            <ArrowRight className="w-4 h-4 text-[#84d64f]" />
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#14281a]/15 hover:border-[#14281a] bg-transparent text-[#14281a] px-5 py-3.5 text-sm font-bold transition-all active:scale-[0.98]"
          >
            <MoveLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center text-xs text-[#79857f] font-mono pt-6 border-t border-neutral-200/60">
        404 // DEAD END
      </footer>
    </div>
  );
}
