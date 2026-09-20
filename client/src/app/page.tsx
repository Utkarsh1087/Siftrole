"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Layers,
  BellRing,
  ClipboardCheck,
  ArrowRight,
  ChevronDown,
  Clock,
  DollarSign,
  GraduationCap,
  SlidersHorizontal,
  Flame,
  Zap,
  TrendingUp,
  X,
  Share2,
  Bookmark,
  FileText,
  CheckCircle2,
  Check,
  Send,
  Mail,
  AlertCircle,
} from "lucide-react";
import { CompanyLogo, getCompanyDomain } from "@/components/CompanyLogo";
import { LiquidSilkBackground } from "@/components/LiquidSilkBackground";
import { NewsletterSection } from "@/components/NewsletterSection";
import { SiftroleLogo } from "@/components/SiftroleLogo";
import { JobDetailModal } from "@/components/JobDetailModal";
import { AuthGateModal } from "@/components/AuthGateModal";
import { useAppliedJobs } from "@/lib/appliedJobs";
import { useAuth } from "@/lib/useAuth";

interface Listing {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type: string | null;
  eligibility: string | null;
  stipend_or_salary: string | null;
  deadline: string | null;
  skills_required: string[];
  experience_level: string | null;
  apply_url: string;
  source: string;
  status: string;
  raw_jd_hash: string;
  raw_jd_text: string | null;
  created_at: string;
}

