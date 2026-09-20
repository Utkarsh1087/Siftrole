"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, Check, ShieldCheck } from "lucide-react";

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  badge?: string;
  primaryCta?: string;
  secondaryCta?: string;
}

export function AuthGateModal({
  isOpen,
  onClose,
  title = "Unlock Full Free Access",
  description = "Join thousands of student developers discovering real-time verified roles and reaching top tech recruiters with AI.",
  badge = "Free Instant Access",
  primaryCta = "Get Free Instant Access",
  secondaryCta = "Already a member? Sign In",
}: AuthGateModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-[#eadecc] bg-white p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full bg-[#faf8f5] hover:bg-[#f4ede0] flex items-center justify-center text-[#495e54] transition cursor-pointer border border-[#eadecc]"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Text Header in Bodoni Moda (same as navbar) */}
        <div className="pt-1">
          <span className="font-bodoni-moda text-[2.25rem] font-extrabold italic tracking-[-0.02em] text-[#02110c] select-none">
            Sift<span className="text-[#008561]">role</span>
          </span>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#008561]/10 border border-[#008561]/25 text-[#008561] text-[0.72rem] font-bold px-3 py-0.5 mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#008561]" /> {badge}
          </div>
          <h3 className="text-xl sm:text-[1.65rem] font-pochaevsk font-bold text-[#02110c] tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#495e54] mt-2 leading-relaxed max-w-[340px] mx-auto">
            {description}
          </p>
        </div>

        {/* Value Perks Strip */}
        <div className="rounded-2xl bg-[#faf8f5] border border-[#eadecc] p-3.5 text-left space-y-2 text-xs text-[#02110c]">
          <div className="flex items-center gap-2.5 font-medium">
            <div className="h-4 w-4 rounded-full bg-[#008561]/12 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 text-[#008561] stroke-[3]" />
            </div>
            <span><strong>100% Free</strong> &bull; No subscription or card</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium">
            <div className="h-4 w-4 rounded-full bg-[#008561]/12 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 text-[#008561] stroke-[3]" />
            </div>
            <span><strong>Direct Career Sync</strong> &bull; Zero ghost jobs or reposts</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium">
            <div className="h-4 w-4 rounded-full bg-[#008561]/12 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 text-[#008561] stroke-[3]" />
            </div>
            <span><strong>AI Cold Email Drafter</strong> &bull; Verified HR contacts</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <Link
            href="/login?mode=signup"
            className="w-full rounded-full bg-[#008561] hover:bg-[#006e50] text-white font-lora font-bold text-sm sm:text-base py-3.5 shadow-md transition hover:shadow-lg active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{primaryCta}</span>
            <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="pt-1">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-lora font-semibold text-[#495e54] hover:text-[#008561] transition underline-offset-4 hover:underline"
            >
              {secondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
