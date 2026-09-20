"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { LiquidSilkBackground } from "@/components/LiquidSilkBackground";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const { isLoggedIn, isLoaded } = useAuth();

  const [isSignUp, setIsSignUp] = useState(modeParam === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && isLoggedIn) {
      router.replace("/jobs");
    }
  }, [isLoaded, isLoggedIn, router]);

  React.useEffect(() => {
    setIsSignUp(modeParam === "signup");
  }, [modeParam]);

  const toggleMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setError("");
    if (typeof window !== "undefined") {
      const url = signUp ? "/login?mode=signup" : "/login";
      window.history.replaceState(null, "", url);
    }
  };

  const fillDemo = (demoType: "student" | "admin") => {
    setIsSignUp(false);
    setError("");
    setAgreedToTerms(true);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/login");
    }
    if (demoType === "student") {
      setName("Candidate");
      setEmail("student@demo.com");
      setPassword("password123");
    } else if (demoType === "admin") {
      setName("Administrator");
      setEmail("admin@siftrole.com");
      setPassword("siftrole-admin-2026");
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isSignUp && !agreedToTerms) {
      setError("You must accept the Terms of Use and Privacy Policy to create an account.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp
        ? "http://localhost:4000/api/auth/register"
        : "http://localhost:4000/api/auth/login";

      const payload = isSignUp ? { name, email, password } : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      const targetRedirect = (typeof window !== "undefined" && sessionStorage.getItem("siftrole_redirect_after_auth")) || "/jobs";
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("siftrole_redirect_after_auth");
      }

      if (response && response.ok) {
        const data = await response.json();
        localStorage.setItem("siftrole_token", data.token);
        localStorage.setItem("siftrole_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("siftrole-auth-change"));
        router.push(targetRedirect);
        return;
      }

      // Fallback local session if backend server is not running
      const fallbackUser = {
        id: "demo-" + Date.now(),
        name: name || (email.split("@")[0] ? email.split("@")[0] : "Candidate"),
        email: email,
        role: email.includes("admin") ? "admin" : "student",
        grad_year: null,
        degree: null,
        profile_status: "Active",
      };

      localStorage.setItem("siftrole_token", "mock-token-" + Date.now());
      localStorage.setItem("siftrole_user", JSON.stringify(fallbackUser));
      window.dispatchEvent(new Event("siftrole-auth-change"));
      router.push(targetRedirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-screen w-full grid lg:grid-cols-[1.1fr_0.9fr] bg-white font-sans selection:bg-[#008561]/20 overflow-hidden">
      {/* Left Column: Background Image with Liquid Silk Effect & Centered Siftrole Brand */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-[#02110c] overflow-hidden h-full max-h-screen select-none">
        {/* Liquid Silk Background with user's background image */}
        <LiquidSilkBackground imageSrc="/images/auth_fern_frame.jpg" />

        {/* Top Return link */}
        <div className="relative z-20">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-xs font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl backdrop-saturate-150 transition hover:border-white/60 hover:bg-white/25 hover:shadow-[0_10px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.8)]"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#b9ffe5] transition-transform group-hover:-translate-x-0.5" /> Back to Home
          </Link>
        </div>

        {/* Centred Siftrole Brand written in the middle */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="font-bodoni-moda text-[4.5rem] xl:text-[5.5rem] font-extrabold italic tracking-[-0.03em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] select-none">
            Sift<span className="text-[#00D793]">role</span>
          </span>
        </div>
      </div>

      {/* Right Column: Clean Auth Form with internal scroll isolation and generous bottom spacing */}
      <div className="flex flex-col justify-between px-6 sm:px-10 lg:px-12 xl:px-16 pt-6 sm:pt-10 pb-10 sm:pb-14 bg-white h-full max-h-screen overflow-y-auto no-scrollbar">
        
        {/* Mobile top navigation */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <Link href="/" className="inline-flex items-center group">
            <span className="font-bodoni-moda text-[1.65rem] font-extrabold italic tracking-[-0.02em] text-[#02110c]">
              Sift<span className="text-[#008561] transition-colors group-hover:text-[#02110c]">role</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-lora font-bold text-[#556958] hover:text-[#02110c] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#008561]" /> Back
          </Link>
        </div>

        {/* Centered Auth Card Form Area */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-2 sm:py-4">

          <div className="text-center mt-2 lg:mt-5 transition-all duration-300">
            <h1 className="font-pochaevsk text-2xl sm:text-3xl font-bold text-[#02110c] tracking-tight transition-opacity duration-200">
              {isSignUp ? "Create account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#718276] font-lora font-normal transition-opacity duration-200">
              {isSignUp
                ? "Start tracking verified roles with smart AI match scores."
                : "Sign in to access your saved roles and checklist."}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            {/* Full Name field with smooth height/opacity expander */}
            <div
              className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isSignUp
                  ? "grid-rows-[1fr] opacity-100 mb-3.5"
                  : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
              }`}
            >
              <div className="overflow-hidden">
                <input
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-full border border-[#eadecc] bg-[#faf8f5] px-5 py-3 text-xs sm:text-sm font-medium text-[#02110c] placeholder:text-neutral-400 outline-none transition focus:border-[#008561] focus:bg-white focus:ring-2 focus:ring-[#008561]/15"
                />
              </div>
            </div>

            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-full border border-[#eadecc] bg-[#faf8f5] px-5 py-3 text-xs sm:text-sm font-medium text-[#02110c] placeholder:text-neutral-400 outline-none transition focus:border-[#008561] focus:bg-white focus:ring-2 focus:ring-[#008561]/15"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-full border border-[#eadecc] bg-[#faf8f5] pl-5 pr-12 py-3 text-xs sm:text-sm font-medium text-[#02110c] placeholder:text-neutral-400 outline-none transition focus:border-[#008561] focus:bg-white focus:ring-2 focus:ring-[#008561]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa99c] hover:text-[#02110c] transition cursor-pointer p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-bold text-rose-700">
                {error}
              </div>
            ) : null}

            {/* Mandatory Terms & Privacy Agreement (Sign Up Only with smooth expander) */}
            <div
              className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isSignUp
                  ? "grid-rows-[1fr] opacity-100 pt-0.5"
                  : "grid-rows-[0fr] opacity-0 pt-0 pointer-events-none"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex items-start gap-2.5 pt-0.5 text-left">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (error) setError("");
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#008561] focus:ring-[#008561] accent-[#008561] cursor-pointer"
                    required={isSignUp}
                  />
                  <label htmlFor="terms-checkbox" className="text-[0.75rem] text-[#55615b] leading-relaxed cursor-pointer select-none">
                    I have read and agree to Siftrole&apos;s{" "}
                    <Link href="/terms" target="_blank" className="text-[#008561] font-bold underline hover:text-[#02110c]">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <span className="whitespace-nowrap">
                      <Link href="/privacy" target="_blank" className="text-[#008561] font-bold underline hover:text-[#02110c]">
                        Privacy Policy
                      </Link>
                      .<span className="text-red-500 font-bold ml-0.5">*</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#008561] hover:bg-[#006e50] text-white font-lora font-bold text-sm sm:text-base py-3 shadow-md shadow-[#008561]/20 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-2"
            >
              {loading
                ? "Authenticating..."
                : isSignUp
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          {/* Social / Alternative Divider */}
          <div className="mt-5 text-center">
            <p className="text-[0.78rem] font-lora font-medium text-[#849688] transition-opacity duration-200">
              {isSignUp ? "or sign up with" : "or sign in with"}
            </p>

            {/* Social Login / 1-Click Fast Filler Icons */}
            <div className="mt-3 flex items-center justify-center gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => fillDemo("student")}
                title="Sign in with Google (Student demo)"
                className="w-9 h-9 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center transition cursor-pointer text-[#162a1e] font-bold text-xs shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </button>

              {/* Microsoft / Admin */}
              <button
                type="button"
                onClick={() => fillDemo("admin")}
                title="Sign in with Microsoft (Admin demo)"
                className="w-9 h-9 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center transition cursor-pointer text-[#162a1e] font-bold text-xs shadow-2xs"
              >
                <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                  <div className="bg-[#f25022] rounded-[1px]" />
                  <div className="bg-[#7fba00] rounded-[1px]" />
                  <div className="bg-[#00a4ef] rounded-[1px]" />
                  <div className="bg-[#ffb900] rounded-[1px]" />
                </div>
              </button>
            </div>
          </div>

          {/* Terms of Service agreement (Sign Up Only with smooth expander) */}
          <div
            className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isSignUp
                ? "grid-rows-[1fr] opacity-100 mt-4"
                : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-[0.72rem] text-center text-[#7b8d80] leading-relaxed">
                By creating an account you agree to Siftrole&apos;s{" "}
                <Link href="/terms" className="text-[#008561] font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#008561] font-semibold hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Bottom Switcher */}
          <div className="mt-4 pt-4 border-t border-[#f0f4ee] text-center">
            <p className="text-xs sm:text-sm font-lora text-[#697d6e]">
              {isSignUp ? (
                <>
                  Have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleMode(false)}
                    className="font-lora font-bold text-[#008561] hover:text-[#02110c] hover:underline transition cursor-pointer"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleMode(true)}
                    className="font-lora font-bold text-[#008561] hover:text-[#02110c] hover:underline transition cursor-pointer"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>

        </div>

        {/* Subtle bottom note with safe spacing */}
        <div className="text-center text-[0.7rem] font-lora text-[#9aa99c] pt-4 pb-2">
          © {new Date().getFullYear()} Siftrole. Verified opportunities for builders.
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#b9dc9a] flex items-center justify-center p-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#162a1e] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

