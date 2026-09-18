"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-neutral-900 rounded-3xl max-w-[440px] w-full border border-neutral-100 shadow-2xl p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {!isVerified ? (
          <div>
            {/* Minimal Icon */}
            <div className="h-11 w-11 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Check your inbox
            </h3>
            <p className="mt-1.5 text-sm text-neutral-500 leading-normal">
              We sent a 6-digit verification code to{" "}
              <span className="font-medium text-neutral-900 break-all">{email}</span>.
            </p>

            {/* 6-Digit OTP Inputs */}
            <div className="my-6">
              <div
                className="flex items-center justify-between gap-2"
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
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-semibold rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition shadow-xs"
                  />
                ))}
              </div>

              {/* Feedback messages */}
              {errorMsg && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {resendMsg && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{resendMsg}</span>
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              onClick={() => handleVerifyCode()}
              disabled={isVerifying || otp.join("").length !== 6}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-black text-white py-3 text-sm font-medium transition active:scale-[0.99] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              {isVerifying ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Code Section */}
            <div className="mt-5 text-center text-xs text-neutral-500">
              Didn't receive the code?{" "}
              {countdown > 0 ? (
                <span className="font-medium text-neutral-700">
                  Resend in <span className="font-mono">{countdown}s</span>
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-medium text-neutral-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                  <span>Resend code</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Email Verified</h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">
              You're all set! Job alert digests will now arrive directly in your inbox.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
