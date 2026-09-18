"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { LiquidSilkBackground } from "@/components/LiquidSilkBackground";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface NewsletterSectionProps {
  className?: string;
}

export function NewsletterSection({ className = "" }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start subscription. Please try again.");
      }

      setSubmittedEmail(cleanEmail);
      setIsSuccess(true);
      setEmail("");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="newsletter-section"
      data-footer-zone="true"
      className={`mt-16 sm:mt-24 relative overflow-hidden rounded-[32px] sm:rounded-[38px] min-h-[340px] sm:min-h-[380px] flex flex-col justify-center items-center text-center p-8 sm:p-14 lg:p-16 shadow-2xl border border-[#14281a] ${className}`}
    >
      {/* Interactive 3D WebGL Liquid Silk Background */}
      <LiquidSilkBackground imageSrc="/images/emerald_silk_horizontal.jpg" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a180e]/55 via-transparent to-[#0a180e]/55 pointer-events-none" />

      {/* Headline */}
      <h2 className="relative z-10 text-[2rem] sm:text-[2.75rem] lg:text-[3.15rem] font-medium sm:font-semibold tracking-[-0.02em] leading-[1.18] text-white/95 max-w-[720px] mx-auto drop-shadow-sm">
        Subscribe to our newsletter to get job updates.
      </h2>

      {!isSuccess ? (
        <form
          onSubmit={handleSubscribe}
          className="relative z-10 mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-[640px] mx-auto"
        >
          <div className="relative w-full sm:w-[400px]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Enter your university or work email"
              className="w-full rounded-full border border-white/30 bg-black/30 backdrop-blur-md px-6 py-3.5 text-sm text-white placeholder:text-white/60 outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto shrink-0 rounded-full bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] px-7 py-3.5 text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-85"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-[#14281a] border-t-transparent animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="relative z-10 mt-8 inline-flex flex-col sm:flex-row items-center gap-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 px-6 py-3 text-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2.5 text-sm font-medium text-white/90">
            <CheckCircle2 className="w-4 h-4 text-[#84d64f] shrink-0" />
            <span>
              A confirmation link has been sent to your inbox. Please check your email to activate.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setEmail("");
            }}
            className="text-xs text-white/60 hover:text-white underline underline-offset-2 transition cursor-pointer shrink-0"
          >
            Use another email
          </button>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="relative z-10 mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-950/70 border border-rose-500/40 px-4 py-1.5 text-xs font-semibold text-rose-200 backdrop-blur-xs">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </section>
  );
}
