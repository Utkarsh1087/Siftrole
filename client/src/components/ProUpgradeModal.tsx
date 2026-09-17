"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  ArrowRight,
  Mail,
  Users,
  Award,
} from "lucide-react";
import { unlockProAccess } from "@/lib/hrContacts";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProUpgradeModal({ isOpen, onClose, onSuccess }: ProUpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      unlockProAccess();
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#14281a] text-white rounded-[32px] max-w-[620px] w-full border border-[#84d64f]/30 shadow-[0_25px_60px_rgba(0,0,0,0.5)] p-6 sm:p-10 relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#84d64f]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#84d64f]/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer z-10"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {!isSuccess ? (
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#84d64f]/20 border border-[#84d64f]/40 px-3.5 py-1 text-xs font-bold text-[#84d64f] mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Siftrole Pro Outreach Pass
            </div>

            {/* Title */}
            <h2 className="text-[2.2rem] sm:text-[2.6rem] font-black tracking-[-0.03em] leading-[1.1] text-white">
              Unlock All 500+ Verified Tech Recruiter Contacts
            </h2>
            <p className="mt-3 text-sm text-[#eef8e5]/80 leading-relaxed">
              Skip third-party job queues. Reach directly into the inboxes of talent partners and engineering hiring managers across Stripe, OpenAI, Figma, Linear, and top tier startups.
            </p>

            {/* Feature Checklist */}
            <div className="mt-6 space-y-3.5 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-[#eef8e5]">
                <CheckCircle2 className="w-4 h-4 text-[#84d64f] shrink-0 mt-0.5" />
                <span><strong className="text-white">500+ Direct Recruiter & HR Emails:</strong> 100% verified work inboxes, updated weekly.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-[#eef8e5]">
                <CheckCircle2 className="w-4 h-4 text-[#84d64f] shrink-0 mt-0.5" />
                <span><strong className="text-white">Unlimited AI Cold Mail Generation:</strong> High-response human drafts powered by Groq LLM.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-[#eef8e5]">
                <CheckCircle2 className="w-4 h-4 text-[#84d64f] shrink-0 mt-0.5" />
                <span><strong className="text-white">One-Click Mailto Deep Links:</strong> Instantly opens pre-filled outreach in Gmail / Apple Mail.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-[#eef8e5]">
                <CheckCircle2 className="w-4 h-4 text-[#84d64f] shrink-0 mt-0.5" />
                <span><strong className="text-white">Lifetime Access & Updates:</strong> Zero recurring subscriptions.</span>
              </div>
            </div>

            {/* Pricing CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">₹49</span>
                  <span className="text-xs font-bold text-[#84d64f]">only (lifetime access)</span>
                  <span className="text-xs line-through text-neutral-400">₹499</span>
                </div>
                <div className="text-[0.7rem] text-neutral-300 mt-0.5">30-day money-back guarantee</div>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] px-8 py-4 text-sm font-heading font-extrabold shadow-[0_12px_28px_rgba(132,214,79,0.35)] transition active:scale-[0.98] cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-[#14281a] border-t-transparent animate-spin" />
                    <span>Activating Pro Access...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Full Directory for ₹49</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-[#84d64f]/20 border border-[#84d64f] text-[#84d64f] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">Pro Access Unlocked!</h3>
            <p className="text-sm text-[#eef8e5]/80 mt-1">
              All 500+ verified recruiter contacts and unlimited AI drafts are now available.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
