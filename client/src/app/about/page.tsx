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
    <main className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 selection:text-[#14281a]">
      {/* Subtle Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#84d64f]/15 via-[#84d64f]/5 to-transparent blur-3xl opacity-75" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pt-4 pb-20">
        
        {/* ======================================================== */}
        {/* TOP NAVBAR */}
        {/* ======================================================== */}
        <header className="sticky top-4 z-50 rounded-[20px] border border-neutral-200/80 bg-white/85 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 text-xs font-bold text-[#121816] transition"
              >
                <ChevronLeft className="w-4 h-4 text-[#3c7818]" /> Home
              </Link>

              <Link href="/" className="flex items-center gap-2.5 group">
                <SiftroleLogoMark size={28} />
                <span className="text-[1.7rem] font-black tracking-[-0.04em] text-[#121816]">
                  Sift<span className="text-[#58a826] transition-colors group-hover:text-[#4a911e]">role</span>
                </span>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-[0.95rem] font-semibold text-[#55615b]">
              <Link href="/jobs" className="hover:text-[#121816] transition-colors">
                All Jobs
              </Link>
              <Link href="/cold-email" className="hover:text-[#121816] transition-colors">
                HR Outreach
              </Link>
              <Link href="/about" className="text-[#3c7818] font-bold hover:text-[#58a826] transition-colors">
                About
              </Link>
              <Link href="/#faq" className="hover:text-[#121816] transition-colors">
                FAQ
              </Link>
            </nav>

            {/* Right Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/jobs"
                    className="hidden sm:inline-flex text-xs font-bold text-[#55615b] hover:text-[#121816] px-3 py-2 transition"
                  >
                    Explore Roles
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-5 py-2.5 text-xs sm:text-[0.9rem] font-heading font-bold text-[#14281a] shadow-md shadow-[#84d64f]/25 transition active:scale-[0.98] inline-flex items-center gap-2"
                  >
                    Go to Dashboard <ArrowRight className="w-3.5 h-3.5 text-[#14281a]" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs sm:text-[0.9rem] font-bold text-[#55615b] hover:text-[#121816] px-3 py-2 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-4 sm:px-5 py-2.5 text-xs sm:text-[0.9rem] font-heading font-bold text-[#14281a] shadow-md shadow-[#84d64f]/25 transition active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    Sign Up <ArrowRight className="w-3.5 h-3.5 text-[#14281a]" />
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
          <h1 className="text-[3rem] sm:text-[4.2rem] lg:text-[4.8rem] font-black leading-[1.05] tracking-[-0.04em] text-[#121816]">
            All big company openings. <br className="hidden sm:block" />
            <span className="text-[#58a826]">In one single place.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl leading-[1.7] text-[#55615b] max-w-[800px] mx-auto">
            Siftrole solves the chaos of hunting for tech jobs across dozens of fragmented career sites. We are the ultimate checklist for engineering jobs and internships so you never miss an opportunity again.
          </p>
        </section>

        {/* ======================================================== */}
        {/* OUR CORE AIM CARD (MISSION STATEMENT) */}
        {/* ======================================================== */}
        <section className="mt-16 sm:mt-20">
          <div className="rounded-[32px] sm:rounded-[36px] border border-[#14281a]/40 bg-[#14281a] p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
            {/* Static Texture Background */}
            <Image
              src="/images/about_mission_emerald_bg.jpg"
              alt="Mission texture background"
              fill
              priority
              className="object-cover object-center pointer-events-none opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a180e]/90 via-[#0a180e]/75 to-[#0a180e]/50 pointer-events-none" />

            <div className="relative z-10 max-w-[860px]">
              <h2 className="text-[2.2rem] sm:text-[3rem] lg:text-[3.4rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-white">
                The ultimate application checklist so no student or developer misses a live role.
              </h2>

              <p className="mt-6 text-sm sm:text-base lg:text-lg leading-[1.75] text-[#eef8e5]/90">
                Finding job and internship openings should not require checking 50 company career pages every single morning. Siftrole monitors official career portals across top engineering companies in real time, organizes them into a clean actionable checklist, and lets you track exactly where you have applied.
              </p>

              {/* Upcoming Feature Callout */}
              <div className="mt-6 inline-flex items-center gap-2.5 rounded-2xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#84d64f]">
                <Sparkles className="w-4 h-4 text-[#84d64f] shrink-0" />
                <span>Coming Soon: 1-Click Automated Easy Apply directly to verified company portals.</span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/jobs"
                  className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-6 py-3.5 text-sm font-heading font-bold text-[#14281a] shadow-lg shadow-black/20 transition active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
                >
                  Start Your Application Checklist <ArrowRight className="w-4 h-4 text-[#14281a]" />
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
        {/* THE PROBLEMS WE SOLVE */}
        {/* ======================================================== */}
        <section className="mt-20 sm:mt-28">
          <div className="text-center max-w-[700px] mx-auto mb-12">
            <h2 className="text-[2.2rem] sm:text-[2.8rem] font-black tracking-[-0.035em] text-[#121816]">
              Why Job Hunting Needed a Central Checklist
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#55615b]">
              Job seekers waste hundreds of hours navigating scattered portals, losing track of deadlines, and applying to expired links.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Problem 1 */}
            <div className="group rounded-[28px] border border-neutral-200/90 bg-white p-7 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[#84d64f] hover:bg-[#eef8e5] hover:shadow-[0_12px_32px_rgba(132,214,79,0.12)] hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#eef8e5] border border-[#cce8be] flex items-center justify-center text-[#3c7818] group-hover:bg-[#14281a] group-hover:text-[#84d64f] group-hover:border-[#14281a] transition-all duration-300 shadow-2xs">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="rounded-full border border-neutral-300/80 bg-white/90 group-hover:border-[#84d64f] group-hover:bg-white px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-wider text-[#14281a] transition-colors shadow-2xs">
                    Problem 01
                  </span>
                </div>
                <h3 className="text-xl sm:text-[1.35rem] font-black text-[#121816] tracking-tight group-hover:text-[#14281a] transition-colors">
                  Scattered Across 50+ Career Sites
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-[1.7] text-[#55615b] group-hover:text-[#284236] transition-colors">
                  Big tech companies post on their own individual ATS career pages. Checking each portal every day is overwhelming and causes candidates to miss crucial application windows.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-neutral-200/70 group-hover:border-[#cce8be] transition-colors">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#eef8e5] border border-[#cce8be] group-hover:bg-white px-3.5 py-2 text-xs font-black text-[#14281a] transition-all shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#3c7818] shrink-0" />
                  <span>Siftrole Fix: Centralized Big Tech Feed</span>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="group rounded-[28px] border border-neutral-200/90 bg-white p-7 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[#84d64f] hover:bg-[#eef8e5] hover:shadow-[0_12px_32px_rgba(132,214,79,0.12)] hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#eef8e5] border border-[#cce8be] flex items-center justify-center text-[#3c7818] group-hover:bg-[#14281a] group-hover:text-[#84d64f] group-hover:border-[#14281a] transition-all duration-300 shadow-2xs">
                    <ListTodo className="w-6 h-6" />
                  </div>
                  <span className="rounded-full border border-neutral-300/80 bg-white/90 group-hover:border-[#84d64f] group-hover:bg-white px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-wider text-[#14281a] transition-colors shadow-2xs">
                    Problem 02
                  </span>
                </div>
                <h3 className="text-xl sm:text-[1.35rem] font-black text-[#121816] tracking-tight group-hover:text-[#14281a] transition-colors">
                  No Built-in Tracking System
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-[1.7] text-[#55615b] group-hover:text-[#284236] transition-colors">
                  Students struggle to remember where they submitted resumes, what status each application is in, or which openings they still need to apply to.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-neutral-200/70 group-hover:border-[#cce8be] transition-colors">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#eef8e5] border border-[#cce8be] group-hover:bg-white px-3.5 py-2 text-xs font-black text-[#14281a] transition-all shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#3c7818] shrink-0" />
                  <span>Siftrole Fix: Integrated Application Tracker</span>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="group rounded-[28px] border border-neutral-200/90 bg-white p-7 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[#84d64f] hover:bg-[#eef8e5] hover:shadow-[0_12px_32px_rgba(132,214,79,0.12)] hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#eef8e5] border border-[#cce8be] flex items-center justify-center text-[#3c7818] group-hover:bg-[#14281a] group-hover:text-[#84d64f] group-hover:border-[#14281a] transition-all duration-300 shadow-2xs">
                    <SendHorizontal className="w-6 h-6" />
                  </div>
                  <span className="rounded-full border border-neutral-300/80 bg-white/90 group-hover:border-[#84d64f] group-hover:bg-white px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-wider text-[#14281a] transition-colors shadow-2xs">
                    Problem 03
                  </span>
                </div>
                <h3 className="text-xl sm:text-[1.35rem] font-black text-[#121816] tracking-tight group-hover:text-[#14281a] transition-colors">
                  Tedious Repetitive Forms
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-[1.7] text-[#55615b] group-hover:text-[#284236] transition-colors">
                  Re-entering the same contact information, work history, and resume across dozens of different company forms wastes valuable engineering time.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-neutral-200/70 group-hover:border-[#cce8be] transition-colors">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#eef8e5] border border-[#cce8be] group-hover:bg-white px-3.5 py-2 text-xs font-black text-[#14281a] transition-all shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#3c7818] shrink-0" />
                  <span>Siftrole Fix: Upcoming 1-Click Easy Apply</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* OUR 4 PILLARS */}
        {/* ======================================================== */}
        <section className="mt-20 sm:mt-28">
          <div className="rounded-[32px] border border-neutral-200/90 bg-white p-8 sm:p-12 lg:p-16 shadow-sm">
            <div className="max-w-[720px] mb-12">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3c7818]">
                Built for Students & Builders
              </span>
              <h2 className="mt-2 text-[2.2rem] sm:text-[3rem] font-black tracking-[-0.035em] text-[#121816]">
                How Siftrole Powers Your Search
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#55615b]">
                Everything you need to discover, organize, and apply to top engineering roles without missing a beat.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-sm mb-4">
                  01
                </div>
                <h4 className="text-lg font-bold text-[#121816]">All Openings at One Place</h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#55615b]">
                  Continuous ingestion directly from official company feeds ensures every internship and job is listed here first.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-sm mb-4">
                  02
                </div>
                <h4 className="text-lg font-bold text-[#121816]">The Application Checklist</h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#55615b]">
                  Never lose track of where you've applied. Mark roles as applied, bookmarked, or in review with a single click.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-sm mb-4">
                  03
                </div>
                <h4 className="text-lg font-bold text-[#121816]">Zero Ghost Postings</h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#55615b]">
                  When a company fills an opening, it auto-expires from our checklist within minutes to protect your application time.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-sm mb-4">
                  04
                </div>
                <h4 className="text-lg font-bold text-[#121816]">AI Matching Opportunities</h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#55615b]">
                  Upload your resume to instantly rank and surface the highest-matching engineering opportunities tailored specifically to your skillset.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* STATS STRIP */}
        {/* ======================================================== */}
        <section className="mt-16 sm:mt-24 border-y border-neutral-200/80 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-[2.8rem] sm:text-[3.5rem] font-black text-[#121816] tracking-tight">100%</div>
              <div className="text-xs sm:text-sm font-bold text-[#55615b]">Direct Company Openings</div>
            </div>
            <div>
              <div className="text-[2.8rem] sm:text-[3.5rem] font-black text-[#58a826] tracking-tight">0</div>
              <div className="text-xs sm:text-sm font-bold text-[#55615b]">Missed Opportunities</div>
            </div>
            <div>
              <div className="text-[2.8rem] sm:text-[3.5rem] font-black text-[#121816] tracking-tight">1-Click</div>
              <div className="text-xs sm:text-sm font-bold text-[#55615b]">Checklist & Tracking</div>
            </div>
            <div>
              <div className="text-[2.8rem] sm:text-[3.5rem] font-black text-[#58a826] tracking-tight">Soon</div>
              <div className="text-xs sm:text-sm font-bold text-[#55615b]">Automated Easy Apply</div>
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
        <footer className="mt-16 sm:mt-24 pt-10 border-t border-neutral-200/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[1.8rem] font-black tracking-[-0.04em] text-[#121816]">
                Sift<span className="text-[#58a826]">role</span>
              </span>
              <span className="text-xs font-semibold text-[#55615b] ml-2">
                All big tech openings & internships in one place.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-[#55615b]">
              <Link href="/jobs" className="hover:text-[#121816] transition">
                All Roles
              </Link>
              <Link href="/about" className="text-[#3c7818] hover:text-[#121816] transition">
                About
              </Link>
              <Link href="/#faq" className="hover:text-[#121816] transition">
                FAQ
              </Link>
              <Link href="/login" className="hover:text-[#121816] transition">
                Sign In
              </Link>
              <span className="text-neutral-400 font-normal">
                © {new Date().getFullYear()} Siftrole. All rights reserved.
              </span>
            </div>
          </div>

          {/* SIFTR[O]LE giant bottom wordmark with logo as letter O */}
          <div className="mt-12 select-none overflow-hidden flex items-center justify-center font-black uppercase text-[#14281a] leading-none tracking-[-0.04em]">
            <span className="text-[12.5vw] sm:text-[13.5vw]">SIFTR</span>
            <span className="inline-flex items-center justify-center w-[12.5vw] h-[12.5vw] sm:w-[13.5vw] sm:h-[13.5vw] max-w-[240px] max-h-[240px] min-w-[52px] min-h-[52px] mx-[0.02em] relative shrink-0">
              <Image
                src="/images/siftrole-logo.png"
                alt="O"
                width={400}
                height={400}
                className="w-full h-full object-contain drop-shadow-[0_12px_32px_rgba(132,214,79,0.38)]"
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
