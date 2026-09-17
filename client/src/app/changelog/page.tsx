"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2, Zap, ShieldCheck } from "lucide-react";

import Image from "next/image";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";

export default function ChangelogPage() {
  const releases = [
    {
      version: "v2.4.0",
      date: "Latest Release",
      title: "Background Scraper Pipeline, Razorpay & Deep AI Verification",
      highlights: [
        "Automated background ATS scrapers continuously scanning verified employer feeds.",
        "Admin Review Queue with Groq LLM-powered Job Refinement and deep company authenticity checks.",
        "Integrated official Razorpay checkout for Siftrole Pro recruiter outreach pass.",
        "Edge bot protection, rate limiters, and strict multi-tenant data isolation.",
      ],
    },
    {
      version: "v2.3.0",
      date: "September 2026",
      title: "OTP Newsletter Verification & Recruiter Directory",
      highlights: [
        "Cryptographic 6-digit OTP verification and 1-click magic links for new job alerts.",
        "Curated engineering recruiter directory with direct verified inboxes and pagination.",
        "Candidate interactive application tracking board with real-time status management.",
      ],
    },
    {
      version: "v2.1.0",
      date: "August 2026",
      title: "Direct ATS Integration & Real-Time Sync",
      highlights: [
        "Direct JSON API integrations for Greenhouse, Lever, Ashby, and SmartRecruiters.",
        "Automated closed-job reconciliation to eliminate dead links from the public board.",
        "Interactive match scoring engine based on candidate skills and role requirements.",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#14281a] hover:text-[#3c7818] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Siftrole
        </Link>

        <div>
          <span className="text-[0.85rem] font-extrabold uppercase tracking-widest text-[#3c7818]">
            Product Updates
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#121816] mt-1">
            Siftrole Changelog
          </h1>
          <p className="text-sm text-[#55615b] mt-2 leading-relaxed">
            See what we are shipping every week to bring you 100% verified tech job opportunities.
          </p>
        </div>

        <div className="space-y-6">
          {releases.map((rel) => (
            <div
              key={rel.version}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#eef8e5] text-[#14281a] border border-[#cce8be] text-xs font-black">
                  {rel.version}
                </span>
                <span className="text-xs font-bold text-neutral-400">{rel.date}</span>
              </div>

              <h2 className="text-xl font-black text-[#121816]">{rel.title}</h2>

              <ul className="space-y-2.5">
                {rel.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#44504b] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#84d64f] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer brand mark with adjacent logo */}
        <div className="pt-12 pb-4 select-none overflow-hidden flex items-center justify-center gap-3 sm:gap-4 text-[#14281a] border-t border-neutral-200/70">
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center">
            <Image
              src="/images/siftrole-logo.png"
              alt="Siftrole Logo"
              width={96}
              height={96}
              className="w-full h-full object-contain drop-shadow-sm"
              unoptimized
            />
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-[-0.04em] uppercase text-[#14281a]">
            SIFT<span className="text-[#58a826]">ROLE</span>
          </span>
        </div>
      </div>
    </main>
  );
}
