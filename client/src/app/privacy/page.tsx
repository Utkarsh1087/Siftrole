"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            Legal & Trust
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#121816] mt-1">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#55615b] mt-2 leading-relaxed">
            Your candidate privacy and application security are our top priorities.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6 text-xs sm:text-sm text-[#44504b] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-black text-[#121816]">1. Information We Collect</h2>
            <p>
              Siftrole collects only essential candidate information required to deliver job matching and email alert services, such as your email address, graduation year, and technical skills.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#121816]">2. Zero Third-Party Selling</h2>
            <p>
              We never sell, rent, or trade candidate contact details or resumes to third-party data brokers or marketing agencies. When you apply, your application goes directly to the official employer ATS portal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#121816]">3. Newsletter & Alert Subscriptions</h2>
            <p>
              Email newsletter subscriptions require explicit OTP or magic link verification. You can unsubscribe at any time with a single click from any email.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#121816]">4. Free & Open Platform Access</h2>
            <p>
              All job listings, recruiter contacts, AI career copilot tools, and cold email drafters are 100% free and open for candidates. Siftrole does not charge any mandatory fees or registration subscriptions.
            </p>
          </section>

          <div className="pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs text-[#55615b] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#3c7818]" /> Last updated: September 2026
          </div>
        </div>

        {/* Footer brand mark with logo as letter O */}
        <div className="pt-8 pb-4 select-none overflow-hidden flex items-center justify-center font-black uppercase text-[#14281a] leading-none tracking-[-0.04em] text-2xl sm:text-3xl border-t border-neutral-200/70">
          <span>SIFTR</span>
          <span className="inline-flex items-center justify-center w-[0.84em] h-[0.84em] mx-[0.04em] relative shrink-0">
            <img
              src="/images/siftrole-logo.png"
              alt="O"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </span>
          <span>LE</span>
        </div>
      </div>
    </main>
  );
}
