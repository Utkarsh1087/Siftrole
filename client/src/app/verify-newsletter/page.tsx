"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles, Briefcase } from "lucide-react";
import { LiquidSilkBackground } from "@/components/LiquidSilkBackground";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function VerifyNewsletterContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your subscription...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Please subscribe again from the home page.");
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch(`${API_BASE}/api/newsletter/verify-link?token=${encodeURIComponent(token!)}&email=${encodeURIComponent(email || "")}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Verification link is invalid or has expired.");
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully! Your job alert radar is now live.");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Failed to verify email link.");
      }
    }

    verifyToken();
  }, [token, email]);

  return (
    <main className="min-h-screen bg-[#f8f7f5] text-[#121816] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#84d64f]/15 blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-md w-full rounded-[32px] border border-neutral-200/90 bg-white p-8 shadow-xl text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center gap-2 font-black text-lg text-[#14281a] mb-6">
          <span className="w-3.5 h-3.5 rounded-full bg-[#84d64f]" />
          Siftrole Job Radar
        </div>

        {status === "loading" && (
          <div className="py-8 space-y-4">
            <div className="h-10 w-10 rounded-full border-3 border-[#84d64f] border-t-transparent animate-spin mx-auto" />
            <h2 className="text-xl font-black text-[#121816]">Confirming your subscription</h2>
            <p className="text-xs text-[#55615b] leading-relaxed">
              Please wait a moment while we verify your email address.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 space-y-4">
            <div className="h-16 w-16 rounded-full bg-[#eef8e5] border border-[#84d64f] text-[#3c7818] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#121816]">Subscription Activated!</h2>
            <p className="text-xs sm:text-sm text-[#55615b] leading-relaxed">
              {message}
            </p>

            <div className="pt-4 flex flex-col gap-2.5">
              <Link
                href="/jobs"
                className="w-full rounded-xl bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] py-3 text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>Browse Verified Tech Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[#121816] py-3 text-xs font-bold transition"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 space-y-4">
            <div className="h-16 w-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#121816]">Verification Failed</h2>
            <p className="text-xs sm:text-sm text-[#55615b] leading-relaxed">
              {message}
            </p>

            <div className="pt-4">
              <Link
                href="/#newsletter-section"
                className="w-full rounded-xl bg-[#14281a] hover:bg-[#1f3d27] text-[#84d64f] py-3 text-xs font-bold transition shadow-xs inline-block"
              >
                Try Subscribing Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyNewsletterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-4">
        <div className="h-8 w-8 rounded-full border-2 border-[#84d64f] border-t-transparent animate-spin" />
      </div>
    }>
      <VerifyNewsletterContent />
    </Suspense>
  );
}
