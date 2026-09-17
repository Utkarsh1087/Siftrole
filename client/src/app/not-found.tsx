"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  Home as HomeIcon,
  Search,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Zap,
  ExternalLink,
  ChevronLeft,
  Bot,
} from "lucide-react";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glow Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#84d64f]/20 via-[#84d64f]/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute -bottom-[20%] right-[-10%] w-[600px] h-[400px] bg-[#84d64f]/10 blur-3xl rounded-full" />
      </div>

      {/* Top Brand Header */}
      <header className="relative z-10 w-full max-w-[1440px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-[#14281a] p-1.5 flex items-center justify-center text-[#84d64f] shadow-xs group-hover:scale-105 transition-transform">
            <SiftroleLogoMark className="w-full h-full" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-[#14281a]">
            sift<span className="text-[#3c7818]">role</span>
          </span>
        </Link>

        <Link
          href="/jobs"
          className="rounded-full border border-neutral-200/90 bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-bold text-[#14281a] shadow-2xs transition inline-flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5 text-[#3c7818]" />
          <span>Browse Active Roles</span>
        </Link>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 my-auto py-12 px-6 max-w-3xl mx-auto text-center">
        
        {/* Animated Sift Detective Doodle Character */}
        <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 mb-8 flex items-center justify-center">
          
          {/* Outer Pulsing Glow */}
          <div className="absolute inset-0 rounded-full bg-[#84d64f]/25 blur-2xl animate-pulse" />

          {/* Interactive SVG Doodle */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full relative z-10 drop-shadow-xl select-none"
            style={{
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Magnifying Glass Outer Halo */}
            <circle
              cx="100"
              cy="95"
              r="60"
              fill="#ffffff"
              stroke="#14281a"
              strokeWidth="5"
              className="transition-all"
            />
            {/* Glass Lens Tint */}
            <circle
              cx="100"
              cy="95"
              r="52"
              fill="#eef8e5"
              opacity="0.75"
            />
            
            {/* Cute Detective Face */}
            {/* Left Eye */}
            <g
              style={{
                transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <circle cx="85" cy="90" r="8" fill="#14281a" />
              <circle cx="83" cy="88" r="2.5" fill="#ffffff" />
            </g>

            {/* Right Eye (with detective monocle shine) */}
            <g
              style={{
                transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <circle cx="115" cy="90" r="8" fill="#14281a" />
              <circle cx="113" cy="88" r="2.5" fill="#ffffff" />
            </g>

            {/* Embarrassed / Confused Squiggly Mouth */}
            <path
              d="M 88 112 Q 94 107 100 112 T 112 112"
              fill="none"
              stroke="#14281a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Cute Rosy Cheeks */}
            <circle cx="75" cy="102" r="5" fill="#ffd5df" opacity="0.8" />
            <circle cx="125" cy="102" r="5" fill="#ffd5df" opacity="0.8" />

            {/* Magnifying Glass Handle */}
            <path
              d="M 142 138 L 175 172"
              stroke="#14281a"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 142 138 L 175 172"
              stroke="#84d64f"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Floating Question Marks & Ghost Sparks */}
            <g className="animate-bounce [animation-duration:2.5s]">
              <text
                x="45"
                y="55"
                fontSize="24"
                fontWeight="900"
                fill="#3c7818"
                fontFamily="sans-serif"
              >
                ?
              </text>
            </g>
            <g className="animate-bounce [animation-duration:2s] [animation-delay:0.5s]">
              <text
                x="145"
                y="65"
                fontSize="20"
                fontWeight="900"
                fill="#58a826"
                fontFamily="sans-serif"
              >
                404
              </text>
            </g>
          </svg>

          {/* Floating Dead Link Badge */}
          <div className="absolute -bottom-2 bg-[#14281a] text-[#84d64f] border border-[#84d64f]/40 px-3.5 py-1 rounded-full text-[0.68rem] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#84d64f] animate-ping" />
            <span>404: Certified Dead End</span>
          </div>
        </div>

        {/* Sarcastic & Witty Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#121816] tracking-tight leading-[1.1]">
            This page is a ghost listing.
          </h1>
          <p className="text-sm sm:text-base text-[#55615b] leading-relaxed max-w-xl mx-auto font-medium">
            This page doesn&apos;t exist. Do not waste your precious time here like you do hunting down expired apply links across 47 different career portals.
          </p>
          <p className="text-xs sm:text-sm text-[#79857f] max-w-lg mx-auto">
            At least Siftrole&apos;s job openings are 100% verified and active. This URL, however, is pure fiction.
          </p>
        </div>

        {/* Fun Sarcastic Platform Telemetry Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 max-w-lg mx-auto">
          <span className="rounded-full bg-[#eef8e5] border border-[#cce8be] px-3.5 py-1 text-xs font-bold text-[#2b640e] inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3c7818]" /> 0 Ghost Jobs on Feed
          </span>
          <span className="rounded-full bg-rose-50 border border-rose-200 px-3.5 py-1 text-xs font-bold text-rose-700 inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-rose-500" /> 1 Lost Page Found Here
          </span>
          <span className="rounded-full bg-neutral-100 border border-neutral-200 px-3.5 py-1 text-xs font-bold text-[#4a5550]">
            100% Direct Official Feeds
          </span>
        </div>

        {/* High-Converting Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="w-full sm:w-auto rounded-full bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] px-8 py-3.5 text-sm font-heading font-black shadow-lg shadow-[#84d64f]/30 transition active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Verified Openings</span>
            <ArrowRight className="w-4 h-4 text-[#14281a]" />
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-[#14281a] px-6 py-3.5 text-sm font-bold shadow-2xs transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <HomeIcon className="w-4 h-4 text-[#55615b]" />
            <span>Return to Safety</span>
          </Link>
        </div>

      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 w-full text-center py-6 text-xs text-[#9aa99c]">
        © {new Date().getFullYear()} Siftrole. Verified opportunities directly from official employer career feeds.
      </footer>
    </div>
  );
}
