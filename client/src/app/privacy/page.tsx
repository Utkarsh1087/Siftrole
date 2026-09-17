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
            <h2 className="text-base font-black text-[#121816]">4. Payment Security</h2>
            <p>
              Payments for Siftrole Pro passes are processed securely via Razorpay with industry-standard 256-bit SSL encryption. Siftrole does not store your credit card or bank details.
            </p>
          </section>

          <div className="pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs text-[#55615b] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#3c7818]" /> Last updated: September 2026
          </div>
        </div>

        {/* Footer brand mark with adjacent logo */}
        <div className="pt-8 pb-4 select-none overflow-hidden flex items-center justify-center gap-3 sm:gap-4 text-[#14281a] border-t border-neutral-200/70">
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center">
            <img
              src="/images/siftrole-logo.png"
              alt="Siftrole Logo"
              className="w-full h-full object-contain drop-shadow-sm"
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
