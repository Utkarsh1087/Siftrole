"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import confetti from "canvas-confetti";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function AnimatedCheckmark() {
  return (
    <div className="relative inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#eef8e5] text-[#3c7818] mb-4 animate-[popIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
      <svg
        className="w-8 h-8"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circle Animation */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="#3c7818"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="animate-[drawCircle_0.5s_ease-out_forwards]"
          style={{
            strokeDasharray: 130,
            strokeDashoffset: 130,
          }}
        />
        {/* Checkmark Path Animation */}
        <path
          d="M15 24.5L21.5 31L33 18"
          stroke="#3c7818"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-[drawCheck_0.35s_ease-out_0.35s_forwards]"
          style={{
            strokeDasharray: 30,
            strokeDashoffset: 30,
          }}
        />
      </svg>
    </div>
  );
}

function VerifyNewsletterContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your subscription...");
  const [copied, setCopied] = useState(false);
  const hasFetchedRef = React.useRef(false);

  const fireCelebrationBurst = () => {
    // Subtle, high-class particle burst on success
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        gravity: 1.1,
        scalar: 0.9,
        ticks: 200,
        colors: ["#3c7818", "#84d64f", "#121816", "#22c55e", "#166534"],
        disableForReducedMotion: true,
      });
    } catch {
      // Fallback gracefully if canvas is unavailable
    }
  };

  useEffect(() => {
    // Copy OTP code to clipboard if present
    if (otp && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(otp).then(() => {
        setCopied(true);
      }).catch(() => {});
    }

    if (!token && !otp) {
      setStatus("error");
      setMessage("Missing verification details. Please subscribe again from the home page.");
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function verify() {
      try {
        let res;
        if (token) {
          res = await fetch(`${API_BASE}/api/newsletter/verify-link?token=${encodeURIComponent(token!)}&email=${encodeURIComponent(email || "")}`);
        } else {
          res = await fetch(`${API_BASE}/api/newsletter/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
          });
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Verification link is invalid or has expired.");
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully! Your job alert radar is now live.");
        fireCelebrationBurst();
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Failed to verify email.");
      }
    }

    verify();
  }, [token, email, otp]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl text-center transition-all duration-300">
        {/* Brand Logo */}
        <div className="inline-flex items-center gap-1.5 font-black text-2xl sm:text-[28px] tracking-[-0.03em] text-neutral-900 mb-6">
          <span>Sift<span className="text-[#3c7818]">role</span></span>
        </div>

        {status === "loading" && (
          <div className="py-6 space-y-4">
            <div className="h-9 w-9 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-neutral-900">Confirming subscription</h2>
            <p className="text-sm text-neutral-500">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-2 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Animated Checkmark (No Glow) */}
            <AnimatedCheckmark />
            
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Subscription Verified!
            </h2>
            
            {copied && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-800">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Code <strong>{otp}</strong> copied to clipboard</span>
              </div>
            )}

            <p className="text-sm text-neutral-600 leading-relaxed px-2">
              {message}
            </p>

            <div className="pt-4 flex flex-col gap-2.5">
              <Link
                href="/jobs"
                className="w-full rounded-xl bg-neutral-900 hover:bg-black text-white py-3 text-sm font-medium transition active:scale-[0.99] flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Browse Verified Tech Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 py-3 text-sm font-medium transition active:scale-[0.99]"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 space-y-4 animate-in fade-in duration-200">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">Verification Failed</h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {message}
            </p>

            <div className="pt-4">
              <Link
                href="/#newsletter-section"
                className="w-full rounded-xl bg-neutral-900 hover:bg-black text-white py-3 text-sm font-medium transition inline-block"
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="h-8 w-8 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
      </div>
    }>
      <VerifyNewsletterContent />
    </Suspense>
  );
}
