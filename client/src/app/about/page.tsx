"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Target,
  RefreshCw,
  CheckCircle2,
  Lock,
  Building2,
  TrendingUp,
  Cpu,
  Mail,
  Flame,
  ListTodo,
  Layers,
  BookmarkCheck,
  SendHorizontal,
} from "lucide-react";
import { LiquidSilkBackground } from "@/components/LiquidSilkBackground";
import { NewsletterSection } from "@/components/NewsletterSection";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";
import { useAuth } from "@/lib/useAuth";

export default function AboutPage() {
  const [subscribedEmail, setSubscribedEmail] = useState(false);
  const { isLoggedIn } = useAuth();

  return (
    <main className="min-h-screen bg-[#fdfcf9] bg-canvas-white text-[#02110c] font-sans antialiased selection:bg-[#008561]/20 selection:text-[#02110c]">
      {/* Subtle Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#008561]/8 via-transparent to-transparent blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pt-4 pb-20">
        
        {/* ======================================================== */}
        {/* TOP NAVBAR */}
        {/* ======================================================== */}
        <header className="sticky top-4 z-50 rounded-[20px] border border-[#eadecc] bg-white/95 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(2,17,12,0.04)] transition-all">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              {!isLoggedIn && (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#faf8f5] hover:bg-white px-3.5 py-2 text-xs font-lora font-bold text-[#02110c] transition border border-[#eadecc]"
                >
                  <ChevronLeft className="w-4 h-4 text-[#008561]" /> Home
                </Link>
              )}

              <Link href="/" className="flex items-center gap-2.5 group">
                <SiftroleLogoMark size={28} />
                <span className="font-bodoni-moda text-[1.85rem] font-extrabold italic tracking-[-0.02em] text-[#02110c]">
                  Sift<span className="text-[#008561] transition-colors group-hover:text-[#008561]">role</span>
                </span>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-[1rem] font-lora font-medium text-[#083D2E]/85">
              <Link href="/jobs" className="hover:text-[#083D2E] transition-colors">
                All Jobs
              </Link>
              <Link href="/cold-email" className="hover:text-[#083D2E] transition-colors">
                HR Outreach
              </Link>
              <Link href="/about" className="text-[#083D2E] font-bold hover:text-[#008561] transition-colors">
                About
              </Link>
              <Link href="/#faq" className="hover:text-[#083D2E] transition-colors">
                FAQ
              </Link>
            </nav>

            {/* Right Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/jobs"
                    className="hidden sm:inline-flex text-xs font-lora font-bold text-[#083D2E] hover:text-[#008561] px-3 py-2 transition"
                  >
                    Explore Roles
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-[#00D793] hover:bg-[#00bf83] px-5 py-2.5 text-xs sm:text-[0.92rem] font-lora font-bold text-[#083D2E] shadow-md shadow-[#00D793]/25 transition active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
                  >
                    Go to Dashboard <ArrowRight className="w-3.5 h-3.5 text-[#083D2E]" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs sm:text-[0.92rem] font-lora font-bold text-[#083D2E] hover:text-[#008561] px-3 py-2 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    className="rounded-full bg-[#00D793] hover:bg-[#00bf83] px-4 sm:px-5 py-2.5 text-xs sm:text-[0.92rem] font-lora font-bold text-[#083D2E] shadow-md shadow-[#00D793]/25 transition active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Sign Up <ArrowRight className="w-3.5 h-3.5 text-[#083D2E]" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* HERO SECTION */}
        {/* ======================================================== */}
        <section className="mt-12 sm:mt-16 text-center max-w-[960px] mx-auto">
          <h1 className="text-[3rem] sm:text-[4.2rem] lg:text-[4.8rem] font-pochaevsk font-bold leading-[1.05] tracking-tight text-[#02110c]">
            All big company openings. <br className="hidden sm:block" />
            <span className="text-[#008561]">In one single place.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl leading-[1.7] text-[#495e54] max-w-[800px] mx-auto">
            Siftrole solves the chaos of hunting for tech jobs across dozens of fragmented career sites. We are the ultimate checklist for engineering jobs and internships so you never miss an opportunity again.
          </p>
        </section>

        {/* ======================================================== */}
        {/* OUR CORE AIM CARD (MISSION STATEMENT) */}
        {/* ======================================================== */}
        <section className="mt-16 sm:mt-20">
          <div className="rounded-[32px] sm:rounded-[36px] border border-[#008561]/30 bg-[#02110c] p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
            {/* Emerald Leaf Texture Background */}
            <Image
              src="/images/about_hero_leaf_bg.jpg"
              alt="Emerald leaf texture background"
              fill
              priority
              className="object-cover object-center pointer-events-none opacity-95"
            />
            {/* Translucent overlay preserving leaf texture vibrancy and text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#02110c]/85 via-[#02110c]/55 to-black/25 pointer-events-none" />

            <div className="relative z-10 max-w-[860px]">
              <h2 className="text-[2.2rem] sm:text-[3rem] lg:text-[3.4rem] font-pochaevsk font-bold leading-[1.12] tracking-tight text-white">
                The ultimate application checklist so no student or developer misses a live role.
              </h2>

              <p className="mt-6 text-sm sm:text-base lg:text-lg leading-[1.75] text-[#fff6eb]/90">
                Finding job and internship openings should not require checking 50 company career pages every single morning. Siftrole monitors official career portals across top engineering companies in real time, organizes them into a clean actionable checklist, and lets you track exactly where you have applied.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/jobs"
                  className="rounded-full bg-[#008561] hover:bg-[#006e50] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-[0.98] inline-flex items-center gap-2"
                >
                  Browse Checklist <ArrowRight className="w-4 h-4 text-white" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/25 bg-white/10 hover:bg-white/20 px-6 py-3.5 text-sm font-bold text-white transition cursor-pointer"
                >
                  Track My Applications
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3 PROBLEMS SOLVED */}
        {/* ======================================================== */}
        <section className="mt-20 sm:mt-28">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#008561]">
              The Problem We Solve
            </span>
            <h2 className="mt-2 text-[2.4rem] sm:text-[3.2rem] font-pochaevsk font-bold tracking-tight text-[#02110c]">
              Why Job Hunting for Students is Broken
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#495e54]">
              Three painful issues every aspiring engineer encounters when looking for tech roles: and how Siftrole fixes them forever.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Problem 1 */}
            <div className="group rounded-[28px] border border-[#eadecc] bg-white p-7 sm:p-8 shadow-[0_2px_12px_rgba(2,17,12,0.03)] transition-all duration-300 hover:border-[#008561] hover:shadow-[0_12px_32px_rgba(0,133,97,0.08)] hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#008561]/10 border border-[#008561]/25 flex items-center justify-center text-[#008561] group-hover:bg-[#008561] group-hover:text-white group-hover:border-[#008561] transition-all duration-300 shadow-2xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="rounded-full border border-[#eadecc] bg-[#faf8f5] group-hover:border-[#008561] px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-wider text-[#02110c] transition-colors shadow-2xs">
                    Problem 01
                  </span>
                </div>
                <h3 className="text-xl sm:text-[1.35rem] font-pochaevsk font-bold text-[#02110c] tracking-tight transition-colors">
                  Scattered Across 50+ Career Sites
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-[1.7] text-[#495e54] transition-colors">
                  Big tech companies post on their own individual ATS career pages. Checking each portal every day is overwhelming and causes candidates to miss crucial application windows.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-[#eadecc] group-hover:border-[#008561]/20 transition-colors">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#008561]/10 border border-[#008561]/25 group-hover:bg-white px-3.5 py-2 text-xs font-bold text-[#008561] transition-all shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#008561] shrink-0" />
                  <span>Siftrole Fix: Centralized Big Tech Feed</span>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="group rounded-[28px] border border-[#eadecc] bg-white p-7 sm:p-8 shadow-[0_2px_12px_rgba(2,17,12,0.03)] transition-all duration-300 hover:border-[#008561] hover:shadow-[0_12px_32px_rgba(0,133,97,0.08)] hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#008561]/10 border border-[#008561]/25 flex items-center justify-center text-[#008561] group-hover:bg-[#008561] group-hover:text-white group-hover:border-[#008561] transition-all duration-300 shadow-2xs">
                    <ListTodo className="w-6 h-6" />
                  </div>
                  <span className="rounded-full border border-[#eadecc] bg-[#faf8f5] group-hover:border-[#008561] px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-wider text-[#02110c] transition-colors shadow-2xs">
                    Problem 02
                  </span>
                </div>
                <h3 className="text-xl sm:text-[1.35rem] font-pochaevsk font-bold text-[#02110c] tracking-tight transition-colors">
                  No Built-in Tracking System
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-[1.7] text-[#495e54] transition-colors">
                  Students struggle to remember where they submitted resumes, what status each application is in, or which openings they still need to apply to.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-[#eadecc] group-hover:border-[#008561]/20 transition-colors">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#008561]/10 border border-[#008561]/25 group-hover:bg-white px-3.5 py-2 text-xs font-bold text-[#008561] transition-all shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#008561] shrink-0" />
                  <span>Siftrole Fix: Integrated Application Tracker</span>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="group rounded-[28px] border border-[#eadecc] bg-white p-7 sm:p-8 shadow-[0_2px_12px_rgba(2,17,12,0.03)] transition-all duration-300 hover:border-[#008561] hover:shadow-[0_12px_32px_rgba(0,133,97,0.08)] hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#008561]/10 border border-[#008561]/25 flex items-center justify-center text-[#008561] group-hover:bg-[#008561] group-hover:text-white group-hover:border-[#008561] transition-all duration-300 shadow-2xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="rounded-full border border-[#eadecc] bg-[#faf8f5] group-hover:border-[#008561] px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-wider text-[#02110c] transition-colors shadow-2xs">
                    Problem 03
                  </span>
                </div>
                <h3 className="text-xl sm:text-[1.35rem] font-pochaevsk font-bold text-[#02110c] tracking-tight transition-colors">
                  Manual & Mismatched Job Hunting
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-[1.7] text-[#495e54] transition-colors">
                  Candidates waste dozens of hours scrolling through hundreds of openings that do not match their tech stack, graduation year, or experience level.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-[#eadecc] group-hover:border-[#008561]/20 transition-colors">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#008561]/10 border border-[#008561]/25 group-hover:bg-white px-3.5 py-2 text-xs font-bold text-[#008561] transition-all shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#008561] shrink-0" />
                  <span>Siftrole Fix: Instant AI Resume Fit & Job Search</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* OUR 4 PILLARS */}
        {/* ======================================================== */}
        <section className="mt-20 sm:mt-28">
          <div className="rounded-[32px] border border-[#eadecc] bg-white p-8 sm:p-12 lg:p-16 shadow-[0_4px_20px_rgba(2,17,12,0.03)]">
            <div className="max-w-[720px] mb-12">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#008561]">
                Built for Students & Builders
              </span>
              <h2 className="mt-2 text-[2.2rem] sm:text-[3rem] font-pochaevsk font-bold tracking-tight text-[#02110c]">
                How Siftrole Powers Your Search
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#495e54]">
                Everything you need to discover, organize, and apply to top engineering roles without missing a beat.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#008561]/10 text-[#008561] flex items-center justify-center font-bold text-sm mb-4 border border-[#008561]/20">
                  01
                </div>
                <h4 className="text-lg font-pochaevsk font-bold text-[#02110c]">All Openings at One Place</h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#495e54]">
                  Continuous ingestion directly from official company feeds ensures every internship and job is listed here first.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#008561]/10 text-[#008561] flex items-center justify-center font-bold text-sm mb-4 border border-[#008561]/20">
                  02
                </div>
                <h4 className="text-lg font-pochaevsk font-bold text-[#02110c]">The Application Checklist</h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#495e54]">
                  Never lose track of where you've applied. Mark roles as applied, bookmarked, or in review with a single click.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#008561]/10 text-[#008561] flex items-center justify-center font-bold text-sm mb-4 border border-[#008561]/20">
                  03
                </div>
                <h4 className="text-lg font-pochaevsk font-bold text-[#02110c]">Zero Ghost Postings</h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#495e54]">
                  When a company fills an opening, it auto-expires from our checklist within minutes to protect your application time.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#008561]/10 text-[#008561] flex items-center justify-center font-bold text-sm mb-4 border border-[#008561]/20">
                  04
                </div>
                <h4 className="text-lg font-pochaevsk font-bold text-[#02110c]">AI Matching Opportunities</h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#495e54]">
                  Upload your resume to instantly rank and surface the highest-matching engineering opportunities tailored specifically to your skillset.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* STATS STRIP */}
        {/* ======================================================== */}
        <section className="mt-16 sm:mt-24 border-y border-[#eedfc9] py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-[2.8rem] sm:text-[3.5rem] font-pochaevsk font-bold text-[#02110c] tracking-tight">100%</div>
              <div className="text-xs sm:text-sm font-bold text-[#55615b]">Direct Company Openings</div>
            </div>
            <div>
              <div className="text-[2.8rem] sm:text-[3.5rem] font-pochaevsk font-bold text-[#008561] tracking-tight">0</div>
              <div className="text-xs sm:text-sm font-bold text-[#55615b]">Missed Opportunities</div>
            </div>
            <div>
              <div className="text-[2.8rem] sm:text-[3.5rem] font-pochaevsk font-bold text-[#02110c] tracking-tight">1-Click</div>
              <div className="text-xs sm:text-sm font-bold text-[#55615b]">Checklist & Tracking</div>
            </div>
            <div>
              <div className="text-[2.8rem] sm:text-[3.5rem] font-pochaevsk font-bold text-[#008561] tracking-tight">AI-Match</div>
              <div className="text-xs sm:text-sm font-bold text-[#55615b]">Resume Fit & Scoring</div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* EXACT EMERALD SILK NEWSLETTER CARD */}
        {/* ======================================================== */}
        <NewsletterSection />

        {/* ======================================================== */}
        {/* EXACT ORIGINAL BRAND FOOTER WITH NATURAL TRACKING */}
        {/* ======================================================== */}
        <footer className="mt-16 sm:mt-24 pt-10 border-t border-[#eedfc9]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[1.8rem] font-black tracking-[-0.04em] text-[#02110c]">
                Sift<span className="text-[#008561]">role</span>
              </span>
              <span className="text-xs font-semibold text-[#55615b] ml-2">
                All big tech openings & internships in one place.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-[#55615b]">
              <Link href="/jobs" className="hover:text-[#02110c] transition">
                All Roles
              </Link>
              <Link href="/about" className="text-[#008561] hover:text-[#02110c] transition">
                About
              </Link>
              <Link href="/#faq" className="hover:text-[#02110c] transition">
                FAQ
              </Link>
              <Link href="/login" className="hover:text-[#02110c] transition">
                Sign In
              </Link>
              <span className="text-[#79857f] font-normal">
                © {new Date().getFullYear()} Siftrole. All rights reserved.
              </span>
            </div>
          </div>

          {/* SIFTR[O]LE giant bottom wordmark with logo as letter O */}
          <div className="mt-12 select-none overflow-hidden flex items-center justify-center font-black uppercase text-[#02110c] leading-none tracking-[-0.04em]">
            <span className="text-[12.5vw] sm:text-[13.5vw]">SIFTR</span>
            <span className="inline-flex items-center justify-center w-[10vw] h-[10vw] sm:w-[11vw] sm:h-[11vw] max-w-[190px] max-h-[190px] min-w-[42px] min-h-[42px] mx-[0.03em] relative shrink-0">
              <Image
                src="/images/siftrole-logo.png"
                alt="O"
                width={400}
                height={400}
                className="w-full h-full object-contain drop-shadow-[0_10px_24px_rgba(0,133,97,0.22)]"
                unoptimized
              />
            </span>
            <span className="text-[12.5vw] sm:text-[13.5vw]">LE</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
