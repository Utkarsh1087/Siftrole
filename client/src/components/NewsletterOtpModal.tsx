"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface NewsletterOtpModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function NewsletterOtpModal({
  isOpen,
  email,
  onClose,
  onSuccess,
}: NewsletterOtpModalProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setErrorMsg(null);
      setResendMsg(null);
      setIsVerified(false);
      setCountdown(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    setErrorMsg(null);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input if single digit typed
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
      // Auto-submit on paste of full 6-digit code
      handleVerifyCode(pasted);
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otp.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/newsletter/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed. Please try again.");
      }

      setIsVerified(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);
    setResendMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/newsletter/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification code.");
      }

      setResendMsg("A fresh 6-digit code has been sent to your email.");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#14281a] text-white rounded-[32px] max-w-[480px] w-full border border-[#84d64f]/35 shadow-[0_25px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 relative overflow-hidden">
        
        {/* Glow Ambient Lights */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#84d64f]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#84d64f]/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer z-10"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {!isVerified ? (
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#84d64f]/20 border border-[#84d64f]/40 px-3.5 py-1 text-xs font-bold text-[#84d64f] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Confirm Subscription
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl font-black tracking-[-0.02em] leading-tight text-white">
              Enter Verification Code
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#eef8e5]/80 leading-relaxed">
              We sent a 6-digit security code to{" "}
              <strong className="text-white font-mono font-bold break-all">{email}</strong>.
            </p>

            {/* 6-Digit OTP Inputs */}
            <div className="my-6">
              <div
                className="flex items-center justify-between gap-2 sm:gap-2.5"
                onPaste={handlePaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl bg-white/10 border border-white/20 focus:border-[#84d64f] focus:bg-white/15 focus:ring-2 focus:ring-[#84d64f]/30 outline-none text-white transition"
                  />
                ))}
              </div>

              {/* Feedback messages */}
              {errorMsg && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {resendMsg && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#84d64f]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{resendMsg}</span>
                </div>
              )}
            </div>

            {/* Verification Action Button */}
            <button
              onClick={() => handleVerifyCode()}
              disabled={isVerifying || otp.join("").length !== 6}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] py-3.5 text-sm font-heading font-extrabold shadow-[0_10px_25px_rgba(132,214,79,0.35)] transition active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-[#14281a] border-t-transparent animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Activate Job Alerts</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Code Section */}
            <div className="mt-5 text-center text-xs text-[#eef8e5]/70">
              Did not receive the code?{" "}
              {countdown > 0 ? (
                <span className="font-semibold text-neutral-400">
                  Resend in <span className="font-mono text-white">{countdown}s</span>
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-bold text-[#84d64f] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                  <span>Resend Code</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-full bg-[#84d64f]/20 border border-[#84d64f] text-[#84d64f] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">Email Verified!</h3>
            <p className="text-xs sm:text-sm text-[#eef8e5]/80 mt-1 max-w-xs mx-auto">
              Your job alert subscription is active. We sent your first welcome digest to your inbox.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
