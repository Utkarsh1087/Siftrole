"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const { isLoggedIn, isLoaded } = useAuth();

  const [isSignUp, setIsSignUp] = useState(modeParam === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("student@demo.com");
  const [password, setPassword] = useState("password123");
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

  const fillDemo = (demoType: "student" | "admin" | "recruiter") => {
    setIsSignUp(false);
    setError("");
    setAgreedToTerms(true);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/login");
    }
    if (demoType === "student") {
      setName("Alex Morgan");
      setEmail("student@demo.com");
      setPassword("password123");
    } else if (demoType === "admin") {
      setName("Siftrole Admin");
      setEmail("admin@demo.com");
      setPassword("admin123");
    } else {
      setName("Lead Recruiter");
      setEmail("recruiter@demo.com");
      setPassword("recruit123");
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
    <main className="h-screen w-full grid lg:grid-cols-[1.1fr_0.9fr] bg-white font-sans selection:bg-[#8cd64f]/30 overflow-hidden">
      {/* Left Column: Fixed-Dimension 3D Workspace Scene */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-[#d1e8bf] overflow-hidden h-full max-h-screen select-none">
        {/* 3D Render Image strictly fixed */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/auth_3d_workspace.jpg"
            alt="Siftrole 3D Workspace"
            fill
            sizes="55vw"
            priority
            className="object-cover object-center pointer-events-none select-none"
          />
        </div>

        {/* Subtle Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#162a1e]/35 via-transparent to-black/10 pointer-events-none" />

        {/* Top Return link */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-heading font-bold text-[#162a1e] shadow-sm hover:bg-white hover:shadow-md transition"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#589c2c]" /> Back to Home
          </Link>
        </div>
      </div>

      {/* Right Column: Clean Auth Form with internal scroll isolation and generous bottom spacing */}
      <div className="flex flex-col justify-between px-6 sm:px-10 lg:px-12 xl:px-16 pt-6 sm:pt-10 pb-10 sm:pb-14 bg-white h-full max-h-screen overflow-y-auto no-scrollbar">
        
        {/* Mobile top navigation */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <Link href="/" className="inline-flex items-center group">
            <span className="font-heading text-xl font-bold tracking-tight text-[#162a1e]">
              sift<span className="text-[#58a826]">role</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-heading font-bold text-[#556958] hover:text-[#162a1e]"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#58a826]" /> Back
          </Link>
        </div>

        {/* Centered Auth Card Form Area */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-2 sm:py-4">
          
          {/* Top Logo (Desktop) */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center">
            <Link href="/" className="inline-flex items-center group">
              <span className="font-heading text-2xl sm:text-[1.75rem] font-bold tracking-tight text-[#162a1e]">
                sift<span className="text-[#58a826]">role</span>
              </span>
            </Link>
          </div>

          <div className="text-center mt-2 lg:mt-5 transition-all duration-300">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#162a1e] tracking-tight transition-opacity duration-200">
              {isSignUp ? "Create account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#718276] font-normal transition-opacity duration-200">
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
                  className="w-full rounded-full border border-[#e2e8df] bg-[#fafcfa] px-5 py-3 text-xs sm:text-sm font-medium text-[#162a1e] placeholder:text-[#9aa99c] outline-none transition focus:border-[#8cd64f] focus:bg-white focus:ring-3 focus:ring-[#8cd64f]/20"
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
                className="w-full rounded-full border border-[#e2e8df] bg-[#fafcfa] px-5 py-3 text-xs sm:text-sm font-medium text-[#162a1e] placeholder:text-[#9aa99c] outline-none transition focus:border-[#8cd64f] focus:bg-white focus:ring-3 focus:ring-[#8cd64f]/20"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-full border border-[#e2e8df] bg-[#fafcfa] pl-5 pr-12 py-3 text-xs sm:text-sm font-medium text-[#162a1e] placeholder:text-[#9aa99c] outline-none transition focus:border-[#8cd64f] focus:bg-white focus:ring-3 focus:ring-[#8cd64f]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa99c] hover:text-[#162a1e] transition cursor-pointer p-1"
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
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#3c7818] focus:ring-[#8cd64f] accent-[#3c7818] cursor-pointer"
                    required={isSignUp}
                  />
                  <label htmlFor="terms-checkbox" className="text-[0.75rem] text-[#55615b] leading-relaxed cursor-pointer select-none">
                    I have read and agree to Siftrole&apos;s{" "}
                    <Link href="/terms" target="_blank" className="text-[#3c7818] font-bold underline hover:text-[#14281a]">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <span className="whitespace-nowrap">
                      <Link href="/privacy" target="_blank" className="text-[#3c7818] font-bold underline hover:text-[#14281a]">
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
              className="w-full rounded-full bg-[#8cd64f] hover:bg-[#7ec942] text-[#14261b] font-heading font-bold text-sm sm:text-base py-3 shadow-md shadow-[#8cd64f]/30 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-2"
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
            <p className="text-[0.78rem] font-medium text-[#849688] transition-opacity duration-200">
              {isSignUp ? "or sign up with" : "or sign in with"}
            </p>

            {/* Social Login / 1-Click Fast Filler Icons */}
            <div className="mt-3 flex items-center justify-center gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => fillDemo("student")}
                title="Sign in with Google (Student demo)"
                className="w-9 h-9 rounded-xl border border-[#d9ebd0] bg-[#f2faed] hover:bg-[#e4f5da] flex items-center justify-center transition cursor-pointer text-[#162a1e] font-bold text-xs shadow-2xs"
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
                className="w-9 h-9 rounded-xl border border-[#d9ebd0] bg-[#f2faed] hover:bg-[#e4f5da] flex items-center justify-center transition cursor-pointer text-[#162a1e] font-bold text-xs shadow-2xs"
              >
                <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                  <div className="bg-[#f25022] rounded-[1px]" />
                  <div className="bg-[#7fba00] rounded-[1px]" />
                  <div className="bg-[#00a4ef] rounded-[1px]" />
                  <div className="bg-[#ffb900] rounded-[1px]" />
                </div>
              </button>

              {/* GitHub / Recruiter */}
              <button
                type="button"
                onClick={() => fillDemo("recruiter")}
                title="Sign in with GitHub (Recruiter demo)"
                className="w-9 h-9 rounded-xl border border-[#d9ebd0] bg-[#f2faed] hover:bg-[#e4f5da] flex items-center justify-center transition cursor-pointer text-[#162a1e] shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
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
                <Link href="/terms" className="text-[#3c7818] font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#3c7818] font-semibold hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Bottom Switcher */}
          <div className="mt-4 pt-4 border-t border-[#f0f4ee] text-center">
            <p className="text-xs sm:text-sm text-[#697d6e]">
              {isSignUp ? (
                <>
                  Have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleMode(false)}
                    className="font-bold text-[#3c7818] hover:text-[#2d5d11] hover:underline transition cursor-pointer"
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
                    className="font-bold text-[#3c7818] hover:text-[#2d5d11] hover:underline transition cursor-pointer"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>

        </div>

        {/* Subtle bottom note with safe spacing */}
        <div className="text-center text-[0.7rem] text-[#9aa99c] pt-4 pb-2">
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

