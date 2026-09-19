"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, ArrowRight, Sparkles, Key } from "lucide-react";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";

interface AdminLoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onSuccess }: AdminLoginModalProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError("Please enter the administrator passcode.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect passcode. Access denied.");
      }
    } catch {
      setError("Server communication error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#121816] text-white rounded-[32px] max-w-[440px] w-full border border-neutral-800 shadow-2xl p-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#84d64f]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#84d64f]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#1f2923] border border-[#2e3d34] flex items-center justify-center mb-4 shadow-lg shadow-[#84d64f]/10">
            <ShieldCheck className="w-7 h-7 text-[#84d64f]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e2a22] border border-[#2e4034] text-[#84d64f] text-[0.7rem] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" /> Siftrole Security Gate
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">Admin Console Access</h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-[280px]">
            Please enter your administrator passcode to manage live jobs, scrapers, and candidate telemetry.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[0.7rem] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
              Admin Passcode
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter master passcode..."
                autoFocus
                className="w-full rounded-2xl border border-neutral-700 bg-neutral-900/90 pl-10 pr-4 py-3 text-sm font-semibold text-white placeholder-neutral-500 outline-none focus:border-[#84d64f] focus:ring-2 focus:ring-[#84d64f]/20 transition"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#84d64f] hover:bg-[#75c73d] text-[#121816] py-3.5 text-sm font-black transition shadow-lg shadow-[#84d64f]/20 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Unlock Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[0.68rem] text-neutral-500">
            Protected with encrypted session cookies & rate-limited firewall.
          </p>
        </div>
      </div>
    </div>
  );
}