const COMPANY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Figma: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-200" },
  Stripe: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-200" },
  Spotify: { bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-200" },
  Linear: { bg: "bg-slate-800/10", text: "text-slate-800", border: "border-slate-200" },
  Notion: { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-200" },
  SmartRecruiters: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-200" },
};

function formatLocation(loc: string | null | undefined): string {
  if (!loc) return "Remote / Unspecified";
  const trimmed = loc.trim();
  if (/multiple locations/i.test(trimmed)) {
    const prefix = trimmed.split("(")[0].trim();
    return prefix ? `${prefix} (Multiple Locations)` : "Multiple Locations";
  }
  if (trimmed.length > 35) {
    const parts = trimmed.split(/[;,]/);
    if (parts.length > 1 && parts[0].trim().length >= 3) {
      return `${parts[0].trim()} +more`;
    }
    return trimmed.slice(0, 32) + "...";
  }
  return trimmed;
}

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleType, setSelectedRoleType] = useState("all");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [totalListingsCount, setTotalListingsCount] = useState<number>(0);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [selectedListingModal, setSelectedListingModal] = useState<Listing | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribedEmail, setSubscribedEmail] = useState(false);
  const { appliedJobIds, toggleApplied, isApplied } = useAppliedJobs();
  const { isLoggedIn, isLoaded } = useAuth();
  const [authGateConfig, setAuthGateConfig] = useState<{
    isOpen: boolean;
    title?: string;
    description?: string;
    badge?: string;
    primaryCta?: string;
  }>({ isOpen: false });

  const handleToggleAppliedWithAuth = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setAuthGateConfig({
        isOpen: true,
        title: "Sign in to Track Applications",
        description: "Create a free account or sign in to mark roles as applied and track your application progress.",
        badge: "Sign In Required",
      });
      return;
    }
    toggleApplied(jobId, e);
  };

  // Contact / Feedback form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCategory, setContactCategory] = useState("Feedback");
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) return;
    setIsSendingContact(true);
    setContactError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim().toLowerCase(),
          topic: contactCategory,
          message: contactMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }

      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err: any) {
      console.error("Contact form error:", err);
      setContactError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSendingContact(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isLoggedIn) {
      router.replace("/jobs");
    }
  }, [isLoaded, isLoggedIn, router]);

  const metrics: { value: React.ReactNode; label: string; caption: string }[] = [
    { value: "100%", label: "Direct from company career feeds", caption: "Zero scraped third-party reposts" },
    {
      value: totalListingsCount > 0 ? (
        `${totalListingsCount.toLocaleString()}+`
      ) : isLoadingListings ? (
        <span className="inline-block w-28 h-10 bg-neutral-200/70 rounded-xl animate-pulse align-middle" />
      ) : (
        "0+"
      ),
      label: "Verified active tech opportunities",
      caption: "Synced across official company career portals",
    },
    { value: "0", label: "Dead links or expired ghost postings", caption: "Auto-removed the second a role closes" },
  ];

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    setIsLoadingListings(true);
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        const listings: Listing[] = data.listings || [];
        setTotalListingsCount(typeof data.total === "number" ? data.total : listings.length);
        setFeaturedListings(listings.slice(0, 5));
      }
    } catch (e) {
      console.error("Failed to fetch featured listings:", e);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const toggleSaveJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = (job: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(job.apply_url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoaded && isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#14281a] border-t-transparent animate-spin" />
      </div>
    );
  }

  const faqs = [
    {
      q: "How does Siftrole guarantee every job listing is verified and active?",
      a: "Every listing is pulled directly from official company career feeds and applicant tracking systems (like Greenhouse, Lever, Ashby, and SmartRecruiters). The second a role closes on a company's career page, our sync pipeline removes it from Siftrole, eliminating ghost jobs, duplicate reposts, and dead links.",
    },
    {
      q: "How does the AI Resume Match scoring work?",
      a: "Upload your resume or set your target tech stack and graduation year. Our AI parser analyzes the job description's core requirements, skills, and eligibility criteria, ranking roles as High, Medium, or Low fit so you can focus your time on opportunities where you stand out.",
    },
    {
      q: "What is the AI Cold Email & HR Outreach generator?",
      a: "Siftrole includes an AI-powered outreach generator that drafts personalized, high-converting cold emails and LinkedIn messages tailored to each specific company and role, helping you connect directly with hiring managers and recruiters.",
    },
    {
      q: "Can I track my job applications directly on Siftrole?",
      a: "Yes! Siftrole includes a built-in Application Tracker in your dashboard. You can mark jobs as Applied, track your interview stages, take notes, and keep your entire job search organized in one clean interface.",
    },
    {
      q: "How often are new tech opportunities added and updated?",
      a: "Our automated sync pipeline continuously monitors official career feeds throughout the day, bringing in verified internships, new grad roles, and full-time engineering positions within minutes of companies publishing them.",
    },
    {
      q: "Is Siftrole completely free for students and developers?",
      a: "Yes, 100% free. You can search, filter, generate outreach emails, match resumes, and click directly to official application portals without paywalls or subscription gates.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-[#fff6eb] bg-canvas-pattern text-[#02110c] font-sans antialiased selection:bg-[#008561]/20 selection:text-[#02110c]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#008561]/12 via-[#008561]/4 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pt-4 pb-20">
        
        {/* ======================================================== */}
        {/* PREMIUM FLOATING NAVBAR */}
        {/* ======================================================== */}
        <header className="sticky top-4 z-50 rounded-[20px] border border-[#eadecc] bg-white/95 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(2,17,12,0.04)] transition-all">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <SiftroleLogo size={32} priority />

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-[1rem] font-lora font-medium text-[#083D2E]/85">
              <Link href="/jobs" className="text-[#083D2E] font-bold hover:text-[#008561] transition-colors">
                All Jobs
              </Link>
              <Link href="/cold-email" className="hover:text-[#083D2E] transition-colors">
                HR Outreach
              </Link>
              <Link href="/about" className="hover:text-[#083D2E] transition-colors">
                About
              </Link>
              <a href="#faq" className="hover:text-[#083D2E] transition-colors">
                FAQ
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/jobs"
                    className="hidden sm:inline-flex text-xs font-lora font-bold text-[#083D2E] hover:text-[#008561] px-3 py-2 transition"
                  >
                    Browse Roles
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-[#00D793] hover:bg-[#00bf83] px-5 py-2.5 text-xs sm:text-[0.92rem] font-lora font-bold text-[#083D2E] shadow-md shadow-[#00D793]/25 transition active:scale-[0.98] inline-flex items-center gap-2"
                  >
                    Go to Dashboard <ArrowRight className="w-3.5 h-3.5 text-[#083D2E]" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs sm:text-[0.92rem] font-lora font-bold text-[#083D2E] hover:text-[#008561] px-3 py-2 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    className="rounded-full bg-[#00D793] hover:bg-[#00bf83] px-4 sm:px-5 py-2.5 text-xs sm:text-[0.92rem] font-lora font-bold text-[#083D2E] shadow-md shadow-[#00D793]/25 transition active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    Sign Up <ArrowRight className="w-3.5 h-3.5 text-[#083D2E]" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* HERO SECTION */}
        {/* ======================================================== */}
        <section className="relative mt-8 sm:mt-12 lg:mt-14 pb-4 sm:pb-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr]">
            
            {/* Left Column: Heading & Core Angle */}
            <div className="relative z-10">
              <h1 className="font-pochaevsk text-[3.2rem] sm:text-[4.4rem] lg:text-[5rem] tracking-[-0.02em] text-[#02110c] leading-[1.08]">
                Thinking you applied to them all?<br />
                <span className="text-[#008561]">Check the master list.</span>
              </h1>

              <p className="mt-6 max-w-[580px] text-[1.1rem] sm:text-[1.2rem] leading-[1.75] text-[#495e54]">
                Leave the job hunting to us, you just apply. We continuously monitor official career feeds across big tech companies, then use AI to match and rank the highest-fit roles for your resume in seconds.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/jobs"
                  className="rounded-full bg-[#008561] hover:bg-[#006e50] px-8 py-4 text-[1.05rem] font-heading font-bold text-white shadow-[0_12px_28px_rgba(0,133,97,0.3)] transition active:scale-[0.98] inline-flex items-center gap-2"
                >
                  Explore Verified Roles <ArrowRight className="w-4 h-4 text-white" />
                </Link>

                <Link
                  href="/jobs"
                  className="rounded-full border border-[#008561]/25 bg-white/80 backdrop-blur-xs px-6 py-4 text-[1.02rem] font-heading font-bold text-[#02110c] hover:border-[#008561] hover:bg-white transition shadow-sm inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#008561]" />
                  Match With Resume
                </Link>
              </div>
            </div>

            {/* Right Column: Transparent Girl Cutout with Laptop */}
            <div className="relative flex items-center justify-center min-h-[480px] sm:min-h-[560px] lg:min-h-[620px]">
              {/* Soft ambient glow behind cutout */}
              <div className="absolute w-[440px] h-[440px] rounded-full bg-[#008561]/15 blur-3xl pointer-events-none -translate-y-3 sm:-translate-y-5 lg:-translate-y-7" />

              {/* Fully transparent cut-out image */}
              <div className="relative w-full max-w-[580px] h-[500px] sm:h-[580px] lg:h-[640px] -translate-y-3 sm:-translate-y-5 lg:-translate-y-7 transition-transform duration-300">
                <Image
                  src="/images/student_hero_green_sweater.png?v=2"
                  alt="Student developer finding verified tech roles on Siftrole"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-bottom sm:object-center drop-shadow-[0_25px_40px_rgba(0,0,0,0.12)] scale-105 sm:scale-110 lg:scale-115"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CASCADING GLOWING CHEVRONS SCROLL PROMPT */}
          {/* ======================================================== */}
          <div className="relative z-20 -mt-2 sm:-mt-6 lg:-mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" })}
              aria-label="Scroll down to explore verified opportunities"
              className="group flex flex-col items-center justify-center p-2 transition-all hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
            >
              <div className="flex flex-col items-center -space-y-3 drop-shadow-[0_0_10px_rgba(0,133,97,0.35)]">
                <svg
                  className="w-6 h-6 text-[#008561]/50 animate-[pulse_1.4s_infinite_100ms] opacity-60 transition-colors group-hover:opacity-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <svg
                  className="w-6 h-6 text-[#008561] animate-[pulse_1.4s_infinite_350ms] opacity-80 transition-colors group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <svg
                  className="w-6 h-6 text-[#02110c] animate-[pulse_1.4s_infinite_600ms] transition-colors group-hover:text-[#008561]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>
          </div>
        </section>

        {/* ======================================================== */}
        {/* METRICS ROW */}
        {/* ======================================================== */}
        <section className="border-t border-neutral-200/80 py-10 mt-4">
          <div className="grid gap-8 md:grid-cols-3">
            {metrics.map((metric, i) => (
              <div
                key={metric.label}
                className={`flex flex-col justify-center px-4 sm:px-8 py-2 ${
                  i < 2 ? "md:border-r md:border-neutral-200/80" : ""
                }`}
              >
                <div className="text-[3.2rem] sm:text-[4rem] font-black tracking-[-0.04em] text-[#121816] leading-none min-h-[4rem] flex items-center">
                  {metric.value}
                </div>
                <div className="mt-2 text-base font-bold text-[#121816]">
                  {metric.label}
                </div>
                <div className="mt-1 text-xs text-[#55615b]">
                  {metric.caption}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* FEATURED OPPORTUNITIES SECTION (CURATED PREVIEW) */}
        {/* ======================================================== */}
        <section id="jobs" className="py-16 scroll-mt-20">
          {/* Section Heading with Direct CTA */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#008561]">
                Featured Roles
              </span>
              <h2 className="mt-2 font-pochaevsk text-[2.8rem] sm:text-[3.6rem] leading-[1.06] tracking-[-0.02em] text-[#02110c]">
                Recently Verified Openings
              </h2>
              <p className="mt-2 text-sm font-medium text-[#495e54]">
                A preview of active roles parsed with AI. Explore the full board for {totalListingsCount > 0 ? `${totalListingsCount.toLocaleString()}+` : "all verified"} live positions.
              </p>
            </div>

            <Link
              href="/jobs"
              className="text-xs sm:text-sm font-extrabold text-[#008561] hover:text-[#02110c] inline-flex items-center gap-1.5 transition group"
            >
              <span>View all {totalListingsCount > 0 ? `${totalListingsCount.toLocaleString()}+` : "verified"} live listings</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Job Preview Feed */}
          <div className="space-y-4">
            {isLoadingListings ? (
              <div className="py-20 text-center bg-white rounded-[26px] border border-[#eedfc9] text-[#495e54]">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#008561] border-t-transparent mb-3" />
                <p className="text-xs font-bold">Loading verified positions...</p>
              </div>
            ) : featuredListings.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-[26px] border border-[#eedfc9] p-8">
                <Briefcase className="w-10 h-10 text-[#495e54]/50 mx-auto mb-2" />
                <h3 className="font-extrabold text-base text-[#02110c]">Checking company career feeds...</h3>
                <Link
                  href="/jobs"
                  className="mt-4 inline-block rounded-xl bg-[#008561] hover:bg-[#006e50] text-white text-xs font-bold px-5 py-2.5 shadow-sm"
                >
                  Open Full Job Board
                </Link>
              </div>
            ) : (
              featuredListings.map((job, idx) => {
                const applied = isApplied(job.id);
                return (
                  <Link
                    key={job.id || job.raw_jd_hash || idx}
                    href={`/jobs/${job.id}`}
                    className={`block group rounded-2xl border p-5 sm:p-6 shadow-[0_2px_12px_rgba(2,17,12,0.03)] transition-all duration-150 hover:border-[#008561] hover:shadow-md cursor-pointer relative ${
                      applied ? "border-[#008561] bg-[#faf8f5]" : "border-[#eadecc] bg-white"
                    }`}
                  >
                    {/* Top Row: Company Logo & Name & Verified Badge, Actions */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                        <CompanyLogo
                          company={job.company}
                          size="sm"
                          className="!h-6 !w-6 !p-0.5 rounded-md border border-[#eadecc] bg-white shadow-none shrink-0"
                        />
                        <span className="text-xs sm:text-sm font-bold text-[#02110c] tracking-tight truncate">
                          {job.company}
                        </span>
                        <span className="rounded-full bg-[#00D793]/15 text-[#083D2E] text-[0.65rem] font-bold px-2.5 py-0.5 border border-[#00D793]/40 inline-flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3 h-3 text-[#008561]" /> Verified
                        </span>
                      </div>

                      {/* Mark as Applied Toggle Button */}
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleAppliedWithAuth(job.id, e)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-bold transition-all shadow-2xs cursor-pointer ${
                            applied
                              ? "bg-[#008561] text-white"
                              : "border border-[#eadecc] bg-[#faf8f5] hover:border-[#008561] hover:text-[#02110c] hover:bg-white text-[#495e54]"
                          }`}
                        >
                          {applied ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-white" />
                              <span>Applied</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 text-[#495e54]" />
                              <span>Mark Applied</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Second Row: Job Title */}
                    <h3 className="font-lora text-xl sm:text-[1.35rem] font-bold text-[#02110c] tracking-tight group-hover:text-[#008561] transition-colors leading-snug mb-3 line-clamp-2">
                      {job.title}
                    </h3>

                    {/* Third Row: Key Important Details Pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-3.5">
                      {/* Location */}
                      <div className="inline-flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] rounded-lg px-2.5 py-1 text-xs font-medium text-[#02110c]">
                        <MapPin className="w-3.5 h-3.5 text-[#008561] shrink-0" />
                        <span className="truncate max-w-[240px]">{formatLocation(job.location)}</span>
                      </div>

                      {/* Employment Type */}
                      {job.employment_type && (
                        <div className="inline-flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] rounded-lg px-2.5 py-1 text-xs font-medium text-[#02110c]">
                          <Briefcase className="w-3.5 h-3.5 text-[#008561] shrink-0" />
                          <span>{job.employment_type}</span>
                        </div>
                      )}

                      {/* Salary */}
                      {job.stipend_or_salary && (
                        <div className="inline-flex items-center gap-1.5 bg-[#00D793]/15 border border-[#00D793]/40 text-[#083D2E] rounded-lg px-2.5 py-1 text-xs font-bold">
                          <DollarSign className="w-3.5 h-3.5 text-[#008561] shrink-0" />
                          <span>{job.stipend_or_salary}</span>
                        </div>
                      )}

                      {/* Experience Level */}
                      {job.experience_level && (
                        <div className="inline-flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] rounded-lg px-2.5 py-1 text-xs font-medium text-[#02110c]">
                          <GraduationCap className="w-3.5 h-3.5 text-[#008561] shrink-0" />
                          <span>{job.experience_level}</span>
                        </div>
                      )}
                    </div>

                    {/* Fourth Row: Skills + View Details Link */}
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#eadecc]/60 flex-wrap">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {job.skills_required.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-[#faf8f5] text-[#495e54] border border-[#eadecc] px-2 py-0.5 text-[0.7rem] font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills_required.length > 4 && (
                            <span className="text-[0.68rem] text-[#495e54] font-medium">
                              +{job.skills_required.length - 4} more
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-[#008561] group-hover:underline inline-flex items-center gap-1 shrink-0 ml-auto">
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* Centered See More Job Pill Button */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/jobs"
              className="rounded-full bg-[#008561] hover:bg-[#006e50] text-white px-9 py-3.5 text-xs sm:text-sm font-bold transition-all shadow-md inline-flex items-center gap-2 active:scale-[0.98]"
            >
              See More Verified Roles <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        </section>

        {/* ======================================================== */}
        {/* WHY SIFTROLE BENTO GRID */}
        {/* ======================================================== */}
        <section id="about" className="py-16 scroll-mt-20">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-end">
            <div>
              <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#008561]">
                Why Siftrole
              </span>
              <h2 className="mt-2 font-pochaevsk text-[2.8rem] sm:text-[3.8rem] leading-[1.06] tracking-[-0.02em] text-[#02110c]">
                Only verified jobs. Zero ghost posts.
              </h2>
            </div>
            <div className="pt-2 lg:pt-6 flex flex-col items-start gap-4">
              <p className="text-[1.15rem] leading-[1.8] text-[#495e54]">
                Every role links directly to official company career pages. When a position closes, it's removed immediately so you never waste time on dead links.
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-full bg-[#008561] hover:bg-[#006e50] text-white px-6 py-3 text-xs sm:text-sm font-bold transition shadow-xs"
              >
                <span>Browse Verified Jobs</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

          {/* Bento Layout Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Bento 1: Sourced, Not Scraped */}
            <div className="md:col-span-2 rounded-[28px] border border-[#eadecc] bg-white p-8 sm:p-10 flex flex-col justify-between shadow-[0_4px_20px_rgba(2,17,12,0.03)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#008561]/10 border border-[#008561]/25 text-[#008561] text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
                    Always Current
                  </span>
                  <span className="rounded-md bg-[#faf8f5] border border-[#eadecc] text-[#02110c] text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
                    Auto-Expiring
                  </span>
                </div>
                <h3 className="font-pochaevsk text-[2.2rem] sm:text-[2.8rem] leading-[1.1] tracking-[-0.02em] text-[#02110c] mt-4">
                  Sourced, not scraped.
                </h3>
                <p className="mt-4 text-[1.05rem] leading-[1.7] text-[#495e54] max-w-[620px]">
                  Every listing traces directly back to the company's official career page. The moment a role closes on the company's own site, it vanishes from ours: eliminating dead links sitting around for weeks.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 relative h-[250px] sm:h-[290px] rounded-[20px] overflow-hidden shadow-xs border border-[#eadecc]">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85"
                  alt="Students collaborating on projects"
                  fill
                  className="object-cover object-[center_12%]"
                />
              </div>
            </div>

            {/* Bento 2: Zero Spam & Verified Startups */}
            <div className="relative rounded-[28px] overflow-hidden p-8 text-white flex flex-col justify-between shadow-lg border border-[#008561]/40 min-h-[380px] group">
              {/* Background Image with Ambient Emerald Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                  alt="Verified tech startups team collaboration"
                  fill
                  className="object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02110c] via-[#02110c]/85 to-[#008561]/40" />
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#008561]/25 blur-2xl pointer-events-none" />
              </div>

              {/* Top content */}
              <div className="relative z-10">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#008561]/30 text-[#fff6eb] text-[0.72rem] font-extrabold px-3 py-1 uppercase tracking-wider border border-[#008561]/50 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00e5a3]" />
                    Zero Spam
                  </span>
                </div>
                <h3 className="font-pochaevsk text-[2.1rem] leading-[1.12] tracking-[-0.02em] text-white mt-4">
                  Verified startups only.
                </h3>
                <p className="mt-3 text-sm leading-[1.7] text-white/85">
                  Every non-top-company post is manually checked before going live. No anonymous postings, no fake recruitment ads.
                </p>

                {/* Micro trust indicators */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-white/90 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/15">
                    ✓ Official ATS Feeds
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-white/90 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/15">
                    ✓ Direct Career Portals
                  </span>
                </div>
              </div>

              {/* Bottom footer bar */}
              <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs font-bold text-white/90">100% Verified Source Gate</span>
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#008561] text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Bento 3: One Feed */}
            <div className="rounded-[28px] border border-[#eadecc] bg-white p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(2,17,12,0.03)]">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#008561]/10 text-[#008561] flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-pochaevsk text-[1.8rem] tracking-[-0.02em] text-[#02110c]">
                  One feed, not fifty tabs.
                </h4>
                <p className="mt-3 text-sm leading-[1.65] text-[#495e54]">
                  Top tech company openings across official career portals in one clean, unified stream.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#02110c]">
                <ShieldCheck className="w-4 h-4 text-[#008561]" />
                <span>Direct company sync</span>
              </div>
            </div>

            {/* Bento 4: Resume-Matched */}
            <div className="rounded-[28px] border border-[#eadecc] bg-white p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(2,17,12,0.03)]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-[#008561]/10 border border-[#008561]/25 text-[#008561] text-xs font-bold px-3 py-1 uppercase tracking-wider">
                    Smart Rank
                  </span>
                  <Sparkles className="w-4 h-4 text-[#008561]" />
                </div>
                <div className="font-pochaevsk text-[1.8rem] tracking-[-0.02em] text-[#02110c]">
                  Resume-matched.
                </div>
                <p className="mt-2 text-sm leading-[1.65] text-[#495e54]">
                  Upload your resume once. Open roles are ranked as High, Medium, or Low fit based on your exact profile.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#eadecc]/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#02110c]">
                  <BellRing className="w-4 h-4 text-[#008561]" />
                  <span>Passive discovery alerts</span>
                </div>
              </div>
            </div>

            {/* Bento 5: Application Tracking */}
            <div className="rounded-[28px] border border-[#eadecc] bg-white p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(2,17,12,0.03)]">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#faf8f5] border border-[#eadecc] text-[#02110c] flex items-center justify-center mb-3">
                  <ClipboardCheck className="w-5 h-5 text-[#008561]" />
                </div>
                <h4 className="font-pochaevsk text-[1.7rem] tracking-[-0.02em] text-[#02110c]">
                  Application tracking.
                </h4>
                <p className="mt-2 text-sm leading-[1.65] text-[#495e54]">
                  One unified place to track applied, interviewed, offered, and rejected across every role you pursue.
                </p>
              </div>
              <Link
                href="/jobs"
                className="mt-6 text-xs font-bold text-[#008561] inline-flex items-center gap-1 hover:text-[#02110c]"
              >
                Explore opportunities <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* FAQ & WE WOULD LIKE TO HEAR FROM YOU SECTION */}
        {/* ======================================================== */}
        <section id="faq" className="py-16 sm:py-20 scroll-mt-20 border-t border-[#eadecc]">
          <div className="grid lg:grid-cols-[1.12fr_0.88fr] gap-10 lg:gap-14 items-start">
            
            {/* Left Column: FAQ Accordion */}
            <div>
              <div className="mb-8">
                <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#008561]">
                  Got Questions?
                </span>
                <h2 className="mt-2 font-pochaevsk text-[2.4rem] sm:text-[3rem] tracking-[-0.02em] text-[#02110c] leading-[1.1]">
                  Frequently Asked Questions
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#495e54]">
                  Everything you need to know about our verified feeds, AI tools, and matching.
                </p>
              </div>

              <div className="space-y-3.5">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={faq.q}
                      className={`rounded-[20px] border transition-all duration-300 overflow-hidden shadow-2xs ${
                        isOpen
                          ? "border-[#008561]/40 bg-white shadow-sm ring-1 ring-[#008561]/20"
                          : "border-[#eadecc] bg-white hover:border-[#008561]/30"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full text-left p-5 sm:p-6 font-bold text-sm sm:text-base text-[#02110c] flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/50 transition-colors"
                      >
                        <span className={`leading-snug transition-colors duration-200 ${isOpen ? "text-[#008561]" : "text-[#02110c]"}`}>
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#495e54] transition-transform duration-300 shrink-0 ${
                            isOpen ? "rotate-180 text-[#008561]" : ""
                          }`}
                        />
                      </button>

                      {/* Smooth expanding container */}
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                          isOpen
                            ? "[grid-template-rows:1fr] opacity-100"
                            : "[grid-template-rows:0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 text-xs sm:text-sm leading-[1.75] text-[#495e54] border-t border-[#eadecc]/50 bg-[#faf8f5]">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: We Would Like to Hear From You Form Card */}
            <div className="lg:sticky lg:top-24 rounded-[28px] border border-[#eadecc] bg-white p-7 sm:p-9 shadow-[0_8px_30px_rgba(2,17,12,0.04)] relative overflow-hidden">
              {/* Subtle radiant background accent */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#008561]/10 via-[#008561]/5 to-transparent rounded-bl-full pointer-events-none" />

              <div>
                <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#008561]">
                  Get In Touch
                </span>
                <h3 className="mt-2 font-pochaevsk text-2xl sm:text-[2rem] tracking-tight text-[#02110c]">
                  We would like to hear from you
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#495e54] leading-relaxed">
                  Have feedback, a feature suggestion, or spotted a company career feed we should track? Send us a message directly.
                </p>
              </div>

              {contactSuccess ? (
                <div className="mt-6 rounded-2xl border border-[#008561]/20 bg-[#008561]/10 p-6 text-center animate-fadeIn">
                  <CheckCircle2 className="w-10 h-10 text-[#008561] mx-auto mb-2" />
                  <h4 className="font-extrabold text-sm text-[#02110c]">Thank you for reaching out!</h4>
                  <p className="text-xs text-[#495e54] mt-1.5 leading-relaxed">
                    Your message has been sent directly to our team. We read every note and will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactSuccess(false)}
                    className="mt-4 text-xs font-bold text-[#008561] hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-6 space-y-3.5">
                  <div>
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-wider text-[#02110c] mb-1.5">
                      Your Name <span className="text-[#495e54] font-normal text-[0.7rem]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => {
                        setContactName(e.target.value);
                        setContactError(null);
                      }}
                      placeholder="Alex Morgan"
                      className="w-full rounded-xl border border-[#eadecc] bg-[#faf8f5] px-4 py-2.5 text-xs sm:text-sm font-medium text-[#02110c] placeholder:text-[#495e54]/50 outline-none transition hover:border-[#008561]/40 focus:border-[#008561] focus:bg-white focus:ring-2 focus:ring-[#008561]/15"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-wider text-[#02110c] mb-1.5">
                      Email Address <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => {
                        setContactEmail(e.target.value);
                        setContactError(null);
                      }}
                      placeholder="you@domain.com"
                      className="w-full rounded-xl border border-[#eadecc] bg-[#faf8f5] px-4 py-2.5 text-xs sm:text-sm font-medium text-[#02110c] placeholder:text-[#495e54]/50 outline-none transition hover:border-[#008561]/40 focus:border-[#008561] focus:bg-white focus:ring-2 focus:ring-[#008561]/15"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-wider text-[#02110c] mb-1.5">
                      Topic
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Feedback", "Feature Request", "Other"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setContactCategory(cat)}
                          className={`rounded-lg py-1.5 px-2 text-[0.75rem] font-bold transition text-center cursor-pointer border ${
                            contactCategory === cat
                              ? "bg-[#02110c] text-white border-[#02110c] shadow-xs"
                              : "bg-[#faf8f5] text-[#495e54] border-[#eadecc] hover:border-[#008561] hover:text-[#02110c]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-wider text-[#02110c] mb-1.5">
                      Message <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => {
                        setContactMessage(e.target.value);
                        setContactError(null);
                      }}
                      placeholder="Tell us what you think or how we can help..."
                      className="w-full rounded-xl border border-[#eadecc] bg-[#faf8f5] p-3 text-xs sm:text-sm font-medium text-[#02110c] placeholder:text-[#495e54]/50 outline-none transition hover:border-[#008561]/40 focus:border-[#008561] focus:bg-white focus:ring-2 focus:ring-[#008561]/15 resize-none"
                    />
                  </div>

                  {contactError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{contactError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingContact}
                    className="w-full rounded-xl bg-[#008561] hover:bg-[#006e50] text-white font-bold text-xs sm:text-sm py-3 shadow-md shadow-[#008561]/20 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2 mt-1"
                  >
                    {isSendingContact ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-5 pt-4 border-t border-[#eadecc]/60 flex items-center justify-center text-[0.72rem] text-[#495e54]">
                <a
                  href="mailto:support@siftrole.in"
                  className="inline-flex items-center gap-1.5 hover:text-[#008561] transition-colors font-semibold"
                >
                  <Mail className="w-3.5 h-3.5 text-[#008561]" />
                  <span>support@siftrole.in</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* EXACT EMERALD SILK NEWSLETTER CARD */}
        {/* ======================================================== */}
        <NewsletterSection />

        {/* ======================================================== */}
        {/* FOOTER NAVIGATION & OPTIONS */}
        {/* ======================================================== */}
        <footer data-footer-zone="true" className="mt-16 sm:mt-20 pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
            {/* Left: Mission description */}
            <div className="lg:col-span-2 space-y-3">
              <p className="text-xs sm:text-sm font-medium text-[#55615b] leading-relaxed max-w-[340px]">
                Siftrole is your trusted platform for discovering verified tech job opportunities that match your skills, experience, and career aspirations.
              </p>
            </div>

            {/* Col: Company */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><Link href="/about" className="hover:text-[#1a422f] transition">About</Link></li>
                <li><Link href="/jobs" className="hover:text-[#1a422f] transition">Opportunities</Link></li>
                <li><a href="#faq" className="hover:text-[#1a422f] transition">FAQ</a></li>
                <li><Link href="/cold-email" className="hover:text-[#1a422f] transition">Recruiter Outreach</Link></li>
              </ul>
            </div>

            {/* Col: Support */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Legal & Support
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><Link href="/privacy" className="hover:text-[#1a422f] transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#1a422f] transition">Terms of Service</Link></li>
                <li><Link href="/cold-email" className="hover:text-[#1a422f] transition">Recruiter Network</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#1a422f] transition">Member Dashboard</Link></li>
              </ul>
            </div>

            {/* Col: Social */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Social
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#1a422f] transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          {/* Sub-row */}
          <div className="pt-8 border-t border-neutral-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#55615b]">
            <div>
              &copy; {new Date().getFullYear()} Siftrole. All rights reserved.
            </div>
            <div>
              <a href="mailto:support@siftrole.in" className="hover:text-[#1a422f] transition">
                support@siftrole.in
              </a>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MASSIVE BOTTOM SIFTR[O]LE WORDMARK WITH EMBEDDED LOGO */}
          {/* ======================================================== */}
          <SiftroleLogo variant="footer-emblem" />
        </footer>

      </div>

      {/* ======================================================== */}
      {/* ROLE DETAIL SLIDING MODAL (VIEW FULL JD) */}
      {/* ======================================================== */}
      {selectedListingModal && (
        <JobDetailModal
          listing={selectedListingModal as any}
          onClose={() => setSelectedListingModal(null)}
        />
      )}

      {/* ======================================================== */}
      {/* AUTH GATE MODAL */}
      {/* ======================================================== */}
      <AuthGateModal
        isOpen={authGateConfig.isOpen}
        onClose={() => setAuthGateConfig({ isOpen: false })}
        title={authGateConfig.title}
        description={authGateConfig.description}
        badge={authGateConfig.badge}
        primaryCta={authGateConfig.primaryCta}
      />
    </main>
  );
}
