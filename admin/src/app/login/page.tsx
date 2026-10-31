"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@siftrole.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your admin email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid email or password. Please try again.");
      }
    } catch {
      setError("Server communication error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-between items-center p-4 sm:p-6 selection:bg-[#083327] selection:text-white">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#083327] flex items-center justify-center text-[#84d64f] shadow-xs">
            <SiftroleLogoMark className="w-4 h-4 text-[#84d64f]" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#083327]">Siftrole</span>
          <span className="text-[0.68rem] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
            Admin
          </span>
        </div>

        <a
          href="https://siftrole-user.vercel.app/
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-xs"
        >
          <span>Main Website</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] my-auto">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-9 shadow-sm">
          
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 text-[#083327] mb-3">
              <ShieldCheck className="w-6 h-6 text-[#083327]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Sign In</h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Enter your credentials to access the Siftrole administration dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@siftrole.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#083327] focus:ring-2 focus:ring-[#083327]/10 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  required
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#083327] focus:ring-2 focus:ring-[#083327]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#083327] focus:ring-[#083327]"
                />
                <span className="text-xs text-slate-600">Keep me signed in</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white py-2.5 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full max-w-5xl text-center py-2 text-[0.7rem] text-slate-400">
        &copy; {new Date().getFullYear()} Siftrole Inc. All rights reserved.
      </div>
    </div>
  );
}
